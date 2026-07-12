import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import {
  generateSlotGroups,
  hasOpeningHours,
  type SlotConfig,
} from "@/lib/slots";
import type { Restaurant } from "@/types";

// Una fascia con la disponibilità residua calcolata dagli ordini già prenotati.
export type AvailableSlot = {
  start: string; // ISO inizio fascia
  remaining: number; // posti liberi nella fascia
  full: boolean; // remaining <= 0 → non selezionabile
};
export type AvailableSlotGroup = { label: string; slots: AvailableSlot[] };

export type DeliverySlots = {
  configured: boolean; // il ristorante ha orari impostati?
  groups: AvailableSlotGroup[]; // fasce oggi/domani con disponibilità
};

// Conteggi prenotati per fascia, dalla RPC SECURITY DEFINER `slot_booked_counts`
// (l'app non può leggere gli ordini altrui per via della RLS). Ritorna una mappa
// ISO-slot → numero di ordini.
async function fetchBookedCounts(
  vendorId: string,
  fromISO: string,
  toISO: string,
): Promise<Map<string, number>> {
  const { data, error } = await supabase.rpc("slot_booked_counts", {
    p_vendor: vendorId,
    p_from: fromISO,
    p_to: toISO,
  });
  if (error) throw error;
  const map = new Map<string, number>();
  for (const row of (data ?? []) as { slot: string; booked: number }[]) {
    // Normalizziamo a ISO per combaciare con gli slot generati (stesso istante).
    map.set(new Date(row.slot).toISOString(), row.booked);
  }
  return map;
}

// Fasce di consegna disponibili per un ristorante: genera gli slot candidati
// (oggi/domani) dagli orari configurati e ne sottrae gli ordini già prenotati.
export function useDeliverySlots(restaurant: Restaurant | null | undefined) {
  const configured = hasOpeningHours(restaurant?.openingHours);

  return useQuery<DeliverySlots>({
    queryKey: ["delivery-slots", restaurant?.id],
    enabled: !!restaurant && configured,
    // Gli slot "scadono" col tempo: rigeneriamo spesso e al focus.
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const r = restaurant!;
      const config: SlotConfig = {
        slotMinutes: r.slotMinutes,
        openingHours: r.openingHours,
      };
      const groups = generateSlotGroups(config);

      const all = groups.flatMap((g) => g.slots.map((s) => s.start));
      if (all.length === 0) return { configured, groups: [] };

      const from = all.reduce((a, b) => (a < b ? a : b));
      const to = all.reduce((a, b) => (a > b ? a : b));
      const counts = await fetchBookedCounts(r.id, from, to);
      const cap = Math.max(1, r.slotCapacity);

      return {
        configured,
        groups: groups.map((g) => ({
          label: g.label,
          slots: g.slots.map((s) => {
            const booked = counts.get(s.start) ?? 0;
            const remaining = Math.max(0, cap - booked);
            return { start: s.start, remaining, full: remaining <= 0 };
          }),
        })),
      };
    },
  });
}
