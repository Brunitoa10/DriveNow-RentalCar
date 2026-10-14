import type { Metadata } from "next";
import { LoginForm } from "@modules/admin-auth/LoginForm";
import { Logo } from "@shared/ui/Logo";

export const metadata: Metadata = { title: "Acceso administración", robots: { index: false } };

export default function AdminLoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink p-12 text-background lg:flex lg:flex-col lg:justify-between">
        <Logo inverted />
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full border border-brass/20" aria-hidden />
        <div className="absolute -bottom-20 -right-20 h-[320px] w-[320px] rounded-full border border-brass/30" aria-hidden />
        <div className="relative max-w-md">
          <p className="eyebrow">Panel de gestión</p>
          <p className="display mt-4 text-5xl leading-tight">Flota, reservas y desempeño en un solo lugar.</p>
        </div>
        <p className="relative text-xs text-background/50">Acceso restringido al equipo operativo.</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="display mt-10 text-4xl lg:mt-0">Ingresá al panel</h1>
          <p className="mt-2 text-sm text-muted-foreground">Usá la clave de acceso del equipo. No necesitás una cuenta.</p>
          <LoginForm next={searchParams.next} />
        </div>
      </div>
    </div>
  );
}
