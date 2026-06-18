import type { SFSymbol } from "expo-symbols";

// I valori ammessi per le sezioni del menù (union type = guardrail)
export type DishSection = "Antipasti" | "Primi" | "Secondi" | "Dolci" | "Drink";

// Una "chip" categoria nella Home
export type Category = {
  id: string; // 'all' oppure una DishSection
  label: string;
  icon: SFSymbol; // nome di un'icona SF Symbols (tipizzato: solo nomi validi)
};

export type Dish = {
  id: string;
  restaurantId: string; // a quale ristorante appartiene
  name: string;
  description: string;
  price: number; // euro
  image: string; // URL foto
  // Sezione del menu: testo libero deciso dal vendor (es. "Pizze", "Bibite").
  // NON è un union fisso: il vendor può creare sezioni qualsiasi.
  section: string;
};

// Un ristorante della Home
export type Restaurant = {
  id: string;
  name: string;
  coverImage: string;
  tags: string[]; // cucine/etichette, es. ["Gourmet", "Pesce"]
  rating: number;
  minOrder: number; // ordine minimo in euro
  deliveryTime: string; // es. "30-40 min"
  deliveryFee: number; // euro (0 = gratis)
};

// Una riga del carrello: un piatto + la quantità scelta
export type CartItem = {
  dish: Dish;
  qty: number;
};

// Stati possibili di un ordine: CODICI canonici nel DB, condivisi con la
// dashboard vendor. Le etichette italiane sono solo per la UI (vedi sotto).
export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "on_the_way"
  | "delivered"
  | "cancelled";

// Codice stato → etichetta italiana mostrata nell'interfaccia.
export const orderStatusLabel: Record<OrderStatus, string> = {
  pending: "In attesa",
  preparing: "In preparazione",
  ready: "Pronto",
  on_the_way: "In consegna",
  delivered: "Consegnato",
  cancelled: "Annullato",
};

// Etichetta da mostrare per uno stato; fallback sul valore grezzo se ignoto.
export function orderStatusLabelOf(status: string): string {
  return orderStatusLabel[status as OrderStatus] ?? status;
}

// Una riga dell'ordine: "scatto" del piatto al momento dell'acquisto
export type OrderItem = {
  name: string;
  qty: number;
  price: number; // prezzo unitario quando è stato ordinato
};

export type Order = {
  id: string;
  createdAt: string; // timestamp ISO dal database
  status: OrderStatus;
  items: OrderItem[];
  total: number; // euro
  vendorId: string; // ristorante a cui è instradato l'ordine
};
