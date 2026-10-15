import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@shared/config/env";
import type { Database } from "./database.types";

export type Db = SupabaseClient<Database>;

declare global {
  // eslint-disable-next-line no-var
  var supabaseAdmin: Db | undefined;
}

/**
 * Cliente de servidor con la service_role key: nunca se expone al navegador.
 * Los clientes no tienen cuenta y el admin entra con clave propia,
 * así que todo el acceso a datos pasa por Server Components / Actions.
 */
function createAdminClient(): Db {
  if (!env.supabaseUrl || !env.supabaseServiceKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local (Supabase → Project Settings → API Keys → secret key)",
    );
  }
  return createClient<Database>(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    // Next.js cachea los fetch por defecto: los datos de negocio siempre deben ser frescos
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}

/** Se crea al primer uso (no al importar) para que `next build` no exija credenciales. */
export function getSupabase(): Db {
  globalThis.supabaseAdmin ??= createAdminClient();
  return globalThis.supabaseAdmin;
}

type SupabaseResult = { data: unknown; error: { message: string } | null };

/** Desenvuelve la respuesta de supabase-js: devuelve data o lanza el error. */
export function unwrap<R extends SupabaseResult>(result: R): Exclude<R["data"], null> {
  if (result.error) throw new Error(`[supabase] ${result.error.message}`);
  return result.data as Exclude<R["data"], null>;
}

/** Igual que unwrap, para consultas `.maybeSingle()` donde "no encontrado" es válido. */
export function unwrapMaybe<R extends SupabaseResult>(result: R): R["data"] {
  if (result.error) throw new Error(`[supabase] ${result.error.message}`);
  return result.data;
}
