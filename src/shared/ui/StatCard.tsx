import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  hint?: React.ReactNode;
  /** Variación porcentual vs. período anterior (0.12 = +12%). */
  delta?: number | null;
}

export function StatCard({ label, value, icon: Icon, hint, delta }: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="rounded-xl border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />}
      </div>
      <p className="num mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        {delta !== undefined && delta !== null && (
          <span className={cn("inline-flex items-center font-medium", positive ? "text-success" : "text-destructive")}>
            {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(Math.round(delta * 100))}%
          </span>
        )}
        {hint}
      </div>
    </div>
  );
}
