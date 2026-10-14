"use client";

import { KeyRound, Loader2 } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useFormState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next ?? "/admin"} />
      <div className="space-y-1.5">
        <Label htmlFor="key">Clave de acceso</Label>
        <Input id="key" name="key" type="password" autoComplete="current-password" autoFocus required className="h-11" />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="h-11 w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <KeyRound />}
      Ingresar
    </Button>
  );
}
