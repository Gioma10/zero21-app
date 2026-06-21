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
    phone: z
      .string()
      .trim()
      .min(6, "Inserisci un numero di telefono valido"),
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
