"use client";

import { CalendarRange, CarFront, ExternalLink, LayoutDashboard, LogOut, Map as MapIcon, Menu, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@modules/admin-auth/actions";
import { Logo } from "@shared/ui/Logo";

const NAV = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/admin/flota", label: "Flota y performance", icon: CarFront },
  { href: "/admin/reservas", label: "Reservas", icon: CalendarRange },
  { href: "/admin/mapa", label: "Mapa de flota", icon: MapIcon },
  { href: "/admin/sucursales", label: "Sucursales", icon: Store },
];

function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="Administración">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active ? "bg-white/10 font-medium text-background" : "text-background/60 hover:bg-white/5 hover:text-background",
            )}
          >
            <Icon className={cn("h-4 w-4", active && "text-brass")} strokeWidth={1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Footer() {
  return (
    <div className="space-y-1 border-t border-white/10 pt-4">
      <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-background/60 hover:text-background">
        <ExternalLink className="h-4 w-4" strokeWidth={1.75} /> Ver sitio público
      </Link>
      <form action={logoutAction}>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-background/60 hover:text-background">
          <LogOut className="h-4 w-4" strokeWidth={1.75} /> Cerrar sesión
        </button>
      </form>
    </div>
  );
}

export function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col justify-between bg-ink p-5 lg:flex">
      <div>
        <Logo inverted className="px-2" />
        <p className="mb-3 mt-10 px-3 text-[10px] font-semibold uppercase tracking-eyebrow text-background/40">Gestión</p>
        <NavLinks />
      </div>
      <Footer />
    </aside>
  );
}

export function AdminMobileBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="sticky top-0 z-40 bg-ink lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Logo inverted />
        <button onClick={() => setOpen((o) => !o)} className="text-background" aria-label="Menú">
          <Menu />
        </button>
      </div>
      {open && (
        <div className="space-y-4 px-4 pb-4">
          <NavLinks />
          <Footer />
        </div>
      )}
    </div>
  );
}
