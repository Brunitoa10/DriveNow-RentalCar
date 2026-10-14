"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@shared/ui/Textarea";
import { completeReservationAction, transitionReservationAction } from "../../actions";
import type { ReservationStatus } from "../../domain/reservation";
import { ACTION_LABELS, nextStatuses } from "../../domain/reservation-state";

/** Los botones salen de la state machine: sólo se ofrecen transiciones válidas. */
export function ReservationActions({ id, status, carName }: { id: string; status: ReservationStatus; carName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [completing, setCompleting] = useState(false);
  const options = nextStatuses(status);

  const transition = (to: ReservationStatus) =>
    startTransition(async () => {
      const result = await transitionReservationAction(id, to);
      if (result.ok) router.refresh();
      else toast({ title: "Error", description: result.error, variant: "destructive" });
    });

  if (options.length === 0) return <span className="text-xs text-muted-foreground">—</span>;

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {isPending && <Loader2 className="h-4 w-4 animate-spin self-center text-muted-foreground" />}
      {options.map((to) => (
        <Button
          key={to}
          size="sm"
          variant={to === "CANCELLED" ? "ghost" : "outline"}
          className={to === "CANCELLED" ? "text-destructive hover:text-destructive" : undefined}
          disabled={isPending}
          onClick={() => (to === "COMPLETED" ? setCompleting(true) : transition(to))}
        >
          {ACTION_LABELS[to]}
        </Button>
      ))}
      <CompleteDialog id={id} carName={carName} open={completing} onOpenChange={setCompleting} onDone={() => router.refresh()} />
    </div>
  );
}

function CompleteDialog({
  id,
  carName,
  open,
  onOpenChange,
  onDone,
}: {
  id: string;
  carName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const [values, setValues] = useState({ distanceKm: "", fuelUsedL: "", incidents: "0", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar devolución</DialogTitle>
          <DialogDescription>
            Estos datos alimentan el índice de performance del {carName} (consumo, confiabilidad y kilometraje).
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Km recorridos" value={values.distanceKm} onChange={(v) => setValues({ ...values, distanceKm: v })} />
          <Field label="Combustible (L)" value={values.fuelUsedL} onChange={(v) => setValues({ ...values, fuelUsedL: v })} />
          <Field label="Incidentes" value={values.incidents} onChange={(v) => setValues({ ...values, incidents: v })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Observaciones</Label>
          <Textarea value={values.notes} onChange={(e) => setValues({ ...values, notes: e.target.value })} className="min-h-[72px]" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button
            disabled={isPending || !values.distanceKm || !values.fuelUsedL}
            onClick={() =>
              startTransition(async () => {
                const result = await completeReservationAction(id, values);
                if (result.ok) {
                  toast({ title: "Reserva finalizada", description: "El cliente ya puede calificar el auto." });
                  onOpenChange(false);
                  onDone();
                } else setError(result.error);
              })
            }
          >
            {isPending && <Loader2 className="animate-spin" />} Finalizar reserva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input type="number" min={0} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
