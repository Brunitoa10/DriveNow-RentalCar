"use client";

import { Loader2, Search } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lookupReservationAction, type LookupState } from "../actions";

export function LookupForm() {
  const [state, action] = useFormState<LookupState, FormData>(lookupReservationAction, {});
  return (
    <form action={action} className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
      <div className="space-y-1.5">
        <Label htmlFor="code">Código de reserva</Label>
        <Input id="code" name="code" placeholder="DN-XXXXXXXX" className="num uppercase" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email usado al reservar</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <Search />}
      Buscar reserva
    </Button>
  );
}
