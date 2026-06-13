// I valori ammessi per le sezioni del menù (union type = guardrail)
export type DishSection = "Antipasti" | "Primi" | "Secondi" | "Dolci" | "Drink";

// Una "chip" categoria nella Home
export type Category = {
  id: string; // 'all' oppure una DishSection
  label: string;
  icon: string; // nome SF Symbol
};

export type Dish = {
  id: string;
  name: string;
  description: string;
  price: number; // euro
  image: string; // URL foto
  section: DishSection;
};

// Info del tuo unico locale
export type Restaurant = {
  name: string;
  location: string;
  coverImage: string;
  rating: number;
  avgTime: number; // minuti
  deliveryFee: number; // euro
};
