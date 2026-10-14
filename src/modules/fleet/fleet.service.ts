import "server-only";
import type { PrismaClient, ReservationStatus } from "@prisma/client";
import { addMonths, differenceInCalendarDays, format, max as maxDate, min as minDate, startOfMonth, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { z } from "zod";
import type { TripRecorder } from "@modules/reservations/application/reservation.service";
import type { CarActivity, CarPerformance, PerformanceScorer } from "./domain/performance";

const REVENUE_STATUSES: ReservationStatus[] = ["PAID", "ACTIVE", "COMPLETED"];

export const maintenanceSchema = z.object({
  carId: z.string().uuid(),
  kind: z.string().trim().min(2, "Indicá el tipo").max(60),
  description: z.string().trim().max(300).optional(),
  cost: z.coerce.number().min(0),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
});

export const completionSchema = z.object({
  distanceKm: z.coerce.number().min(0).max(20000),
  fuelUsedL: z.coerce.number().min(0).max(5000),
  incidents: z.coerce.number().int().min(0).max(50),
  notes: z.string().trim().max(300).optional(),
});

export interface FleetKpis {
  revenue: number;
  revenuePrev: number;
  activeRentals: number;
  upcomingRentals: number;
  pendingPayments: number;
  utilization: number;
  averageRating: number | null;
  reviewCount: number;
  fleetSize: number;
  publishedCount: number;
  revenueByMonth: { label: string; value: number }[];
}

/** Días de solapamiento entre [start, end] y la ventana. */
const overlapDays = (start: Date, end: Date, from: Date, to: Date) => {
  const s = maxDate([start, from]);
  const e = minDate([end, to]);
  return Math.max(0, differenceInCalendarDays(e, s));
};

/**
 * Servicio de lectura (read model, estilo CQRS) para analítica de flota:
 * hace consultas agregadas que no encajan en un repositorio de entidad.
 * Implementa TripRecorder para que Reservations registre viajes sin conocer este módulo.
 */
export class FleetService implements TripRecorder {
  constructor(
    private readonly db: PrismaClient,
    private readonly scorer: PerformanceScorer,
  ) {}

  // ── Performance por auto ──────────────────────────────────────────────

  async performance(windowDays = 90): Promise<CarPerformance[]> {
    const to = new Date();
    const from = subDays(to, windowDays);

    const cars = await this.db.car.findMany({
      include: {
        reservations: {
          where: { status: { in: REVENUE_STATUSES }, startDate: { lt: to }, endDate: { gt: from } },
          select: { startDate: true, endDate: true, total: true },
        },
        reviews: { select: { overall: true } },
        tripLogs: { where: { recordedAt: { gte: from } }, select: { distanceKm: true, fuelUsedL: true, incidents: true } },
        maintenances: {
          where: { startDate: { lt: to }, OR: [{ endDate: null }, { endDate: { gt: from } }] },
          select: { startDate: true, endDate: true, cost: true },
        },
      },
    });

    return cars
      .map((car): CarActivity => {
        const ratings = car.reviews.map((r) => r.overall);
        return {
          carId: car.id,
          name: car.name,
          brand: car.brand,
          photo: car.photo,
          category: car.category,
          fuel: car.fuel,
          windowDays,
          bookedDays: car.reservations.reduce((acc, r) => acc + overlapDays(r.startDate, r.endDate, from, to), 0),
          downtimeDays: car.maintenances.reduce((acc, m) => acc + overlapDays(m.startDate, m.endDate ?? to, from, to), 0),
          revenue: car.reservations.reduce((acc, r) => acc + Number(r.total), 0),
          ratingAverage: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
          ratingCount: ratings.length,
          distanceKm: car.tripLogs.reduce((acc, t) => acc + t.distanceKm, 0),
          fuelUsedL: car.tripLogs.reduce((acc, t) => acc + t.fuelUsedL, 0),
          incidents: car.tripLogs.reduce((acc, t) => acc + t.incidents, 0),
          maintenanceCost: car.maintenances.reduce((acc, m) => acc + Number(m.cost), 0),
        };
      })
      .map((activity) => this.scorer.evaluate(activity))
      .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  }

  async performanceFor(carId: string, windowDays = 90): Promise<CarPerformance | null> {
    return (await this.performance(windowDays)).find((p) => p.carId === carId) ?? null;
  }

  // ── KPIs del tablero ──────────────────────────────────────────────────

  async kpis(windowDays = 30): Promise<FleetKpis> {
    const now = new Date();
    const from = subDays(now, windowDays);
    const prevFrom = subDays(from, windowDays);
    const sixMonthsAgo = startOfMonth(addMonths(now, -5));

    const [current, previous, active, upcoming, pending, rating, fleetSize, published, monthly, performance] =
      await Promise.all([
        this.sumRevenue(from, now),
        this.sumRevenue(prevFrom, from),
        this.db.reservation.count({ where: { status: "ACTIVE" } }),
        this.db.reservation.count({ where: { status: "PAID", startDate: { gte: now } } }),
        this.db.reservation.count({ where: { status: "PENDING" } }),
        this.db.review.aggregate({ _avg: { overall: true }, _count: { _all: true } }),
        this.db.car.count(),
        this.db.car.count({ where: { isPublished: true } }),
        this.db.reservation.findMany({
          where: { status: { in: REVENUE_STATUSES }, startDate: { gte: sixMonthsAgo } },
          select: { startDate: true, total: true },
        }),
        this.performance(windowDays),
      ]);

    const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
      const month = addMonths(sixMonthsAgo, i);
      const key = format(month, "yyyy-MM");
      return {
        label: format(month, "MMM", { locale: es }),
        value: monthly.filter((r) => format(r.startDate, "yyyy-MM") === key).reduce((acc, r) => acc + Number(r.total), 0),
      };
    });

    return {
      revenue: current,
      revenuePrev: previous,
      activeRentals: active,
      upcomingRentals: upcoming,
      pendingPayments: pending,
      utilization: performance.length ? performance.reduce((acc, p) => acc + p.utilization, 0) / performance.length : 0,
      averageRating: rating._avg.overall,
      reviewCount: rating._count._all,
      fleetSize,
      publishedCount: published,
      revenueByMonth,
    };
  }

  // ── Registros operativos ──────────────────────────────────────────────

  async record(input: { carId: string; reservationId: string; distanceKm: number; fuelUsedL: number; incidents: number; notes?: string }) {
    await this.db.tripLog.create({ data: input });
  }

  async addMaintenance(raw: unknown) {
    const data = maintenanceSchema.parse(raw);
    await this.db.maintenance.create({ data });
  }

  listMaintenance(carId: string) {
    return this.db.maintenance
      .findMany({ where: { carId }, orderBy: { startDate: "desc" } })
      .then((rows) => rows.map((m) => ({ ...m, cost: Number(m.cost) })));
  }

  listTrips(carId: string) {
    return this.db.tripLog.findMany({ where: { carId }, orderBy: { recordedAt: "desc" }, take: 8 });
  }

  private async sumRevenue(from: Date, to: Date) {
    const result = await this.db.reservation.aggregate({
      where: { status: { in: REVENUE_STATUSES }, startDate: { gte: from, lt: to } },
      _sum: { total: true },
    });
    return Number(result._sum.total ?? 0);
  }
}
