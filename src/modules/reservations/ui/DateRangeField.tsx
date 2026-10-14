"use client";

import { addDays, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange, Matcher } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDate } from "@shared/lib/format";

interface DateRangeFieldProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  blocked?: { from: Date; to: Date }[];
}

export function DateRangeField({ value, onChange, blocked = [] }: DateRangeFieldProps) {
  const disabled: Matcher[] = [{ before: startOfDay(new Date()) }, ...blocked];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="grid w-full grid-cols-2 divide-x rounded-lg border bg-background text-left transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <Slot label="Retiro" value={value?.from} />
          <Slot label="Devolución" value={value?.to} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          defaultMonth={value?.from ?? new Date()}
          selected={value}
          onSelect={onChange}
          disabled={disabled}
          initialFocus
        />
        {blocked.length > 0 && (
          <p className="border-t px-4 py-2 text-xs text-muted-foreground">Las fechas deshabilitadas ya están reservadas.</p>
        )}
      </PopoverContent>
    </Popover>
  );
}

function Slot({ label, value }: { label: string; value?: Date }) {
  return (
    <span className="flex flex-col gap-0.5 px-4 py-3">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn("flex items-center gap-2 text-sm font-medium", !value && "text-muted-foreground")}>
        <CalendarIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
        {value ? formatDate(value, "EEE d MMM") : "Elegir"}
      </span>
    </span>
  );
}

/** Primer rango libre de `nights` noches a partir de mañana (evita arrancar en fechas ocupadas). */
export function firstFreeRange(blocked: { from: Date; to: Date }[], nights = 3): DateRange {
  let from = addDays(startOfDay(new Date()), 1);
  for (let i = 0; i < 120; i++) {
    const to = addDays(from, nights);
    const clash = blocked.find((b) => new Date(b.from) < to && new Date(b.to) > from);
    if (!clash) return { from, to };
    from = startOfDay(new Date(clash.to));
  }
  return { from, to: addDays(from, nights) };
}
