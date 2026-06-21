/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  // Costa Smeralda "di giorno": sabbia calda e luminosa; i verdi sono allineati
  // al brand del logo ZERO21 (verde smeraldo hue ~163). Oro/corallo come caldi.
  light: {
    text: "#1C2B22",
    textSecondary: "#51604F", // approfondito: ~4.6:1 sulla sabbia (prima 6B7A6C falliva a 3.4)
    background: "#F6F0E4",
    card: "#FFFDF7",
    backgroundElement: "#FFFDF7",
    backgroundSelected: "#D6EFE3", // tinta menta chiarissima per gli stati attivi
    border: "#E3D9C5",
    // Smeraldo del brand: come TESTO su sabbia fa 4.76:1, come fondo regge bianco a 5.4:1.
    accent: "#007A4B",
    // Smeraldo brillante: solo per gradienti, glow e grandi superfici.
    accentBright: "#09BB83",
    accentSecondary: "#A8772A", // oro più caldo e leggibile (≥3:1 in bold/large)
    accentTertiary: "#C2452C", // corallo/terracotta: l'accento "caldo" e gli inviti all'azione
    onAccent: "#FFFFFF", // testo/icone sopra i fondi smeraldo pieni
    scrim: "rgba(6, 22, 19, 0.55)", // velo sopra le foto per far risaltare il testo
  },
  // "Di sera" = il mondo del logo: verde-foresta profondo + menta brillante (#52EDB3).
  dark: {
    text: "#E7F1ED",
    textSecondary: "#9FB1AB",
    background: "#061613", // verde-foresta del logo, approfondito per lo schermo
    card: "#0E2521", // ≈ colore pieno dello sfondo del logo
    backgroundElement: "#0E2521",
    backgroundSelected: "#15342D",
    border: "#243B36",
    accent: "#44DBA4",
    accentBright: "#54EDB3", // la menta del logo
    accentSecondary: "#E0C07A",
    accentTertiary: "#F0795E",
    onAccent: "#08120C", // testo/icone sopra la menta brillante in dark
    scrim: "rgba(3, 11, 9, 0.6)",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// La forma di una palette (chiavi uguali, valori stringa) — utile per tipizzare
// le funzioni che costruiscono gli stili dal tema corrente.
export type Palette = Record<ThemeColor, string>;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  card: 18,
  lg: 26,
  xl: 34,
  pill: 999,
} as const;

/**
 * Ombre morbide e coerenti. Su iOS usano shadow*, su Android `elevation`.
 * Le teniamo basse e diffuse: il "vibrante" lo porta il colore, non l'ombra dura.
 */
export const Shadows = {
  soft: Platform.select({
    ios: {
      shadowColor: "#0A1E16",
      shadowOpacity: 0.1,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    default: { elevation: 4 },
  }),
  lifted: Platform.select({
    ios: {
      shadowColor: "#0A1E16",
      shadowOpacity: 0.18,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 14 },
    },
    default: { elevation: 10 },
  }),
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
