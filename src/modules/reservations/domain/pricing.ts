import { differenceInCalendarDays } from "date-fns";

/**
 * Motor de precios con patrón Strategy + Composite.
 * Cada regla es independiente; el motor las aplica en orden.
 * Es código puro (sin I/O): se usa igual en el servidor (autoritativo) y en el cliente (preview).
 */

export interface PricingContext {
  pricePerDay: number;
  startDate: Date;
  endDate: Date;
  deliveryMode: "BRANCH" | "HOME";
  /** Km de la ruta sucursal → domicilio (sólo HOME). */
  deliveryDistanceKm?: number;
  pickupBranchId?: string | null;
  dropoffBranchId?: string | null;
}

export type PriceLineKind = "base" | "discount" | "fee";

export interface PriceLine {
  kind: PriceLineKind;
  label: string;
  amount: number;
}

export interface PricingRule {
  apply(ctx: PricingContext, days: number, runningSubtotal: number): PriceLine | null;
}

export interface Quote {
  days: number;
  lines: PriceLine[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export const countRentalDays = (start: Date, end: Date) =>
  Math.max(1, differenceInCalendarDays(end, start));

// ── Reglas ──────────────────────────────────────────────────────────────

export class BaseRateRule implements PricingRule {
  apply(ctx: PricingContext, days: number): PriceLine {
    return {
      kind: "base",
      label: `${days} ${days === 1 ? "día" : "días"} de alquiler`,
      amount: round2(days * ctx.pricePerDay),
    };
  }
}

export class LongStayDiscountRule implements PricingRule {
  constructor(private readonly tiers: { minDays: number; rate: number }[]) {
    this.tiers = [...tiers].sort((a, b) => b.minDays - a.minDays);
  }

  apply(_ctx: PricingContext, days: number, subtotal: number): PriceLine | null {
    const tier = this.tiers.find((t) => days >= t.minDays);
    if (!tier) return null;
    return {
      kind: "discount",
      label: `Estadía de ${tier.minDays}+ días (−${Math.round(tier.rate * 100)}%)`,
      amount: -round2(subtotal * tier.rate),
    };
  }
}

export class HomeDeliveryFeeRule implements PricingRule {
  constructor(
    private readonly options = { freeKm: 8, perKm: 1.6, minimum: 15 },
  ) {}

  apply(ctx: PricingContext): PriceLine | null {
    if (ctx.deliveryMode !== "HOME" || ctx.deliveryDistanceKm === undefined) return null;
    const billableKm = Math.max(0, ctx.deliveryDistanceKm - this.options.freeKm);
    const amount = Math.max(this.options.minimum, billableKm * this.options.perKm);
    return {
      kind: "fee",
      label: `Entrega a domicilio (${ctx.deliveryDistanceKm.toFixed(1)} km)`,
      amount: round2(amount),
    };
  }
}

export class OneWayFeeRule implements PricingRule {
  constructor(private readonly fee = 35) {}

  apply(ctx: PricingContext): PriceLine | null {
    const isOneWay =
      ctx.deliveryMode === "BRANCH" &&
      !!ctx.pickupBranchId &&
      !!ctx.dropoffBranchId &&
      ctx.pickupBranchId !== ctx.dropoffBranchId;
    return isOneWay ? { kind: "fee", label: "Devolución en otra sucursal", amount: this.fee } : null;
  }
}

// ── Motor ───────────────────────────────────────────────────────────────

export class PricingEngine {
  constructor(private readonly rules: PricingRule[]) {}

  quote(ctx: PricingContext): Quote {
    const days = countRentalDays(ctx.startDate, ctx.endDate);
    const lines: PriceLine[] = [];
    let running = 0;

    for (const rule of this.rules) {
      const line = rule.apply(ctx, days, running);
      if (!line) continue;
      lines.push(line);
      if (line.kind !== "fee") running = round2(running + line.amount);
    }

    const sum = (kind: PriceLineKind) =>
      round2(lines.filter((l) => l.kind === kind).reduce((acc, l) => acc + l.amount, 0));

    const subtotal = sum("base");
    const discount = -sum("discount");
    const deliveryFee = sum("fee");

    return { days, lines, subtotal, discount, deliveryFee, total: round2(subtotal - discount + deliveryFee) };
  }
}

/** Configuración por defecto del negocio. */
export const createDefaultPricingEngine = () =>
  new PricingEngine([
    new BaseRateRule(),
    new LongStayDiscountRule([
      { minDays: 7, rate: 0.1 },
      { minDays: 28, rate: 0.2 },
    ]),
    new HomeDeliveryFeeRule(),
    new OneWayFeeRule(),
  ]);
