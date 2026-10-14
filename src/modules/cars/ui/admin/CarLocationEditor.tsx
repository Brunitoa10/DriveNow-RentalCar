"use client";

import { Loader2, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Map, type MapMarker } from "@shared/ui/map/Map";
import { updateCarLocationAction } from "../../actions";

interface Props {
  carId: string;
  current: { lat: number; lng: number } | null;
  branches: MapMarker[];
}

/** Check-in manual de ubicación (reemplazable por telemetría GPS en el futuro). */
export function CarLocationEditor({ carId, current, branches }: Props) {
  const router = useRouter();
  const [point, setPoint] = useState(current);
  const [isPending, startTransition] = useTransition();
  const dirty = point && (point.lat !== current?.lat || point.lng !== current?.lng);

  return (
    <div className="space-y-3">
      <Map className="h-72" markers={branches} picked={point} onPick={setPoint} fitBounds={!current} center={current ?? undefined} zoom={current ? 13 : undefined} />
      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {point ? `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}` : "Sin ubicación registrada — tocá el mapa"}
        </span>
        <Button
          size="sm"
          disabled={!dirty || isPending}
          onClick={() =>
            point &&
            startTransition(async () => {
              const result = await updateCarLocationAction(carId, point.lat, point.lng);
              if (result.ok) {
                toast({ title: "Ubicación actualizada" });
                router.refresh();
              } else toast({ title: "Error", description: result.error, variant: "destructive" });
            })
          }
        >
          {isPending && <Loader2 className="animate-spin" />} Guardar ubicación
        </Button>
      </div>
    </div>
  );
}
