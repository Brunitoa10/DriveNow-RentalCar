import "server-only";
import { randomInt } from "node:crypto";
import type { CarService } from "@modules/cars/application/car.service";
import type { Branch } from "@modules/branches/branch";
import type { BranchService } from "@modules/branches/branch.service";
import type { PaymentGateway } from "@modules/payments/payment-gateway";
import type { RouteResult, RoutingProvider } from "@modules/routing/routing";
import { DomainError, NotFoundError } from "@shared/lib/errors";
import { haversineKm, type LatLng } from "@shared/lib/geo";
import type { PricingEngine, Quote } from "../domain/pricing";
import type { Reservation, ReservationRepository, ReservationStatus } from "../domain/reservation";
import { assertTransition } from "../domain/reservation-state";
import { lookupSchema, quoteSchema, reservationSchema } from "../validation/reservation.schema";

/** Registro de viaje al cerrar una reserva (lo implementa el módulo fleet). */
export interface TripRecorder {
  record(input: { carId: string; reservationId: string; distanceKm: number; fuelUsedL: number; incidents: number; notes?: string }): Promise<void>;
}

export interface QuoteResult {
  quote: Quote;
  route: (RouteResult & { from: LatLng; to: LatLng }) | null;
  available: boolean;
  originBranch: Pick<Branch, "id" | "name"> | null;
}

