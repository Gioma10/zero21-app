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

// Quanti giorni in avanti cercare orari prenotabili. App same-day (stile Glovo):
// si ordina solo per OGGI, quindi 1 giorno. Esauriti gli orari di oggi il picker
// mostra "nessun orario disponibile". (Alzare a 2+ per abilitare i giorni futuri.)
const HORIZON_DAYS = 1;

// Genera gli orari candidati per i prossimi HORIZON_DAYS giorni (prima del filtro
// capienza). `slotMinutes` è anche il passo tra un orario e l'altro. Un orario è
// prenotabile finché NON è ancora passato (nessun anticipo/cuscinetto): quello in
// corso resta disponibile fino alla fine dell'intervallo.
export function generateSlotGroups(
  cfg: SlotConfig,
  now: Date = new Date(),
): SlotGroup[] {
  const step = Math.max(1, Math.floor(cfg.slotMinutes || 0));
  const nowMs = now.getTime();
  const groups: SlotGroup[] = [];

  for (let offset = 0; offset < HORIZON_DAYS; offset++) {
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
        // Prenotabile finché non è finita: scarta solo le fasce già concluse.
        if (start.getTime() + step * 60_000 <= nowMs) continue;
        slots.push({ start: start.toISOString() });
      }
    }
    if (slots.length > 0) {
      groups.push({ label: dayGroupLabel(day, offset), slots });
    }
  }
  return groups;
}

// Etichetta del gruppo-giorno: "Oggi", "Domani", poi "Sab 12" (giorno + data).
function dayGroupLabel(day: Date, offset: number): string {
  if (offset === 0) return "Oggi";
  if (offset === 1) return "Domani";
  const wd = DAY_SHORT[day.getDay()];
  return `${wd.charAt(0).toUpperCase()}${wd.slice(1)} ${day.getDate()}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function hhmm(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Orario esatto di arrivo, "20:00" (ora locale). Ogni fascia è un ORARIO di
// consegna preciso scelto dal cliente, non una finestra.
export function formatSlotTime(startISO: string): string {
  return hhmm(new Date(startISO));
}

const DAY_SHORT = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];

// Etichetta relativa del giorno: "Oggi" / "Domani" / "Sab 12".
function dayLabelOf(d: Date): string {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const dayOf = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((dayOf - startOfToday) / 86_400_000);
  if (diffDays === 0) return "Oggi";
  if (diffDays === 1) return "Domani";
  const wd = DAY_SHORT[d.getDay()];
  return `${wd.charAt(0).toUpperCase()}${wd.slice(1)} ${d.getDate()}`;
}

// "Oggi 20:00" — giorno + orario esatto di arrivo, per le viste ordine.
export function formatSlotAt(startISO: string): string {
  const d = new Date(startISO);
  return `${dayLabelOf(d)} ${hhmm(d)}`;
}
