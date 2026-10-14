import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@shared/config/site";

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label={siteConfig.name}>
      <span
        className={cn(
          "grid h-8 w-8 place-items-center rounded-md text-[13px] font-bold tracking-tight transition-colors",
          inverted ? "bg-brass text-ink" : "bg-ink text-background group-hover:bg-ink-soft",
        )}
      >
        DN
      </span>
      <span className={cn("display text-[26px] leading-none", inverted && "text-background")}>
        Drive<span className="italic text-brass">Now</span>
      </span>
    </Link>
  );
}
