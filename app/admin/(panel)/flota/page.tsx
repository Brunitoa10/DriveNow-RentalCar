import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CATEGORY_LABELS } from "@modules/cars/domain/car";
import { CarRowActions } from "@modules/cars/ui/admin/CarRowActions";
import { GradeBadge, ScoreBar } from "@modules/fleet/ui/ScoreBar";
import { container } from "@server/container";
import { PageHeader } from "@shared/layout/PageHeader";
import { formatCurrency, formatNumber } from "@shared/lib/format";
import { Badge } from "@shared/ui/Badge";
import { CarImage } from "@shared/ui/CarImage";

export const metadata: Metadata = { title: "Flota" };

export default async function FleetPage() {
  const [cars, performance] = await Promise.all([container.carService.listAll(), container.fleetService.performance(90)]);
  const perfById = new Map(performance.map((p) => [p.carId, p]));

  return (
    <>
      <PageHeader
        title="Flota y performance"
        description={`${cars.length} vehículos · ${cars.filter((c) => c.isPublished).length} publicados`}
        action={
          <Button asChild>
            <Link href="/admin/flota/nuevo">
              <Plus /> Nuevo auto
            </Link>
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Vehículo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Precio/día</TableHead>
              <TableHead className="text-right">Km</TableHead>
              <TableHead className="w-48">Índice</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.map((car) => {
              const perf = perfById.get(car.id);
              return (
                <TableRow key={car.id}>
                  <TableCell>
                    <Link href={`/admin/flota/${car.id}`} className="flex items-center gap-3">
                      <span className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-secondary">
                        <CarImage src={car.photo} alt="" fill sizes="64px" className="object-cover" />
                      </span>
                      <span>
                        <span className="block font-medium hover:underline">{car.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {car.brand} · {car.year} · {car.branchName ?? "Sin sucursal"}
                        </span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell>{CATEGORY_LABELS[car.category]}</TableCell>
                  <TableCell className="num text-right">{formatCurrency(car.pricePerDay)}</TableCell>
                  <TableCell className="num text-right">{formatNumber(car.mileageKm)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <GradeBadge grade={perf?.grade ?? "—"} className="h-6 w-6 text-xs" />
                      <ScoreBar value={perf?.score ?? null} className="flex-1" />
                    </div>
                  </TableCell>
                  <TableCell>
                    {car.isPublished ? <Badge tone="success" dot>Publicado</Badge> : <Badge tone="outline">Oculto</Badge>}
                  </TableCell>
                  <TableCell>
                    <CarRowActions id={car.id} name={car.name} isPublished={car.isPublished} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
