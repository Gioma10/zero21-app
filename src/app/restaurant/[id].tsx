import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Link, router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { MenuItem } from "@/components/menu-item";
import { PressableScale } from "@/components/pressable-scale";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radii, Shadows, Spacing, type Palette } from "@/constants/theme";
import { useCart } from "@/context/cart";
import { useTheme } from "@/hooks/use-theme";
import { useDishes } from "@/hooks/use-dishes";
import { useRestaurant } from "@/hooks/use-restaurants";
import { useDeliveryFee } from "@/hooks/use-settings";
import type { DishSection } from "@/types";

// Ordine "preferito" delle sezioni note. Le sezioni libere create dal vendor
// (es. "Pizze") NON vengono nascoste: appaiono dopo, nell'ordine in cui compaiono.
const PREFERRED_SECTIONS: DishSection[] = ["Antipasti", "Primi", "Secondi", "Dolci", "Drink"];

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cart = useCart();
  const colors = useTheme();
  const reduceMotion = useReducedMotion();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { data: restaurant, isLoading } = useRestaurant(id);
  const { data: menu = [] } = useDishes(id);
  // Costo di consegna unico di piattaforma (uguale per tutti i ristoranti).
  const { data: deliveryFee } = useDeliveryFee();

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

  // Sezioni effettivamente presenti nel menù, ordinate: prima quelle note
  // (nell'ordine preferito), poi le eventuali sezioni libere del vendor.
  const present = Array.from(new Set(menu.map((d) => d.section)));
  const sections = [
    ...PREFERRED_SECTIONS.filter((s) => present.includes(s)),
    ...present.filter((s) => !PREFERRED_SECTIONS.includes(s as DishSection)),
  ];
  const freeDelivery = deliveryFee === 0;

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* COVER con scrim e bottoni flottanti */}
        <View style={styles.coverWrap}>
          <Image
            source={restaurant.coverImage}
            style={styles.cover}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={[colors.scrim, "transparent", "transparent", colors.background]}
            locations={[0, 0.3, 0.7, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <SafeAreaView edges={["top"]} style={styles.coverButtons} pointerEvents="box-none">
            <Pressable style={styles.circleBtn} onPress={() => router.back()} hitSlop={8}>
              <SymbolView name="chevron.left" size={18} tintColor="#FFFFFF" />
            </Pressable>
          </SafeAreaView>
        </View>

        {/* SCHEDA INFO che scavalca la cover */}
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <ThemedText type="serif" style={styles.name}>
              {restaurant.name}
            </ThemedText>
          </View>
          <ThemedText type="smallBold" themeColor="accent" style={styles.cuisine}>
            {restaurant.tags.join(" · ")}
          </ThemedText>

          {/* Statistiche inline, separate da divisori */}
          <View style={styles.stats}>
            <View style={styles.stat}>
              <SymbolView name="clock" size={16} tintColor={colors.accent} />
              <ThemedText type="smallBold">{restaurant.deliveryTime}</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <SymbolView name="bag" size={16} tintColor={colors.accent} />
              <ThemedText type="smallBold">Min € {restaurant.minOrder.toFixed(0)}</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <SymbolView name="bicycle" size={16} tintColor={colors.accent} />
              <ThemedText
                type="smallBold"
                style={freeDelivery ? styles.freeText : undefined}
              >
                {deliveryFee == null
                  ? "—"
                  : freeDelivery
                    ? "Gratis"
                    : `€ ${deliveryFee.toFixed(2)}`}
              </ThemedText>
            </View>
          </View>

          {/* MENU per sezioni */}
          {sections.map((section) => (
            <View key={section} style={styles.section}>
              <View style={styles.sectionHead}>
                <ThemedText type="serif" style={styles.sectionTitle}>
                  {section}
                </ThemedText>
                <View style={styles.sectionRule} />
              </View>
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
          <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(320)}>
            <Link href="/cart" asChild>
              <PressableScale style={styles.cartBar} scaleTo={0.97}>
                <View style={styles.cartBadge}>
                  <ThemedText type="smallBold" style={styles.cartBadgeText}>
                    {cart.count}
                  </ThemedText>
                </View>
                <ThemedText type="smallBold" style={styles.cartBarLabel}>
                  Vedi carrello
                </ThemedText>
                <View style={styles.spacer} />
                <ThemedText type="smallBold" style={styles.cartBarLabel}>
                  € {cart.subtotal.toFixed(2)}
                </ThemedText>
              </PressableScale>
            </Link>
          </Animated.View>
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
    coverWrap: {
      height: 300,
      width: "100%",
    },
    cover: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: "100%",
      height: "100%",
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
      width: 42,
      height: 42,
      borderRadius: Radii.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(8, 18, 12, 0.4)",
    },
    body: {
      marginTop: -28,
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.four,
      borderTopLeftRadius: Radii.xl,
      borderTopRightRadius: Radii.xl,
      backgroundColor: colors.background,
      gap: Spacing.two,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: Spacing.two,
    },
    name: { flex: 1, fontSize: 30 },
    cuisine: { marginTop: 2 },
    stats: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: Spacing.three,
      padding: Spacing.three,
      borderRadius: Radii.lg,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    stat: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.one + 2,
      flex: 1,
      justifyContent: "center",
    },
    statDivider: {
      width: StyleSheet.hairlineWidth,
      height: 24,
      backgroundColor: colors.border,
    },
    freeText: { color: colors.accentTertiary },
    section: {
      marginTop: Spacing.four,
      gap: Spacing.three,
    },
    sectionHead: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.three,
    },
    sectionTitle: {
      fontSize: 21,
    },
    sectionRule: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    sectionList: {
      gap: Spacing.four,
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
      gap: Spacing.two,
      height: 58,
      paddingHorizontal: Spacing.three,
      borderRadius: Radii.card,
      backgroundColor: colors.accent,
      ...Shadows.lifted,
    },
    cartBadge: {
      minWidth: 26,
      height: 26,
      paddingHorizontal: Spacing.one,
      borderRadius: Radii.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.22)",
    },
    cartBadgeText: { color: colors.onAccent },
    spacer: { flex: 1 },
    cartBarLabel: {
      color: colors.onAccent,
      fontSize: 16,
    },
  });
