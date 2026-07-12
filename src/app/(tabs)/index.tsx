import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/pressable-scale";
import { RestaurantCard } from "@/components/restaurant-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radii, Shadows, Spacing, type Palette } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { useThemeMode } from "@/context/theme-mode";
import { categories } from "@/data/mock";
import { useRestaurants } from "@/hooks/use-restaurants";
import { useTheme } from "@/hooks/use-theme";

export default function HomeScreen() {
  const colors = useTheme();
  const { user } = useAuth();
  const { mode, toggle } = useThemeMode();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [selected, setSelected] = useState("all");
  const [query, setQuery] = useState("");

  // Avatar in alto a destra: mostra l'iniziale dell'utente, come nel profilo.
  const email = user?.email ?? "";
  const displayName =
    (user?.user_metadata?.display_name as string) || email.split("@")[0] || "Utente";
  const initial = displayName.charAt(0).toUpperCase() || "?";

  const {
    data: restaurants = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useRestaurants();

  // Filtro combinato: categoria selezionata + testo di ricerca (nome o cucina).
  const q = query.trim().toLowerCase();
  const visibleRestaurants = restaurants.filter((r) => {
    const matchesCategory = selected === "all" || r.tags.includes(selected);
    const matchesQuery =
      q === "" ||
      r.name.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          // La tab bar è nativa e si sovrappone: lasciamo spazio sotto (barra +
          // safe area) così le ultime card non restano coperte.
          { paddingBottom: insets.bottom + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.accent}
            progressViewOffset={insets.top + 80}
          />
        }
      >
        {/* HERO a gradiente smeraldo — la firma di zero21 */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(500)}
          style={[styles.heroWrap, { paddingTop: insets.top + Spacing.three }]}
        >
          <LinearGradient
            colors={[colors.accentBright, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroTop}>
              <Pressable style={styles.location} hitSlop={8}>
                <ThemedText type="smallBold" style={styles.locationKicker}>
                  Consegna a
                </ThemedText>
                <View style={styles.locationRow}>
                  <SymbolView name="location.fill" size={15} tintColor="#FFFFFF" />
                  <ThemedText type="smallBold" style={styles.locationName}>
                    Arzachena, Centro
                  </ThemedText>
                  <SymbolView name="chevron.down" size={11} tintColor="rgba(255,255,255,0.8)" />
                </View>
              </Pressable>
              <View style={styles.heroActions}>
                <Pressable style={styles.glassBtn} onPress={toggle} hitSlop={8}>
                  <SymbolView
                    name={mode === "dark" ? "sun.max.fill" : "moon.fill"}
                    size={18}
                    tintColor="#FFFFFF"
                  />
                </Pressable>
                <Pressable
                  style={styles.avatar}
                  onPress={() => router.navigate("/profile")}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Vai al profilo"
                >
                  <ThemedText type="smallBold" style={styles.avatarText}>
                    {initial}
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            <ThemedText type="display" style={styles.heroTitle}>
              Ordina. Rilassati.{"\n"}Arriviamo noi.
            </ThemedText>
          </LinearGradient>

          {/* Barra ricerca flottante che scavalca il bordo dell'hero */}
          <View style={styles.searchRow}>
            <View style={styles.search}>
              <SymbolView name="magnifyingglass" size={18} tintColor={colors.textSecondary} />
              <TextInput
                placeholder="Cerca ristoranti o cucina…"
                placeholderTextColor={colors.textSecondary}
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                autoCorrect={false}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            </View>
          </View>
        </Animated.View>

        {/* CATEGORIE a pill */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categories.map((cat) => {
            const isActive = cat.id === selected;
            return (
              <PressableScale
                key={cat.id}
                onPress={() => setSelected(cat.id)}
                scaleTo={0.94}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? colors.accent : colors.card,
                    borderColor: isActive ? colors.accent : colors.border,
                  },
                ]}
              >
                <SymbolView
                  name={cat.icon}
                  size={15}
                  tintColor={isActive ? colors.onAccent : colors.accent}
                />
                <ThemedText
                  type="smallBold"
                  style={{ color: isActive ? colors.onAccent : colors.text }}
                >
                  {cat.label}
                </ThemedText>
              </PressableScale>
            );
          })}
        </ScrollView>

        {/* LISTA RISTORANTI */}
        <View style={styles.listHeader}>
          <ThemedText type="serif">Ristoranti</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {visibleRestaurants.length} aperti ora
          </ThemedText>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : isError ? (
          <View style={styles.errorBox}>
            <SymbolView name="wifi.exclamationmark" size={28} tintColor={colors.accentTertiary} />
            <ThemedText type="smallBold" style={styles.errorTitle}>
              Niente connessione
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.errorText}>
              Non riusciamo a caricare i ristoranti. Controlla la rete e tira giù per riprovare.
            </ThemedText>
          </View>
        ) : visibleRestaurants.length === 0 ? (
          <View style={styles.errorBox}>
            <SymbolView name="magnifyingglass" size={28} tintColor={colors.accentTertiary} />
            <ThemedText type="smallBold" style={styles.errorTitle}>
              Nessun risultato
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.errorText}>
              Nessun ristorante corrisponde alla ricerca. Prova con un altro nome o categoria.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.list}>
            {visibleRestaurants.map((r, i) => (
              <Animated.View
                key={r.id}
                entering={
                  reduceMotion ? undefined : FadeInDown.duration(420).delay(i * 90)
                }
              >
                <RestaurantCard restaurant={r} />
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    screen: { flex: 1 },
    content: {
      gap: Spacing.four,
    },
    heroWrap: {
      paddingHorizontal: Spacing.three,
      // spazio per la search bar flottante che sporge sotto l'hero
      marginBottom: 28,
    },
    hero: {
      borderRadius: Radii.xl,
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.four,
      paddingBottom: Spacing.six,
      ...Shadows.soft,
    },
    heroTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    location: {
      gap: 2,
    },
    locationKicker: {
      color: "rgba(255,255,255,0.85)",
      fontSize: 12,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.one,
    },
    locationName: {
      color: "#FFFFFF",
      fontSize: 16,
    },
    heroActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.two,
    },
    glassBtn: {
      width: 42,
      height: 42,
      borderRadius: Radii.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.18)",
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: Radii.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.18)",
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.6)",
    },
    avatarText: {
      color: "#FFFFFF",
      fontSize: 17,
    },
    heroTitle: {
      color: "#FFFFFF",
      marginTop: Spacing.four,
      fontSize: 40,
      lineHeight: 42,
    },
    searchRow: {
      position: "absolute",
      left: Spacing.four + Spacing.two,
      right: Spacing.four + Spacing.two,
      bottom: -26,
      flexDirection: "row",
      gap: Spacing.two,
    },
    search: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.two,
      height: 52,
      paddingHorizontal: Spacing.three,
      borderRadius: Radii.card,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      ...Shadows.lifted,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
    },
    categories: {
      gap: Spacing.two,
      paddingHorizontal: Spacing.three,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.one + 2,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      borderRadius: Radii.pill,
      borderWidth: 1,
    },
    listHeader: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.three,
    },
    list: {
      gap: Spacing.four,
      paddingHorizontal: Spacing.three,
    },
    loader: {
      marginTop: Spacing.four,
    },
    errorBox: {
      alignItems: "center",
      gap: Spacing.one,
      marginHorizontal: Spacing.three,
      padding: Spacing.four,
      borderRadius: Radii.lg,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    errorTitle: {
      marginTop: Spacing.one,
      fontSize: 16,
    },
    errorText: {
      textAlign: "center",
    },
  });
