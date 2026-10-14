"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@modules/admin-auth/guard";
import { completionSchema } from "@modules/fleet/fleet.service";
import { container } from "@server/container";
import { runAction, type ActionResult } from "@shared/lib/result";
import type { ReservationStatus } from "./domain/reservation";
import type { QuoteResult } from "./application/reservation.service";
import type { QuoteInput, ReservationInput } from "./validation/reservation.schema";

const { reservationService } = container;

// ── Público ─────────────────────────────────────────────────────────────

export async function quoteAction(input: QuoteInput): Promise<ActionResult<QuoteResult>> {
  return runAction(() => reservationService.quote(input));
}

export async function createReservationAction(
  input: ReservationInput,
): Promise<ActionResult<{ redirectUrl: string }>> {
  return runAction(async () => {
    const { redirectUrl } = await reservationService.create(input);
    return { redirectUrl };
  });
}

export interface LookupState {
  error?: string;
}

export async function lookupReservationAction(_prev: LookupState, formData: FormData): Promise<LookupState> {
  const result = await runAction(() =>
    reservationService.lookup({ code: formData.get("code"), email: formData.get("email") }),
  );
  if (!result.ok) return { error: "No encontramos una reserva con esos datos" };
  redirect(`/reserva/${result.data.code}`);
}

export async function simulatePaymentAction(code: string): Promise<ActionResult> {
  const result = await runAction(async () => {
    await reservationService.simulateDemoPayment(code);
  });
  revalidatePath(`/reserva/${code}`);
  return result;
}

// ── Admin ───────────────────────────────────────────────────────────────

export async function transitionReservationAction(id: string, to: ReservationStatus): Promise<ActionResult> {
  return runAction(async () => {
    await assertAdmin();
    await reservationService.transition(id, to);
    revalidatePath("/admin", "layout");
  });
}

export async function completeReservationAction(id: string, raw: unknown): Promise<ActionResult> {
  return runAction(async () => {
    await assertAdmin();
    await reservationService.complete(id, completionSchema.parse(raw));
    revalidatePath("/admin", "layout");
  });
}
