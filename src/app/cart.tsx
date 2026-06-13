import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { useCart } from "@/context/cart";
import { useCreateOrder } from "@/hooks/use-orders";

const colors = Colors.dark;

// Costi fissi (in futuro arriveranno dal ristorante / backend).
const DELIVERY_FEE = 3.99;
const SERVICE_FEE = 2.0;

export default function CartScreen() {
  const cart = useCart();
  const createOrder = useCreateOrder();
  const total = cart.subtotal + DELIVERY_FEE + SERVICE_FEE;

  function checkout() {
    createOrder.mutate(
      {
        // "scatto" dei piatti nel carrello: nome, quantità e prezzo attuali
        items: cart.items.map((i) => ({
          name: i.dish.name,
          qty: i.qty,
          price: i.dish.price,
        })),
        total,
      },
      {
        onSuccess: (order) => {
          cart.clear();
          // Sostituisco il carrello con la pagina di conferma (replace = niente
          // "indietro" verso un carrello ormai vuoto). Passo l'id dell'ordine.
          router.replace({ pathname: "/order-success", params: { id: order.id } });
        },
        onError: () => {
          Alert.alert("Errore", "Non è stato possibile inviare l'ordine. Riprova.");
        },
      },
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <SymbolView name="chevron.left" size={20} tintColor={colors.text} />
          </Pressable>
          <ThemedText type="smallBold">Il tuo carrello</ThemedText>
          <Pressable onPress={cart.clear} hitSlop={8} disabled={cart.items.length === 0}>
            <ThemedText type="small" style={{ color: colors.accent }}>
              Svuota
            </ThemedText>
          </Pressable>
        </View>

        {cart.items.length === 0 ? (
          <View style={styles.empty}>
            <SymbolView name="cart" size={48} tintColor={colors.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">
              Il carrello è vuoto
            </ThemedText>
          </View>
        ) : (
          <>
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* ARTICOLI */}
              {cart.items.map(({ dish, qty }) => (
                <View key={dish.id} style={styles.item}>
                  <Image
                    source={dish.image}
                    style={styles.itemImage}
                    contentFit="cover"
                    transition={200}
                  />
                  <View style={styles.itemInfo}>
                    <ThemedText type="smallBold" numberOfLines={1}>
                      {dish.name}
                    </ThemedText>
                    <ThemedText type="small" style={styles.price}>
                      € {dish.price.toFixed(2)}
                    </ThemedText>
                  </View>

                  {/* STEPPER quantità */}
                  <View style={styles.stepper}>
                    <Pressable
                      style={styles.stepBtn}
                      onPress={() => cart.decrement(dish.id)}
                      hitSlop={6}
                    >
                      <SymbolView name="minus" size={14} tintColor={colors.accent} />
                    </Pressable>
                    <ThemedText type="smallBold" style={styles.qty}>
                      {qty}
                    </ThemedText>
                    <Pressable
                      style={styles.stepBtn}
                      onPress={() => cart.increment(dish.id)}
                      hitSlop={6}
                    >
                      <SymbolView name="plus" size={14} tintColor={colors.accent} />
                    </Pressable>
                  </View>
                </View>
              ))}

              {/* PROMO CODE (statico) */}
              <Pressable style={styles.promo}>
                <SymbolView name="tag.fill" size={18} tintColor={colors.accent} />
                <ThemedText type="default" style={styles.promoLabel}>
                  Applica codice promo
                </ThemedText>
                <SymbolView name="chevron.right" size={14} tintColor={colors.textSecondary} />
              </Pressable>

              {/* RIEPILOGO */}
              <View style={styles.summary}>
                <SummaryRow label="Subtotale" value={cart.subtotal} />
                <SummaryRow label="Consegna" value={DELIVERY_FEE} />
                <SummaryRow label="Servizio" value={SERVICE_FEE} />
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <ThemedText type="smallBold">Totale</ThemedText>
                  <ThemedText type="default" style={styles.total}>
                    € {total.toFixed(2)}
                  </ThemedText>
                </View>
              </View>
            </ScrollView>

            {/* CHECKOUT */}
            <SafeAreaView edges={["bottom"]} style={styles.footer}>
              <Pressable
                style={[styles.checkout, createOrder.isPending && styles.checkoutDisabled]}
                onPress={checkout}
                disabled={createOrder.isPending}
              >
                <ThemedText type="default" style={styles.checkoutText}>
                  {createOrder.isPending ? "Invio in corso..." : "Procedi al pagamento"}
                </ThemedText>
              </Pressable>
            </SafeAreaView>
          </>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

// Piccolo componente locale: una riga "etichetta ........ valore €".
function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryRow}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        € {value.toFixed(2)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: Radii.card,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: Radii.sm,
  },
  itemInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  price: {
    color: colors.accent,
    fontWeight: "700",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: Radii.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.accent,
  },
  qty: {
    minWidth: 16,
    textAlign: "center",
  },
  promo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radii.card,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  promoLabel: { flex: 1 },
  summary: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: Spacing.one,
  },
  total: {
    color: colors.accent,
    fontWeight: "700",
    fontSize: 18,
  },
  footer: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  checkout: {
    height: 56,
    borderRadius: Radii.card,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  checkoutDisabled: {
    opacity: 0.6,
  },
  checkoutText: {
    color: colors.background,
    fontWeight: "700",
    fontSize: 16,
  },
});
