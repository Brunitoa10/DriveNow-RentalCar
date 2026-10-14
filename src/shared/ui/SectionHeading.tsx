import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "left", action, className }: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="display text-4xl leading-[1.05] md:text-5xl">{title}</h2>
        {description && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
