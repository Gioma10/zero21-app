import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors, Radii, Spacing } from "@/constants/theme";
import type { Dish } from "@/types";

const colors = Colors.dark;

export function DishCard({ dish }: { dish: Dish }) {
  return (
    <View style={styles.card}>
      <Image
        source={dish.image}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
      <View style={styles.info}>
        <ThemedText type="smallBold">{dish.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
          {dish.description}
        </ThemedText>
        <ThemedText type="default" style={styles.price}>
          € {dish.price.toFixed(2)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: Radii.card,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  image: {
    width: 84,
    height: 84,
    borderRadius: Radii.sm,
  },
  info: {
    flex: 1,
    gap: Spacing.half,
  },
  price: {
    color: colors.accent,
    fontWeight: "700",
  },
});
