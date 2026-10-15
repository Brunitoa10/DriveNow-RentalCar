-- ════════════════════════════════════════════════════════════════════════
-- DriveNow · esquema inicial para Supabase
-- Aplicar: Supabase Dashboard → SQL Editor (pegar y ejecutar)
--          o con la CLI:  npx supabase db push
-- ════════════════════════════════════════════════════════════════════════

-- ── Tipos ───────────────────────────────────────────────────────────────
create type public.car_category       as enum ('SEDAN', 'SUV', 'DEPORTIVO', 'LUJO', 'COMPACTO', 'PICKUP');
create type public.transmission       as enum ('MANUAL', 'AUTOMATICA');
create type public.fuel_type          as enum ('NAFTA', 'DIESEL', 'HIBRIDO', 'ELECTRICO');
create type public.reservation_status as enum ('PENDING', 'PAID', 'ACTIVE', 'COMPLETED', 'CANCELLED');
create type public.delivery_mode      as enum ('BRANCH', 'HOME');

-- ── updated_at automático ───────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ── Sucursales ──────────────────────────────────────────────────────────
create table public.branches (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  address    text not null,
  city       text not null,
  phone      text,
  lat        double precision not null check (lat between -90 and 90),
  lng        double precision not null check (lng between -180 and 180),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Autos ───────────────────────────────────────────────────────────────
create table public.cars (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  brand         text not null,
  year          int  not null,
  category      public.car_category not null,
  transmission  public.transmission not null,
  fuel          public.fuel_type not null,
  seats         int  not null check (seats > 0),
  horsepower    int  not null check (horsepower > 0),
  engine        text not null,
  price_per_day numeric(10, 2) not null check (price_per_day > 0),
  photo         text not null,
  is_published  boolean not null default false,
  mileage_km    int not null default 0,
  branch_id     uuid references public.branches (id) on delete set null,
  lat           double precision,
  lng           double precision,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index cars_branch_id_idx on public.cars (branch_id);
create index cars_is_published_idx on public.cars (is_published);

-- ── Reservas ────────────────────────────────────────────────────────────
create table public.reservations (
  id                 uuid primary key default gen_random_uuid(),
  code               text not null unique,
  car_id             uuid not null references public.cars (id) on delete cascade,
  customer_name      text not null,
  customer_email     text not null,
  customer_phone     text not null,
  start_date         timestamptz not null,
  end_date           timestamptz not null,
  status             public.reservation_status not null default 'PENDING',
  delivery_mode      public.delivery_mode not null default 'BRANCH',
  pickup_branch_id   uuid references public.branches (id) on delete set null,
  dropoff_branch_id  uuid references public.branches (id) on delete set null,
  delivery_address   text,
  delivery_lat       double precision,
  delivery_lng       double precision,
  route_distance_km  double precision,
  route_duration_min double precision,
  days               int not null check (days > 0),
  price_per_day      numeric(10, 2) not null,
  subtotal           numeric(10, 2) not null,
  discount           numeric(10, 2) not null default 0,
  delivery_fee       numeric(10, 2) not null default 0,
  total              numeric(10, 2) not null,
  payment_provider   text,
  payment_ref        text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint reservations_dates_check check (end_date > start_date)
);
create index reservations_car_id_idx on public.reservations (car_id);
create index reservations_status_idx on public.reservations (status);
create index reservations_email_idx on public.reservations (customer_email);
create index reservations_car_dates_idx on public.reservations (car_id, start_date, end_date);

-- ── Reseñas ─────────────────────────────────────────────────────────────
create table public.reviews (
  id             uuid primary key default gen_random_uuid(),
  car_id         uuid not null references public.cars (id) on delete cascade,
  reservation_id uuid not null unique references public.reservations (id) on delete cascade,
  author_name    text not null,
  overall        int not null check (overall between 1 and 5),
  comfort        int not null check (comfort between 1 and 5),
  cleanliness    int not null check (cleanliness between 1 and 5),
  performance    int not null check (performance between 1 and 5),
  efficiency     int not null check (efficiency between 1 and 5),
  value          int not null check (value between 1 and 5),
  comment        text,
  created_at     timestamptz not null default now()
);
create index reviews_car_id_idx on public.reviews (car_id);

-- ── Telemetría operativa ────────────────────────────────────────────────
create table public.trip_logs (
  id             uuid primary key default gen_random_uuid(),
  car_id         uuid not null references public.cars (id) on delete cascade,
  reservation_id uuid unique references public.reservations (id) on delete set null,
  distance_km    double precision not null check (distance_km >= 0),
  fuel_used_l    double precision not null check (fuel_used_l >= 0),
  incidents      int not null default 0,
  notes          text,
  recorded_at    timestamptz not null default now()
);
create index trip_logs_car_id_idx on public.trip_logs (car_id);

create table public.maintenances (
  id          uuid primary key default gen_random_uuid(),
  car_id      uuid not null references public.cars (id) on delete cascade,
  kind        text not null,
  description text,
  cost        numeric(10, 2) not null default 0,
  start_date  timestamptz not null,
  end_date    timestamptz,
  created_at  timestamptz not null default now()
);
create index maintenances_car_id_idx on public.maintenances (car_id);

-- ── Triggers ────────────────────────────────────────────────────────────
create trigger branches_updated_at     before update on public.branches     for each row execute function public.set_updated_at();
create trigger cars_updated_at         before update on public.cars         for each row execute function public.set_updated_at();
create trigger reservations_updated_at before update on public.reservations for each row execute function public.set_updated_at();

-- ── Vista: calificación por auto ────────────────────────────────────────
create view public.car_rating_stats with (security_invoker = true) as
  select car_id, avg(overall)::float8 as rating_average, count(*)::int as rating_count
  from public.reviews
  group by car_id;

-- ── RPC: suma kilometraje de forma atómica ──────────────────────────────
create or replace function public.increment_car_mileage(p_car_id uuid, p_km int)
returns void language sql as $$
  update public.cars set mileage_km = mileage_km + greatest(p_km, 0) where id = p_car_id;
$$;
revoke execute on function public.increment_car_mileage(uuid, int) from public, anon, authenticated;

-- ════════════════════════════════════════════════════════════════════════
-- Row Level Security
-- El servidor usa la service_role key (no pasa por RLS). Estas políticas
-- son defensa en profundidad: si alguien usa la anon key, sólo puede LEER
-- el catálogo público. Reservas y datos operativos quedan cerrados.
-- ════════════════════════════════════════════════════════════════════════
alter table public.branches     enable row level security;
alter table public.cars         enable row level security;
alter table public.reservations enable row level security;
alter table public.reviews      enable row level security;
alter table public.trip_logs    enable row level security;
alter table public.maintenances enable row level security;

create policy "Sucursales visibles para todos" on public.branches for select using (true);
create policy "Autos publicados visibles"      on public.cars     for select using (is_published);
create policy "Reseñas visibles para todos"    on public.reviews  for select using (true);

-- ── Storage: fotos de autos (bucket público de lectura) ─────────────────
do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('car-photos', 'car-photos', true, 4194304, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
    on conflict (id) do nothing;
  end if;
end $$;
