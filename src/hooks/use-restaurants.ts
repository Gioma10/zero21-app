import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import type { Restaurant } from "@/types";

// Le colonne da leggere. "coverImage:cover_image" = prendi cover_image
// ma chiamala coverImage nel risultato → combacia col tipo Restaurant.
const RESTAURANT_COLUMNS =
  "id, name, coverImage:cover_image, tags, rating, minOrder:min_order, deliveryTime:delivery_time, slotMinutes:slot_minutes, slotCapacity:slot_capacity, orderLeadMinutes:order_lead_minutes, openingHours:opening_hours";

// La "queryFn": fa la chiamata e, se Supabase segnala un errore, lo LANCIA
// (così TanStack Query capisce che è fallita).
async function fetchRestaurants(): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from("restaurants")
    .select(RESTAURANT_COLUMNS)
    .order("rating", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Restaurant[];
}

async function fetchRestaurant(id: string): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from("restaurants")
    .select(RESTAURANT_COLUMNS)
    .eq("id", id)
    .maybeSingle(); // come .single() ma ritorna null invece di lanciare se non c'è

  if (error) throw error;
  return data as Restaurant | null;
}

// Hook per la lista (Home). queryKey = "indirizzo" della cache.
export function useRestaurants() {
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: fetchRestaurants,
  });
}

// Hook per un singolo ristorante (pagina dettaglio).
export function useRestaurant(id: string) {
  return useQuery({
    queryKey: ["restaurant", id], // cache separata per ogni id
    queryFn: () => fetchRestaurant(id),
    enabled: !!id, // non partire finché non abbiamo un id
  });
}
