import { ARZACHENA_ZIP } from "@/constants/zones";

// Validazione geografica dell'indirizzo di consegna.
//
// Regola di business: ZERO21 consegna solo nel PAESE di Arzachena, non in tutto
// il comune (che include Cannigione, Baja Sardinia, Porto Cervo...). Il campo
// "via" è testo libero, quindi non basta il selettore di zona: geocodifichiamo
// l'indirizzo (via + zona) in coordinate e controlliamo che cada entro un
// raggio attorno al centro del paese.
//
// Geocoder: Nominatim (OpenStreetMap), gratuito e senza chiave. Volume basso
// (una chiamata a salvataggio indirizzo), rispetta la usage policy. Se in
// futuro serve autocomplete o più precisione si passa a un provider con chiave
// senza toccare la logica del raggio qui sotto.

// Centro del paese di Arzachena. Il raggio copre l'abitato e i dintorni
// immediati senza arrivare alle frazioni (Cannigione ~7 km, Baja Sardinia
// ~14 km). Tarabile: alza/abbassa DELIVERY_RADIUS_KM per allargare/stringere.
export const ARZACHENA_CENTER = { lat: 41.0793, lon: 9.3892 };
export const DELIVERY_RADIUS_KM = 4;

type Coord = { lat: number; lon: number };

// Distanza in km tra due coordinate (formula dell'emisenoverso / haversine).
export function distanceKm(a: Coord, b: Coord): number {
  const R = 6371; // raggio medio terrestre in km
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Esito della verifica dell'area di consegna.
export type AreaCheck =
  | { status: "ok"; distanceKm: number } // dentro il raggio → consegnabile
  | { status: "outside"; distanceKm: number } // geocodificato ma fuori raggio
  | { status: "not_found" } // Nominatim non trova l'indirizzo
  | { status: "error" }; // problema di rete/servizio (fail-open a monte)

// Geocodifica l'indirizzo e verifica se è dentro l'area di consegna.
export async function checkDeliveryArea(
  street: string,
  zone: string,
): Promise<AreaCheck> {
  try {
    const params = new URLSearchParams({
      // Ricerca strutturata: più affidabile del q= libero.
      street, // "Via Roma 10"
      city: zone || "Arzachena",
      county: "Sassari",
      state: "Sardegna",
      country: "Italia",
      postalcode: ARZACHENA_ZIP,
      format: "jsonv2",
      limit: "1",
      "accept-language": "it",
    });
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    const res = await fetch(url, {
      headers: {
        // Nominatim richiede un identificativo dell'app nelle richieste.
        "User-Agent": "ZERO21-App/1.0 (consegne Arzachena)",
      },
    });
    if (!res.ok) return { status: "error" };
    const data = (await res.json()) as { lat?: string; lon?: string }[];
    const hit = Array.isArray(data) ? data[0] : undefined;
    if (!hit) return { status: "not_found" };
    const lat = Number(hit.lat);
    const lon = Number(hit.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return { status: "not_found" };
    }
    const d = distanceKm(ARZACHENA_CENTER, { lat, lon });
    return d <= DELIVERY_RADIUS_KM
      ? { status: "ok", distanceKm: d }
      : { status: "outside", distanceKm: d };
  } catch {
    return { status: "error" };
  }
}

// Messaggio da mostrare all'utente, o null se l'indirizzo è ammesso.
// Blocchiamo SOLO quando l'indirizzo è stato geocodificato con certezza ed è
// fuori dal raggio ("outside"). Negli altri casi lasciamo salvare:
//  - "not_found": l'indirizzo non è mappato su OSM (via piccola/nuova). Non
//    penalizziamo un residente reale per un buco di copertura del geocoder.
//  - "error": problema di rete/servizio (fail-open); l'app senza rete non
//    funziona comunque (Supabase).
export function deliveryAreaError(check: AreaCheck): string | null {
  switch (check.status) {
    case "outside":
      return "Consegniamo solo nel paese di Arzachena e questo indirizzo risulta fuori dalla zona di consegna.";
    case "ok":
    case "not_found":
    case "error":
      return null;
  }
}
