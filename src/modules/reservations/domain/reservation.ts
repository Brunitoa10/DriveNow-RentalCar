export const RESERVATION_STATUSES = ["PENDING", "PAID", "ACTIVE", "COMPLETED", "CANCELLED"] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];
export type DeliveryMode = "BRANCH" | "HOME";

export interface Reservation {
  id: string;
  code: string;
  carId: string;
  carName: string;
  carPhoto: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: Date;
  endDate: Date;
  status: ReservationStatus;
  deliveryMode: DeliveryMode;
  pickupBranch: { id: string; name: string; lat: number; lng: number } | null;
  dropoffBranch: { id: string; name: string; lat: number; lng: number } | null;
  deliveryAddress: string | null;
  deliveryLat: number | null;
  deliveryLng: number | null;
  routeDistanceKm: number | null;
  routeDurationMin: number | null;
  days: number;
  pricePerDay: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentProvider: string | null;
  paymentRef: string | null;
  hasReview: boolean;
  createdAt: Date;
}

export interface NewReservation {
  code: string;
  carId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: Date;
  endDate: Date;
  deliveryMode: DeliveryMode;
  pickupBranchId: string | null;
  dropoffBranchId: string | null;
  deliveryAddress: string | null;
  deliveryLat: number | null;
  deliveryLng: number | null;
  routeDistanceKm: number | null;
  routeDurationMin: number | null;
  days: number;
  pricePerDay: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentProvider: string;
}

export interface ReservationRepository {
  create(data: NewReservation): Promise<Reservation>;
  findByCode(code: string): Promise<Reservation | null>;
  findById(id: string): Promise<Reservation | null>;
  findAll(filter?: { status?: ReservationStatus }): Promise<Reservation[]>;
  /** ¿Hay alguna reserva que bloquee el auto en ese rango? */
  hasOverlap(carId: string, start: Date, end: Date): Promise<boolean>;
  /** Rangos ocupados (para deshabilitar fechas en el calendario). */
  findBlockedRanges(carId: string): Promise<{ from: Date; to: Date }[]>;
  updateStatus(id: string, status: ReservationStatus): Promise<Reservation>;
  setPaymentRef(id: string, ref: string): Promise<void>;
}

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: "Pendiente de pago",
  PAID: "Confirmada",
  ACTIVE: "En curso",
  COMPLETED: "Finalizada",
  CANCELLED: "Cancelada",
};

export const DELIVERY_LABELS: Record<DeliveryMode, string> = {
  BRANCH: "Retiro en sucursal",
  HOME: "Entrega a domicilio",
};

/** Una reserva PENDING bloquea el auto sólo durante este tiempo (checkout abierto). */
export const PENDING_HOLD_MINUTES = 30;
