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
    textSecondary: "#6B7A6C",
    background: "#F6F0E4",
    card: "#FFFDF7",
    backgroundElement: "#FFFDF7",
    backgroundSelected: "#ECE3D0",
    border: "#E3D9C5",
    accent: "#1FA774",
    accentSecondary: "#C99A4E",
  },
  // Costa Smeralda "di sera": verde caldo, smeraldo brillante, sabbia/oro.
  dark: {
    text: "#EFEADD",
    textSecondary: "#9AA796",
    background: "#121A14",
    card: "#1B241D",
    backgroundElement: "#1B241D",
    backgroundSelected: "#27322A",
    border: "#2E3A30",
    accent: "#2BB888",
    accentSecondary: "#E0C07A",
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
  card: 16,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
