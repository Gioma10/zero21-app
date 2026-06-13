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
  section: DishSection;
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

// Stati possibili di un ordine (union type = guardrail)
export type OrderStatus = "In preparazione" | "In consegna" | "Consegnato" | "Annullato";

export type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  items: { name: string; qty: number }[];
  total: number; // euro
};
