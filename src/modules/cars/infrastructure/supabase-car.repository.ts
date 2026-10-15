import "server-only";
import type { Db } from "@server/supabase";
import { unwrap, unwrapMaybe } from "@server/supabase";
import type { Tables, TablesInsert } from "@server/database.types";
import type { Car, CarFilters, CarWithRating } from "../domain/car";
import type { CarRepository } from "../domain/car.repository";
import type { CarInput } from "../validation/car.schema";

const SELECT = "*, branch:branches(name)";
type CarRow = Tables<"cars"> & { branch: { name: string } | null };

/** Mapper fila (snake_case) → entidad de dominio (camelCase). */
const toDomain = (row: CarRow): Car => ({
  id: row.id,
  name: row.name,
  brand: row.brand,
  year: row.year,
  category: row.category,
  transmission: row.transmission,
  fuel: row.fuel,
  seats: row.seats,
  horsepower: row.horsepower,
  engine: row.engine,
  pricePerDay: Number(row.price_per_day),
  photo: row.photo,
  isPublished: row.is_published,
  mileageKm: row.mileage_km,
  branchId: row.branch_id,
  branchName: row.branch?.name ?? null,
  lat: row.lat,
  lng: row.lng,
  createdAt: new Date(row.created_at),
});

const toRow = (input: Partial<CarInput>): Partial<TablesInsert<"cars">> => {
  const row: Partial<TablesInsert<"cars">> = {
    name: input.name,
    brand: input.brand,
    year: input.year,
    category: input.category,
    transmission: input.transmission,
    fuel: input.fuel,
    seats: input.seats,
    horsepower: input.horsepower,
    engine: input.engine,
    price_per_day: input.pricePerDay,
    photo: input.photo,
    branch_id: input.branchId,
    is_published: input.isPublished,
  };
  // Quita undefined para no pisar columnas en updates parciales
  return Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined));
};

/** Escapa caracteres con significado en la sintaxis `or()` de PostgREST. */
const sanitizeSearch = (q: string) => q.replace(/[%,()*\\]/g, " ").trim();

export class SupabaseCarRepository implements CarRepository {
  constructor(private readonly db: Db) {}

  async findPublished(filters: CarFilters): Promise<CarWithRating[]> {
    let query = this.db.from("cars").select(SELECT).eq("is_published", true);

    if (filters.category) query = query.eq("category", filters.category);
    if (filters.transmission) query = query.eq("transmission", filters.transmission);
    if (filters.fuel) query = query.eq("fuel", filters.fuel);
    if (filters.minSeats) query = query.gte("seats", filters.minSeats);
    if (filters.maxPrice) query = query.lte("price_per_day", filters.maxPrice);
    const q = filters.query ? sanitizeSearch(filters.query) : "";
    if (q) query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%`);

    query =
      filters.sort === "price-asc"
        ? query.order("price_per_day", { ascending: true })
        : filters.sort === "price-desc"
          ? query.order("price_per_day", { ascending: false })
          : query.order("created_at", { ascending: false });

    const rows = unwrap(await query) as CarRow[];
    const stats = rows.length
      ? unwrap(await this.db.from("car_rating_stats").select("*").in("car_id", rows.map((r) => r.id)))
      : [];
    const byCar = new Map(stats.map((s) => [s.car_id, s]));

    const cars = rows.map((row) => ({
      ...toDomain(row),
      ratingAverage: byCar.get(row.id)?.rating_average ?? null,
      ratingCount: byCar.get(row.id)?.rating_count ?? 0,
    }));
    if (filters.sort === "rating") cars.sort((a, b) => (b.ratingAverage ?? 0) - (a.ratingAverage ?? 0));
    return cars;
  }

  async findAll(): Promise<Car[]> {
    const rows = unwrap(await this.db.from("cars").select(SELECT).order("created_at", { ascending: false }));
    return (rows as CarRow[]).map(toDomain);
  }

  async findById(id: string): Promise<Car | null> {
    const row = unwrapMaybe(await this.db.from("cars").select(SELECT).eq("id", id).maybeSingle());
    return row ? toDomain(row as CarRow) : null;
  }

  async create(input: CarInput): Promise<Car> {
    const row = unwrap(
      await this.db.from("cars").insert(toRow(input) as TablesInsert<"cars">).select(SELECT).single(),
    );
    return toDomain(row as CarRow);
  }

  async update(id: string, input: Partial<CarInput>): Promise<Car> {
    const row = unwrap(await this.db.from("cars").update(toRow(input)).eq("id", id).select(SELECT).single());
    return toDomain(row as CarRow);
  }

  setPublished(id: string, isPublished: boolean): Promise<Car> {
    return this.update(id, { isPublished });
  }

  async setLocation(id: string, lat: number, lng: number): Promise<Car> {
    const row = unwrap(await this.db.from("cars").update({ lat, lng }).eq("id", id).select(SELECT).single());
    return toDomain(row as CarRow);
  }

  async addMileage(id: string, km: number): Promise<void> {
    // RPC atómica: evita "leer-sumar-escribir" con condiciones de carrera
    unwrap(await this.db.rpc("increment_car_mileage", { p_car_id: id, p_km: Math.round(km) }));
  }

  async delete(id: string): Promise<void> {
    unwrap(await this.db.from("cars").delete().eq("id", id));
  }
}
