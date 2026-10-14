"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@shared/config/env";
import { ADMIN_COOKIE, SESSION_TTL_SECONDS, createSessionToken, isValidAccessKey } from "./session";

export interface LoginState {
  error?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!env.adminAccessKey) {
    return { error: "Configurá ADMIN_ACCESS_KEY en el archivo .env" };
  }

  const key = String(formData.get("key") ?? "");
  if (!(await isValidAccessKey(key, env.adminAccessKey))) {
    await new Promise((r) => setTimeout(r, 600)); // frena intentos por fuerza bruta
    return { error: "Clave incorrecta" };
  }

  cookies().set(ADMIN_COOKIE, await createSessionToken(env.adminSessionSecret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  const next = String(formData.get("next") ?? "/admin");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction(): Promise<void> {
  cookies().delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
