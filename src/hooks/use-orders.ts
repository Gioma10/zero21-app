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

// Un singolo ordine per id (lo usa la pagina di conferma).
async function fetchOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Order | null;
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  });
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
    onSuccess: (order) => {
      // Metto subito l'ordine creato nella cache: la pagina di conferma lo
      // legge all'istante con useOrder, senza una seconda chiamata al server.
      queryClient.setQueryData(["order", order.id], order);
      // La lista "orders" è ora obsoleta → la marco da rifare: TanStack la ricarica.
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
