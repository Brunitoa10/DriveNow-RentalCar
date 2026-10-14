"use server";

import { revalidatePath } from "next/cache";
import { container } from "@server/container";
import { runAction, type ActionResult } from "@shared/lib/result";
import type { ReviewInput } from "./review";

export async function submitReviewAction(input: ReviewInput): Promise<ActionResult> {
  return runAction(async () => {
    const review = await container.reviewService.submit(input);
    revalidatePath(`/autos/${review.carId}`);
    revalidatePath(`/reserva/${String(input.code).toUpperCase()}`);
  });
}
