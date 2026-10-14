import type { Metadata } from "next";
import { BranchList } from "@modules/branches/ui/BranchList";
import { container } from "@server/container";
import { Map } from "@shared/ui/map/Map";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sucursales" };

export default async function BranchesPage() {
  const branches = await container.branchService.list();
  return (
    <div className="container py-12">
      <p className="eyebrow">Sucursales</p>
      <h1 className="display mt-3 text-5xl md:text-6xl">Dónde encontrarnos</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Retirá y devolvé en cualquier sede. Si preferís, te llevamos el auto a tu domicilio u hotel.
      </p>
      <div className="mt-10 grid gap-8 lg:grid-cols-[380px_1fr]">
        <BranchList branches={branches} />
        <Map
          className="h-[560px]"
          markers={branches.map((b, i) => ({
            id: b.id,
            lat: b.lat,
            lng: b.lng,
            glyph: String(i + 1),
            title: b.name,
            popup: (
              <div className="text-sm">
                <p className="font-semibold">{b.name}</p>
                <p>{b.address}</p>
              </div>
            ),
          }))}
        />
      </div>
    </div>
  );
}
