import "server-only";
import { addMonths, differenceInCalendarDays, format, max as maxDate, min as minDate, startOfMonth, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { z } from "zod";
import type { TripRecorder } from "@modules/reservations/application/reservation.service";
import type { ReservationStatus } from "@modules/reservations/domain/reservation";
import { unwrap, type Db } from "@server/supabase";
import type { CarActivity, CarPerformance, PerformanceScorer } from "./domain/performance";

const REVENUE_STATUSES: ReservationStatus[] = ["PAID", "ACTIVE", "COMPLETED"];
const sum = (values: number[]) => values.reduce((acc, v) => acc + v, 0);

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
    private readonly db: Db,
    private readonly scorer: PerformanceScorer,
  ) {}

  // ── Performance por auto ──────────────────────────────────────────────

  async performance(windowDays = 90): Promise<CarPerformance[]> {
    const to = new Date();
    const from = subDays(to, windowDays);
    const [fromIso, toIso] = [from.toISOString(), to.toISOString()];

    // Una sola consulta con relaciones embebidas y filtradas (PostgREST)
    const cars = unwrap(
      await this.db
        .from("cars")
        .select(
          `id, name, brand, photo, category, fuel,
           reservations(start_date, end_date, total, status),
           reviews(overall),
           trip_logs(distance_km, fuel_used_l, incidents, recorded_at),
           maintenances(start_date, end_date, cost)`,
        )
        .in("reservations.status", REVENUE_STATUSES)
        .lt("reservations.start_date", toIso)
        .gt("reservations.end_date", fromIso)
        .gte("trip_logs.recorded_at", fromIso)
        .lt("maintenances.start_date", toIso)
        .or(`end_date.is.null,end_date.gt.${fromIso}`, { referencedTable: "maintenances" }),
    );

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
          bookedDays: sum(car.reservations.map((r) => overlapDays(new Date(r.start_date), new Date(r.end_date), from, to))),
          downtimeDays: sum(
            car.maintenances.map((m) => overlapDays(new Date(m.start_date), m.end_date ? new Date(m.end_date) : to, from, to)),
          ),
          revenue: sum(car.reservations.map((r) => Number(r.total))),
          ratingAverage: ratings.length ? sum(ratings) / ratings.length : null,
          ratingCount: ratings.length,
          distanceKm: sum(car.trip_logs.map((t) => t.distance_km)),
          fuelUsedL: sum(car.trip_logs.map((t) => t.fuel_used_l)),
          incidents: sum(car.trip_logs.map((t) => t.incidents)),
          maintenanceCost: sum(car.maintenances.map((m) => Number(m.cost))),
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

    const [current, previous, active, upcoming, pending, ratings, fleetSize, published, monthly, performance] =
      await Promise.all([
        this.sumRevenue(from, now),
        this.sumRevenue(prevFrom, from),
        this.countRows(this.head("reservations").eq("status", "ACTIVE")),
        this.countRows(this.head("reservations").eq("status", "PAID").gte("start_date", now.toISOString())),
        this.countRows(this.head("reservations").eq("status", "PENDING")),
        this.db.from("reviews").select("overall").then(unwrap),
        this.countRows(this.head("cars")),
        this.countRows(this.head("cars").eq("is_published", true)),
        this.db
          .from("reservations")
          .select("start_date, total")
          .in("status", REVENUE_STATUSES)
          .gte("start_date", sixMonthsAgo.toISOString())
          .then(unwrap),
        this.performance(windowDays),
      ]);

    const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
      const month = addMonths(sixMonthsAgo, i);
      const key = format(month, "yyyy-MM");
      return {
        label: format(month, "MMM", { locale: es }),
        value: sum(monthly.filter((r) => format(new Date(r.start_date), "yyyy-MM") === key).map((r) => Number(r.total))),
      };
    });

    return {
      revenue: current,
      revenuePrev: previous,
      activeRentals: active,
      upcomingRentals: upcoming,
      pendingPayments: pending,
      utilization: performance.length ? sum(performance.map((p) => p.utilization)) / performance.length : 0,
      averageRating: ratings.length ? sum(ratings.map((r) => r.overall)) / ratings.length : null,
      reviewCount: ratings.length,
      fleetSize,
      publishedCount: published,
      revenueByMonth,
    };
  }

  // ── Registros operativos ──────────────────────────────────────────────

  async record(input: { carId: string; reservationId: string; distanceKm: number; fuelUsedL: number; incidents: number; notes?: string }) {
    unwrap(
      await this.db.from("trip_logs").insert({
        car_id: input.carId,
        reservation_id: input.reservationId,
        distance_km: input.distanceKm,
        fuel_used_l: input.fuelUsedL,
        incidents: input.incidents,
        notes: input.notes ?? null,
      }),
    );
  }

  async addMaintenance(raw: unknown) {
    const m = maintenanceSchema.parse(raw);
    unwrap(
      await this.db.from("maintenances").insert({
        car_id: m.carId,
        kind: m.kind,
        description: m.description ?? null,
        cost: m.cost,
        start_date: m.startDate.toISOString(),
        end_date: m.endDate ? m.endDate.toISOString() : null,
      }),
    );
  }

  async listMaintenance(carId: string) {
    const rows = unwrap(
      await this.db.from("maintenances").select("*").eq("car_id", carId).order("start_date", { ascending: false }),
    );
    return rows.map((m) => ({
      id: m.id,
      kind: m.kind,
      cost: Number(m.cost),
      startDate: new Date(m.start_date),
      endDate: m.end_date ? new Date(m.end_date) : null,
    }));
  }

  async listTrips(carId: string) {
    const rows = unwrap(
      await this.db.from("trip_logs").select("*").eq("car_id", carId).order("recorded_at", { ascending: false }).limit(8),
    );
    return rows.map((t) => ({
      id: t.id,
      distanceKm: t.distance_km,
      fuelUsedL: t.fuel_used_l,
      incidents: t.incidents,
      recordedAt: new Date(t.recorded_at),
    }));
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private async sumRevenue(from: Date, to: Date) {
    const rows = unwrap(
      await this.db
        .from("reservations")
        .select("total")
        .in("status", REVENUE_STATUSES)
        .gte("start_date", from.toISOString())
        .lt("start_date", to.toISOString()),
    );
    return sum(rows.map((r) => Number(r.total)));
  }

  /** SELECT count(*) sin traer filas. */
  private head<T extends "cars" | "reservations">(table: T) {
    return this.db.from(table).select("id", { count: "exact", head: true });
  }

  private async countRows(query: PromiseLike<{ count: number | null; error: { message: string } | null }>) {
    const { count, error } = await query;
    if (error) throw new Error(`[supabase] ${error.message}`);
    return count ?? 0;
  }
}
