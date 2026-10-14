import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@shared/config/env";
import { UnauthorizedError } from "@shared/lib/errors";
import { ADMIN_COOKIE, verifySessionToken } from "./session";

export async function isAdmin(): Promise<boolean> {
  return verifySessionToken(cookies().get(ADMIN_COOKIE)?.value, env.adminSessionSecret);
}

/** Para Server Actions y Route Handlers: el middleware no protege llamadas directas a actions. */
export async function assertAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new UnauthorizedError();
}

/** Para páginas del panel (defensa en profundidad además del middleware). */
export async function requireAdminPage(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
