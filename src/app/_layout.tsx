import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, Stack, ThemeProvider, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider, useAuth } from "@/context/auth";
import { CartProvider } from "@/context/cart";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DarkTheme}>
        {/* AuthProvider sopra a tutto: ogni schermata sa se c'è un utente loggato */}
        <AuthProvider>
          <CartProvider>
            <AnimatedSplashOverlay />
            <RootNavigator />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Componente separato: sta DENTRO l'AuthProvider, quindi può usare useAuth.
function RootNavigator() {
  const { session, isLoading } = useAuth();
  const segments = useSegments(); // pezzi dell'URL corrente, es. ["login"] o ["(tabs)"]
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // aspetta di sapere se c'è una sessione salvata

    const inLogin = segments[0] === "login";
    if (!session && !inLogin) {
      router.replace("/login"); // non loggato → al login
    } else if (session && inLogin) {
      router.replace("/"); // loggato ma sul login → entra nell'app
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
