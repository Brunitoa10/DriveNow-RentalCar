import { z } from "zod";
import type { CarFilters } from "./car";

const filtersSchema = z.object({
  q: z.string().trim().max(60).optional().catch(undefined),
  categoria: z.enum(["SEDAN", "SUV", "DEPORTIVO", "LUJO", "COMPACTO", "PICKUP"]).optional().catch(undefined),
  caja: z.enum(["MANUAL", "AUTOMATICA"]).optional().catch(undefined),
  combustible: z.enum(["NAFTA", "DIESEL", "HIBRIDO", "ELECTRICO"]).optional().catch(undefined),
  plazas: z.coerce.number().int().min(1).max(15).optional().catch(undefined),
  precioMax: z.coerce.number().positive().optional().catch(undefined),
  orden: z.enum(["recent", "price-asc", "price-desc", "rating"]).optional().catch(undefined),
});

/** Traduce los query params (en español, legibles en la URL) a filtros de dominio. */
export function parseCarFilters(params: Record<string, string | string[] | undefined>): CarFilters {
  const flat = Object.fromEntries(Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v || undefined]));
  const p = filtersSchema.parse(flat);
  return {
    query: p.q,
    category: p.categoria,
    transmission: p.caja,
    fuel: p.combustible,
    minSeats: p.plazas,
    maxPrice: p.precioMax,
    sort: p.orden,
  };
}
