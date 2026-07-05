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

-- Blindatura della commissione: `restaurants.commission_rate` è un dato di
-- piattaforma, lo può cambiare SOLO la console admin (service role). Il vendor
-- può aggiornare la propria riga (policy sopra) ma non questo campo: il trigger
-- ignora ogni tentativo (insert/update) da ruoli diversi dal service role,
-- riportando il valore precedente (o NULL in insert = usa il default globale).
create or replace function public.lock_restaurant_commission()
returns trigger language plpgsql as $$
begin
  if current_user not in ('service_role', 'postgres', 'supabase_admin') then
    if tg_op = 'INSERT' then
      new.commission_rate := null;
    elsif tg_op = 'UPDATE'
      and new.commission_rate is distinct from old.commission_rate then
      new.commission_rate := old.commission_rate;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists lock_restaurant_commission on public.restaurants;
create trigger lock_restaurant_commission
  before insert or update on public.restaurants
  for each row execute function public.lock_restaurant_commission();

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

-- UPDATE: il cliente può annullare un proprio ordine SOLO finché è "pending"
-- (il ristorante non l'ha ancora preso in carico). `using` vede la riga PRIMA
-- dell'update (deve essere pending del cliente), `with check` vede la riga DOPO
-- (l'unico esito ammesso è "cancelled"): così il cliente non può far avanzare
-- lo stato né annullare cibo già in preparazione.
drop policy if exists "orders: cliente annulla i propri pending" on public.orders;
create policy "orders: cliente annulla i propri pending"
  on public.orders for update
  using (user_id = auth.uid() and status = 'pending')
  with check (user_id = auth.uid() and status = 'cancelled');

-- Realtime: la dashboard riceve i nuovi ordini in tempo reale.
-- (idempotente: ignora l'errore se la tabella è già nella publication)
do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
end $$;

-- ---- platform_settings -----------------------------------------------------
alter table public.platform_settings enable row level security;

-- Lettura pubblica: vendor (anon key) e app leggono la commissione. La
-- SCRITTURA passa solo dalla console admin (service role, che BYPASSA la RLS):
-- nessuna policy di insert/update per anon → non modificabile dai client.
drop policy if exists "public: read platform settings" on public.platform_settings;
create policy "public: read platform settings"
  on public.platform_settings for select using (true);

-- ---- restaurant_billing ----------------------------------------------------
-- Dati fiscali: NESSUNA lettura pubblica (a differenza di restaurants). Il
-- vendor gestisce solo la propria riga; l'admin (service role) bypassa la RLS
-- e li legge tutti per fatturare.
alter table public.restaurant_billing enable row level security;

drop policy if exists "billing: vendor legge la propria" on public.restaurant_billing;
create policy "billing: vendor legge la propria"
  on public.restaurant_billing for select
  using (id = auth.uid()::text);

drop policy if exists "billing: vendor crea la propria" on public.restaurant_billing;
create policy "billing: vendor crea la propria"
  on public.restaurant_billing for insert
  with check (id = auth.uid()::text);

drop policy if exists "billing: vendor aggiorna la propria" on public.restaurant_billing;
create policy "billing: vendor aggiorna la propria"
  on public.restaurant_billing for update
  using (id = auth.uid()::text)
  with check (id = auth.uid()::text);
