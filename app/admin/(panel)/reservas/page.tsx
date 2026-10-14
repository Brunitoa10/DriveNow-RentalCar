import type { Metadata } from "next";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DELIVERY_LABELS, STATUS_LABELS, type ReservationStatus } from "@modules/reservations/domain/reservation";
import { ReservationActions } from "@modules/reservations/ui/admin/ReservationActions";
import { StatusBadge } from "@modules/reservations/ui/StatusBadge";
import { container } from "@server/container";
import { PageHeader } from "@shared/layout/PageHeader";
import { formatCurrency, formatDateRange } from "@shared/lib/format";
import { EmptyState } from "@shared/ui/EmptyState";
import { CalendarX } from "lucide-react";

export const metadata: Metadata = { title: "Reservas" };

const STATUSES = Object.keys(STATUS_LABELS) as ReservationStatus[];

export default async function AdminReservationsPage({ searchParams }: { searchParams: { estado?: string } }) {
  const status = STATUSES.find((s) => s === searchParams.estado);
  const all = await container.reservationService.listAll();
  const reservations = status ? all.filter((r) => r.status === status) : all;
  const countBy = (s: ReservationStatus) => all.filter((r) => r.status === s).length;

  return (
    <>
      <PageHeader title="Reservas" description="Gestioná el ciclo de vida: pago → entrega → devolución." />

      <nav className="mb-6 flex flex-wrap gap-2">
        <FilterChip href="/admin/reservas" active={!status} label="Todas" count={all.length} />
        {STATUSES.map((s) => (
          <FilterChip key={s} href={`/admin/reservas?estado=${s}`} active={status === s} label={STATUS_LABELS[s]} count={countBy(s)} />
        ))}
      </nav>

      {reservations.length === 0 ? (
        <EmptyState icon={CalendarX} title="Sin reservas" description="No hay reservas con este estado." />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Auto</TableHead>
                <TableHead>Fechas</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="num whitespace-nowrap font-medium">
                    <Link href={`/reserva/${r.code}`} target="_blank" className="hover:underline">
                      {r.code}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{r.customerName}</p>
                    <p className="text-xs text-muted-foreground">{r.customerEmail} · {r.customerPhone}</p>
                  </TableCell>
                  <TableCell>{r.carName}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDateRange(r.startDate, r.endDate)}
                    <p className="text-xs text-muted-foreground">{r.days} días</p>
                  </TableCell>
                  <TableCell className="text-sm">
                    {DELIVERY_LABELS[r.deliveryMode]}
                    <p className="text-xs text-muted-foreground">
                      {r.deliveryMode === "HOME" ? r.deliveryAddress ?? "Punto en mapa" : r.pickupBranch?.name}
                    </p>
                  </TableCell>
                  <TableCell className="num text-right font-medium">{formatCurrency(r.total)}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell>
                    <ReservationActions id={r.id} status={r.status} carName={r.carName} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

function FilterChip({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active ? "border-ink bg-ink text-background" : "bg-card hover:border-foreground/30",
      )}
    >
      {label}
      <span className={cn("num text-xs", active ? "text-background/70" : "text-muted-foreground")}>{count}</span>
    </Link>
  );
}
