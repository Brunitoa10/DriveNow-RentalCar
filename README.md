# DriveNow · Alquiler de autos premium

Next.js 14 (App Router) · TypeScript · **Supabase** (Postgres + Storage) · Tailwind/shadcn · Leaflet + OSRM · Stripe (opcional)

## Puesta en marcha

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. Abrí **SQL Editor**, pegá `supabase/migrations/20261014200000_drivenow_init.sql` y ejecutalo. Crea las tablas, la RLS, la función de kilometraje y el bucket `car-photos`.
   (Con la CLI: `npx supabase link --project-ref <ref>` y después `npx supabase db push`.)
3. Configurá el entorno e instalá:
   ```bash
   cp .env.example .env    # URL + service_role key (Settings → API) y ADMIN_ACCESS_KEY
   npm install
   npm run db:seed         # flota, sucursales, historial y reseñas de demo (borra y recrea)
   npm run dev
   ```

- Sitio: `http://localhost:3000`
- Panel: `http://localhost:3000/admin` → ingresás con `ADMIN_ACCESS_KEY` (sin cuentas)
- Reserva de prueba para reseñar: `/mis-reservas` con **DN-PRUEBA01** + **demo@drivenow.com**
- Sin `STRIPE_API_KEY` el checkout corre en **modo demo** (botón "Simular pago").
- Si cambiás el esquema, regenerá los tipos: `npx supabase link` y después `npm run db:types`.

### Cómo se usa Supabase
- **Datos:** `supabase-js` con la `service_role` key, **sólo en el servidor** (Server Components, Server Actions y el webhook). El navegador nunca habla directo con la base.
- **RLS activada** en todas las tablas. Con la `anon` key sólo se puede leer el catálogo publicado, las sucursales y las reseñas; las reservas y la telemetría quedan cerradas.
- **Storage:** las fotos se suben al bucket público `car-photos` mediante una Server Action protegida por la sesión admin.
- **RPC** `increment_car_mileage` para sumar kilómetros de forma atómica, y vista `car_rating_stats` para los promedios.

## Arquitectura

```
app/                      Rutas (sólo composición: leen del container y renderizan)
  (public)/               Home, flota, detalle, reserva, mis-reservas, favoritos, sucursales
  admin/login             Acceso con clave
  admin/(panel)/          Resumen, flota y performance, reservas, mapa, sucursales
  api/                    Webhook de Stripe
supabase/migrations/      Esquema SQL, RLS, Storage y RPC
src/
  server/container.ts     Composition Root: única fábrica de dependencias
  server/supabase.ts      Cliente Supabase (service role, sin caché de Next)
  server/database.types.ts Tipos generados del esquema
  modules/
    cars/                 domain · validation · infrastructure (Supabase) · application · ui · actions
    reservations/         pricing (Strategy) · state machine · servicio · BookingPanel
    reviews/              reseñas por criterios y resumen
    fleet/                índice de performance (Strategy + Composite) · KPIs · mantenimiento
    branches/             sucursales
    routing/              OSRM (Adapter) + fallback línea recta (Decorator)
    payments/             PaymentGateway: Stripe / Demo
    storage/              PhotoStorage → Supabase Storage
    admin-auth/           cookie firmada HMAC + middleware
  shared/                 config, formatters, errores, UI base, mapas
```

### Principios y patrones aplicados

| Dónde | Patrón / principio |
|---|---|
| `*Repository` interfaces + `Supabase*Repository` | Repository + DIP: los servicios no conocen Supabase (la migración desde Prisma no tocó ningún servicio de dominio) |
| `server/container.ts` | Composition Root / inyección de dependencias |
| `reservations/domain/pricing.ts` | Strategy + Composite: cada regla de precio es una clase (OCP) |
| `reservations/domain/reservation-state.ts` | State Machine: transiciones válidas en un solo lugar |
| `fleet/domain/performance.ts` | Strategy por criterio + scorer ponderado |
| `payments/payment-gateway.ts` | Puerto de pagos: Stripe hoy, MercadoPago mañana sin tocar el servicio |
| `routing/routing.ts` | Adapter (OSRM) + Decorator con fallback |
| `shared/lib/result.ts` | Resultado uniforme para Server Actions (sin excepciones al cliente) |
| `cars/validation/car.schema.ts` | Una sola validación zod para cliente y servidor |

### Seguridad
- El precio se calcula **siempre en el servidor**; el cliente sólo ve una cotización.
- La reserva nace `PENDING` y pasa a `PAID` por webhook o verificación con el proveedor.
- Control de disponibilidad (no se superponen reservas).
- Todas las mutaciones admin verifican la sesión (`assertAdmin`), además del middleware.

## Índice de performance (0–100)

| Criterio | Peso | Fuente |
|---|---|---|
| Satisfacción | 35% | Reseñas de clientes (1–5) |
| Utilización | 30% | Días alquilados / días disponibles (meta 75%) |
| Confiabilidad | 20% | Incidentes cada 1000 km + días en taller |
| Eficiencia | 15% | L/100 km medido vs. referencia por categoría |

Grados: **A** ≥ 85 · **B** ≥ 70 · **C** ≥ 55 · **D** < 55. Los datos de viaje se cargan al registrar la devolución de cada reserva.

## Stripe (opcional)
1. `STRIPE_API_KEY` y `STRIPE_WEBHOOK_SECRET` en `.env`
2. Webhook → `POST /api/webhooks/stripe` con el evento `checkout.session.completed`
3. En local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
