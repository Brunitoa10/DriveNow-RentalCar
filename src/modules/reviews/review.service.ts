import "server-only";
import type { PrismaClient } from "@prisma/client";
import type { ReservationService } from "@modules/reservations/application/reservation.service";
import { DomainError } from "@shared/lib/errors";
import { reviewSchema, summarize, type RatingSummary, type Review, type ReviewRepository } from "./review";

export class PrismaReviewRepository implements ReviewRepository {
  constructor(private readonly db: PrismaClient) {}

  findByCar(carId: string, limit = 50): Promise<Review[]> {
    return this.db.review.findMany({ where: { carId }, orderBy: { createdAt: "desc" }, take: limit });
  }

  create(data: Omit<Review, "id" | "createdAt"> & { reservationId: string }): Promise<Review> {
    return this.db.review.create({ data });
  }
}

export class ReviewService {
  constructor(
    private readonly reviews: ReviewRepository,
    private readonly reservations: ReservationService,
  ) {}

  async forCar(carId: string): Promise<{ reviews: Review[]; summary: RatingSummary }> {
    const reviews = await this.reviews.findByCar(carId);
    return { reviews, summary: summarize(reviews) };
  }

  /** Sólo quien completó un alquiler puede reseñar, y una única vez. */
  async submit(raw: unknown): Promise<Review> {
    const { code, comment, ...scores } = reviewSchema.parse(raw);
    const reservation = await this.reservations.getByCode(code);

    if (reservation.status !== "COMPLETED") {
      throw new DomainError("Podés calificar el auto cuando finalice tu alquiler");
    }
    if (reservation.hasReview) throw new DomainError("Esta reserva ya tiene una reseña");

    return this.reviews.create({
      ...scores,
      comment: comment || null,
      carId: reservation.carId,
      reservationId: reservation.id,
      authorName: reservation.customerName.split(" ")[0],
    });
  }
}
