// Zone di consegna ZERO21. L'app serve Arzachena e la Costa Smeralda: per ora
// l'unica zona attiva è Arzachena. In futuro si aggiungeranno le frazioni
// (Cannigione, Porto Cervo, Baja Sardinia) — basta renderle `active: true`.
//
// Il CAP è derivato dalla zona: Arzachena e le sue frazioni condividono 07021.

export type Zone = {
  name: string;
  zip: string;
  active: boolean; // false = non ancora servita (non mostrata nel selettore)
};

export const ARZACHENA_ZIP = "07021";

export const ZONES: Zone[] = [
  { name: "Arzachena", zip: ARZACHENA_ZIP, active: true },
  { name: "Cannigione", zip: ARZACHENA_ZIP, active: false },
  { name: "Porto Cervo", zip: ARZACHENA_ZIP, active: false },
  { name: "Baja Sardinia", zip: ARZACHENA_ZIP, active: false },
];

// Zone selezionabili adesso (quelle attive).
export const availableZones = (): Zone[] => ZONES.filter((z) => z.active);

// Zona predefinita: la prima attiva (oggi Arzachena).
export const DEFAULT_ZONE: Zone = availableZones()[0];

// CAP corrispondente a una zona (fallback al CAP di Arzachena).
export function zipForZone(zoneName: string): string {
  return ZONES.find((z) => z.name === zoneName)?.zip ?? ARZACHENA_ZIP;
}

// Una stringa è una zona attiva valida?
export function isValidZone(zoneName: string): boolean {
  return availableZones().some((z) => z.name === zoneName);
}
