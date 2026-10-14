"use client";

import { Heart, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@shared/config/site";
import { Logo } from "@shared/ui/Logo";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled || open ? "border-border bg-background/90 backdrop-blur-md" : "border-transparent bg-background",
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {siteConfig.nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive(href) && "text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="icon" aria-label="Favoritos">
            <Link href="/favoritos">
              <Heart strokeWidth={1.5} />
            </Link>
          </Button>
          <Button asChild>
            <Link href="/autos">Reservar</Link>
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menú">
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open && (
        <nav className="container flex flex-col gap-1 pb-6 md:hidden" aria-label="Móvil">
          {[...siteConfig.nav, { href: "/favoritos", label: "Favoritos" }].map(({ href, label }) => (
            <Link key={href} href={href} className="border-b py-3 text-base font-medium">
              {label}
            </Link>
          ))}
          <Button asChild className="mt-4">
            <Link href="/autos">Reservar un auto</Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
