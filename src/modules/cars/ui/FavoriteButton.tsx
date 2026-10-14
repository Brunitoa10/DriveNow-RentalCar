"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useFavorites, type FavoriteCar } from "../favorites.store";

export function FavoriteButton({ car, className }: { car: FavoriteCar; className?: string }) {
  const { isFavorite, toggle } = useFavorites();
  // Evita desajustes de hidratación: localStorage sólo existe en el cliente
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const active = mounted && isFavorite(car.id);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle(car);
        toast({ title: added ? "Guardado en favoritos" : "Quitado de favoritos" });
      }}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-105",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", active ? "fill-ink text-ink" : "text-ink")} strokeWidth={1.75} />
    </button>
  );
}
