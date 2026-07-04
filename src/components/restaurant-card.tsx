import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { PressableScale } from "@/components/pressable-scale";
import { ThemedText } from "@/components/themed-text";
import { Radii, Shadows, Spacing, type Palette } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { Restaurant } from "@/types";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const freeDelivery = restaurant.deliveryFee === 0;

  return (
    <Link href={`/restaurant/${restaurant.id}`} asChild>
      <PressableScale style={styles.card} scaleTo={0.975}>
        <View style={styles.imageWrap}>
          <Image
            source={restaurant.coverImage}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
          {/* Scrim: scurisce SOLO la parte bassa, così il nome resta leggibile su ogni foto */}
          <LinearGradient
            colors={["transparent", "transparent", colors.scrim]}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {/* Riga in alto: badge consegna gratis */}
          {freeDelivery ? (
            <View style={styles.topRow}>
              <View style={[styles.pill, styles.freePill]}>
                <SymbolView name="bicycle" size={12} tintColor="#FFFFFF" />
                <ThemedText type="smallBold" style={styles.freePillText}>
                  Consegna gratis
                </ThemedText>
              </View>
            </View>
          ) : null}

          {/* Nome + cucine, sovrapposti in basso sullo scrim */}
          <View style={styles.overlayText}>
            <ThemedText type="serif" style={styles.name} numberOfLines={1}>
              {restaurant.name}
            </ThemedText>
            <ThemedText type="smallBold" style={styles.tags} numberOfLines={1}>
              {restaurant.tags.join(" · ")}
            </ThemedText>
          </View>
        </View>

        {/* Footer informativo */}
        <View style={styles.footer}>
          <View style={styles.metaItem}>
            <SymbolView name="clock" size={13} tintColor={colors.accent} />
            <ThemedText type="small" themeColor="textSecondary">
              {restaurant.deliveryTime}
            </ThemedText>
          </View>
          <View style={styles.dot} />
          <ThemedText type="small" themeColor="textSecondary">
            Min € {restaurant.minOrder.toFixed(0)}
          </ThemedText>
          <View style={styles.spacer} />
          <ThemedText type="smallBold" style={styles.fee}>
            {freeDelivery ? "Gratis" : `€ ${restaurant.deliveryFee.toFixed(2)}`}
          </ThemedText>
        </View>
      </PressableScale>
    </Link>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    card: {
      borderRadius: Radii.lg,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      overflow: "hidden",
      ...Shadows.soft,
    },
    imageWrap: {
      height: 176,
      width: "100%",
    },
    image: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: "100%",
      height: "100%",
    },
    topRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      padding: Spacing.three,
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.one,
      paddingHorizontal: Spacing.two,
      paddingVertical: 5,
      borderRadius: Radii.pill,
    },
    freePill: {
      backgroundColor: colors.accentTertiary,
    },
    freePillText: {
      color: "#FFFFFF",
      fontSize: 12,
    },
    overlayText: {
      position: "absolute",
      left: Spacing.three,
      right: Spacing.three,
      bottom: Spacing.three,
      gap: 2,
    },
    name: {
      color: "#FFFFFF",
      fontSize: 24,
    },
    tags: {
      color: "rgba(255, 255, 255, 0.88)",
      fontSize: 13,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two + 2,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.one,
    },
    dot: {
      width: 3,
      height: 3,
      borderRadius: Radii.pill,
      backgroundColor: colors.textSecondary,
      opacity: 0.5,
    },
    spacer: { flex: 1 },
    fee: {
      color: colors.accent,
    },
  });
