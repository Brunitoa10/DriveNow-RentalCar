import { DomainError } from "@shared/lib/errors";
import type { ReservationStatus } from "./reservation";

/**
 * State Machine de la reserva.
 * PENDING → PAID → ACTIVE → COMPLETED, con cancelación posible antes de iniciar.
 * Agregar un estado nuevo = agregar una entrada acá, sin tocar los servicios (OCP).
 */
const TRANSITIONS: Record<ReservationStatus, readonly ReservationStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const ACTION_LABELS: Partial<Record<ReservationStatus, string>> = {
  PAID: "Marcar como pagada",
  ACTIVE: "Registrar entrega",
  COMPLETED: "Registrar devolución",
  CANCELLED: "Cancelar",
};

export const canTransition = (from: ReservationStatus, to: ReservationStatus) =>
  TRANSITIONS[from].includes(to);

export const nextStatuses = (from: ReservationStatus) => TRANSITIONS[from];

export function assertTransition(from: ReservationStatus, to: ReservationStatus): void {
  if (!canTransition(from, to)) {
    throw new DomainError(`No se puede pasar de ${from} a ${to}`);
  }
}

/** Estados que ocupan el auto en el calendario. */
export const BLOCKING_STATUSES: readonly ReservationStatus[] = ["PAID", "ACTIVE"];
