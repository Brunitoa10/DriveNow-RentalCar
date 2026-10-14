"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import type { MapProps } from "./types";

/** Leaflet usa `window`: se carga sólo en el cliente. */
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-secondary" />,
});

export function Map({ className, ...props }: MapProps & { className?: string }) {
  return (
    <div className={cn("relative isolate overflow-hidden rounded-xl border bg-secondary", className)}>
      <LeafletMap {...props} />
    </div>
  );
}

export type { MapMarker, MapProps } from "./types";
