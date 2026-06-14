import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { PressableScale } from "@/components/pressable-scale";
import { ThemedText } from "@/components/themed-text";
import { Radii, Shadows, Spacing, type Palette } from "@/constants/theme";
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
        <ThemedText type="smallBold" style={styles.name} numberOfLines={1}>
          {dish.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
          {dish.description}
        </ThemedText>
        <ThemedText type="smallBold" style={styles.price}>
          € {dish.price.toFixed(2)}
        </ThemedText>
      </View>
      <PressableScale
        style={styles.addBtn}
        scaleTo={0.86}
        onPress={() => add(dish)}
        hitSlop={8}
        accessibilityLabel={`Aggiungi ${dish.name} al carrello`}
      >
        <SymbolView name="plus" size={20} tintColor={colors.onAccent} />
      </PressableScale>
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
      width: 76,
      height: 76,
      borderRadius: Radii.md,
      backgroundColor: colors.backgroundSelected,
    },
    info: {
      flex: 1,
      gap: 3,
    },
    name: {
      fontSize: 15,
    },
    price: {
      color: colors.accent,
      fontSize: 15,
      marginTop: 2,
    },
    addBtn: {
      width: 38,
      height: 38,
      borderRadius: Radii.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
      ...Shadows.soft,
    },
  });
