import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import type { Order, OrderItem } from "@/types";

const ORDER_COLUMNS = "id, createdAt:created_at, status, items, total";

// --- LETTURA: la lista degli ordini, dal più recente ---
async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Order[];
}

export function useOrders() {
  return useQuery({ queryKey: ["orders"], queryFn: fetchOrders });
}

// --- SCRITTURA: crea un nuovo ordine ---
type NewOrder = { items: OrderItem[]; total: number };

async function createOrder(order: NewOrder): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .insert({ items: order.items, total: order.total }) // id, created_at, status li mette il DB
    .select(ORDER_COLUMNS)
    .single(); // ci facciamo restituire la riga appena creata

  if (error) throw error;
  return data as Order;
}

// useMutation = per le operazioni che MODIFICANO i dati (insert/update/delete).
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      // L'ordine è stato creato → la lista "orders" in cache è ora obsoleta.
      // invalidate la marca come "da rifare" e TanStack la ricarica da sola.
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
