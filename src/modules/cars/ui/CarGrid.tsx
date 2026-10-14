import { CarFront } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@shared/ui/EmptyState";
import type { CarWithRating } from "../domain/car";
import { CarCard } from "./CarCard";

export function CarGrid({ cars }: { cars: CarWithRating[] }) {
  if (cars.length === 0) {
    return (
      <EmptyState
        icon={CarFront}
        title="No encontramos autos"
        description="Probá ajustando los filtros para ver más opciones de la flota."
        action={
          <Button asChild variant="outline">
            <Link href="/autos">Limpiar filtros</Link>
          </Button>
        }
      />
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {cars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
}
