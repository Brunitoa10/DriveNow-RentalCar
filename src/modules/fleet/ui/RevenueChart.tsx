import { formatCurrency } from "@shared/lib/format";

/** Barras simples en CSS: sin librerías de gráficos para 6 valores. */
export function RevenueChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-56 items-end gap-3">
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        return (
          <div key={d.label} className="group flex h-full flex-1 flex-col items-center gap-2">
            <span className="num text-[11px] text-muted-foreground">{formatCurrency(d.value)}</span>
            {/* Contenedor propio: el % de alto se calcula sólo sobre el área de barras */}
            <div className="relative w-full flex-1">
              <div
                className={`absolute inset-x-0 bottom-0 rounded-t-md transition-colors ${isLast ? "bg-brass" : "bg-ink/85 group-hover:bg-ink"}`}
                style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }}
                title={formatCurrency(d.value)}
              />
            </div>
            <span className="text-xs capitalize text-muted-foreground">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
