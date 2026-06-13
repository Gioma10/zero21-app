/**
 * Restituisce la palette del tema CORRENTE (light o dark), presa dal
 * ThemeModeProvider. Essendo un hook di context, ogni componente che lo usa
 * si ri-renderizza automaticamente quando si cambia tema.
 */
import { useThemeMode } from "@/context/theme-mode";

export function useTheme() {
  return useThemeMode().colors;
}
