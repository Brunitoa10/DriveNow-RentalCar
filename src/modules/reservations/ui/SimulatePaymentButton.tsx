"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { simulatePaymentAction } from "../actions";

/** Sólo visible con el gateway "demo" (sin credenciales de Stripe). */
export function SimulatePaymentButton({ code }: { code: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="lg"
      className="h-12"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await simulatePaymentAction(code);
          if (result.ok) {
            toast({ title: "Pago acreditado", description: "Tu reserva está confirmada." });
            router.refresh();
          } else {
            toast({ title: "No se pudo procesar", description: result.error, variant: "destructive" });
          }
        })
      }
    >
      {isPending ? <Loader2 className="animate-spin" /> : <CreditCard />}
      Simular pago (modo demo)
    </Button>
  );
}
