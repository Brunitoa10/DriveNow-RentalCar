import { ArrowLeft, Info } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from "@modules/cars/domain/car";
import { FavoriteButton } from "@modules/cars/ui/FavoriteButton";
import { CriteriaList, GradeBadge } from "@modules/fleet/ui/ScoreBar";
import { BookingPanel } from "@modules/reservations/ui/BookingPanel";
import { RatingBreakdown } from "@modules/reviews/ui/RatingBreakdown";
import { ReviewList } from "@modules/reviews/ui/ReviewList";
import { container } from "@server/container";
import { NotFoundError } from "@shared/lib/errors";
import { formatNumber } from "@shared/lib/format";
import { CarImage } from "@shared/ui/CarImage";
import { RatingStars } from "@shared/ui/RatingStars";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
  searchParams: { pago?: string };
}

async function loadCar(id: string) {
  try {
    return await container.carService.getPublished(id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const car = await loadCar(params.id);
  return { title: car.name, description: `${car.brand} ${car.name} ${car.year} · ${car.horsepower} CV` };
}

export default async function CarDetailPage({ params, searchParams }: PageProps) {
  const car = await loadCar(params.id);
  const { reservationService, reviewService, branchService, fleetService } = container;

  const [branches, blocked, { reviews, summary }, performance] = await Promise.all([
    branchService.list(),
    reservationService.blockedRanges(car.id),
    reviewService.forCar(car.id),
    fleetService.performanceFor(car.id),
  ]);

  const specs = [
    ["Motor", car.engine],
    ["Potencia", `${car.horsepower} CV`],
    ["Transmisión", TRANSMISSION_LABELS[car.transmission]],
    ["Combustible", FUEL_LABELS[car.fuel]],
    ["Plazas", String(car.seats)],
    ["Año", String(car.year)],
    ["Kilometraje", `${formatNumber(car.mileageKm)} km`],
    ["Sucursal base", car.branchName ?? "—"],
  ];

  return (
    <div className="container py-8">
      <Link href="/autos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Volver a la flota
      </Link>

      {searchParams.pago === "cancelado" && (
        <p className="mt-6 flex items-center gap-2 rounded-lg border bg-card p-4 text-sm">
          <Info className="h-4 w-4 text-brass" /> El pago se canceló. Tu reserva no fue confirmada; podés intentarlo nuevamente.
        </p>
      )}

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_440px]">
        {/* ── Columna principal ─────────────────────────────── */}
        <div className="min-w-0 space-y-14">
          <section>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-secondary">
              <CarImage src={car.photo} alt={car.name} fill priority sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" />
              <FavoriteButton car={car} className="absolute right-4 top-4" />
            </div>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">
                  {car.brand} · {CATEGORY_LABELS[car.category]}
                </p>
                <h1 className="display mt-2 text-5xl leading-none md:text-6xl">{car.name}</h1>
                {summary.overall && (
                  <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <RatingStars value={summary.overall} />
                    <span className="num font-medium text-foreground">{summary.overall.toFixed(1)}</span>· {summary.count} reseñas
                  </p>
                )}
              </div>
              {performance?.score != null && (
                <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
                  <GradeBadge grade={performance.grade} />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Índice DriveNow</p>
                    <p className="num text-lg font-semibold">{performance.score}/100</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="display text-3xl">Ficha técnica</h2>
            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-4">
              {specs.map(([label, value]) => (
                <div key={label} className="bg-card p-4">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {performance?.score != null && (
            <section>
              <h2 className="display text-3xl">Desempeño del vehículo</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Calculado con datos reales de los últimos 90 días: reseñas de clientes, uso, incidentes, tiempo en taller y
                consumo medido en cada viaje.
              </p>
              <div className="mt-6 rounded-2xl border bg-card p-6">
                <CriteriaList performance={performance} />
              </div>
            </section>
          )}

          <section>
            <h2 className="display text-3xl">Opiniones</h2>
            {summary.count > 0 ? (
              <div className="mt-6 space-y-6">
                <RatingBreakdown summary={summary} />
                <ReviewList reviews={reviews.slice(0, 6)} />
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Todavía no hay reseñas. Quienes alquilan este auto pueden calificarlo al finalizar el viaje.
              </p>
            )}
          </section>
        </div>

        {/* ── Reserva ───────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BookingPanel
            car={{ id: car.id, name: car.name, pricePerDay: car.pricePerDay, branchId: car.branchId }}
            branches={branches}
            blocked={blocked}
          />
        </aside>
      </div>
    </div>
  );
}
