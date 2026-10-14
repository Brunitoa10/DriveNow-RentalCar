import "server-only";
import { haversineKm, type LatLng } from "@shared/lib/geo";

export interface RouteResult {
  distanceKm: number;
  durationMin: number;
  /** Polilínea en formato [lat, lng] lista para Leaflet. */
  geometry: [number, number][];
  /** "road" = ruta real por calles; "estimated" = aproximación en línea recta. */
  source: "road" | "estimated";
}

/** Strategy: cualquier proveedor de rutas (OSRM, Mapbox, Google) implementa esto. */
export interface RoutingProvider {
  route(from: LatLng, to: LatLng): Promise<RouteResult>;
}

/** Adapter sobre la API pública de OSRM (OpenStreetMap). */
export class OsrmRoutingProvider implements RoutingProvider {
  constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs = 4000,
  ) {}

  async route(from: LatLng, to: LatLng): Promise<RouteResult> {
    const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
    const url = `${this.baseUrl}/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(this.timeoutMs),
      next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error(`OSRM respondió ${response.status}`);

    const data = (await response.json()) as {
      routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[];
    };
    const best = data.routes?.[0];
    if (!best) throw new Error("OSRM no devolvió rutas");

    return {
      distanceKm: best.distance / 1000,
      durationMin: best.duration / 60,
      geometry: best.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      source: "road",
    };
  }
}

/** Estimación offline: línea recta × factor de tortuosidad urbana. */
export class StraightLineRoutingProvider implements RoutingProvider {
  constructor(
    private readonly detourFactor = 1.3,
    private readonly avgSpeedKmh = 40,
  ) {}

  async route(from: LatLng, to: LatLng): Promise<RouteResult> {
    const distanceKm = haversineKm(from, to) * this.detourFactor;
    return {
      distanceKm,
      durationMin: (distanceKm / this.avgSpeedKmh) * 60,
      geometry: [
        [from.lat, from.lng],
        [to.lat, to.lng],
      ],
      source: "estimated",
    };
  }
}

/** Decorator con fallback: si el proveedor principal falla, usa el secundario. */
export class FallbackRoutingProvider implements RoutingProvider {
  constructor(
    private readonly primary: RoutingProvider,
    private readonly fallback: RoutingProvider,
  ) {}

  async route(from: LatLng, to: LatLng): Promise<RouteResult> {
    try {
      return await this.primary.route(from, to);
    } catch (error) {
      console.warn("[ROUTING] usando estimación:", (error as Error).message);
      return this.fallback.route(from, to);
    }
  }
}
