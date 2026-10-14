import { CalendarDays, CheckCircle2, Clock, MapPin, Route as RouteIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DELIVERY_LABELS, type Reservation } from "@modules/reservations/domain/reservation";
import { QuoteBreakdown } from "@modules/reservations/ui/QuoteBreakdown";
import { SimulatePaymentButton } from "@modules/reservations/ui/SimulatePaymentButton";
import { StatusBadge } from "@modules/reservations/ui/StatusBadge";
import { ReviewForm } from "@modules/reviews/ui/ReviewForm";
import { container } from "@server/container";
import { NotFoundError } from "@shared/lib/errors";
import { formatDate, formatNumber, pluralize } from "@shared/lib/format";
import { CarImage } from "@shared/ui/CarImage";
import { Map, type MapMarker } from "@shared/ui/map/Map";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tu reserva", robots: { index: false } };

const maskEmail = (email: string) => email.replace(/^(.{2}).*(@.*)$/, "$1•••$2");

function buildMarkers(r: Reservation): MapMarker[] {
  if (r.deliveryMode === "HOME" && r.deliveryLat != null && r.deliveryLng != null) {
    return [{ id: "home", lat: r.deliveryLat, lng: r.deliveryLng, tone: "brass", glyph: "●", title: "Entrega" }];
  }
  const markers: MapMarker[] = [];
  if (r.pickupBranch) markers.push({ ...r.pickupBranch, id: "a", tone: "ink", glyph: "A", title: r.pickupBranch.name });
  if (r.dropoffBranch && r.dropoffBranch.id !== r.pickupBranch?.id)
    markers.push({ ...r.dropoffBranch, id: "b", tone: "brass", glyph: "B", title: r.dropoffBranch.name });
  return markers;
}

export default async function ReservationPage({ params }: { params: { code: string } }) {
  let reservation: Reservation;
  try {
    // Al volver de Stripe, verificamos el pago aunque el webhook no haya llegado todavía
    reservation = await container.reservationService.syncPayment(params.code);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  const r = reservation;

  const priceLines = [
    { kind: "base" as const, label: `${pluralize(r.days, "día")} de alquiler`, amount: r.subtotal },
    ...(r.discount ? [{ kind: "discount" as const, label: "Descuento por estadía", amount: -r.discount }] : []),
    ...(r.deliveryFee ? [{ kind: "fee" as const, label: "Entrega / traslado", amount: r.deliveryFee }] : []),
  ];

  return (
    <div className="container max-w-5xl py-12">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="eyebrow">Reserva</p>
          <h1 className="display num mt-2 text-5xl">{r.code}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A nombre de {r.customerName} · {maskEmail(r.customerEmail)}
          </p>
        </div>
        <StatusBadge status={r.status} />
      </div>

      {r.status === "PENDING" && r.paymentProvider === "demo" && (
        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-brass/40 bg-brass-soft/60 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold">Falta confirmar el pago</p>
            <p className="text-sm text-muted-foreground">El sitio está en modo demo (sin Stripe configurado).</p>
          </div>
          <SimulatePaymentButton code={r.code} />
        </div>
      )}

      {r.status === "PAID" && (
        <p className="mt-8 flex items-center gap-3 rounded-2xl border bg-success/5 p-5 text-sm font-medium text-success">
          <CheckCircle2 className="h-5 w-5" /> ¡Listo! Tu reserva está confirmada. Guardá el código para consultarla.
        </p>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <div className="flex gap-5 rounded-2xl border bg-card p-5">
            <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-lg bg-secondary">
              <CarImage src={r.carPhoto} alt={r.carName} fill sizes="144px" className="object-cover" />
            </div>
            <div className="min-w-0 space-y-2 text-sm">
              <Link href={`/autos/${r.carId}`} className="text-lg font-semibold hover:underline">
                {r.carName}
              </Link>
              <p className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4" strokeWidth={1.5} />
                {formatDate(r.startDate, "EEE d MMM")} → {formatDate(r.endDate, "EEE d MMM yyyy")}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" strokeWidth={1.5} />
                {DELIVERY_LABELS[r.deliveryMode]}
                {r.deliveryMode === "BRANCH"
                  ? `: ${r.pickupBranch?.name ?? "—"}${r.dropoffBranch && r.dropoffBranch.id !== r.pickupBranch?.id ? ` → ${r.dropoffBranch.name}` : ""}`
                  : r.deliveryAddress
                    ? `: ${r.deliveryAddress}`
                    : ""}
              </p>
              {r.routeDistanceKm != null && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <RouteIcon className="h-4 w-4" strokeWidth={1.5} />
                  {formatNumber(r.routeDistanceKm, 1)} km
                  <Clock className="ml-2 h-4 w-4" strokeWidth={1.5} />
                  {Math.round(r.routeDurationMin ?? 0)} min estimados
                </p>
              )}
            </div>
          </div>

          <Map className="h-72" markers={buildMarkers(r)} />
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h2 className="text-sm font-semibold">Detalle del pago</h2>
          <QuoteBreakdown className="mt-4" lines={priceLines} total={r.total} />
          <Button asChild variant="outline" className="mt-6 w-full">
            <Link href="/autos">Seguir explorando</Link>
          </Button>
        </div>
      </div>

      {r.status === "COMPLETED" && r.hasReview && (
        <p className="mt-12 flex items-center gap-3 rounded-2xl border bg-success/5 p-5 text-sm font-medium text-success">
          <CheckCircle2 className="h-5 w-5" /> ¡Gracias por calificar el {r.carName}! Tu reseña ya está publicada.
        </p>
      )}

      {r.status === "COMPLETED" && !r.hasReview && (
        <div className="mt-12">
          <ReviewForm code={r.code} carName={r.carName} />
        </div>
      )}
    </div>
  );
}
