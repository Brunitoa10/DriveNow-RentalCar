import Link from "next/link";
import { CarImage } from "@shared/ui/CarImage";
import { RatingStars } from "@shared/ui/RatingStars";
import { formatCurrency } from "@shared/lib/format";
import { CATEGORY_LABELS } from "../domain/car";
import type { FavoriteCar } from "../favorites.store";
import { CarSpecs } from "./CarSpecs";
import { FavoriteButton } from "./FavoriteButton";

/** Tarjeta única de auto: se reutiliza en catálogo, home y favoritos (antes había 3 copias). */
export function CarCard({ car, action }: { car: FavoriteCar; action?: React.ReactNode }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-soft transition-shadow duration-300 hover:shadow-lift">
      <Link href={`/autos/${car.id}`} className="absolute inset-0 z-10" aria-label={`Ver ${car.name}`} />
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        <CarImage
          src={car.photo}
          alt={car.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
          {CATEGORY_LABELS[car.category]}
        </span>
        <FavoriteButton car={car} className="absolute right-3 top-3 z-20" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {car.brand} · {car.year}
            </p>
            <h3 className="mt-1 truncate text-lg font-semibold tracking-tight">{car.name}</h3>
          </div>
          <div className="text-right">
            <p className="num text-lg font-semibold">{formatCurrency(car.pricePerDay)}</p>
            <p className="text-[11px] text-muted-foreground">por día</p>
          </div>
        </div>

        <div className="mt-2 flex h-5 items-center gap-2 text-xs text-muted-foreground">
          {car.ratingAverage ? (
            <>
              <RatingStars value={car.ratingAverage} size={12} />
              <span className="num">
                {car.ratingAverage.toFixed(1)} ({car.ratingCount})
              </span>
            </>
          ) : (
            <span>Sin reseñas aún</span>
          )}
        </div>

        <CarSpecs car={car} className="hairline mt-4 pt-4" />
        {action && <div className="relative z-20 mt-5">{action}</div>}
      </div>
    </article>
  );
}
