import { z } from "zod";

/** Criterios que califica el cliente. Agregar uno = agregarlo acá y como columna en la migración SQL. */
export const REVIEW_CRITERIA = [
  { key: "comfort", label: "Confort" },
  { key: "cleanliness", label: "Limpieza" },
  { key: "performance", label: "Rendimiento" },
  { key: "efficiency", label: "Consumo" },
  { key: "value", label: "Precio / calidad" },
] as const;

export type ReviewCriterion = (typeof REVIEW_CRITERIA)[number]["key"];

export interface Review {
  id: string;
  carId: string;
  authorName: string;
  overall: number;
  comfort: number;
  cleanliness: number;
  performance: number;
  efficiency: number;
  value: number;
  comment: string | null;
  createdAt: Date;
}

export interface RatingSummary {
  count: number;
  overall: number | null;
  criteria: Record<ReviewCriterion, number | null>;
  /** Cantidad de reseñas por estrella (índice 0 = 1★). */
  distribution: [number, number, number, number, number];
}

const score = z.coerce.number().int().min(1, "Calificá de 1 a 5").max(5);

export const reviewSchema = z.object({
  code: z.string().trim().toUpperCase(),
  overall: score,
  comfort: score,
  cleanliness: score,
  performance: score,
  efficiency: score,
  value: score,
  comment: z.string().trim().max(800).optional(),
});

export type ReviewInput = z.input<typeof reviewSchema>;

export interface ReviewRepository {
  findByCar(carId: string, limit?: number): Promise<Review[]>;
  create(data: Omit<Review, "id" | "createdAt"> & { reservationId: string }): Promise<Review>;
}

export function summarize(reviews: Review[]): RatingSummary {
  const avg = (pick: (r: Review) => number) =>
    reviews.length ? reviews.reduce((acc, r) => acc + pick(r), 0) / reviews.length : null;

  const distribution: RatingSummary["distribution"] = [0, 0, 0, 0, 0];
  reviews.forEach((r) => distribution[r.overall - 1]++);

  return {
    count: reviews.length,
    overall: avg((r) => r.overall),
    criteria: Object.fromEntries(REVIEW_CRITERIA.map(({ key }) => [key, avg((r) => r[key])])) as RatingSummary["criteria"],
    distribution,
  };
}
