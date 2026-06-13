import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import type { Dish } from "@/types";

const DISH_COLUMNS =
  "id, restaurantId:restaurant_id, name, description, price, image, section";

async function fetchDishes(restaurantId: string): Promise<Dish[]> {
  const { data, error } = await supabase
    .from("dishes")
    .select(DISH_COLUMNS)
    .eq("restaurant_id", restaurantId); // solo i piatti di QUESTO ristorante

  if (error) throw error;
  return (data ?? []) as Dish[];
}

// Hook per i piatti di un ristorante.
export function useDishes(restaurantId: string) {
  return useQuery({
    queryKey: ["dishes", restaurantId],
    queryFn: () => fetchDishes(restaurantId),
    enabled: !!restaurantId,
  });
}
