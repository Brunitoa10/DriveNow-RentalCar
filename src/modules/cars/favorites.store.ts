"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CarWithRating } from "./domain/car";

/** Favoritos del visitante (sin login): se guardan en el navegador. */
export type FavoriteCar = Pick<
  CarWithRating,
  "id" | "name" | "brand" | "photo" | "pricePerDay" | "category" | "transmission" | "seats" | "fuel" | "horsepower" | "year"
> & { ratingAverage?: number | null; ratingCount?: number };

interface FavoritesState {
  items: FavoriteCar[];
  isFavorite: (id: string) => boolean;
  toggle: (car: FavoriteCar) => boolean;
  remove: (id: string) => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      isFavorite: (id) => get().items.some((c) => c.id === id),
      toggle: (car) => {
        const exists = get().isFavorite(car.id);
        set({ items: exists ? get().items.filter((c) => c.id !== car.id) : [...get().items, car] });
        return !exists;
      },
      remove: (id) => set({ items: get().items.filter((c) => c.id !== id) }),
    }),
    { name: "drivenow-favorites", storage: createJSONStorage(() => localStorage) },
  ),
);
