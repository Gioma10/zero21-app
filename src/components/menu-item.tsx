import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Radii, Spacing, type Palette } from "@/constants/theme";
import { useCart } from "@/context/cart";
import { useTheme } from "@/hooks/use-theme";
import type { Dish } from "@/types";

export function MenuItem({ dish }: { dish: Dish }) {
  const { add } = useCart();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <Image source={dish.image} style={styles.image} contentFit="cover" transition={300} />
      <View style={styles.info}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {dish.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
          {dish.description}
        </ThemedText>
        <ThemedText type="default" style={styles.price}>
          € {dish.price.toFixed(2)}
        </ThemedText>
      </View>
      <Pressable style={styles.addBtn} onPress={() => add(dish)} hitSlop={8}>
        <SymbolView name="plus" size={20} tintColor={colors.background} />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.three,
    },
    image: {
      width: 72,
      height: 72,
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
    addBtn: {
      width: 36,
      height: 36,
      borderRadius: Radii.sm,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
    },
  });
