import { NextResponse } from "next/server";
import { StripePaymentGateway } from "@modules/payments/payment-gateway";
import { container } from "@server/container";
import { env } from "@shared/config/env";

/** Stripe confirma el pago acá: es la fuente de verdad para pasar la reserva a PAID. */
export async function POST(req: Request) {
  const gateway = container.payments;
  if (!(gateway instanceof StripePaymentGateway) || !env.stripeWebhookSecret) {
    return NextResponse.json({ error: "Webhook de Stripe no configurado" }, { status: 400 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Falta la firma" }, { status: 400 });

  try {
    const event = gateway.constructWebhookEvent(await req.text(), signature, env.stripeWebhookSecret);
    if (event.type === "checkout.session.completed") {
      const reservationId = event.data.object.metadata?.reservationId;
      if (reservationId) await container.reservationService.markPaid(reservationId);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[STRIPE WEBHOOK]", error);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }
}
