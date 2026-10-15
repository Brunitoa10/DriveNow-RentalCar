import "server-only";
import { subMinutes } from "date-fns";
import type { Tables } from "@server/database.types";
import { unwrap, unwrapMaybe, type Db } from "@server/supabase";
import {
  PENDING_HOLD_MINUTES,
  type NewReservation,
  type Reservation,
  type ReservationRepository,
  type ReservationStatus,
} from "../domain/reservation";
import { BLOCKING_STATUSES } from "../domain/reservation-state";

// Dos FKs a branches: se desambigua con el nombre de la constraint
const SELECT = `*,
  car:cars(name, photo),
  pickup:branches!reservations_pickup_branch_id_fkey(id, name, lat, lng),
  dropoff:branches!reservations_dropoff_branch_id_fkey(id, name, lat, lng),
  review:reviews(id)`;

type BranchRef = { id: string; name: string; lat: number; lng: number } | null;
type ReservationRow = Tables<"reservations"> & {
  car: { name: string; photo: string } | null;
  pickup: BranchRef;
  dropoff: BranchRef;
  review: { id: string } | { id: string }[] | null;
};

const toDomain = (r: ReservationRow): Reservation => ({
  id: r.id,
  code: r.code,
  carId: r.car_id,
  carName: r.car?.name ?? "Auto eliminado",
  carPhoto: r.car?.photo ?? "",
  customerName: r.customer_name,
  customerEmail: r.customer_email,
  customerPhone: r.customer_phone,
  startDate: new Date(r.start_date),
  endDate: new Date(r.end_date),
  status: r.status,
  deliveryMode: r.delivery_mode,
  pickupBranch: r.pickup,
  dropoffBranch: r.dropoff,
  deliveryAddress: r.delivery_address,
  deliveryLat: r.delivery_lat,
  deliveryLng: r.delivery_lng,
  routeDistanceKm: r.route_distance_km,
  routeDurationMin: r.route_duration_min,
  days: r.days,
  pricePerDay: Number(r.price_per_day),
  subtotal: Number(r.subtotal),
  discount: Number(r.discount),
  deliveryFee: Number(r.delivery_fee),
  total: Number(r.total),
  paymentProvider: r.payment_provider,
  paymentRef: r.payment_ref,
  hasReview: Array.isArray(r.review) ? r.review.length > 0 : !!r.review,
  createdAt: new Date(r.created_at),
});

/** Filtro PostgREST: reservas que hoy bloquean un auto (pagas/en curso o pendientes recientes). */
const blockingFilter = () =>
  `status.in.(${BLOCKING_STATUSES.join(",")}),and(status.eq.PENDING,created_at.gte.${subMinutes(
    new Date(),
    PENDING_HOLD_MINUTES,
  ).toISOString()})`;

export class SupabaseReservationRepository implements ReservationRepository {
  constructor(private readonly db: Db) {}

  async create(d: NewReservation): Promise<Reservation> {
    const row = unwrap(
      await this.db
        .from("reservations")
        .insert({
          code: d.code,
          car_id: d.carId,
          customer_name: d.customerName,
          customer_email: d.customerEmail,
          customer_phone: d.customerPhone,
          start_date: d.startDate.toISOString(),
          end_date: d.endDate.toISOString(),
          delivery_mode: d.deliveryMode,
          pickup_branch_id: d.pickupBranchId,
          dropoff_branch_id: d.dropoffBranchId,
          delivery_address: d.deliveryAddress,
          delivery_lat: d.deliveryLat,
          delivery_lng: d.deliveryLng,
          route_distance_km: d.routeDistanceKm,
          route_duration_min: d.routeDurationMin,
          days: d.days,
          price_per_day: d.pricePerDay,
          subtotal: d.subtotal,
          discount: d.discount,
          delivery_fee: d.deliveryFee,
          total: d.total,
          payment_provider: d.paymentProvider,
        })
        .select(SELECT)
        .single(),
    );
    return toDomain(row as unknown as ReservationRow);
  }

  async findByCode(code: string): Promise<Reservation | null> {
    const row = unwrapMaybe(await this.db.from("reservations").select(SELECT).eq("code", code).maybeSingle());
    return row ? toDomain(row as unknown as ReservationRow) : null;
  }

  async findById(id: string): Promise<Reservation | null> {
    const row = unwrapMaybe(await this.db.from("reservations").select(SELECT).eq("id", id).maybeSingle());
    return row ? toDomain(row as unknown as ReservationRow) : null;
  }

  async findAll(filter: { status?: ReservationStatus } = {}): Promise<Reservation[]> {
    let query = this.db.from("reservations").select(SELECT).order("created_at", { ascending: false });
    if (filter.status) query = query.eq("status", filter.status);
    return (unwrap(await query) as unknown as ReservationRow[]).map(toDomain);
  }

  async hasOverlap(carId: string, start: Date, end: Date): Promise<boolean> {
    const { count, error } = await this.db
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("car_id", carId)
      .lt("start_date", end.toISOString())
      .gt("end_date", start.toISOString())
      .or(blockingFilter());
    if (error) throw new Error(`[supabase] ${error.message}`);
    return (count ?? 0) > 0;
  }

  async findBlockedRanges(carId: string): Promise<{ from: Date; to: Date }[]> {
    const rows = unwrap(
      await this.db
        .from("reservations")
        .select("start_date, end_date")
        .eq("car_id", carId)
        .gte("end_date", new Date().toISOString())
        .or(blockingFilter())
        .order("start_date"),
    );
    return rows.map((r) => ({ from: new Date(r.start_date), to: new Date(r.end_date) }));
  }

  async updateStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    const row = unwrap(await this.db.from("reservations").update({ status }).eq("id", id).select(SELECT).single());
    return toDomain(row as unknown as ReservationRow);
  }

  async setPaymentRef(id: string, ref: string): Promise<void> {
    unwrap(await this.db.from("reservations").update({ payment_ref: ref }).eq("id", id));
  }
}
