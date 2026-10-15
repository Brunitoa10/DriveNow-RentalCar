/**
 * Datos de demostración para Supabase: sucursales, flota, reservas históricas,
 * viajes, mantenimientos y reseñas (para que el panel muestre métricas reales).
 *
 * Ejecutar:  npm run db:seed      (borra y recrea todo; usa SUPABASE_SERVICE_ROLE_KEY)
 */
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import type { Database, Enums, TablesInsert } from "../src/server/database.types";

// Lee .env y .env.local (igual que Next.js); .env.local tiene prioridad
for (const file of [".env.local", ".env"]) if (existsSync(file)) process.loadEnvFile(file);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Definí NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local");
const db = createClient<Database>(url, key, { auth: { persistSession: false } });

// PRNG determinístico: el seed genera siempre los mismos datos
let state = 42;
const rand = () => ((state = (state * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const between = (min: number, max: number) => min + rand() * (max - min);
const pick = <T,>(items: readonly T[]) => items[Math.floor(rand() * items.length)];
const day = (offset: number) => {
  const d = new Date();
  d.setHours(10, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString();
};
const round2 = (n: number) => Math.round(n * 100) / 100;

async function run<T>(label: string, op: PromiseLike<{ error: { message: string } | null; data?: T }>) {
  const { error } = await op;
  if (error) throw new Error(`${label}: ${error.message}`);
}

const BRANCHES = [
  { name: "Brickell Financial", address: "1101 Brickell Ave", city: "Miami", phone: "+1 305 555 0101", lat: 25.7634, lng: -80.1918 },
  { name: "Aeropuerto MIA", address: "2100 NW 42nd Ave", city: "Miami", phone: "+1 305 555 0102", lat: 25.7959, lng: -80.2871 },
  { name: "Miami Beach", address: "1601 Collins Ave", city: "Miami Beach", phone: "+1 305 555 0103", lat: 25.7907, lng: -80.1300 },
  { name: "Coral Gables", address: "2301 Ponce de Leon Blvd", city: "Coral Gables", phone: null, lat: 25.7505, lng: -80.2587 },
];

type SeedCar = {
  name: string; brand: string; year: number; category: Enums<"car_category">; transmission: Enums<"transmission">; fuel: Enums<"fuel_type">;
  seats: number; horsepower: number; engine: string; pricePerDay: number; photo: string;
  /** Perfil operativo para generar historial verosímil. */
  profile: { demand: number; consumption: number; quality: number; incidents: number };
};

const CARS: SeedCar[] = [
  { name: "Mustang Shelby GT500", brand: "Ford", year: 2023, category: "DEPORTIVO", transmission: "AUTOMATICA", fuel: "NAFTA", seats: 4, horsepower: 760, engine: "5.2 V8 sobrealimentado", pricePerDay: 289, photo: "/images/FordMustangShelbyShadowBlack.png", profile: { demand: 0.8, consumption: 13.5, quality: 4.7, incidents: 0.1 } },
  { name: "Huracán EVO", brand: "Lamborghini", year: 2022, category: "LUJO", transmission: "AUTOMATICA", fuel: "NAFTA", seats: 2, horsepower: 640, engine: "5.2 V10 atmosférico", pricePerDay: 1150, photo: "/images/categoryCar/Lamborghini.jpg", profile: { demand: 0.45, consumption: 15.8, quality: 4.9, incidents: 0.05 } },
  { name: "911 Carrera S", brand: "Porsche", year: 2024, category: "DEPORTIVO", transmission: "AUTOMATICA", fuel: "NAFTA", seats: 4, horsepower: 450, engine: "3.0 bóxer biturbo", pricePerDay: 640, photo: "/images/categoryCar/porche.jpg", profile: { demand: 0.65, consumption: 10.9, quality: 4.8, incidents: 0.05 } },
  { name: "M3 Competition", brand: "BMW", year: 2023, category: "SEDAN", transmission: "AUTOMATICA", fuel: "NAFTA", seats: 5, horsepower: 503, engine: "3.0 I6 biturbo", pricePerDay: 340, photo: "/images/categoryCar/m3.jpg", profile: { demand: 0.7, consumption: 10.2, quality: 4.5, incidents: 0.15 } },
  { name: "Corvette Stingray", brand: "Chevrolet", year: 2023, category: "DEPORTIVO", transmission: "AUTOMATICA", fuel: "NAFTA", seats: 2, horsepower: 495, engine: "6.2 V8", pricePerDay: 410, photo: "/images/categoryCar/corvette.avif", profile: { demand: 0.55, consumption: 12.4, quality: 4.3, incidents: 0.3 } },
  { name: "Camaro SS", brand: "Chevrolet", year: 2021, category: "DEPORTIVO", transmission: "MANUAL", fuel: "NAFTA", seats: 4, horsepower: 455, engine: "6.2 V8", pricePerDay: 195, photo: "/images/categoryCar/camaro.jpg", profile: { demand: 0.5, consumption: 14.8, quality: 3.6, incidents: 0.6 } },
  { name: "Land Cruiser 300", brand: "Toyota", year: 2024, category: "SUV", transmission: "AUTOMATICA", fuel: "HIBRIDO", seats: 7, horsepower: 409, engine: "3.4 V6 biturbo híbrido", pricePerDay: 260, photo: "/images/categoryCar/toyota.jpg", profile: { demand: 0.85, consumption: 9.1, quality: 4.6, incidents: 0.1 } },
];

const NAMES = ["Lucía Fernández", "Martín Gómez", "Sofía Rodríguez", "Diego Torres", "Valentina Ruiz", "Joaquín Pérez", "Camila López", "Tomás Díaz", "Emma Johnson", "Carlos Méndez", "Ana Silva", "Nicolás Herrera"];
const COMMENTS = [
  "Impecable. El auto estaba como nuevo y la entrega fue puntual.",
  "Muy buena experiencia, la atención en la sucursal fue excelente.",
  "Gran rendimiento en ruta. Volvería a alquilarlo.",
  "Todo correcto, aunque el consumo fue mayor al esperado.",
  "La entrega a domicilio es un diferencial enorme.",
  null,
];

let codeCounter = 1000;
const code = () => `DN-DEMO${(codeCounter++).toString(36).toUpperCase()}`;
const clampScore = (n: number) => Math.max(1, Math.min(5, Math.round(n)));

async function main() {
  // Limpieza (el orden respeta las FKs; "id != null" equivale a "todas las filas")
  for (const table of ["reviews", "trip_logs", "maintenances", "reservations", "cars", "branches"] as const) {
    await run(`delete ${table}`, db.from(table).delete().not("id", "is", null));
  }

  const branches = BRANCHES.map((b) => ({ id: randomUUID(), ...b }));
  const cars: TablesInsert<"cars">[] = [];
  const reservations: TablesInsert<"reservations">[] = [];
  const trips: TablesInsert<"trip_logs">[] = [];
  const reviews: TablesInsert<"reviews">[] = [];
  const maintenances: TablesInsert<"maintenances">[] = [];

  CARS.forEach((seed, index) => {
    const { profile, pricePerDay, ...data } = seed;
    const home = branches[index % branches.length];
    const carId = randomUUID();
    cars.push({
      id: carId,
      ...data,
      price_per_day: pricePerDay,
      is_published: true,
      branch_id: home.id,
      lat: home.lat + between(-0.004, 0.004),
      lng: home.lng + between(-0.004, 0.004),
      mileage_km: Math.round(between(4000, 30000)),
    });

    const base = (over: Partial<TablesInsert<"reservations">>): TablesInsert<"reservations"> => ({
      code: code(), car_id: carId, customer_name: pick(NAMES), customer_email: "cliente@example.com",
      customer_phone: "+1 305 555 0100", start_date: day(-1), end_date: day(3), days: 4,
      price_per_day: pricePerDay, subtotal: 4 * pricePerDay, total: 4 * pricePerDay, payment_provider: "demo",
      delivery_mode: "BRANCH", pickup_branch_id: home.id, dropoff_branch_id: home.id, ...over,
    });

    // Historial: reservas consecutivas en los últimos ~180 días según la demanda del auto
    let cursor = -180;
    while (cursor < -3) {
      const gap = Math.round(between(1, 10) * (1.2 - profile.demand));
      const length = Math.round(between(2, 8));
      const start = cursor + gap;
      const end = start + length;
      cursor = end;
      if (end >= -1) break;

      const status = rand() < 0.06 ? "CANCELLED" : "COMPLETED";
      const isHome = rand() < 0.35;
      const pickup = pick(branches);
      const subtotal = length * pricePerDay;
      const discount = length >= 7 ? round2(subtotal * 0.1) : 0;
      const deliveryFee = isHome ? Math.round(between(15, 45)) : 0;
      const name = pick(NAMES);
      const id = randomUUID();

      reservations.push(
        base({
          id, status, customer_name: name, customer_email: `${name.split(" ")[0].toLowerCase()}@example.com`,
          customer_phone: "+1 305 555 0199", start_date: day(start), end_date: day(end), days: length,
          delivery_mode: isHome ? "HOME" : "BRANCH",
          pickup_branch_id: isHome ? null : pickup.id, dropoff_branch_id: isHome ? null : pickup.id,
          delivery_address: isHome ? "Hotel en Downtown Miami" : null,
          delivery_lat: isHome ? pickup.lat + between(-0.03, 0.03) : null,
          delivery_lng: isHome ? pickup.lng + between(-0.03, 0.03) : null,
          route_distance_km: isHome ? between(4, 18) : null,
          route_duration_min: isHome ? between(10, 35) : null,
          subtotal, discount, delivery_fee: deliveryFee, total: round2(subtotal - discount + deliveryFee), payment_ref: "seed",
        }),
      );
      if (status !== "COMPLETED") continue;

      const distance = Math.round(length * between(60, 180));
      trips.push({
        car_id: carId, reservation_id: id, distance_km: distance,
        fuel_used_l: round2((distance * profile.consumption * between(0.92, 1.1)) / 100),
        incidents: rand() < profile.incidents ? 1 : 0, recorded_at: day(end),
      });

      if (rand() < 0.7) {
        const score = profile.quality + between(-0.6, 0.5);
        reviews.push({
          car_id: carId, reservation_id: id, author_name: name.split(" ")[0],
          overall: clampScore(score), comfort: clampScore(score + between(-0.5, 0.5)),
          cleanliness: clampScore(score + between(-0.3, 0.6)), performance: clampScore(score + between(-0.4, 0.6)),
          efficiency: clampScore(score - (profile.consumption - 10) / 4), value: clampScore(score + between(-0.8, 0.3)),
          comment: pick(COMMENTS), created_at: day(end + 1),
        });
      }
    }

    // Mantenimiento: service regular + algún arreglo en los menos confiables
    maintenances.push({ car_id: carId, kind: "Service programado", cost: round2(between(250, 900)), start_date: day(-70), end_date: day(-68) });
    if (profile.incidents > 0.25) {
      maintenances.push({
        car_id: carId, kind: "Reparación de suspensión", description: "Detectado tras incidente en ruta",
        cost: round2(between(900, 2200)), start_date: day(-30), end_date: day(-24),
      });
    }

    // Estado actual: algunos en curso, otros con reservas futuras
    if (index % 3 === 0) reservations.push(base({ status: "ACTIVE" }));
    if (index % 2 === 0) reservations.push(base({ status: "PAID", start_date: day(8), end_date: day(12) }));
  });

  // Reserva lista para probar el flujo de reseña desde /mis-reservas
  reservations.push({
    code: "DN-PRUEBA01", car_id: cars[0].id!, customer_name: "Cliente Demo", customer_email: "demo@drivenow.com",
    customer_phone: "+1 305 555 0000", start_date: day(-6), end_date: day(-2), status: "COMPLETED",
    delivery_mode: "BRANCH", pickup_branch_id: branches[0].id, dropoff_branch_id: branches[0].id,
    days: 4, price_per_day: 289, subtotal: 1156, total: 1156, payment_provider: "demo",
  });

  // defaultToNull: false → las columnas omitidas toman su DEFAULT (id, fechas, status…)
  await run("branches", db.from("branches").insert(branches, { defaultToNull: false }));
  await run("cars", db.from("cars").insert(cars, { defaultToNull: false }));
  await run("reservations", db.from("reservations").insert(reservations, { defaultToNull: false }));
  await run("trip_logs", db.from("trip_logs").insert(trips, { defaultToNull: false }));
  await run("reviews", db.from("reviews").insert(reviews, { defaultToNull: false }));
  await run("maintenances", db.from("maintenances").insert(maintenances, { defaultToNull: false }));

  console.log(
    `✔ Seed listo: ${branches.length} sucursales, ${cars.length} autos, ${reservations.length} reservas, ${reviews.length} reseñas`,
  );
  console.log("  Probá la reseña en /mis-reservas con DN-PRUEBA01 + demo@drivenow.com");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
