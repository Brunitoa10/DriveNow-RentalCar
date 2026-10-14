"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@shared/ui/EmptyState";
import { useFavorites } from "../favorites.store";
import { CarCard } from "./CarCard";

export function FavoritesGrid() {
  const items = useFavorites((s) => s.items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-64 animate-pulse rounded-xl bg-secondary" />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Todavía no guardaste autos"
        description="Tocá el corazón en cualquier auto de la flota para tenerlo a mano."
        action={
          <Button asChild>
            <Link href="/autos">Explorar la flota</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((car) => (
        <CarCard
          key={car.id}
          car={car}
          action={
            <Button asChild variant="outline" className="w-full">
              <Link href={`/autos/${car.id}`}>Reservar</Link>
            </Button>
          }
        />
      ))}
    </div>
  );
}
