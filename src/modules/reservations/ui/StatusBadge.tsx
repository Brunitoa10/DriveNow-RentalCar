import { Badge, type BadgeProps } from "@shared/ui/Badge";
import { STATUS_LABELS, type ReservationStatus } from "../domain/reservation";

const TONES: Record<ReservationStatus, BadgeProps["tone"]> = {
  PENDING: "warning",
  PAID: "brass",
  ACTIVE: "ink",
  COMPLETED: "success",
  CANCELLED: "danger",
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <Badge tone={TONES[status]} dot>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
