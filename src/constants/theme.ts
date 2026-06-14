/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  // Costa Smeralda "di giorno": sabbia calda e luminosa, verde smeraldo, oro.
  light: {
    text: "#1C2B22",
    textSecondary: "#51604F", // approfondito: ~4.6:1 sulla sabbia (prima 6B7A6C falliva a 3.4)
    background: "#F6F0E4",
    card: "#FFFDF7",
    backgroundElement: "#FFFDF7",
    backgroundSelected: "#E7EFE6", // tinta smeraldo chiarissima per gli stati attivi
    border: "#E3D9C5",
    // Smeraldo profondo: come TESTO su sabbia fa ~4.4:1, come fondo regge bianco a ~5:1.
    accent: "#0A6E4A",
    // Smeraldo brillante: solo per gradienti, glow e grandi superfici (barra 3:1).
    accentBright: "#18A36E",
    accentSecondary: "#A8772A", // oro più caldo e leggibile (≥3:1 in bold/large)
    accentTertiary: "#C2452C", // corallo/terracotta: l'accento "caldo" e gli inviti all'azione
    onAccent: "#FFFFFF", // testo/icone sopra i fondi smeraldo pieni
    scrim: "rgba(10, 30, 22, 0.55)", // velo sopra le foto per far risaltare il testo
  },
  // Costa Smeralda "di sera": verde caldo, smeraldo brillante, sabbia/oro.
  dark: {
    text: "#EFEADD",
    textSecondary: "#9AA796",
    background: "#101814",
    card: "#1B241D",
    backgroundElement: "#1B241D",
    backgroundSelected: "#27322A",
    border: "#2E3A30",
    accent: "#2BB888",
    accentBright: "#3BD79F",
    accentSecondary: "#E0C07A",
    accentTertiary: "#F0795E",
    onAccent: "#08120C", // testo/icone sopra lo smeraldo brillante in dark
    scrim: "rgba(5, 12, 9, 0.6)",
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
