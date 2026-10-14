import { formatDate } from "@shared/lib/format";
import { RatingStars } from "@shared/ui/RatingStars";
import type { Review } from "../review";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-semibold">
                {r.authorName.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-semibold">{r.authorName}</p>
                <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
              </div>
            </div>
            <RatingStars value={r.overall} size={13} />
          </div>
          {r.comment && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">“{r.comment}”</p>}
        </li>
      ))}
    </ul>
  );
}
