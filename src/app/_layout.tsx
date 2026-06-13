import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { CartProvider } from "@/context/cart";

// Creato UNA volta a livello di modulo (non dentro il componente, così non
// viene ricreato a ogni render). È il "cervello" della cache di TanStack Query.
const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    // QueryClientProvider in cima: rende useQuery disponibile in tutta l'app.
    <QueryClientProvider client={queryClient}>
      {/* ThemeProvider: tema scuro per la chrome di navigazione (header, ecc.) */}
      <ThemeProvider value={DarkTheme}>
        {/* CartProvider: ogni schermata può leggere il carrello */}
        <CartProvider>
          <AnimatedSplashOverlay />
          {/* Stack = pila di schermate. Le tab sono una schermata; restaurant e cart
              si "spingono" sopra le tab. headerShown:false → header custom nostri. */}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="restaurant/[id]" />
            <Stack.Screen name="cart" options={{ presentation: "modal" }} />
          </Stack>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
