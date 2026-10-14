import "server-only";

/**
 * Acceso tipado a variables de entorno del servidor.
 * Centralizarlo evita `process.env.X!` repartidos por el código.
 */
export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  adminAccessKey: process.env.ADMIN_ACCESS_KEY || "",
  adminSessionSecret: process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_ACCESS_KEY || "",
  stripeApiKey: process.env.STRIPE_API_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  osrmUrl: process.env.OSRM_URL || "https://router.project-osrm.org",
} as const;
