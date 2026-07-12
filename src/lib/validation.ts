import { z } from "zod";

import { isValidZone } from "@/constants/zones";

// Validazione dei form di autenticazione (login.tsx). Stesso spirito degli
// schemi del vendor (lib/schemas.ts): messaggi in italiano, valori già trimmati.

// Email senza affidarsi a metodi deprecati: trim + regex semplice ma robusta.
const email = z
  .string()
  .trim()
  .min(1, "Inserisci l'email")
  .refine(
    (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    "Email non valida",
  );

// ---- Telefono --------------------------------------------------------------
// Toglie spazi, punti, trattini e parentesi: tiene solo cifre e l'eventuale +
// del prefisso internazionale. Usata sia per validare sia per sanificare
// l'input mentre l'utente digita.
export function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, "");
}

// Cellulare italiano: opzionale prefisso +39/0039, poi un numero che inizia
// per 3 e ha 10 cifre in totale (es. 333 1234567).
const ITALIAN_MOBILE = /^(?:\+39|0039)?3\d{9}$/;

export function isValidPhone(raw: string): boolean {
  return ITALIAN_MOBILE.test(normalizePhone(raw));
}

const phone = z
  .string()
  .trim()
  .min(1, "Inserisci il numero di telefono")
  .refine(isValidPhone, "Numero di cellulare non valido (es. 333 1234567)");

// ---- Accesso ---------------------------------------------------------------
export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Inserisci la password"),
});

export type SignInValues = z.infer<typeof signInSchema>;

// ---- Registrazione ---------------------------------------------------------
export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Inserisci il tuo nome"),
    email,
    phone,
    street: z.string().trim().min(1, "Inserisci via e civico"),
    // La zona è scelta da un selettore: il CAP è derivato, non inserito a mano.
    zone: z
      .string()
      .trim()
      .min(1, "Seleziona la zona")
      .refine(isValidZone, "Zona non disponibile"),
    password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
    confirmPassword: z.string().min(1, "Conferma la password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  });

export type SignUpValues = z.infer<typeof signUpSchema>;

// Restituisce il primo errore per ciascun campo, pronto da mostrare in UI.
export function fieldErrorsOf(
  error: z.ZodError,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}
