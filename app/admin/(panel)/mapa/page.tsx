import type { Metadata } from "next";
import Link from "next/link";
import { container } from "@server/container";
import { PageHeader } from "@shared/layout/PageHeader";
import { Badge } from "@shared/ui/Badge";
import { Map, type MapMarker } from "@shared/ui/map/Map";

export const metadata: Metadata = { title: "Mapa de flota" };

type CarState = "rented" | "available" | "hidden";
const STATE_META: Record<CarState, { label: string; tone: MapMarker["tone"]; badge: "brass" | "success" | "outline" }> = {
  rented: { label: "En alquiler", tone: "brass", badge: "brass" },
  available: { label: "Disponible", tone: "success", badge: "success" },
  hidden: { label: "Fuera de catálogo", tone: "muted", badge: "outline" },
};

export default async function FleetMapPage() {
  const { carService, branchService, reservationService } = container;
  const [cars, branches, active] = await Promise.all([
    carService.listAll(),
    branchService.list(),
    reservationService.listAll("ACTIVE"),
  ]);
  const rentedIds = new Set(active.map((r) => r.carId));
  const stateOf = (c: (typeof cars)[number]): CarState => (rentedIds.has(c.id) ? "rented" : c.isPublished ? "available" : "hidden");

  const located = cars.filter((c) => c.lat != null && c.lng != null);
  const markers: MapMarker[] = [
    ...branches.map((b) => ({ id: b.id, lat: b.lat, lng: b.lng, tone: "ink" as const, glyph: "DN", title: b.name, popup: <strong>{b.name}</strong> })),
    ...located.map((c) => ({
      id: c.id,
      lat: c.lat!,
      lng: c.lng!,
      tone: STATE_META[stateOf(c)].tone,
      glyph: c.brand.charAt(0),
      title: c.name,
      popup: (
        <div className="text-sm">
          <p className="font-semibold">{c.name}</p>
          <p>{STATE_META[stateOf(c)].label}</p>
          <a href={`/admin/flota/${c.id}`}>Ver ficha →</a>
        </div>
      ),
    })),
  ];

  return (
    <>
      <PageHeader title="Mapa de flota" description={`${located.length} de ${cars.length} autos con ubicación · ${rentedIds.size} en alquiler`} />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Map className="h-[640px]" markers={markers} />
        <aside className="space-y-2">
          <div className="flex flex-wrap gap-2 pb-2">
            <Badge tone="ink" dot>Sucursal</Badge>
            {Object.values(STATE_META).map((m) => (
              <Badge key={m.label} tone={m.badge} dot>{m.label}</Badge>
            ))}
          </div>
          <ul className="max-h-[600px] divide-y overflow-auto rounded-xl border bg-card">
            {cars.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <Link href={`/admin/flota/${c.id}`} className="min-w-0">
                  <p className="truncate font-medium hover:underline">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.lat != null ? c.branchName ?? "En ruta" : "Sin ubicación"}</p>
                </Link>
                <Badge tone={STATE_META[stateOf(c)].badge}>{STATE_META[stateOf(c)].label}</Badge>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
