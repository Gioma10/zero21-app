import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { Colors, type Palette } from "@/constants/theme";

type Mode = "light" | "dark";

type ThemeModeContextValue = {
  mode: Mode;
  colors: Palette; // la palette corrente, già scelta in base al mode
  toggle: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);
const STORAGE_KEY = "theme-mode";

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("dark");

  // All'avvio recuperiamo l'ultima scelta salvata.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === "light" || saved === "dark") setMode(saved);
    });
  }, []);

  function toggle() {
    setMode((current) => {
      const next = current === "dark" ? "light" : "dark";
      AsyncStorage.setItem(STORAGE_KEY, next); // ricordiamo la scelta
      return next;
    });
  }

  return (
    <ThemeModeContext.Provider value={{ mode, colors: Colors[mode], toggle }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode deve essere usato dentro <ThemeModeProvider>");
  return ctx;
}
