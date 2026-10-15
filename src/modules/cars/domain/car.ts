/** Enums de dominio (reflejan los enums de Postgres en Supabase). */
export const CAR_CATEGORIES = ["SEDAN", "SUV", "DEPORTIVO", "LUJO", "COMPACTO", "PICKUP"] as const;
export const TRANSMISSIONS = ["MANUAL", "AUTOMATICA"] as const;
export const FUEL_TYPES = ["NAFTA", "DIESEL", "HIBRIDO", "ELECTRICO"] as const;

export type CarCategory = (typeof CAR_CATEGORIES)[number];
export type Transmission = (typeof TRANSMISSIONS)[number];
export type FuelType = (typeof FUEL_TYPES)[number];

/** Entidad de dominio: tipos planos (number en lugar de Decimal) serializables al cliente. */
export interface Car {
  id: string;
  name: string;
  brand: string;
  year: number;
  category: CarCategory;
  transmission: Transmission;
  fuel: FuelType;
  seats: number;
  horsepower: number;
  engine: string;
  pricePerDay: number;
  photo: string;
  isPublished: boolean;
  mileageKm: number;
  branchId: string | null;
  branchName: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: Date;
}

/** Car + resumen de calificaciones, usado en listados públicos. */
export interface CarWithRating extends Car {
  ratingAverage: number | null;
  ratingCount: number;
}

export type CarSort = "recent" | "price-asc" | "price-desc" | "rating";

export interface CarFilters {
  category?: CarCategory;
  transmission?: Transmission;
  fuel?: FuelType;
  minSeats?: number;
  maxPrice?: number;
  query?: string;
  sort?: CarSort;
}

export const CATEGORY_LABELS: Record<CarCategory, string> = {
  SEDAN: "Sedán",
  SUV: "SUV",
  DEPORTIVO: "Deportivo",
  LUJO: "Lujo",
  COMPACTO: "Compacto",
  PICKUP: "Pickup",
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  MANUAL: "Manual",
  AUTOMATICA: "Automática",
};

export const FUEL_LABELS: Record<FuelType, string> = {
  NAFTA: "Nafta",
  DIESEL: "Diésel",
  HIBRIDO: "Híbrido",
  ELECTRICO: "Eléctrico",
};

export const SORT_LABELS: Record<CarSort, string> = {
  recent: "Más recientes",
  "price-asc": "Precio: menor a mayor",
  "price-desc": "Precio: mayor a menor",
  rating: "Mejor calificados",
};
