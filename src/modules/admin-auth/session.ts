/**
 * Sesión de administrador sin cuentas de usuario: se ingresa con una clave
 * (ADMIN_ACCESS_KEY) y se emite una cookie firmada con HMAC-SHA256.
 * Usa Web Crypto, así funciona igual en el middleware (Edge) y en Node.
 */
export const ADMIN_COOKIE = "dn_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 horas

const encoder = new TextEncoder();

async function hmac(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparación en tiempo constante para no filtrar información por timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(secret: string, now = Date.now()): Promise<string> {
  const expiresAt = Math.floor(now / 1000) + SESSION_TTL_SECONDS;
  return `${expiresAt}.${await hmac(secret, `admin.${expiresAt}`)}`;
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token || !secret) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature || Number(expiresAt) < Date.now() / 1000) return false;
  return safeEqual(signature, await hmac(secret, `admin.${expiresAt}`));
}

/** Compara la clave ingresada con la configurada (hasheando ambas para igualar longitudes). */
export async function isValidAccessKey(candidate: string, expected: string): Promise<boolean> {
  if (!expected) return false;
  const [a, b] = await Promise.all([hmac("key-check", candidate), hmac("key-check", expected)]);
  return safeEqual(a, b);
}
