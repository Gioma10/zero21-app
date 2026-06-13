import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors, Radii, Spacing } from "@/constants/theme";
import type { Order, OrderStatus } from "@/types";

const colors = Colors.dark;

function statusColor(status: OrderStatus) {
  switch (status) {
    case "Consegnato":
      return colors.accentSecondary; // menta = successo
    case "Annullato":
      return colors.textSecondary; // grigio = inattivo
    default:
      return colors.accent; // turchese = in corso
  }
}

export function OrderCard({ order }: { order: Order }) {
  const color = statusColor(order.status);
  const summary = order.items.map((i) => `${i.qty}× ${i.name}`).join(", ");

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <ThemedText type="smallBold">Ordine #{order.id}</ThemedText>
        <View style={[styles.badge, { borderColor: color }]}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <ThemedText type="small" style={{ color }}>
            {order.status}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="small" themeColor="textSecondary">
        {order.date}
      </ThemedText>
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
    </View>
  );
}

const styles = StyleSheet.create({
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
});
