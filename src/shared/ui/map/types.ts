export type MarkerTone = "ink" | "brass" | "success" | "muted" | "danger";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  tone?: MarkerTone;
  /** Texto corto dentro del pin (iniciales, número). */
  glyph?: string;
  title?: string;
  popup?: React.ReactNode;
}

export interface MapProps {
  markers?: MapMarker[];
  /** Polilínea [lat, lng] de una ruta. */
  route?: [number, number][];
  /** Línea punteada cuando la ruta es estimada. */
  routeEstimated?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
  /** Encuadra automáticamente marcadores + ruta. */
  fitBounds?: boolean;
  /** Si se pasa, el mapa permite elegir un punto con un click. */
  onPick?: (point: { lat: number; lng: number }) => void;
  picked?: { lat: number; lng: number } | null;
  className?: string;
}
