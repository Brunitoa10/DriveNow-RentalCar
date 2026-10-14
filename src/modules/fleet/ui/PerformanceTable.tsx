import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatPercent } from "@shared/lib/format";
import { CarImage } from "@shared/ui/CarImage";
import type { CarPerformance } from "../domain/performance";
import { GradeBadge, ScoreBar } from "./ScoreBar";

export function PerformanceTable({ rows }: { rows: CarPerformance[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12">#</TableHead>
            <TableHead>Vehículo</TableHead>
            <TableHead className="w-48">Índice</TableHead>
            <TableHead className="text-right">Utilización</TableHead>
            <TableHead className="text-right">Rating</TableHead>
            <TableHead className="text-right">L/100km</TableHead>
            <TableHead className="text-right">Ingresos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((p, i) => (
            <TableRow key={p.carId}>
              <TableCell className="num text-muted-foreground">{i + 1}</TableCell>
              <TableCell>
                <Link href={`/admin/flota/${p.carId}`} className="flex items-center gap-3 hover:underline">
                  <span className="relative h-9 w-14 shrink-0 overflow-hidden rounded bg-secondary">
                    <CarImage src={p.photo} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block font-medium">{p.name}</span>
                    <span className="block text-xs text-muted-foreground">{p.brand}</span>
                  </span>
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <GradeBadge grade={p.grade} className="h-6 w-6 text-xs" />
                  <ScoreBar value={p.score} className="flex-1" />
                </div>
              </TableCell>
              <TableCell className="num text-right">{formatPercent(p.utilization)}</TableCell>
              <TableCell className="num text-right">{p.ratingAverage ? `${p.ratingAverage.toFixed(1)}★` : "—"}</TableCell>
              <TableCell className="num text-right">{p.consumptionL100 ? p.consumptionL100.toFixed(1) : "—"}</TableCell>
              <TableCell className="num text-right font-medium">{formatCurrency(p.revenue)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
