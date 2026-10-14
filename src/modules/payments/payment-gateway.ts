import "server-only";
import Stripe from "stripe";

export interface CheckoutRequest {
  reservationId: string;
  code: string;
  description: string;
  amount: number;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  redirectUrl: string;
  reference: string;
}

/**
 * Puerto de pagos. Stripe hoy; MercadoPago u otro mañana con una clase nueva,
 * sin tocar ReservationService (Open/Closed + Dependency Inversion).
 */
export interface PaymentGateway {
  readonly name: string;
  createCheckout(request: CheckoutRequest): Promise<CheckoutSession>;
  /** Consulta al proveedor si el pago con esta referencia está acreditado. */
  isPaid(reference: string): Promise<boolean>;
}

export class StripePaymentGateway implements PaymentGateway {
  readonly name = "stripe";
  private readonly stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, { typescript: true });
  }

  async createCheckout(req: CheckoutRequest): Promise<CheckoutSession> {
    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: req.customerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(req.amount * 100),
            product_data: { name: req.description },
          },
        },
      ],
      success_url: `${req.successUrl}${req.successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: req.cancelUrl,
      metadata: { reservationId: req.reservationId, code: req.code },
    });
    if (!session.url) throw new Error("Stripe no devolvió URL de checkout");
    return { redirectUrl: session.url, reference: session.id };
  }

  async isPaid(reference: string): Promise<boolean> {
    const session = await this.stripe.checkout.sessions.retrieve(reference);
    return session.payment_status === "paid";
  }

  constructWebhookEvent(payload: string, signature: string, secret: string) {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}

/**
 * Gateway de demostración (sin credenciales): redirige a la confirmación,
 * donde un botón simula el pago. Ideal para portfolio y desarrollo local.
 */
export class DemoPaymentGateway implements PaymentGateway {
  readonly name = "demo";

  async createCheckout(req: CheckoutRequest): Promise<CheckoutSession> {
    return { redirectUrl: req.successUrl, reference: `demo_${req.code}` };
  }

  async isPaid(): Promise<boolean> {
    return false;
  }
}
