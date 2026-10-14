"use client";

import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { cn } from "@/lib/utils";
import { siteConfig } from "@shared/config/site";
import type { MapMarker, MapProps, MarkerTone } from "./types";

const TONE_COLORS: Record<MarkerTone, string> = {
  ink: "hsl(222 24% 9%)",
  brass: "hsl(37 42% 50%)",
  success: "hsl(152 45% 34%)",
  muted: "hsl(220 9% 55%)",
  danger: "hsl(0 62% 46%)",
};

/** Pines vectoriales (divIcon): sin imágenes externas y con la paleta del sitio. */
const buildIcon = (tone: MarkerTone = "ink", glyph = "") =>
  L.divIcon({
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
    html: `<div class="dn-marker" style="width:30px;height:30px;background:${TONE_COLORS[tone]};color:#fff;font:600 11px/1 'Manrope Variable',sans-serif">${glyph}</div>`,
  });

function FitBounds({ markers, route }: { markers: MapMarker[]; route?: [number, number][] }) {
  const map = useMap();
  const points = useMemo<[number, number][]>(
    () => [...markers.map((m) => [m.lat, m.lng] as [number, number]), ...(route ?? [])],
    [markers, route],
  );
  // Re-encuadra sólo cuando cambian los puntos, no en cada render del padre
  const signature = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    if (points.length === 1) map.setView(points[0], 13);
    if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, signature]);
  return null;
}

function ClickPicker({ onPick }: { onPick: NonNullable<MapProps["onPick"]> }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

export default function LeafletMap({
  markers = [],
  route,
  routeEstimated,
  center = siteConfig.map.center,
  zoom = siteConfig.map.zoom,
  fitBounds = true,
  onPick,
  picked,
  className,
}: MapProps) {
  const allMarkers = useMemo(
    () => (picked ? [...markers, { id: "__picked", ...picked, tone: "brass" as const, glyph: "●" }] : markers),
    [markers, picked],
  );

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      scrollWheelZoom={false}
      className={cn("h-full w-full", onPick && "cursor-crosshair", className)}
    >
      <TileLayer url={siteConfig.map.tileUrl} attribution={siteConfig.map.tileAttribution} />
      {route && route.length > 1 && (
        <Polyline
          positions={route}
          pathOptions={{ color: TONE_COLORS.ink, weight: 4, opacity: 0.85, dashArray: routeEstimated ? "6 8" : undefined }}
        />
      )}
      {allMarkers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]} icon={buildIcon(m.tone, m.glyph)} title={m.title}>
          {m.popup && <Popup>{m.popup}</Popup>}
        </Marker>
      ))}
      {fitBounds && <FitBounds markers={markers} route={route} />}
      {onPick && <ClickPicker onPick={onPick} />}
    </MapContainer>
  );
}
