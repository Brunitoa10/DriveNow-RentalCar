import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CarForm } from "@modules/cars/ui/admin/CarForm";
import { CarLocationEditor } from "@modules/cars/ui/admin/CarLocationEditor";
import { MaintenanceForm } from "@modules/fleet/ui/MaintenanceForm";
import { CriteriaList, GradeBadge } from "@modules/fleet/ui/ScoreBar";
import { container } from "@server/container";
import { PageHeader } from "@shared/layout/PageHeader";
import { NotFoundError } from "@shared/lib/errors";
import { formatCurrency, formatDate, formatNumber, formatPercent } from "@shared/lib/format";

export const metadata: Metadata = { title: "Detalle de auto" };

export default async function AdminCarPage({ params }: { params: { id: string } }) {
  const { carService, branchService, fleetService } = container;
  const car = await carService.getById(params.id).catch((e) => {
    if (e instanceof NotFoundError) notFound();
    throw e;
  });
  const [branches, performance, maintenance, trips] = await Promise.all([
    branchService.list(),
    fleetService.performanceFor(car.id),
    fleetService.listMaintenance(car.id),
    fleetService.listTrips(car.id),
  ]);

  const metrics = performance
    ? [
        ["Utilización", formatPercent(performance.utilization)],
        ["Ingresos 90 d", formatCurrency(performance.revenue)],
        ["Ingreso / día", formatCurrency(performance.revenuePerDay)],
        ["Km recorridos", formatNumber(performance.distanceKm)],
        ["Consumo", performance.consumptionL100 ? `${performance.consumptionL100.toFixed(1)} L/100km` : "—"],
        ["Incidentes", String(performance.incidents)],
        ["Días en taller", String(performance.downtimeDays)],
        ["Costo mantenimiento", formatCurrency(performance.maintenanceCost)],
      ]
    : [];

  return (
    <>
      <Link href="/admin/flota" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Flota
      </Link>
      <PageHeader
        title={car.name}
        description={`${car.brand} · ${car.year} · ${formatNumber(car.mileageKm)} km`}
        action={
          car.isPublished && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/autos/${car.id}`} target="_blank">
                Ver en el sitio <ExternalLink />
              </Link>
            </Button>
          )
        }
      />

      {performance && (
        <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-4">
              <GradeBadge grade={performance.grade} className="h-14 w-14 text-2xl" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Índice de performance</p>
                <p className="num text-3xl font-semibold">{performance.score ?? "—"}<span className="text-base text-muted-foreground">/100</span></p>
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
              {metrics.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="num font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-5 font-semibold">Desglose por criterio</h2>
            <CriteriaList performance={performance} />
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="display mb-4 text-2xl">Ficha</h2>
        <CarForm
          carId={car.id}
          branches={branches}
          defaultValues={{
            name: car.name,
            brand: car.brand,
            year: car.year,
            category: car.category,
            transmission: car.transmission,
            fuel: car.fuel,
            seats: car.seats,
            horsepower: car.horsepower,
            engine: car.engine,
            pricePerDay: car.pricePerDay,
            photo: car.photo,
            branchId: car.branchId,
            isPublished: car.isPublished,
          }}
        />
      </section>

      <section className="mt-10 grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 font-semibold">Ubicación actual</h2>
          <CarLocationEditor
            carId={car.id}
            current={car.lat != null && car.lng != null ? { lat: car.lat, lng: car.lng } : null}
            branches={branches.map((b) => ({ id: b.id, lat: b.lat, lng: b.lng, tone: "muted", title: b.name }))}
          />
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 font-semibold">Viajes registrados</h2>
          {trips.length === 0 ? (
            <p className="text-sm text-muted-foreground">Se registran al cerrar cada reserva desde “Reservas”.</p>
          ) : (
            <ul className="divide-y text-sm">
              {trips.map((t) => (
                <li key={t.id} className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">{formatDate(t.recordedAt)}</span>
                  <span className="num">
                    {formatNumber(t.distanceKm)} km · {((t.fuelUsedL / Math.max(1, t.distanceKm)) * 100).toFixed(1)} L/100 ·{" "}
                    {t.incidents} inc.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl border bg-card p-6">
        <h2 className="mb-4 font-semibold">Mantenimiento</h2>
        <MaintenanceForm carId={car.id} />
        {maintenance.length > 0 && (
          <ul className="mt-6 divide-y text-sm">
            {maintenance.map((m) => (
              <li key={m.id} className="flex flex-wrap justify-between gap-2 py-2.5">
                <span className="font-medium">{m.kind}</span>
                <span className="num text-muted-foreground">
                  {formatDate(m.startDate)} → {m.endDate ? formatDate(m.endDate) : "en curso"} · {formatCurrency(m.cost)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
