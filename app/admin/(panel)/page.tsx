import { AlertTriangle, CalendarClock, CarFront, CircleDollarSign, Gauge, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PerformanceTable } from "@modules/fleet/ui/PerformanceTable";
import { RevenueChart } from "@modules/fleet/ui/RevenueChart";
import { StatusBadge } from "@modules/reservations/ui/StatusBadge";
import { container } from "@server/container";
import { PageHeader } from "@shared/layout/PageHeader";
import { formatCurrency, formatDateRange, formatPercent } from "@shared/lib/format";
import { StatCard } from "@shared/ui/StatCard";

export default async function AdminOverviewPage() {
  const { fleetService, reservationService } = container;
  const [kpis, performance, reservations] = await Promise.all([
    fleetService.kpis(30),
    fleetService.performance(90),
    reservationService.listAll(),
  ]);

  const delta = kpis.revenuePrev ? (kpis.revenue - kpis.revenuePrev) / kpis.revenuePrev : null;
  const attention = performance.filter((p) => p.grade === "D" || p.grade === "C");
  const recent = reservations.slice(0, 6);

  return (
    <>
      <PageHeader title="Resumen" description="Indicadores de los últimos 30 días y desempeño de flota a 90 días." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Ingresos 30 días" value={formatCurrency(kpis.revenue)} icon={CircleDollarSign} delta={delta} hint="vs. período anterior" />
        <StatCard label="En curso" value={kpis.activeRentals} icon={CarFront} hint={`${kpis.upcomingRentals} próximas`} />
        <StatCard label="Pagos pendientes" value={kpis.pendingPayments} icon={CalendarClock} hint="checkout abierto" />
        <StatCard label="Utilización" value={formatPercent(kpis.utilization)} icon={Gauge} hint="promedio de flota" />
        <StatCard
          label="Satisfacción"
          value={kpis.averageRating ? `${kpis.averageRating.toFixed(2)}★` : "—"}
          icon={Star}
          hint={`${kpis.reviewCount} reseñas`}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-xl border bg-card p-6">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-semibold">Ingresos por mes</h2>
            <span className="text-xs text-muted-foreground">Reservas pagadas · últimos 6 meses</span>
          </div>
          <RevenueChart data={kpis.revenueByMonth} />
        </section>

        <section className="rounded-xl border bg-card p-6">
          <h2 className="font-semibold">Requiere atención</h2>
          {attention.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Toda la flota está en grado A o B. 👌</p>
          ) : (
            <ul className="mt-4 divide-y">
              {attention.slice(0, 5).map((p) => (
                <li key={p.carId} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <div>
                      <Link href={`/admin/flota/${p.carId}`} className="text-sm font-medium hover:underline">
                        {p.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {p.criteria.filter((c) => c.score !== null).sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0]?.label} es el punto más débil
                      </p>
                    </div>
                  </div>
                  <span className="num text-sm font-semibold">{p.score}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="display text-2xl">Ranking de performance</h2>
            <p className="text-sm text-muted-foreground">Satisfacción 35% · Utilización 30% · Confiabilidad 20% · Eficiencia 15%</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/flota">Gestionar flota</Link>
          </Button>
        </div>
        <PerformanceTable rows={performance} />
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="display text-2xl">Últimas reservas</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/reservas">Ver todas</Link>
          </Button>
        </div>
        <ul className="divide-y rounded-xl border bg-card">
          {recent.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
              <div>
                <p className="font-medium">
                  {r.carName} <span className="num font-normal text-muted-foreground">· {r.code}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.customerName} · {formatDateRange(r.startDate, r.endDate)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="num font-medium">{formatCurrency(r.total)}</span>
                <StatusBadge status={r.status} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
