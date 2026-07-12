import { useMemo } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Radii, Spacing, type Palette } from "@/constants/theme";
import { useCancelOrder } from "@/hooks/use-orders";
import { useTheme } from "@/hooks/use-theme";
import { orderStatusLabelOf, type Order, type OrderStatus } from "@/types";
import { formatSlotAt } from "@/lib/slots";

// Formatta il timestamp ISO del DB in "13/06 · 20:45" (senza dipendere da Intl).
function formatDate(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm} · ${hh}:${min}`;
}

function statusColor(status: OrderStatus, colors: Palette) {
  switch (status) {
    case "delivered":
      return colors.accentSecondary; // sabbia/oro = successo
    case "cancelled":
      return colors.textSecondary; // grigio = inattivo
    default:
      return colors.accent; // verde = in corso
  }
}

export function OrderCard({ order }: { order: Order }) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const color = statusColor(order.status, colors);
  const summary = order.items.map((i) => `${i.qty}× ${i.name}`).join(", ");
  const cancelOrder = useCancelOrder();

  // L'annullamento è possibile solo finché il ristorante non ha accettato
  // l'ordine (stato "pending"): dopo, il cibo è in preparazione.
  const canCancel = order.status === "pending";

  function confirmCancel() {
    Alert.alert(
      "Annullare l'ordine?",
      `L'ordine #${order.id.slice(0, 8)} verrà annullato. Puoi farlo solo finché il ristorante non lo accetta.`,
      [
        { text: "Torna indietro", style: "cancel" },
        {
          text: "Annulla ordine",
          style: "destructive",
          onPress: () =>
            cancelOrder.mutate(order.id, {
              onError: (error) => {
                const alreadyTaken =
                  error instanceof Error && error.message === "NOT_PENDING";
                Alert.alert(
                  alreadyTaken ? "Non più annullabile" : "Errore",
                  alreadyTaken
                    ? "Il ristorante ha già preso in carico l'ordine. Contattalo per annullarlo."
                    : "Non è stato possibile annullare l'ordine. Riprova.",
                );
              },
            }),
        },
      ],
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <ThemedText type="smallBold">Ordine #{order.id.slice(0, 8)}</ThemedText>
        <View style={[styles.badge, { borderColor: color }]}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <ThemedText type="small" style={{ color }}>
            {orderStatusLabelOf(order.status)}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="small" themeColor="textSecondary">
        {formatDate(order.createdAt)}
      </ThemedText>
      {order.deliverySlot && (
        <ThemedText type="small" style={{ color: colors.accent }}>
          Arrivo previsto {formatSlotAt(order.deliverySlot)}
        </ThemedText>
      )}
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
        {summary}
      </ThemedText>

      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary">
          Totale
        </ThemedText>
        <ThemedText type="default" style={styles.total}>
          € {order.total.toFixed(2)}
        </ThemedText>
      </View>

      {canCancel && (
        <Pressable
          onPress={confirmCancel}
          disabled={cancelOrder.isPending}
          style={({ pressed }) => [
            styles.cancelBtn,
            pressed && styles.cancelBtnPressed,
            cancelOrder.isPending && styles.cancelBtnDisabled,
          ]}
        >
          {cancelOrder.isPending ? (
            <ActivityIndicator size="small" color={colors.accentTertiary} />
          ) : (
            <ThemedText type="smallBold" style={{ color: colors.accentTertiary }}>
              Annulla ordine
            </ThemedText>
          )}
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    card: {
      gap: Spacing.two,
      padding: Spacing.three,
      borderRadius: Radii.card,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.one,
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.half,
      borderRadius: Radii.pill,
      borderWidth: 1,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: Radii.pill,
    },
    total: {
      color: colors.accent,
      fontWeight: "700",
    },
    cancelBtn: {
      marginTop: Spacing.one,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: Spacing.two,
      borderRadius: Radii.pill,
      borderWidth: 1,
      borderColor: colors.accentTertiary,
    },
    cancelBtnPressed: {
      opacity: 0.6,
    },
    cancelBtnDisabled: {
      opacity: 0.5,
    },
  });
