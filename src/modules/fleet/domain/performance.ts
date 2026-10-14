import type { CarCategory, FuelType } from "@prisma/client";

/** Datos crudos de un auto en la ventana analizada. */
export interface CarActivity {
  carId: string;
  name: string;
  brand: string;
  photo: string;
  category: CarCategory;
  fuel: FuelType;
  windowDays: number;
  bookedDays: number;
  downtimeDays: number;
  revenue: number;
  ratingAverage: number | null;
  ratingCount: number;
  distanceKm: number;
  fuelUsedL: number;
  incidents: number;
  maintenanceCost: number;
}

export interface CriterionResult {
  key: string;
  label: string;
  weight: number;
  /** 0..1, o null si no hay datos suficientes. */
  score: number | null;
  detail: string;
}

export interface CarPerformance extends CarActivity {
  utilization: number;
  consumptionL100: number | null;
  incidentsPer1000Km: number | null;
  revenuePerDay: number;
  score: number | null;
  grade: "A" | "B" | "C" | "D" | "—";
  criteria: CriterionResult[];
}

/**
 * Strategy: cada criterio de performance es una clase independiente.
 * Sumar un criterio (p. ej. "emisiones") no requiere tocar el scorer.
 */
export interface ScoreCriterion {
  readonly key: string;
  readonly label: string;
  readonly weight: number;
  evaluate(activity: CarActivity): { score: number | null; detail: string };
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export class RatingCriterion implements ScoreCriterion {
  readonly key = "rating";
  readonly label = "Satisfacción";
  constructor(readonly weight = 0.35) {}

  evaluate(a: CarActivity) {
    if (a.ratingAverage === null) return { score: null, detail: "Sin reseñas" };
    return {
      score: clamp01((a.ratingAverage - 1) / 4),
      detail: `${a.ratingAverage.toFixed(1)}★ en ${a.ratingCount} reseñas`,
    };
  }
}

export class UtilizationCriterion implements ScoreCriterion {
  readonly key = "utilization";
  readonly label = "Utilización";
  constructor(
    readonly weight = 0.3,
    private readonly target = 0.75,
  ) {}

  evaluate(a: CarActivity) {
    const available = Math.max(1, a.windowDays - a.downtimeDays);
    const utilization = a.bookedDays / available;
    return {
      score: clamp01(utilization / this.target),
      detail: `${Math.round(utilization * 100)}% de días alquilados (meta ${Math.round(this.target * 100)}%)`,
    };
  }
}

export class ReliabilityCriterion implements ScoreCriterion {
  readonly key = "reliability";
  readonly label = "Confiabilidad";
  constructor(readonly weight = 0.2) {}

  evaluate(a: CarActivity) {
    const incidentRate = a.distanceKm > 0 ? (a.incidents / a.distanceKm) * 1000 : 0;
    const incidentScore = 1 - clamp01(incidentRate / 3);
    const downtimeScore = 1 - clamp01((a.downtimeDays / a.windowDays) * 4);
    return {
      score: (incidentScore + downtimeScore) / 2,
      detail: `${a.incidents} incidentes · ${a.downtimeDays} días en taller`,
    };
  }
}

/** Consumo de referencia (L/100 km) por categoría. */
const CONSUMPTION_BENCHMARK: Record<CarCategory, number> = {
  COMPACTO: 6.5,
  SEDAN: 7.5,
  SUV: 9.5,
  PICKUP: 11,
  DEPORTIVO: 12,
  LUJO: 11,
};

export class EfficiencyCriterion implements ScoreCriterion {
  readonly key = "efficiency";
  readonly label = "Eficiencia";
  constructor(readonly weight = 0.15) {}

  evaluate(a: CarActivity) {
    if (a.fuel === "ELECTRICO") return { score: 1, detail: "Eléctrico" };
    if (a.distanceKm < 50 || a.fuelUsedL <= 0) return { score: null, detail: "Sin viajes registrados" };
    const consumption = (a.fuelUsedL / a.distanceKm) * 100;
    const benchmark = CONSUMPTION_BENCHMARK[a.category];
    return {
      score: clamp01(benchmark / consumption),
      detail: `${consumption.toFixed(1)} L/100km (ref. ${benchmark})`,
    };
  }
}

/** Composite ponderado: re-normaliza pesos cuando un criterio no tiene datos. */
export class PerformanceScorer {
  constructor(private readonly criteria: ScoreCriterion[]) {}

  evaluate(activity: CarActivity): CarPerformance {
    const criteria: CriterionResult[] = this.criteria.map((c) => ({
      key: c.key,
      label: c.label,
      weight: c.weight,
      ...c.evaluate(activity),
    }));

    const scored = criteria.filter((c) => c.score !== null);
    const totalWeight = scored.reduce((acc, c) => acc + c.weight, 0);
    const score = totalWeight
      ? Math.round((scored.reduce((acc, c) => acc + c.weight * (c.score as number), 0) / totalWeight) * 100)
      : null;

    const available = Math.max(1, activity.windowDays - activity.downtimeDays);
    return {
      ...activity,
      utilization: activity.bookedDays / available,
      consumptionL100: activity.distanceKm > 0 ? (activity.fuelUsedL / activity.distanceKm) * 100 : null,
      incidentsPer1000Km: activity.distanceKm > 0 ? (activity.incidents / activity.distanceKm) * 1000 : null,
      revenuePerDay: activity.revenue / activity.windowDays,
      score,
      grade: toGrade(score),
      criteria,
    };
  }
}

export function toGrade(score: number | null): CarPerformance["grade"] {
  if (score === null) return "—";
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  return "D";
}

export const createDefaultScorer = () =>
  new PerformanceScorer([
    new RatingCriterion(),
    new UtilizationCriterion(),
    new ReliabilityCriterion(),
    new EfficiencyCriterion(),
  ]);
