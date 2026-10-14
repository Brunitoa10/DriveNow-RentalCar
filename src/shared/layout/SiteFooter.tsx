import Link from "next/link";
import { siteConfig } from "@shared/config/site";
import { Logo } from "@shared/ui/Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-background/70">
      <div className="container grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo inverted />
          <p className="mt-5 max-w-xs text-sm leading-relaxed">{siteConfig.description}</p>
        </div>
        <FooterColumn title="Explorar" links={[...siteConfig.nav, { href: "/favoritos", label: "Favoritos" }]} />
        <FooterColumn
          title="Contacto"
          links={[
            { href: `mailto:${siteConfig.contact.email}`, label: siteConfig.contact.email },
            { href: `tel:${siteConfig.contact.phone.replace(/\s/g, "")}`, label: siteConfig.contact.phone },
          ]}
        />
        <FooterColumn title="Empresa" links={[{ href: "/admin", label: "Acceso administración" }]} />
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col justify-between gap-2 py-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.</p>
          <p>Hecho por TechnologyAdvanceSolutions</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <div>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-eyebrow text-brass">{title}</p>
      <ul className="space-y-2.5 text-sm">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className="transition-colors hover:text-background">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
