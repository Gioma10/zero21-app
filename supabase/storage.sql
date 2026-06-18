-- ============================================================================
-- Storage per le immagini della dashboard vendor (zero21-vendor)
-- ----------------------------------------------------------------------------
-- Bucket PUBBLICO `restaurant-images`: contiene cover dei ristoranti e foto dei
-- piatti, mostrate ai clienti nella delivery app → lettura pubblica.
--
-- Convenzione dei path:  <auth.uid()>/<cartella>/<file>
--   es. 9f1c…/cover/ab12.jpg   ·   9f1c…/dishes/cd34.webp
-- La prima cartella è sempre lo UID del vendor: le policy di scrittura
-- consentono a ciascuno di toccare SOLO la propria cartella.
--
-- Esegui questo file nel SQL editor di Supabase (una volta).
-- ============================================================================

-- 1) Bucket pubblico (idempotente).
insert into storage.buckets (id, name, public)
values ('restaurant-images', 'restaurant-images', true)
on conflict (id) do update set public = true;

-- 2) Lettura pubblica degli oggetti del bucket.
drop policy if exists "restaurant-images: public read" on storage.objects;
create policy "restaurant-images: public read"
  on storage.objects for select
  using (bucket_id = 'restaurant-images');

-- 3) Upload consentito solo nella propria cartella (prima cartella = UID).
drop policy if exists "restaurant-images: vendor upload own folder" on storage.objects;
create policy "restaurant-images: vendor upload own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'restaurant-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4) Aggiornamento dei propri file.
drop policy if exists "restaurant-images: vendor update own folder" on storage.objects;
create policy "restaurant-images: vendor update own folder"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'restaurant-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'restaurant-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5) Eliminazione dei propri file.
drop policy if exists "restaurant-images: vendor delete own folder" on storage.objects;
create policy "restaurant-images: vendor delete own folder"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'restaurant-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
