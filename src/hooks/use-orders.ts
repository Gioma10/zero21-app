import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "@/lib/supabase";
import type { DeliveryAddress, Order, OrderItem } from "@/types";

// Stringa literal (NON concatenata): supabase-js infietta il tipo del risultato
// dal literal del select, quindi va tenuta su una riga sola.
const ORDER_COLUMNS =
  "id, createdAt:created_at, status, items, total, vendorId:vendor_id, deliveryStreet:delivery_street, deliveryCity:delivery_city, deliveryZip:delivery_zip, deliveryNotes:delivery_notes, contactPhone:contact_phone";

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
// vendorId = id del ristorante (= UID del vendor) a cui instradare l'ordine.
type NewOrder = {
  items: OrderItem[];
  total: number;
  vendorId: string;
  address: DeliveryAddress;
  phone: string; // telefono di contatto per la consegna
};

async function createOrder(order: NewOrder): Promise<Order> {
  // Il cliente loggato: serve per intestare l'ordine (user_id) e passare la RLS.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Devi essere autenticato per ordinare.");

  const { data, error } = await supabase
    .from("orders")
    .insert({
      items: order.items,
      total: order.total,
      vendor_id: order.vendorId, // a quale ristorante arriva l'ordine
      user_id: user.id, // chi ha ordinato
      // Snapshot indirizzo di consegna (campi vuoti → null).
      delivery_street: order.address.street.trim() || null,
      delivery_city: order.address.city.trim() || null,
      delivery_zip: order.address.zip.trim() || null,
      delivery_notes: order.address.notes.trim() || null,
      contact_phone: order.phone.trim() || null,
    }) // id, created_at, status li mette il DB
    .select(ORDER_COLUMNS)
    .single(); // ci facciamo restituire la riga appena creata

  if (error) throw error;
  return data as Order;
}

// --- SCRITTURA: il cliente annulla un proprio ordine ancora "pending" ---
// Filtriamo su status='pending' anche lato query: è una guardia in più, ma la
// garanzia vera è la RLS ("orders: cliente annulla i propri pending"), che
// impedisce di annullare un ordine già in preparazione. Se 0 righe combaciano
// (stato già avanzato dal ristorante) restituiamo un errore parlante.
async function cancelOrder(id: string): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("status", "pending")
    .select(ORDER_COLUMNS)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("NOT_PENDING");
  return data as Order;
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: (order) => {
      queryClient.setQueryData(["order", order.id], order);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

// --- REALTIME: gli aggiornamenti del vendor arrivano live al cliente ---
// Quando il ristorante avanza lo stato di un ordine (UPDATE), o ne arriva uno
// nuovo, invalidiamo la cache: la tab "I tuoi ordini" e la schermata di
// conferma si aggiornano da sole, senza pull-to-refresh.
// RLS-safe: il filtro user_id combacia con la policy di SELECT sugli ordini.
export function useOrdersRealtime(userId: string | null | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`orders:user:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // payload.new/old è la riga grezza del DB: ci basta l'id.
          const row = (payload.new ?? payload.old) as { id?: string };
          if (row?.id) {
            queryClient.invalidateQueries({ queryKey: ["order", row.id] });
          }
          queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
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
