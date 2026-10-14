import { cn } from "@/lib/utils";
import { formatCurrency } from "@shared/lib/format";
import type { PriceLine } from "../domain/pricing";

export function QuoteBreakdown({ lines, total, className }: { lines: PriceLine[]; total: number; className?: string }) {
  return (
    <dl className={cn("space-y-2 text-sm", className)}>
      {lines.map((line) => (
        <div key={line.label} className="flex justify-between gap-4">
          <dt className="text-muted-foreground">{line.label}</dt>
          <dd className={cn("num font-medium", line.kind === "discount" && "text-success")}>
            {line.kind === "discount" ? "−" : ""}
            {formatCurrency(Math.abs(line.amount), true)}
          </dd>
        </div>
      ))}
      <div className="flex items-baseline justify-between border-t pt-3">
        <dt className="font-semibold">Total</dt>
        <dd className="num text-xl font-semibold">{formatCurrency(total, true)}</dd>
      </div>
    </dl>
  );
}
