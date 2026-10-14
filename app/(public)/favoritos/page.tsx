import type { Metadata } from "next";
import { FavoritesGrid } from "@modules/cars/ui/FavoritesGrid";

export const metadata: Metadata = { title: "Favoritos" };

export default function FavoritesPage() {
  return (
    <div className="container py-12">
      <p className="eyebrow">Tu selección</p>
      <h1 className="display mt-3 text-5xl md:text-6xl">Favoritos</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">Se guardan en este navegador, sin necesidad de crear una cuenta.</p>
      <div className="mt-10">
        <FavoritesGrid />
      </div>
    </div>
  );
}
