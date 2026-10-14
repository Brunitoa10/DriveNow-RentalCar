import { cn } from "@/lib/utils";
import type { CarPerformance } from "../domain/performance";

const GRADE_STYLES: Record<CarPerformance["grade"], string> = {
  A: "bg-success text-white",
  B: "bg-ink text-background",
  C: "bg-warning text-white",
  D: "bg-destructive text-white",
  "—": "bg-secondary text-muted-foreground",
};

export function GradeBadge({ grade, className }: { grade: CarPerformance["grade"]; className?: string }) {
  return (
    <span className={cn("grid h-8 w-8 place-items-center rounded-md text-sm font-bold", GRADE_STYLES[grade], className)}>
      {grade}
    </span>
  );
}

export function ScoreBar({ value, className }: { value: number | null; className?: string }) {
  const pct = value ?? 0;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
        <span
          className={cn("block h-full rounded-full", pct >= 85 ? "bg-success" : pct >= 70 ? "bg-ink" : pct >= 55 ? "bg-warning" : "bg-destructive")}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="num w-8 text-right text-sm font-semibold">{value ?? "—"}</span>
    </div>
  );
}

/** Desglose por criterio (se usa en el detalle público y en el admin). */
export function CriteriaList({ performance }: { performance: CarPerformance }) {
  return (
    <ul className="space-y-4">
      {performance.criteria.map((c) => (
        <li key={c.key}>
          <div className="mb-1.5 flex items-baseline justify-between gap-4 text-sm">
            <span className="font-medium">
              {c.label} <span className="text-xs font-normal text-muted-foreground">· peso {Math.round(c.weight * 100)}%</span>
            </span>
            <span className="text-xs text-muted-foreground">{c.detail}</span>
          </div>
          <ScoreBar value={c.score === null ? null : Math.round(c.score * 100)} />
        </li>
      ))}
    </ul>
  );
}
