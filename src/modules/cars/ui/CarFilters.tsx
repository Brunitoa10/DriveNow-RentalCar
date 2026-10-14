"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, FUEL_LABELS, SORT_LABELS, TRANSMISSION_LABELS } from "../domain/car";

const ALL = "__all";

const FILTERS = [
  { param: "categoria", placeholder: "Categoría", options: CATEGORY_LABELS },
  { param: "caja", placeholder: "Transmisión", options: TRANSMISSION_LABELS },
  { param: "combustible", placeholder: "Combustible", options: FUEL_LABELS },
  { param: "plazas", placeholder: "Plazas", options: { "2": "2+ plazas", "4": "4+ plazas", "5": "5+ plazas", "7": "7+ plazas" } },
  { param: "precioMax", placeholder: "Precio", options: { "150": "Hasta USD 150", "300": "Hasta USD 300", "600": "Hasta USD 600" } },
] as const;

export function CarFilters({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(params.get("q") ?? "");

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === ALL) next.delete(key);
    else next.set(key, value);
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  // Búsqueda con debounce para no navegar en cada tecla
  useEffect(() => {
    const id = setTimeout(() => {
      if ((params.get("q") ?? "") !== query) update("q", query.trim() || null);
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const activeCount = FILTERS.filter((f) => params.get(f.param)).length + (params.get("q") ? 1 : 0);

  return (
    <div className={cn("rounded-xl border bg-card p-3 shadow-soft transition-opacity", isPending && "opacity-70")}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar marca o modelo"
            className="h-10 border-0 bg-secondary pl-9 shadow-none"
            aria-label="Buscar"
          />
        </div>

        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
          {FILTERS.map(({ param, placeholder, options }) => (
            <Select key={param} value={params.get(param) ?? ALL} onValueChange={(v) => update(param, v)}>
              <SelectTrigger className="h-10 lg:w-auto lg:min-w-[136px]" aria-label={placeholder}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{placeholder}: todas</SelectItem>
                {Object.entries(options).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        <Select value={params.get("orden") ?? "recent"} onValueChange={(v) => update("orden", v === "recent" ? null : v)}>
          <SelectTrigger className="h-10 lg:w-52" aria-label="Ordenar">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-3 flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="num">{total}</span> {total === 1 ? "auto disponible" : "autos disponibles"}
        </span>
        {activeCount > 0 && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={() => {
              setQuery("");
              startTransition(() => router.replace(pathname, { scroll: false }));
            }}
          >
            <X className="h-3 w-3" /> Limpiar ({activeCount})
          </Button>
        )}
      </div>
    </div>
  );
}
