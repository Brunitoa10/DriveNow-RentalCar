import "server-only";
import { BranchService, SupabaseBranchRepository } from "@modules/branches/branch.service";
import { CarService } from "@modules/cars/application/car.service";
import { SupabaseCarRepository } from "@modules/cars/infrastructure/supabase-car.repository";
import { createDefaultScorer } from "@modules/fleet/domain/performance";
import { FleetService } from "@modules/fleet/fleet.service";
import { DemoPaymentGateway, StripePaymentGateway, type PaymentGateway } from "@modules/payments/payment-gateway";
import { ReservationService } from "@modules/reservations/application/reservation.service";
import { createDefaultPricingEngine } from "@modules/reservations/domain/pricing";
import { SupabaseReservationRepository } from "@modules/reservations/infrastructure/supabase-reservation.repository";
import { ReviewService, SupabaseReviewRepository } from "@modules/reviews/review.service";
import { SupabasePhotoStorage } from "@modules/storage/photo-storage";
import { FallbackRoutingProvider, OsrmRoutingProvider, StraightLineRoutingProvider } from "@modules/routing/routing";
import { env } from "@shared/config/env";
import { getSupabase } from "./supabase";

/**
 * Composition Root: único lugar donde se eligen implementaciones concretas
 * y se cablean dependencias. El resto del código depende de interfaces.
 */
function buildContainer() {
  const supabase = getSupabase();
  const payments: PaymentGateway = env.stripeApiKey
    ? new StripePaymentGateway(env.stripeApiKey)
    : new DemoPaymentGateway();

  const routing = new FallbackRoutingProvider(
    new OsrmRoutingProvider(env.osrmUrl),
    new StraightLineRoutingProvider(),
  );

  const carService = new CarService(new SupabaseCarRepository(supabase));
  const branchService = new BranchService(new SupabaseBranchRepository(supabase));
  const fleetService = new FleetService(supabase, createDefaultScorer());

  const reservationService = new ReservationService(
    new SupabaseReservationRepository(supabase),
    carService,
    branchService,
    createDefaultPricingEngine(),
    routing,
    payments,
    fleetService,
    env.appUrl,
  );

  const reviewService = new ReviewService(new SupabaseReviewRepository(supabase), reservationService);
  const photoStorage = new SupabasePhotoStorage(supabase, env.storageBucket);

  return { carService, branchService, fleetService, reservationService, reviewService, photoStorage, payments };
}

type Container = ReturnType<typeof buildContainer>;

declare global {
  // eslint-disable-next-line no-var
  var __container: Container | undefined;
}

export function getContainer(): Container {
  globalThis.__container ??= buildContainer();
  return globalThis.__container;
}

/** Acceso cómodo (`container.carService`) que se resuelve recién al usarse. */
export const container = new Proxy({} as Container, {
  get: (_, key) => getContainer()[key as keyof Container],
});
