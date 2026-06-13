import { DarkTheme, Stack, ThemeProvider } from "expo-router";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { CartProvider } from "@/context/cart";

export default function RootLayout() {
  return (
    // ThemeProvider: tema scuro per la chrome di navigazione (header, ecc.)
    <ThemeProvider value={DarkTheme}>
      {/* CartProvider in cima a tutto: ogni schermata può leggere il carrello */}
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
  );
}
