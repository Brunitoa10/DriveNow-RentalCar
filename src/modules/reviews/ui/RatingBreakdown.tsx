import { RatingStars } from "@shared/ui/RatingStars";
import { REVIEW_CRITERIA, type RatingSummary } from "../review";

export function RatingBreakdown({ summary }: { summary: RatingSummary }) {
  if (!summary.overall) return null;
  return (
    <div className="grid gap-8 rounded-2xl border bg-card p-6 md:grid-cols-[auto_1fr_1fr] md:p-8">
      <div className="md:pr-8">
        <p className="display num text-7xl leading-none">{summary.overall.toFixed(1)}</p>
        <RatingStars value={summary.overall} size={16} className="mt-3" />
        <p className="mt-2 text-sm text-muted-foreground">{summary.count} reseñas verificadas</p>
      </div>

      <ul className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = summary.distribution[star - 1];
          return (
            <li key={star} className="flex items-center gap-3 text-xs">
              <span className="num w-3 text-muted-foreground">{star}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <span className="block h-full rounded-full bg-brass" style={{ width: `${(count / summary.count) * 100}%` }} />
              </span>
              <span className="num w-6 text-right text-muted-foreground">{count}</span>
            </li>
          );
        })}
      </ul>

      <ul className="space-y-3">
        {REVIEW_CRITERIA.map(({ key, label }) => {
          const value = summary.criteria[key] ?? 0;
          return (
            <li key={key}>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="num font-medium">{value.toFixed(1)}</span>
              </div>
              <span className="mt-1 block h-1 overflow-hidden rounded-full bg-secondary">
                <span className="block h-full rounded-full bg-ink" style={{ width: `${(value / 5) * 100}%` }} />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
