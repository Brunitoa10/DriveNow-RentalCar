import "server-only";
import type { Prisma, PrismaClient } from "@prisma/client";
import { subMinutes } from "date-fns";
import {
  PENDING_HOLD_MINUTES,
  type NewReservation,
  type Reservation,
  type ReservationRepository,
  type ReservationStatus,
} from "../domain/reservation";
import { BLOCKING_STATUSES } from "../domain/reservation-state";

const branchSelect = { select: { id: true, name: true, lat: true, lng: true } } as const;

const include = {
  car: { select: { name: true, photo: true } },
  pickupBranch: branchSelect,
  dropoffBranch: branchSelect,
  review: { select: { id: true } },
} satisfies Prisma.ReservationInclude;

type ReservationRecord = Prisma.ReservationGetPayload<{ include: typeof include }>;

const toDomain = (r: ReservationRecord): Reservation => ({
  id: r.id,
  code: r.code,
  carId: r.carId,
  carName: r.car.name,
  carPhoto: r.car.photo,
  customerName: r.customerName,
  customerEmail: r.customerEmail,
  customerPhone: r.customerPhone,
  startDate: r.startDate,
  endDate: r.endDate,
  status: r.status,
  deliveryMode: r.deliveryMode,
  pickupBranch: r.pickupBranch,
  dropoffBranch: r.dropoffBranch,
  deliveryAddress: r.deliveryAddress,
  deliveryLat: r.deliveryLat,
  deliveryLng: r.deliveryLng,
  routeDistanceKm: r.routeDistanceKm,
  routeDurationMin: r.routeDurationMin,
  days: r.days,
  pricePerDay: Number(r.pricePerDay),
  subtotal: Number(r.subtotal),
  discount: Number(r.discount),
  deliveryFee: Number(r.deliveryFee),
  total: Number(r.total),
  paymentProvider: r.paymentProvider,
  paymentRef: r.paymentRef,
  hasReview: !!r.review,
  createdAt: r.createdAt,
});

/** Reservas que hoy bloquean un auto: pagas/en curso, o pendientes recientes. */
const blockingWhere = (): Prisma.ReservationWhereInput => ({
  OR: [
    { status: { in: [...BLOCKING_STATUSES] } },
    { status: "PENDING", createdAt: { gte: subMinutes(new Date(), PENDING_HOLD_MINUTES) } },
  ],
});

export class PrismaReservationRepository implements ReservationRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(data: NewReservation): Promise<Reservation> {
    const record = await this.db.reservation.create({ data, include });
    return toDomain(record);
  }

  async findByCode(code: string): Promise<Reservation | null> {
    const record = await this.db.reservation.findUnique({ where: { code }, include });
    return record ? toDomain(record) : null;
  }

  async findById(id: string): Promise<Reservation | null> {
    const record = await this.db.reservation.findUnique({ where: { id }, include });
    return record ? toDomain(record) : null;
  }

  async findAll(filter: { status?: ReservationStatus } = {}): Promise<Reservation[]> {
    const records = await this.db.reservation.findMany({
      where: { status: filter.status },
      orderBy: { createdAt: "desc" },
      include,
    });
    return records.map(toDomain);
  }

  async hasOverlap(carId: string, start: Date, end: Date): Promise<boolean> {
    const count = await this.db.reservation.count({
      where: {
        carId,
        startDate: { lt: end },
        endDate: { gt: start },
        ...blockingWhere(),
      },
    });
    return count > 0;
  }

  async findBlockedRanges(carId: string): Promise<{ from: Date; to: Date }[]> {
    const records = await this.db.reservation.findMany({
      where: { carId, endDate: { gte: new Date() }, ...blockingWhere() },
      select: { startDate: true, endDate: true },
      orderBy: { startDate: "asc" },
    });
    return records.map((r) => ({ from: r.startDate, to: r.endDate }));
  }

  async updateStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    const record = await this.db.reservation.update({ where: { id }, data: { status }, include });
    return toDomain(record);
  }

  async setPaymentRef(id: string, ref: string): Promise<void> {
    await this.db.reservation.update({ where: { id }, data: { paymentRef: ref } });
  }
}
