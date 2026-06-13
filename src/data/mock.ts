import type { Category, Dish, Restaurant } from "@/types";

export const restaurant: Restaurant = {
  name: "Zero21",
  location: "Arzachena, Centro",
  coverImage: "https://picsum.photos/seed/zero21-cover/800/400",
  rating: 4.8,
  avgTime: 25,
  deliveryFee: 2.5,
};

export const categories: Category[] = [
  { id: "all", label: "Tutti", icon: "square.grid.2x2.fill" },
  { id: "Antipasti", label: "Antipasti", icon: "leaf.fill" },
  { id: "Primi", label: "Primi", icon: "fork.knife" },
  { id: "Secondi", label: "Secondi", icon: "flame.fill" },
  { id: "Dolci", label: "Dolci", icon: "birthday.cake.fill" },
  { id: "Drink", label: "Drink", icon: "wineglass.fill" },
];

export const dishes: Dish[] = [
  {
    id: "d1",
    name: "Carpaccio di Gamberi",
    description: "Gamberi rossi crudi, lime e olio del Mirto",
    price: 16,
    image: "https://picsum.photos/seed/zero21-d1/400/300",
    section: "Antipasti",
  },
  {
    id: "d2",
    name: "Fregola ai Frutti di Mare",
    description: "Fregola sarda con vongole, cozze e gamberi",
    price: 18,
    image: "https://picsum.photos/seed/zero21-d2/400/300",
    section: "Primi",
  },
  {
    id: "d3",
    name: "Catalana di Aragosta",
    description: "Aragosta con pomodoro e cipolla rossa",
    price: 32,
    image: "https://picsum.photos/seed/zero21-d3/400/300",
    section: "Secondi",
  },
  {
    id: "d4",
    name: "Seadas al Miele",
    description: "Dolce sardo fritto con miele di corbezzolo",
    price: 8,
    image: "https://picsum.photos/seed/zero21-d4/400/300",
    section: "Dolci",
  },
  {
    id: "d5",
    name: "Vermentino di Gallura",
    description: "Calice di vino bianco DOCG",
    price: 6,
    image: "https://picsum.photos/seed/zero21-d5/400/300",
    section: "Drink",
  },
];
