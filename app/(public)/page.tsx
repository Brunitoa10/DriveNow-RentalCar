import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CarCard } from "@modules/cars/ui/CarCard";
import { BranchList } from "@modules/branches/ui/BranchList";
import { container } from "@server/container";
import { brandLogos, siteConfig } from "@shared/config/site";
import { Map } from "@shared/ui/map/Map";
import { Reveal } from "@shared/ui/Reveal";
import { SectionHeading } from "@shared/ui/SectionHeading";

export const dynamic = "force-dynamic";

const STEPS = [
  { title: "Elegí tu auto", text: "Filtrá por categoría, plazas o precio y compará calificaciones reales." },
  { title: "Retiro o entrega", text: "Pasá por una sucursal o recibilo en tu domicilio: calculamos la ruta al instante." },
  { title: "Manejá sin vueltas", text: "Seguro premium, asistencia 24/7 y kilometraje generoso incluidos." },
  { title: "Calificá la experiencia", text: "Tu reseña sobre confort, consumo y rendimiento ayuda a mejorar la flota." },
];

export default async function HomePage() {
  const { carService, branchService } = container;
  const [cars, branches] = await Promise.all([carService.listPublished({ sort: "rating" }), branchService.list()]);
  const featured = cars.slice(0, 3);
  const rated = cars.filter((c) => c.ratingAverage);
  const avgRating = rated.length ? rated.reduce((a, c) => a + (c.ratingAverage ?? 0), 0) / rated.length : null;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="container grid items-center gap-12 pb-20 pt-10 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
        <Reveal>
          <p className="eyebrow">Alquiler premium · {siteConfig.city}</p>
          <h1 className="display mt-5 text-[56px] leading-[0.95] sm:text-7xl lg:text-[88px]">
            Manejá lo <span className="italic text-brass">excepcional</span>.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Una flota seleccionada, mantenida al detalle y calificada por quienes la manejan. Reservá en minutos y
            retirala en sucursal o recibila donde estés.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 px-7">
              <Link href="/autos">
                Ver la flota <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-7">
              <Link href="/sucursales">
                <MapPin /> Sucursales
              </Link>
            </Button>
          </div>

          <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t pt-6">
            <Stat value={String(cars.length)} label="autos disponibles" />
            <Stat value={avgRating ? avgRating.toFixed(1) : "—"} label="calificación media" />
            <Stat value={String(branches.length)} label="sucursales" />
          </dl>
        </Reveal>

        <Reveal delay={0.15} className="relative">
          <div className="absolute -inset-x-6 -bottom-6 top-10 rounded-[28px] bg-ink lg:-right-10" aria-hidden />
          <div className="absolute right-6 top-16 h-24 w-24 rounded-full border border-brass/40" aria-hidden />
          <Image
            src="/images/FordMustangShelbyShadowBlack.png"
            alt="Ford Mustang Shelby"
            width={900}
            height={600}
            priority
            className="relative z-10 w-full drop-shadow-2xl"
          />
          <div className="relative z-10 -mt-2 flex items-center justify-between px-2 pb-4 text-background/80">
            <span className="text-xs uppercase tracking-eyebrow">Destacado</span>
            <span className="display text-xl text-background">Mustang Shelby GT</span>
          </div>
        </Reveal>
      </section>

      {/* ── Marcas ───────────────────────────────────────────── */}
      <section className="border-y bg-card">
        <div className="container flex flex-wrap items-center justify-center gap-x-12 gap-y-6 py-8 sm:justify-between">
          {brandLogos.slice(0, 8).map((file) => (
            <Image
              key={file}
              src={`/images/brands/${file}`}
              alt={file.replace(/Logo.*|\.png/g, "")}
              width={84}
              height={40}
              className="h-8 w-auto object-contain opacity-50 grayscale transition hover:opacity-90 hover:grayscale-0"
            />
          ))}
        </div>
      </section>

      {/* ── Flota destacada ──────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="container py-24">
          <SectionHeading
            eyebrow="Flota destacada"
            title="Los mejor calificados por nuestros clientes"
            action={
              <Button asChild variant="link" className="px-0">
                <Link href="/autos">
                  Ver los {cars.length} autos <ArrowRight />
                </Link>
              </Button>
            }
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((car, i) => (
              <Reveal key={car.id} delay={i * 0.08}>
                <CarCard car={car} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── Cómo funciona ────────────────────────────────────── */}
      <section className="bg-card py-24">
        <div className="container">
          <SectionHeading eyebrow="Cómo funciona" title="Del clic al volante, sin fricción" />
          <ol className="mt-14 grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="bg-card p-8">
                <span className="display text-5xl text-brass">0{i + 1}</span>
                <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Sucursales ───────────────────────────────────────── */}
      <section className="container grid gap-10 py-24 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionHeading
            eyebrow="Sucursales"
            title="Cerca de donde estés"
            description="Retirá en cualquiera de nuestras sucursales o pedí entrega a domicilio. Podés devolver el auto en otra sede."
          />
          <BranchList branches={branches} className="mt-8" />
        </div>
        <Map
          className="h-[420px] lg:h-full lg:min-h-[480px]"
          markers={branches.map((b, i) => ({
            id: b.id,
            lat: b.lat,
            lng: b.lng,
            glyph: String(i + 1),
            title: b.name,
            popup: (
              <div className="text-sm">
                <p className="font-semibold">{b.name}</p>
                <p className="text-muted-foreground">{b.address}</p>
              </div>
            ),
          }))}
        />
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="container">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-16 text-background md:px-16 md:py-20">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-brass/30" aria-hidden />
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-brass/20" aria-hidden />
          <p className="eyebrow">Reservá hoy</p>
          <h2 className="display mt-4 max-w-2xl text-4xl leading-tight md:text-6xl">
            Tu próximo viaje empieza con el auto correcto.
          </h2>
          <Button asChild size="lg" className="mt-10 h-12 bg-brass px-7 text-ink hover:bg-brass/90">
            <Link href="/autos">
              Explorar la flota <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="display num text-4xl">{value}</dd>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
