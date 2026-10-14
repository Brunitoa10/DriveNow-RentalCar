import { ZodError } from "zod";
import { DomainError } from "./errors";

/**
 * Resultado uniforme para Server Actions: el cliente nunca recibe excepciones,
 * recibe un objeto discriminado fácil de manejar.
 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });

export const fail = (error: string, fieldErrors?: Record<string, string[]>): ActionResult<never> => ({
  ok: false,
  error,
  fieldErrors,
});

/** Envuelve una acción y traduce errores conocidos a mensajes para el usuario. */
export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return ok(await fn());
  } catch (error) {
    if (error instanceof ZodError) {
      return fail("Revisá los datos ingresados", error.flatten().fieldErrors as Record<string, string[]>);
    }
    if (error instanceof DomainError) {
      return fail(error.message);
    }
    console.error("[ACTION]", error);
    return fail("Ocurrió un error inesperado. Intentá nuevamente.");
  }
}
