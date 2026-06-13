import { Image } from "expo-image";
import { Link, router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MenuItem } from "@/components/menu-item";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radii, Spacing, type Palette } from "@/constants/theme";
import { useCart } from "@/context/cart";
import { useTheme } from "@/hooks/use-theme";
import { useDishes } from "@/hooks/use-dishes";
import { useRestaurant } from "@/hooks/use-restaurants";
import type { DishSection } from "@/types";

const SECTION_ORDER: DishSection[] = ["Antipasti", "Primi", "Secondi", "Dolci", "Drink"];

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cart = useCart();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { data: restaurant, isLoading } = useRestaurant(id);
  const { data: menu = [] } = useDishes(id);

  if (isLoading) {
    return (
      <ThemedView style={styles.screen}>
        <SafeAreaView style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!restaurant) {
    return (
      <ThemedView style={styles.screen}>
        <SafeAreaView style={styles.center}>
          <ThemedText>Ristorante non trovato</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const sections = SECTION_ORDER.filter((s) => menu.some((d) => d.section === s));

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* COVER con bottoni sopra */}
        <View>
          <Image
            source={restaurant.coverImage}
            style={styles.cover}
            contentFit="cover"
            transition={300}
          />
          <SafeAreaView edges={["top"]} style={styles.coverButtons} pointerEvents="box-none">
            <Pressable style={styles.circleBtn} onPress={() => router.back()} hitSlop={8}>
              <SymbolView name="chevron.left" size={18} tintColor="#FFFFFF" />
            </Pressable>
            <Pressable style={styles.circleBtn} hitSlop={8}>
              <SymbolView name="heart" size={18} tintColor="#FFFFFF" />
            </Pressable>
          </SafeAreaView>
        </View>

        {/* INFO RISTORANTE */}
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <ThemedText type="subtitle" style={styles.name}>
              {restaurant.name}
            </ThemedText>
            <View style={styles.ratingBadge}>
              <SymbolView name="star.fill" size={12} tintColor={colors.accent} />
              <ThemedText type="smallBold" style={styles.ratingText}>
                {restaurant.rating.toFixed(1)}
              </ThemedText>
            </View>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {restaurant.tags.join(" • ")}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Min € {restaurant.minOrder.toFixed(2)} · {restaurant.deliveryTime}
          </ThemedText>

          {/* Banner consegna */}
          <View style={styles.banner}>
            <SymbolView name="bicycle" size={20} tintColor={colors.accentSecondary} />
            <ThemedText type="smallBold" style={styles.bannerText}>
              {restaurant.deliveryFee === 0
                ? "Consegna gratis"
                : `Consegna € ${restaurant.deliveryFee.toFixed(2)}`}
            </ThemedText>
          </View>

          {/* MENU per sezioni */}
          {sections.map((section) => (
            <View key={section} style={styles.section}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                {section}
              </ThemedText>
              <View style={styles.sectionList}>
                {menu
                  .filter((d) => d.section === section)
                  .map((dish) => (
                    <MenuItem key={dish.id} dish={dish} />
                  ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* BARRA CARRELLO flottante */}
      {cart.count > 0 && (
        <SafeAreaView edges={["bottom"]} style={styles.cartBarWrap} pointerEvents="box-none">
          <Link href="/cart" asChild>
            <Pressable style={styles.cartBar}>
              <View style={styles.cartBadge}>
                <ThemedText type="smallBold" style={styles.cartBadgeText}>
                  {cart.count}
                </ThemedText>
              </View>
              <ThemedText type="default" style={styles.cartBarLabel}>
                Vedi carrello
              </ThemedText>
              <ThemedText type="default" style={styles.cartBarLabel}>
                € {cart.subtotal.toFixed(2)}
              </ThemedText>
            </Pressable>
          </Link>
        </SafeAreaView>
      )}
    </ThemedView>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    screen: { flex: 1 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: { paddingBottom: Spacing.six * 2 },
    cover: {
      width: "100%",
      height: 260,
    },
    coverButtons: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.two,
    },
    circleBtn: {
      width: 40,
      height: 40,
      borderRadius: Radii.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#00000066", // scuro translucido sopra la foto (in entrambi i temi)
    },
    body: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.three,
      gap: Spacing.two,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: Spacing.two,
    },
    name: { flex: 1 },
    ratingBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.half,
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.half,
      borderRadius: Radii.pill,
      borderWidth: 1,
      borderColor: colors.accent,
    },
    ratingText: { color: colors.accent },
    banner: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.two,
      padding: Spacing.three,
      marginTop: Spacing.two,
      borderRadius: Radii.card,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    bannerText: { color: colors.accentSecondary },
    section: {
      marginTop: Spacing.three,
      gap: Spacing.three,
    },
    sectionTitle: {
      textTransform: "uppercase",
      color: colors.textSecondary,
      letterSpacing: 1,
    },
    sectionList: {
      gap: Spacing.three,
    },
    cartBarWrap: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.two,
    },
    cartBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: Spacing.two,
      height: 56,
      paddingHorizontal: Spacing.three,
      borderRadius: Radii.card,
      backgroundColor: colors.accent,
    },
    cartBadge: {
      minWidth: 24,
      height: 24,
      paddingHorizontal: Spacing.one,
      borderRadius: Radii.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#0000002E",
    },
    cartBadgeText: { color: colors.background },
    cartBarLabel: {
      color: colors.background,
      fontWeight: "700",
    },
  });
