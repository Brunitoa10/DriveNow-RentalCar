"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Map } from "@shared/ui/map/Map";
import { createBranchAction, deleteBranchAction } from "../actions";
import type { Branch } from "../branch";

const EMPTY = { name: "", address: "", city: "", phone: "" };

export function BranchAdmin({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  const notify = (ok: boolean, success: string, error?: string) => {
    if (ok) {
      toast({ title: success });
      router.refresh();
    } else toast({ title: "Error", description: error, variant: "destructive" });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
      <Map
        className="h-[560px]"
        markers={branches.map((b, i) => ({ id: b.id, lat: b.lat, lng: b.lng, glyph: String(i + 1), title: b.name }))}
        picked={point}
        onPick={setPoint}
      />

      <div className="space-y-6">
        <form
          className="space-y-3 rounded-xl border bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!point) return toast({ title: "Marcá la ubicación en el mapa" });
            startTransition(async () => {
              const result = await createBranchAction({ ...values, ...point });
              notify(result.ok, "Sucursal creada", result.ok ? undefined : result.error);
              if (result.ok) {
                setValues(EMPTY);
                setPoint(null);
              }
            });
          }}
        >
          <h2 className="font-semibold">Nueva sucursal</h2>
          {(["name", "address", "city", "phone"] as const).map((key) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {{ name: "Nombre", address: "Dirección", city: "Ciudad", phone: "Teléfono (opcional)" }[key]}
              </Label>
              <Input value={values[key]} onChange={(e) => setValues({ ...values, [key]: e.target.value })} required={key !== "phone"} />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            {point ? `Ubicación: ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}` : "Tocá el mapa para ubicarla."}
          </p>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Plus />} Crear sucursal
          </Button>
        </form>

        <ul className="divide-y rounded-xl border bg-card">
          {branches.map((b, i) => (
            <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">
                  {i + 1}. {b.name}
                </p>
                <p className="text-xs text-muted-foreground">{b.address}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                aria-label={`Eliminar ${b.name}`}
                onClick={() =>
                  startTransition(async () => {
                    const result = await deleteBranchAction(b.id);
                    notify(result.ok, "Sucursal eliminada", result.ok ? undefined : result.error);
                  })
                }
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
