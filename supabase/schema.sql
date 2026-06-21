-- ============================================================================
-- SCHEMA CANONICO del DB Supabase di ZERO21 — FONTE DI VERITÀ.
-- ----------------------------------------------------------------------------
-- ⚠️  Questo DB è CONDIVISO tra la delivery app (zero21-app, client Expo con
--     ANON key) e la dashboard venditori (zero21-vendor, Next.js).
--     Questo file è duplicato identico nei due repo: se lo modifichi qui,
--     riportalo anche in zero21-app/supabase/schema.sql.
--
-- IDEMPOTENTE: si può rieseguire in sicurezza. Funziona sia su un DB nuovo
-- (crea le tabelle) sia su uno già esistente (aggiunge le colonne mancanti,
-- normalizza gli stati legacy, applica vincoli/indici senza errori).
--
-- Ordine di esecuzione nel SQL editor di Supabase:
--   1) schema.sql   (questo file — tabelle, vincoli, indici)
--   2) policies.sql (RLS)
--   3) storage.sql  (bucket immagini)
--
-- Modello di proprietà / collegamento tra i due progetti:
--   restaurants.id == auth.uid() del vendor
--   dishes.restaurant_id -> restaurants.id   (menu del ristorante)
--   orders.vendor_id     -> restaurants.id   (ordine instradato al ristorante)
--   orders.user_id       -> auth.users.id    (cliente che ha ordinato)
-- ============================================================================

-- ---- restaurants -----------------------------------------------------------
-- `id` NON è generato: è lo UID dell'utente Supabase del vendor (text).
create table if not exists public.restaurants (
  id            text primary key,
  name          text not null,
  cover_image   text,
  tags          text[]      not null default '{}',
  rating        numeric     not null default 0,
  min_order     numeric     not null default 0,
  delivery_time text,
  delivery_fee  numeric     not null default 0,
  created_at    timestamptz not null default now()
);

-- Allineamento se la tabella preesisteva con colonne mancanti.
alter table public.restaurants add column if not exists name          text;
alter table public.restaurants add column if not exists cover_image   text;
alter table public.restaurants add column if not exists tags          text[]      not null default '{}';
alter table public.restaurants add column if not exists rating        numeric     not null default 0;
alter table public.restaurants add column if not exists min_order     numeric     not null default 0;
alter table public.restaurants add column if not exists delivery_time text;
alter table public.restaurants add column if not exists delivery_fee  numeric     not null default 0;
alter table public.restaurants add column if not exists created_at    timestamptz not null default now();

-- ---- dishes ----------------------------------------------------------------
-- `section` è testo libero (categoria nel menu, es. "Pizze", "Antipasti").
create table if not exists public.dishes (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id text not null references public.restaurants (id) on delete cascade,
  name          text not null,
  description   text,
  price         numeric not null default 0,
  image         text,
  section       text not null default '',
  created_at    timestamptz not null default now()
);

alter table public.dishes add column if not exists restaurant_id text;
alter table public.dishes add column if not exists name          text;
alter table public.dishes add column if not exists description   text;
alter table public.dishes add column if not exists price         numeric not null default 0;
alter table public.dishes add column if not exists image         text;
alter table public.dishes add column if not exists section       text not null default '';
alter table public.dishes add column if not exists created_at    timestamptz not null default now();

-- FK dishes -> restaurants (idempotente).
do $$ begin
  alter table public.dishes
    add constraint dishes_restaurant_id_fkey
    foreign key (restaurant_id) references public.restaurants (id) on delete cascade;
exception when duplicate_object then null; end $$;

create index if not exists dishes_restaurant_id_idx
  on public.dishes (restaurant_id);

-- ---- orders ----------------------------------------------------------------
-- `status` usa i CODICI canonici (label italiane solo in UI, lato app/vendor).
-- Un nuovo ordine creato dalla delivery app non valorizza lo status → DEFAULT.
-- `items` è jsonb: array di righe { name, qty, price } (snapshot al checkout).
create table if not exists public.orders (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status     text not null default 'pending',
  items      jsonb   not null default '[]'::jsonb,
  total      numeric not null default 0,
  user_id    uuid,
  vendor_id  text,
  -- Indirizzo di consegna: snapshot al checkout (campi separati). Il cliente
  -- lo inserisce in app; vendor e admin lo leggono dall'ordine per consegnare.
  delivery_street text,
  delivery_city   text,
  delivery_zip    text,
  delivery_notes  text,
  -- Telefono di contatto per la consegna (snapshot dal profilo del cliente).
  contact_phone   text
);

-- Allineamento se la tabella preesisteva (è il caso dell'errore "vendor_id
-- does not exist"): aggiunge le colonne mancanti prima di indici/vincoli.
alter table public.orders add column if not exists created_at timestamptz not null default now();
alter table public.orders add column if not exists status     text not null default 'pending';
alter table public.orders add column if not exists items      jsonb   not null default '[]'::jsonb;
alter table public.orders add column if not exists total      numeric not null default 0;
alter table public.orders add column if not exists user_id    uuid;
alter table public.orders add column if not exists vendor_id  text;
-- Indirizzo di consegna (campi separati). Aggiunti su DB preesistenti.
alter table public.orders add column if not exists delivery_street text;
alter table public.orders add column if not exists delivery_city   text;
alter table public.orders add column if not exists delivery_zip    text;
alter table public.orders add column if not exists delivery_notes  text;
alter table public.orders add column if not exists contact_phone   text;

-- Normalizza eventuali stati "legacy" (vecchie etichette italiane) ai codici,
-- così il successivo CHECK non fallisce su righe preesistenti.
update public.orders set status = case status
    when 'In preparazione' then 'preparing'
    when 'In consegna'     then 'on_the_way'
    when 'Consegnato'      then 'delivered'
    when 'Annullato'       then 'cancelled'
    else status
  end
  where status in ('In preparazione', 'In consegna', 'Consegnato', 'Annullato');

-- Niente status nullo: porta a 'pending' prima di imporre NOT NULL/default.
update public.orders set status = 'pending' where status is null;
alter table public.orders alter column status set default 'pending';
alter table public.orders alter column status set not null;

-- Vincolo sui valori ammessi (idempotente).
do $$ begin
  alter table public.orders
    add constraint orders_status_check
    check (status in (
      'pending', 'preparing', 'ready',
      'on_the_way', 'delivered', 'cancelled'
    ));
exception when duplicate_object then null; end $$;

-- FK orders -> auth.users e orders -> restaurants (idempotenti).
do $$ begin
  alter table public.orders
    add constraint orders_user_id_fkey
    foreign key (user_id) references auth.users (id) on delete set null;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.orders
    add constraint orders_vendor_id_fkey
    foreign key (vendor_id) references public.restaurants (id) on delete cascade;
exception when duplicate_object then null; end $$;

-- Filtro/realtime lato dashboard: ordini per ristorante.
create index if not exists orders_vendor_id_idx on public.orders (vendor_id);
-- Lista "i miei ordini" lato cliente.
create index if not exists orders_user_id_idx on public.orders (user_id);
