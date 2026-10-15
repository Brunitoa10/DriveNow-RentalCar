import "server-only";
import type { Tables } from "@server/database.types";
import { unwrap, type Db } from "@server/supabase";
import type { ReservationService } from "@modules/reservations/application/reservation.service";
import { DomainError } from "@shared/lib/errors";
import { reviewSchema, summarize, type RatingSummary, type Review, type ReviewRepository } from "./review";

const toDomain = (r: Tables<"reviews">): Review => ({
  id: r.id,
  carId: r.car_id,
  authorName: r.author_name,
  overall: r.overall,
  comfort: r.comfort,
  cleanliness: r.cleanliness,
  performance: r.performance,
  efficiency: r.efficiency,
  value: r.value,
  comment: r.comment,
  createdAt: new Date(r.created_at),
});

export class SupabaseReviewRepository implements ReviewRepository {
  constructor(private readonly db: Db) {}

  async findByCar(carId: string, limit = 200): Promise<Review[]> {
    const rows = unwrap(
      await this.db.from("reviews").select("*").eq("car_id", carId).order("created_at", { ascending: false }).limit(limit),
    );
    return rows.map(toDomain);
  }

  async create(data: Omit<Review, "id" | "createdAt"> & { reservationId: string }): Promise<Review> {
    const row = unwrap(
      await this.db
        .from("reviews")
        .insert({
          car_id: data.carId,
          reservation_id: data.reservationId,
          author_name: data.authorName,
          overall: data.overall,
          comfort: data.comfort,
          cleanliness: data.cleanliness,
          performance: data.performance,
          efficiency: data.efficiency,
          value: data.value,
          comment: data.comment,
        })
        .select("*")
        .single(),
    );
    return toDomain(row);
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
