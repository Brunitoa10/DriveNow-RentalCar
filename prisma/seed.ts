/**
 * Datos de demostración: sucursales, flota, reservas históricas, viajes,
 * mantenimientos y reseñas para que el panel muestre métricas reales.
 * Ejecutar:  npx prisma db seed   (borra y recrea todo)
 */
import { PrismaClient, type CarCategory, type FuelType, type ReservationStatus, type Transmission } from "@prisma/client";

const db = new PrismaClient();

// PRNG determinístico: el seed genera siempre los mismos datos
let state = 42;
const rand = () => ((state = (state * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const between = (min: number, max: number) => min + rand() * (max - min);
const pick = <T,>(items: readonly T[]) => items[Math.floor(rand() * items.length)];
const day = (offset: number) => {
  const d = new Date();
  d.setHours(10, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
};

const BRANCHES = [
  { name: "Brickell Financial", address: "1101 Brickell Ave", city: "Miami", phone: "+1 305 555 0101", lat: 25.7634, lng: -80.1918 },
  { name: "Aeropuerto MIA", address: "2100 NW 42nd Ave", city: "Miami", phone: "+1 305 555 0102", lat: 25.7959, lng: -80.2871 },
  { name: "Miami Beach", address: "1601 Collins Ave", city: "Miami Beach", phone: "+1 305 555 0103", lat: 25.7907, lng: -80.1300 },
  { name: "Coral Gables", address: "2301 Ponce de Leon Blvd", city: "Coral Gables", phone: null, lat: 25.7505, lng: -80.2587 },
];

type SeedCar = {
  name: string; brand: string; year: number; category: CarCategory; transmission: Transmission; fuel: FuelType;
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
  await db.review.deleteMany();
  await db.tripLog.deleteMany();
  await db.maintenance.deleteMany();
  await db.reservation.deleteMany();
  await db.car.deleteMany();
  await db.branch.deleteMany();

  const branches = await Promise.all(BRANCHES.map((data) => db.branch.create({ data })));

  for (const [index, seed] of CARS.entries()) {
    const { profile, ...data } = seed;
    const home = branches[index % branches.length];
    const car = await db.car.create({
      data: {
        ...data,
        isPublished: true,
        branchId: home.id,
        lat: home.lat + between(-0.004, 0.004),
        lng: home.lng + between(-0.004, 0.004),
        mileageKm: Math.round(between(4000, 30000)),
      },
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

      const status: ReservationStatus = rand() < 0.06 ? "CANCELLED" : "COMPLETED";
      const isHome = rand() < 0.35;
      const pickup = pick(branches);
      const subtotal = length * seed.pricePerDay;
      const discount = length >= 7 ? subtotal * 0.1 : 0;
      const deliveryFee = isHome ? Math.round(between(15, 45)) : 0;
      const name = pick(NAMES);

      const reservation = await db.reservation.create({
        data: {
          code: code(),
          carId: car.id,
          customerName: name,
          customerEmail: `${name.split(" ")[0].toLowerCase()}@example.com`,
          customerPhone: "+1 305 555 0199",
          startDate: day(start),
          endDate: day(end),
          status,
          deliveryMode: isHome ? "HOME" : "BRANCH",
          pickupBranchId: isHome ? null : pickup.id,
          dropoffBranchId: isHome ? null : pickup.id,
          deliveryAddress: isHome ? "Hotel en Downtown Miami" : null,
          deliveryLat: isHome ? pickup.lat + between(-0.03, 0.03) : null,
          deliveryLng: isHome ? pickup.lng + between(-0.03, 0.03) : null,
          routeDistanceKm: isHome ? between(4, 18) : null,
          routeDurationMin: isHome ? between(10, 35) : null,
          days: length,
          pricePerDay: seed.pricePerDay,
          subtotal,
          discount,
          deliveryFee,
          total: subtotal - discount + deliveryFee,
          paymentProvider: "demo",
          paymentRef: "seed",
        },
      });
      if (status !== "COMPLETED") continue;

      const distanceKm = Math.round(length * between(60, 180));
      await db.tripLog.create({
        data: {
          carId: car.id,
          reservationId: reservation.id,
          distanceKm,
          fuelUsedL: (distanceKm * profile.consumption * between(0.92, 1.1)) / 100,
          incidents: rand() < profile.incidents ? 1 : 0,
          recordedAt: day(end),
        },
      });

      if (rand() < 0.7) {
        const base = profile.quality + between(-0.6, 0.5);
        await db.review.create({
          data: {
            carId: car.id,
            reservationId: reservation.id,
            authorName: name.split(" ")[0],
            overall: clampScore(base),
            comfort: clampScore(base + between(-0.5, 0.5)),
            cleanliness: clampScore(base + between(-0.3, 0.6)),
            performance: clampScore(base + between(-0.4, 0.6)),
            efficiency: clampScore(base - (profile.consumption - 10) / 4),
            value: clampScore(base + between(-0.8, 0.3)),
            comment: pick(COMMENTS),
            createdAt: day(end + 1),
          },
        });
      }
    }

    // Mantenimiento: service regular + algún arreglo en los menos confiables
    await db.maintenance.create({
      data: { carId: car.id, kind: "Service programado", cost: between(250, 900), startDate: day(-70), endDate: day(-68) },
    });
    if (profile.incidents > 0.25) {
      await db.maintenance.create({
        data: { carId: car.id, kind: "Reparación de suspensión", description: "Detectado tras incidente en ruta", cost: between(900, 2200), startDate: day(-30), endDate: day(-24) },
      });
    }

    // Estado actual: algunos en curso, otros con reservas futuras
    if (index % 3 === 0) {
      await db.reservation.create({
        data: {
          code: code(), carId: car.id, customerName: pick(NAMES), customerEmail: "cliente@example.com", customerPhone: "+1 305 555 0100",
          startDate: day(-1), endDate: day(3), status: "ACTIVE", deliveryMode: "BRANCH", pickupBranchId: home.id, dropoffBranchId: home.id,
          days: 4, pricePerDay: seed.pricePerDay, subtotal: 4 * seed.pricePerDay, total: 4 * seed.pricePerDay, paymentProvider: "demo",
        },
      });
    }
    if (index % 2 === 0) {
      await db.reservation.create({
        data: {
          code: code(), carId: car.id, customerName: pick(NAMES), customerEmail: "cliente@example.com", customerPhone: "+1 305 555 0100",
          startDate: day(8), endDate: day(12), status: "PAID", deliveryMode: "BRANCH", pickupBranchId: home.id, dropoffBranchId: home.id,
          days: 4, pricePerDay: seed.pricePerDay, subtotal: 4 * seed.pricePerDay, total: 4 * seed.pricePerDay, paymentProvider: "demo",
        },
      });
    }
  }

  // Reserva lista para probar el flujo de reseña desde /mis-reservas
  const firstCar = await db.car.findFirstOrThrow({ orderBy: { createdAt: "asc" } });
  await db.reservation.create({
    data: {
      code: "DN-PRUEBA01", carId: firstCar.id, customerName: "Cliente Demo", customerEmail: "demo@drivenow.com", customerPhone: "+1 305 555 0000",
      startDate: day(-6), endDate: day(-2), status: "COMPLETED", deliveryMode: "BRANCH", pickupBranchId: branches[0].id, dropoffBranchId: branches[0].id,
      days: 4, pricePerDay: 289, subtotal: 1156, total: 1156, paymentProvider: "demo",
    },
  });

  const [cars, reservations, reviews] = await Promise.all([db.car.count(), db.reservation.count(), db.review.count()]);
  console.log(`✔ Seed listo: ${branches.length} sucursales, ${cars} autos, ${reservations} reservas, ${reviews} reseñas`);
  console.log("  Probá la reseña en /mis-reservas con DN-PRUEBA01 + demo@drivenow.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
