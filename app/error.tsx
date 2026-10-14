"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="eyebrow">Error</p>
      <h1 className="display text-4xl">Algo salió mal</h1>
      <p className="max-w-md text-sm text-muted-foreground">Ya registramos el problema. Probá de nuevo en unos segundos.</p>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  );
}