export interface CompletionInput {
  distanceKm: number;
  fuelUsedL: number;
  incidents: number;
  notes?: string;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generateCode = () =>
  "DN-" + Array.from({ length: 8 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");

export class ReservationService {
  constructor(
    private readonly reservations: ReservationRepository,
    private readonly cars: CarService,
    private readonly branches: BranchService,
    private readonly pricing: PricingEngine,
    private readonly routing: RoutingProvider,
    private readonly payments: PaymentGateway,
    private readonly trips: TripRecorder,
    private readonly appUrl: string,
  ) {}

  get paymentProviderName() {
    return this.payments.name;
  }

  // ── Cotización ────────────────────────────────────────────────────────

  async quote(raw: unknown): Promise<QuoteResult> {
    const input = quoteSchema.parse(raw);
    const car = await this.cars.getPublished(input.carId);
    const branches = await this.branches.list();

    let route: QuoteResult["route"] = null;
    let originBranch: Branch | null = null;

    if (input.deliveryMode === "HOME") {
      const destination = { lat: input.deliveryLat!, lng: input.deliveryLng! };
      originBranch = branches.find((b) => b.id === car.branchId) ?? this.nearestBranch(branches, destination);
      if (!originBranch) throw new DomainError("No hay sucursales disponibles para entregar");
      route = await this.routeBetween(originBranch, destination);
    } else {
      const pickup = branches.find((b) => b.id === input.pickupBranchId);
      if (!pickup) throw new NotFoundError("Sucursal de retiro");
      const dropoff = branches.find((b) => b.id === (input.dropoffBranchId ?? pickup.id)) ?? pickup;
      originBranch = pickup;
      if (dropoff.id !== pickup.id) route = await this.routeBetween(pickup, dropoff);
    }

    const quote = this.pricing.quote({
      pricePerDay: car.pricePerDay,
      startDate: input.startDate,
      endDate: input.endDate,
      deliveryMode: input.deliveryMode,
      deliveryDistanceKm: input.deliveryMode === "HOME" ? route?.distanceKm : undefined,
      pickupBranchId: input.pickupBranchId,
      dropoffBranchId: input.dropoffBranchId ?? input.pickupBranchId,
    });

    const available = !(await this.reservations.hasOverlap(car.id, input.startDate, input.endDate));
    return { quote, route, available, originBranch: { id: originBranch.id, name: originBranch.name } };
  }

  // ── Creación + checkout ───────────────────────────────────────────────

  async create(raw: unknown): Promise<{ reservation: Reservation; redirectUrl: string }> {
    const input = reservationSchema.parse(raw);
    if (input.startDate < startOfToday()) throw new DomainError("La fecha de retiro ya pasó");

    // El precio SIEMPRE se recalcula en el servidor: nunca se confía en el cliente.
    const { quote, route, available } = await this.quote(input);
    if (!available) throw new DomainError("El auto no está disponible en esas fechas");

    const car = await this.cars.getPublished(input.carId);
    const isHome = input.deliveryMode === "HOME";

    const reservation = await this.reservations.create({
      code: generateCode(),
      carId: car.id,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      startDate: input.startDate,
      endDate: input.endDate,
      deliveryMode: input.deliveryMode,
      pickupBranchId: isHome ? null : input.pickupBranchId ?? null,
      dropoffBranchId: isHome ? null : input.dropoffBranchId ?? input.pickupBranchId ?? null,
      deliveryAddress: isHome ? input.deliveryAddress ?? null : null,
      deliveryLat: isHome ? input.deliveryLat ?? null : null,
      deliveryLng: isHome ? input.deliveryLng ?? null : null,
      routeDistanceKm: route?.distanceKm ?? null,
      routeDurationMin: route?.durationMin ?? null,
      days: quote.days,
      pricePerDay: car.pricePerDay,
      subtotal: quote.subtotal,
      discount: quote.discount,
      deliveryFee: quote.deliveryFee,
      total: quote.total,
      paymentProvider: this.payments.name,
    });

    const checkout = await this.payments.createCheckout({
      reservationId: reservation.id,
      code: reservation.code,
      description: `${car.name} · ${quote.days} días`,
      amount: quote.total,
      customerEmail: reservation.customerEmail,
      successUrl: `${this.appUrl}/reserva/${reservation.code}`,
      cancelUrl: `${this.appUrl}/autos/${car.id}?pago=cancelado`,
    });
    await this.reservations.setPaymentRef(reservation.id, checkout.reference);

    return { reservation, redirectUrl: checkout.redirectUrl };
  }

  // ── Consultas ─────────────────────────────────────────────────────────

  async getByCode(code: string): Promise<Reservation> {
    const reservation = await this.reservations.findByCode(code.toUpperCase());
    if (!reservation) throw new NotFoundError("Reserva");
    return reservation;
  }

  async lookup(raw: unknown): Promise<Reservation> {
    const { code, email } = lookupSchema.parse(raw);
    const reservation = await this.reservations.findByCode(code);
    // Mismo mensaje en ambos casos para no filtrar qué códigos existen
    if (!reservation || reservation.customerEmail !== email) throw new NotFoundError("Reserva");
    return reservation;
  }

  listAll(status?: ReservationStatus): Promise<Reservation[]> {
    return this.reservations.findAll({ status });
  }

  blockedRanges(carId: string) {
    return this.reservations.findBlockedRanges(carId);
  }

  // ── Pagos ─────────────────────────────────────────────────────────────

  /** Al volver del checkout: verifica con el proveedor (por si el webhook todavía no llegó). */
  async syncPayment(code: string): Promise<Reservation> {
    const reservation = await this.getByCode(code);
    if (reservation.status !== "PENDING" || !reservation.paymentRef) return reservation;
    const paid = await this.payments.isPaid(reservation.paymentRef).catch(() => false);
    return paid ? this.transition(reservation.id, "PAID") : reservation;
  }

  async markPaid(reservationId: string): Promise<void> {
    const reservation = await this.reservations.findById(reservationId);
    if (reservation?.status === "PENDING") await this.transition(reservationId, "PAID");
  }

  async simulateDemoPayment(code: string): Promise<Reservation> {
    const reservation = await this.getByCode(code);
    if (reservation.paymentProvider !== "demo") throw new DomainError("Pago simulado no habilitado");
    return this.transition(reservation.id, "PAID");
  }

  // ── Ciclo de vida (admin) ─────────────────────────────────────────────

  async transition(id: string, to: ReservationStatus): Promise<Reservation> {
    const reservation = await this.reservations.findById(id);
    if (!reservation) throw new NotFoundError("Reserva");
    assertTransition(reservation.status, to);
    return this.reservations.updateStatus(id, to);
  }

  /** Devolución del auto: registra el viaje (alimenta la performance) y cierra la reserva. */
  async complete(id: string, data: CompletionInput): Promise<Reservation> {
    const reservation = await this.reservations.findById(id);
    if (!reservation) throw new NotFoundError("Reserva");
    assertTransition(reservation.status, "COMPLETED");

    await this.trips.record({ carId: reservation.carId, reservationId: id, ...data });
    await this.cars.addMileage(reservation.carId, data.distanceKm);
    return this.reservations.updateStatus(id, "COMPLETED");
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private nearestBranch(branches: Branch[], point: LatLng): Branch | null {
    return branches.reduce<Branch | null>(
      (best, b) => (!best || haversineKm(b, point) < haversineKm(best, point) ? b : best),
      null,
    );
  }

  private async routeBetween(from: LatLng, to: LatLng) {
    const route = await this.routing.route(from, to);
    return { ...route, from: { lat: from.lat, lng: from.lng }, to: { lat: to.lat, lng: to.lng } };
  }
}

/** Inicio de "ayer": tolera diferencias de zona horaria entre navegador y servidor. */
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 1);
  return d;
}
