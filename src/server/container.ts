import "server-only";
import { BranchService, PrismaBranchRepository } from "@modules/branches/branch.service";
import { CarService } from "@modules/cars/application/car.service";
import { PrismaCarRepository } from "@modules/cars/infrastructure/prisma-car.repository";
import { createDefaultScorer } from "@modules/fleet/domain/performance";
import { FleetService } from "@modules/fleet/fleet.service";
import { DemoPaymentGateway, StripePaymentGateway, type PaymentGateway } from "@modules/payments/payment-gateway";
import { ReservationService } from "@modules/reservations/application/reservation.service";
import { createDefaultPricingEngine } from "@modules/reservations/domain/pricing";
import { PrismaReservationRepository } from "@modules/reservations/infrastructure/prisma-reservation.repository";
import { PrismaReviewRepository, ReviewService } from "@modules/reviews/review.service";
import { FallbackRoutingProvider, OsrmRoutingProvider, StraightLineRoutingProvider } from "@modules/routing/routing";
import { env } from "@shared/config/env";
import { db } from "./db";

/**
 * Composition Root: único lugar donde se eligen implementaciones concretas
 * y se cablean dependencias. El resto del código depende de interfaces.
 */
function buildContainer() {
  const payments: PaymentGateway = env.stripeApiKey
    ? new StripePaymentGateway(env.stripeApiKey)
    : new DemoPaymentGateway();

  const routing = new FallbackRoutingProvider(
    new OsrmRoutingProvider(env.osrmUrl),
    new StraightLineRoutingProvider(),
  );

  const carService = new CarService(new PrismaCarRepository(db));
  const branchService = new BranchService(new PrismaBranchRepository(db));
  const fleetService = new FleetService(db, createDefaultScorer());

  const reservationService = new ReservationService(
    new PrismaReservationRepository(db),
    carService,
    branchService,
    createDefaultPricingEngine(),
    routing,
    payments,
    fleetService,
    env.appUrl,
  );

  const reviewService = new ReviewService(new PrismaReviewRepository(db), reservationService);

  return { carService, branchService, fleetService, reservationService, reviewService, payments };
}

type Container = ReturnType<typeof buildContainer>;

declare global {
  // eslint-disable-next-line no-var
  var __container: Container | undefined;
}

export const container: Container = globalThis.__container ?? buildContainer();
if (process.env.NODE_ENV !== "production") globalThis.__container = container;
