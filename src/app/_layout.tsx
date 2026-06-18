import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider, useAuth } from "@/context/auth";
import { CartProvider } from "@/context/cart";
import { ThemeModeProvider, useThemeMode } from "@/context/theme-mode";
import { useOrdersRealtime } from "@/hooks/use-orders";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* ThemeModeProvider in cima: tiene il tema (light/dark) per tutta l'app */}
      <ThemeModeProvider>
        <ThemedApp />
      </ThemeModeProvider>
    </QueryClientProvider>
  );
}

// Sta DENTRO ThemeModeProvider, quindi può leggere il mode per status bar e chrome.
function ThemedApp() {
  const { mode } = useThemeMode();
  return (
    <ThemeProvider value={mode === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <AuthProvider>
        <CartProvider>
          <AnimatedSplashOverlay />
          <RootNavigator />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Aggiornamenti live degli ordini del cliente (stato avanzato dal vendor).
  useOrdersRealtime(session?.user?.id);

  useEffect(() => {
    if (isLoading) return;

    const inLogin = segments[0] === "login";
    if (!session && !inLogin) {
      router.replace("/login");
    } else if (session && inLogin) {
      router.replace("/");
    }
  }, [session, isLoading, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="restaurant/[id]" />
      <Stack.Screen name="cart" options={{ presentation: "modal" }} />
      <Stack.Screen
        name="order-success"
        options={{ presentation: "modal", gestureEnabled: false }}
      />
      <Stack.Screen name="login" options={{ animation: "fade" }} />
    </Stack>
  );
}
