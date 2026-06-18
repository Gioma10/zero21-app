# Database ZERO21 — fonte di verità

Il DB Supabase è **condiviso** tra la delivery app (`zero21-app`, client Expo con
anon key) e la dashboard venditori (`zero21-vendor`, Next.js).

Project ref: `acdjrqbndolwjdinqokj`

## File SQL (eseguire nel SQL editor di Supabase, in quest'ordine)

1. **`schema.sql`** — tabelle, vincoli, indici. Idempotente: rieseguibile, e su un
   DB già esistente aggiunge le colonne mancanti e normalizza gli stati legacy.
2. **`policies.sql`** — Row Level Security. Include le policy `public: read` su
   `restaurants`/`dishes` che tengono viva l'app con la anon key. Idempotente.
3. **`storage.sql`** — bucket pubblico `restaurant-images` + policy. Idempotente.

Questi tre file sono duplicati identici in `zero21-app/supabase/` e
`zero21-vendor/supabase/`: se ne modifichi uno, riportalo anche nell'altro repo.

## Modello dati e collegamento tra i due progetti

```
restaurants.id        == auth.uid() del vendor      (un vendor = un ristorante)
dishes.restaurant_id  -> restaurants.id             (menu del ristorante)
orders.vendor_id      -> restaurants.id             (ordine instradato al ristorante)
orders.user_id        -> auth.users.id              (cliente che ha ordinato)
```

Stati ordine (codici nel DB, etichette IT solo in UI):
`pending → preparing → ready → on_the_way → delivered` (+ `cancelled`).

## Anti-drift: rigenerare i tipi TypeScript dallo schema

Lo schema SQL è la fonte di verità. I tipi TS si rigenerano dal DB con un comando
(richiede la Supabase CLI autenticata: `supabase login` una volta sola):

```bash
# nel repo vendor
pnpm gen:types      # -> lib/database.types.ts

# nel repo app
npm run gen:types   # -> src/types/database.types.ts
```

Tieni allineati i tipi di dominio scritti a mano (`lib/types.ts` nel vendor,
`src/types/index.ts` nell'app) a quanto generato in `database.types.ts`.
