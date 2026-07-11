// Fasce di consegna (slot). Generazione lato client dagli orari di apertura del
// ristorante, per evitare ordini simultanei: ogni fascia ha una capienza e,
// quando è piena, non è più prenotabile (vedi hook use-delivery-slots).
//
// FUSO ORARIO: come il resto dell'app (vedi components/order-card.tsx) usiamo
// l'ORA LOCALE del dispositivo, non Intl+timeZone (non garantito su Hermes). Gli
// utenti sono fisicamente in Costa Smeralda (Europe/Rome), quindi ora locale ==
// ora del ristorante. Lo slot scelto è salvato come istante assoluto (ISO/UTC)
// su orders.delivery_slot: il confronto di capienza lato DB è quindi esatto.

import type { OpeningHours, Weekday } from "@/types";

// index = Date.getDay() (0 = domenica).
const WEEKDAY_KEYS: Weekday[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

export type SlotConfig = {
  slotMinutes: number;
  orderLeadMinutes: number;
  openingHours: OpeningHours;
};

export type CandidateSlot = { start: string }; // ISO dell'inizio fascia
export type SlotGroup = { label: string; slots: CandidateSlot[] };

// Il ristorante ha orari configurati? (almeno un giorno con un intervallo)
export function hasOpeningHours(oh: OpeningHours | null | undefined): boolean {
  if (!oh) return false;
  return Object.values(oh).some((intervals) => (intervals?.length ?? 0) > 0);
}

// "HH:MM" -> minuti dalla mezzanotte, o null se non valido.
function toMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

// Genera le fasce candidate per OGGI e DOMANI (prima del filtro capienza).
// `slotMinutes` è anche il passo tra una fascia e l'altra.
export function generateSlotGroups(
  cfg: SlotConfig,
  now: Date = new Date(),
): SlotGroup[] {
  const step = Math.max(1, Math.floor(cfg.slotMinutes || 0));
  const earliest = now.getTime() + Math.max(0, cfg.orderLeadMinutes) * 60_000;
  const groups: SlotGroup[] = [];

  for (let offset = 0; offset < 2; offset++) {
    const day = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + offset,
    );
    const key = WEEKDAY_KEYS[day.getDay()];
    const intervals = cfg.openingHours[key] ?? [];
    const slots: CandidateSlot[] = [];

    for (const interval of intervals) {
      const open = toMinutes(interval?.[0] ?? "");
      const close = toMinutes(interval?.[1] ?? "");
      if (open == null || close == null || close <= open) continue;
      // La fascia deve stare INTERA dentro l'intervallo di apertura.
      for (let m = open; m + step <= close; m += step) {
        const start = new Date(
          day.getFullYear(),
          day.getMonth(),
          day.getDate(),
          0,
          m,
        );
        if (start.getTime() < earliest) continue;
        slots.push({ start: start.toISOString() });
      }
    }
    if (slots.length > 0) {
      groups.push({ label: offset === 0 ? "Oggi" : "Domani", slots });
    }
  }
  return groups;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function hhmm(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// "20:00–20:30" (ora locale) data la durata fascia.
export function formatSlotRange(startISO: string, slotMinutes: number): string {
  const start = new Date(startISO);
  const end = new Date(start.getTime() + slotMinutes * 60_000);
  return `${hhmm(start)}–${hhmm(end)}`;
}

const DAY_SHORT = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];

// "Oggi 20:00" / "Domani 20:00" / "gio 20:00" per le viste ordine (senza durata).
export function formatSlotStart(startISO: string): string {
  const d = new Date(startISO);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const dayOf = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
  ).getTime();
  const diffDays = Math.round((dayOf - startOfToday) / 86_400_000);
  const label =
    diffDays === 0 ? "Oggi" : diffDays === 1 ? "Domani" : DAY_SHORT[d.getDay()];
  return `${label} ${hhmm(d)}`;
}
