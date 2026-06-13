import { Image } from "expo-image";
import { Link } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors, Radii, Spacing } from "@/constants/theme";
import type { Restaurant } from "@/types";

const colors = Colors.dark;

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    // Link = navigazione. asChild dice "usa il Pressable qui sotto come bottone".
    <Link href={`/restaurant/${restaurant.id}`} asChild>
      <Pressable style={styles.card}>
        <Image
          source={restaurant.coverImage}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <ThemedText type="smallBold" numberOfLines={1} style={styles.name}>
              {restaurant.name}
            </ThemedText>
            <View style={styles.rating}>
              <SymbolView name="star.fill" size={12} tintColor={colors.accent} />
              <ThemedText type="small" style={styles.ratingText}>
                {restaurant.rating.toFixed(1)}
              </ThemedText>
            </View>
          </View>

          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {restaurant.tags.join(" • ")}
          </ThemedText>

          <View style={styles.metaRow}>
            <ThemedText type="small" themeColor="textSecondary">
              Min € {restaurant.minOrder.toFixed(0)}
            </ThemedText>
            <View style={styles.meta}>
              <SymbolView name="clock" size={12} tintColor={colors.accent} />
              <ThemedText type="small" themeColor="textSecondary">
                {restaurant.deliveryTime}
              </ThemedText>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: Radii.card,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  image: {
    width: 92,
    height: 92,
    borderRadius: Radii.sm,
  },
  info: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.one,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  name: {
    flex: 1,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.half,
  },
  ratingText: {
    color: colors.accent,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.half,
  },
});
