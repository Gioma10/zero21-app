import type { Category, Dish, OpeningHours, Restaurant } from "@/types";

// Orari demo per i ristoranti mock: pranzo + cena tutti i giorni, così in
// sviluppo il selettore delle fasce di consegna è visibile.
const MOCK_HOURS: OpeningHours = {
  mon: [["12:00", "15:00"], ["19:00", "23:00"]],
  tue: [["12:00", "15:00"], ["19:00", "23:00"]],
  wed: [["12:00", "15:00"], ["19:00", "23:00"]],
  thu: [["12:00", "15:00"], ["19:00", "23:00"]],
  fri: [["12:00", "15:00"], ["19:00", "23:30"]],
  sat: [["12:00", "15:00"], ["19:00", "23:30"]],
  sun: [["12:00", "15:00"], ["19:00", "23:00"]],
};

// Config comune delle fasce per i ristoranti mock (1 ordine per fascia).
const MOCK_SLOTS = {
  slotMinutes: 30,
  slotCapacity: 1,
  orderLeadMinutes: 30,
  openingHours: MOCK_HOURS,
};

// Le chip in cima alla Home: filtrano i ristoranti per "tag"/cucina.
export const categories: Category[] = [
  { id: "all", label: "Tutti", icon: "square.grid.2x2.fill" },
  { id: "Pizza", label: "Pizza", icon: "flame.fill" },
  { id: "Sushi", label: "Sushi", icon: "fish.fill" },
  { id: "Gourmet", label: "Gourmet", icon: "star.fill" },
];

export const restaurants: Restaurant[] = [
  {
    id: "r1",
    name: "Zero21",
    coverImage: "https://picsum.photos/seed/zero21-r1/800/500",
    tags: ["Gourmet", "Pesce"],
    rating: 4.8,
    minOrder: 20,
    deliveryTime: "30-40 min",
    ...MOCK_SLOTS,
  },
  {
    id: "r2",
    name: "Porto Cervo Pizza",
    coverImage: "https://picsum.photos/seed/zero21-r2/800/500",
    tags: ["Pizza"],
    rating: 4.6,
    minOrder: 15,
    deliveryTime: "25-35 min",
    ...MOCK_SLOTS,
  },
  {
    id: "r3",
    name: "Sushi Smeralda",
    coverImage: "https://picsum.photos/seed/zero21-r3/800/500",
    tags: ["Sushi", "Pesce"],
    rating: 4.7,
    minOrder: 18,
    deliveryTime: "20-30 min",
    ...MOCK_SLOTS,
  },
];

export const dishes: Dish[] = [
  // --- Zero21 (r1) ---
  {
    id: "d1",
    restaurantId: "r1",
    name: "Carpaccio di Gamberi",
    description: "Gamberi rossi crudi, lime e olio del Mirto",
    price: 16,
    image: "https://picsum.photos/seed/zero21-d1/400/300",
    section: "Antipasti",
  },
  {
    id: "d2",
    restaurantId: "r1",
    name: "Fregola ai Frutti di Mare",
    description: "Fregola sarda con vongole, cozze e gamberi",
    price: 18,
    image: "https://picsum.photos/seed/zero21-d2/400/300",
    section: "Primi",
  },
  {
    id: "d3",
    restaurantId: "r1",
    name: "Catalana di Aragosta",
    description: "Aragosta con pomodoro e cipolla rossa",
    price: 32,
    image: "https://picsum.photos/seed/zero21-d3/400/300",
    section: "Secondi",
  },
  {
    id: "d4",
    restaurantId: "r1",
    name: "Seadas al Miele",
    description: "Dolce sardo fritto con miele di corbezzolo",
    price: 8,
    image: "https://picsum.photos/seed/zero21-d4/400/300",
    section: "Dolci",
  },
  // --- Porto Cervo Pizza (r2) ---
  {
    id: "d5",
    restaurantId: "r2",
    name: "Bruschette miste",
    description: "Pane casereccio con pomodoro, olive e mirto",
    price: 7,
    image: "https://picsum.photos/seed/zero21-d5/400/300",
    section: "Antipasti",
  },
  {
    id: "d6",
    restaurantId: "r2",
    name: "Pizza Margherita",
    description: "Pomodoro San Marzano, fiordilatte, basilico",
    price: 9,
    image: "https://picsum.photos/seed/zero21-d6/400/300",
    section: "Primi",
  },
  {
    id: "d7",
    restaurantId: "r2",
    name: "Pizza Diavola",
    description: "Pomodoro, fiordilatte e salame piccante",
    price: 11,
    image: "https://picsum.photos/seed/zero21-d7/400/300",
    section: "Primi",
  },
  {
    id: "d8",
    restaurantId: "r2",
    name: "Tiramisù",
    description: "Classico con savoiardi e mascarpone",
    price: 6,
    image: "https://picsum.photos/seed/zero21-d8/400/300",
    section: "Dolci",
  },
  // --- Sushi Smeralda (r3) ---
  {
    id: "d9",
    restaurantId: "r3",
    name: "Edamame",
    description: "Fave di soia al vapore con sale marino",
    price: 5,
    image: "https://picsum.photos/seed/zero21-d9/400/300",
    section: "Antipasti",
  },
  {
    id: "d10",
    restaurantId: "r3",
    name: "Uramaki Salmone",
    description: "8 pezzi con avocado e salmone scottato",
    price: 12,
    image: "https://picsum.photos/seed/zero21-d10/400/300",
    section: "Primi",
  },
  {
    id: "d11",
    restaurantId: "r3",
    name: "Sashimi Misto",
    description: "Selezione di pesce crudo del giorno",
    price: 22,
    image: "https://picsum.photos/seed/zero21-d11/400/300",
    section: "Secondi",
  },
  {
    id: "d12",
    restaurantId: "r3",
    name: "Mochi",
    description: "Dolce giapponese di riso, gusto matcha",
    price: 6,
    image: "https://picsum.photos/seed/zero21-d12/400/300",
    section: "Dolci",
  },
];
