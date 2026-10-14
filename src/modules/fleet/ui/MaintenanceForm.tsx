"use client";

import { Loader2, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { addMaintenanceAction } from "../actions";

const today = () => new Date().toISOString().slice(0, 10);

export function MaintenanceForm({ carId }: { carId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({ kind: "", description: "", cost: "", startDate: today(), endDate: "" });
  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => setValues({ ...values, [key]: e.target.value });

  return (
    <form
      className="grid gap-3 sm:grid-cols-6"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await addMaintenanceAction({ carId, ...values, endDate: values.endDate || null });
          if (result.ok) {
            toast({ title: "Mantenimiento registrado" });
            setValues({ kind: "", description: "", cost: "", startDate: today(), endDate: "" });
            router.refresh();
          } else toast({ title: "Error", description: result.error, variant: "destructive" });
        });
      }}
    >
      <div className="space-y-1 sm:col-span-2">
        <Label className="text-xs text-muted-foreground">Tipo</Label>
        <Input placeholder="Service 20.000 km" value={values.kind} onChange={set("kind")} required />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Costo (USD)</Label>
        <Input type="number" min={0} step="0.01" value={values.cost} onChange={set("cost")} required />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Desde</Label>
        <Input type="date" value={values.startDate} onChange={set("startDate")} required />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Hasta</Label>
        <Input type="date" value={values.endDate} onChange={set("endDate")} />
      </div>
      <div className="flex items-end">
        <Button type="submit" variant="outline" className="w-full" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <Wrench />} Registrar
        </Button>
      </div>
    </form>
  );
}
