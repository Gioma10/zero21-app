-- ============================================================================
-- RLS per la dashboard vendor (zero21-vendor) + delivery app (zero21-app)
-- ----------------------------------------------------------------------------
-- ⚠️  Questo DB è CONDIVISO con la delivery app (lato cliente, ANON key).
--     Le policy "public: read" su restaurants/dishes servono PROPRIO a far
--     funzionare l'app con la anon key una volta attivata RLS. Non rimuoverle.
--
-- IDEMPOTENTE: si può rieseguire (drop policy if exists prima di ogni create).
-- Eseguire DOPO schema.sql.
--
-- Modello di proprietà: restaurants.id == auth.uid() (lo UID del vendor).
--   dishes appartengono al ristorante via restaurant_id.
--   auth.uid() è uuid → cast a text per confrontarlo con le colonne text.
-- ============================================================================

-- ---- restaurants -----------------------------------------------------------
alter table public.restaurants enable row level security;

drop policy if exists "vendor: read own restaurant" on public.restaurants;
create policy "vendor: read own restaurant"
  on public.restaurants for select
  using (id = auth.uid()::text);

drop policy if exists "vendor: create own restaurant" on public.restaurants;
create policy "vendor: create own restaurant"
  on public.restaurants for insert
  with check (id = auth.uid()::text);

drop policy if exists "vendor: update own restaurant" on public.restaurants;
create policy "vendor: update own restaurant"
  on public.restaurants for update
  using (id = auth.uid()::text)
  with check (id = auth.uid()::text);

-- Lettura pubblica dei ristoranti: la delivery app (anon key) mostra il catalogo
-- a tutti, anche non loggati. Coesiste con la policy "vendor" (le SELECT sono in OR).
drop policy if exists "public: read restaurants" on public.restaurants;
create policy "public: read restaurants"
  on public.restaurants for select using (true);

-- ---- dishes ----------------------------------------------------------------
alter table public.dishes enable row level security;

drop policy if exists "vendor: read own dishes" on public.dishes;
create policy "vendor: read own dishes"
  on public.dishes for select
  using (restaurant_id = auth.uid()::text);

drop policy if exists "vendor: write own dishes" on public.dishes;
create policy "vendor: write own dishes"
  on public.dishes for all
  using (restaurant_id = auth.uid()::text)
  with check (restaurant_id = auth.uid()::text);

-- Lettura pubblica del menu: la delivery app (anon key) mostra i piatti di ogni
-- ristorante. Coesiste con la policy "vendor" (le SELECT sono in OR).
drop policy if exists "public: read dishes" on public.dishes;
create policy "public: read dishes"
  on public.dishes for select using (true);

-- ---- orders ----------------------------------------------------------------
-- Routing degli ordini per ristorante: orders.vendor_id == restaurants.id ==
-- auth.uid() del vendor. La delivery app valorizza vendor_id (= restaurant_id
-- dei piatti nel carrello) e user_id (= cliente che ordina) all'insert.
-- (colonna + indice sono già definiti in schema.sql; qui solo RLS)
alter table public.orders enable row level security;

-- SELECT: il cliente vede i propri ordini, il vendor quelli del suo ristorante.
drop policy if exists "orders: read own (cliente o vendor)" on public.orders;
create policy "orders: read own (cliente o vendor)"
  on public.orders for select
  using (
    user_id = auth.uid()
    or vendor_id = auth.uid()::text
  );

-- INSERT: un cliente autenticato crea un ordine intestato a sé.
drop policy if exists "orders: cliente crea i propri" on public.orders;
create policy "orders: cliente crea i propri"
  on public.orders for insert
  with check (user_id = auth.uid());

-- UPDATE: il vendor aggiorna (es. lo stato) solo gli ordini del proprio ristorante.
drop policy if exists "orders: vendor aggiorna i propri" on public.orders;
create policy "orders: vendor aggiorna i propri"
  on public.orders for update
  using (vendor_id = auth.uid()::text)
  with check (vendor_id = auth.uid()::text);

-- Realtime: la dashboard riceve i nuovi ordini in tempo reale.
-- (idempotente: ignora l'errore se la tabella è già nella publication)
do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
end $$;
