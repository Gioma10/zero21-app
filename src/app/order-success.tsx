import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radii, Spacing, type Palette } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useOrder } from "@/hooks/use-orders";
import { orderStatusLabelOf } from "@/types";
import { formatSlotAt } from "@/lib/slots";

export default function OrderSuccessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // Grazie al setQueryData fatto al checkout, l'ordine è già in cache: niente attesa.
  const { data: order, isLoading } = useOrder(id);

  if (isLoading || !order) {
    return (
      <ThemedView style={styles.screen}>
        <SafeAreaView style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Icona di successo */}
          <View style={styles.iconWrap}>
            <SymbolView name="checkmark.circle.fill" size={84} tintColor={colors.accent} />
          </View>

          <ThemedText type="subtitle" style={styles.title}>
            Ordine confermato!
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
            Ordine #{order.id.slice(0, 8)} · {orderStatusLabelOf(order.status)}
          </ThemedText>
          {order.deliverySlot && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
              Arrivo previsto {formatSlotAt(order.deliverySlot)}
            </ThemedText>
          )}

          {/* Riepilogo dell'ordine */}
          <View style={styles.card}>
            {order.items.map((item, i) => (
              <View key={`${item.name}-${i}`} style={styles.itemRow}>
                <ThemedText type="small">
                  {item.qty}× {item.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  € {(item.qty * item.price).toFixed(2)}
                </ThemedText>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.itemRow}>
              <ThemedText type="smallBold">Totale</ThemedText>
              <ThemedText type="default" style={styles.total}>
                € {order.total.toFixed(2)}
              </ThemedText>
            </View>
          </View>
        </ScrollView>

        {/* Pulsante di chiusura */}
        <SafeAreaView edges={["bottom"]} style={styles.footer}>
          <Pressable style={styles.button} onPress={() => router.dismissAll()}>
            <ThemedText type="default" style={styles.buttonText}>
              Torna al menù
            </ThemedText>
          </Pressable>
        </SafeAreaView>
      </SafeAreaView>
    </ThemedView>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    screen: { flex: 1 },
    safe: { flex: 1 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: {
      padding: Spacing.three,
      gap: Spacing.three,
      alignItems: "center",
    },
    iconWrap: {
      marginTop: Spacing.six,
    },
    title: {
      textAlign: "center",
    },
    subtitle: {
      textAlign: "center",
    },
    card: {
      alignSelf: "stretch",
      gap: Spacing.two,
      padding: Spacing.three,
      marginTop: Spacing.three,
      borderRadius: Radii.card,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    itemRow: {
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
    button: {
      height: 56,
      borderRadius: Radii.card,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
    },
    buttonText: {
      color: colors.background,
      fontWeight: "700",
      fontSize: 16,
    },
  });
