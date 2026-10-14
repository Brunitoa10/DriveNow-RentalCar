import type { Metadata } from "next";
import { Suspense } from "react";
import { parseCarFilters } from "@modules/cars/domain/filters";
import { CarFilters } from "@modules/cars/ui/CarFilters";
import { CarGrid } from "@modules/cars/ui/CarGrid";
import { container } from "@server/container";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Flota" };

export default async function CarsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const cars = await container.carService.listPublished(parseCarFilters(searchParams));

  return (
    <div className="container py-12">
      <p className="eyebrow">Nuestra flota</p>
      <h1 className="display mt-3 text-5xl md:text-6xl">Elegí cómo querés llegar</h1>
      <div className="sticky top-16 z-30 -mx-1 mt-10 bg-background/90 px-1 py-3 backdrop-blur-md">
        <Suspense>
          <CarFilters total={cars.length} />
        </Suspense>
      </div>
      <div className="mt-6">
        <CarGrid cars={cars} />
      </div>
    </div>
  );
}
