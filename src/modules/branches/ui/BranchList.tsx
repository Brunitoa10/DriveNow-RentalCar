import { MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Branch } from "../branch";

export function BranchList({ branches, className }: { branches: Branch[]; className?: string }) {
  return (
    <ol className={cn("divide-y rounded-xl border bg-card", className)}>
      {branches.map((b, i) => (
        <li key={b.id} className="flex gap-4 p-5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-[11px] font-semibold text-background">
            {i + 1}
          </span>
          <div className="min-w-0">
            <p className="font-semibold">{b.name}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              {b.address}, {b.city}
            </p>
            {b.phone && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                {b.phone}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
