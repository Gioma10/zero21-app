import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RestaurantCard } from "@/components/restaurant-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { categories } from "@/data/mock";
import { useRestaurants } from "@/hooks/use-restaurants";

const colors = Colors.dark;

export default function HomeScreen() {
  const [selected, setSelected] = useState("all");

  // Carica i ristoranti dal database. TanStack Query ci dà data + stati.
  const { data: restaurants = [], isLoading, isError } = useRestaurants();

  // Filtra i ristoranti per categoria (tag). "all" = tutti.
  const visibleRestaurants =
    selected === "all"
      ? restaurants
      : restaurants.filter((r) => r.tags.includes(selected));

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <ThemedText type="small" themeColor="textSecondary">
                Consegna a
              </ThemedText>
              <View style={styles.location}>
                <SymbolView name="location.fill" size={16} tintColor={colors.accent} />
                <ThemedText type="smallBold">Arzachena, Centro</ThemedText>
                <SymbolView name="chevron.down" size={12} tintColor={colors.textSecondary} />
              </View>
            </View>
            <Image
              source="https://picsum.photos/seed/zero21-avatar/100/100"
              style={styles.avatar}
              contentFit="cover"
            />
          </View>

          {/* RICERCA + FILTRI */}
          <View style={styles.searchRow}>
            <View style={styles.search}>
              <SymbolView name="magnifyingglass" size={18} tintColor={colors.textSecondary} />
              <TextInput
                placeholder="Cerca ristoranti o piatti..."
                placeholderTextColor={colors.textSecondary}
                style={styles.searchInput}
              />
            </View>
            <Pressable style={styles.filterBtn}>
              <SymbolView name="slider.horizontal.3" size={18} tintColor={colors.background} />
            </Pressable>
          </View>

          {/* CATEGORIE */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}
          >
            {categories.map((cat) => {
              const isActive = cat.id === selected;
              return (
                <Pressable key={cat.id} onPress={() => setSelected(cat.id)} style={styles.category}>
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor: isActive ? colors.accent : colors.card,
                        borderColor: isActive ? colors.accent : colors.border,
                      },
                    ]}
                  >
                    <SymbolView
                      name={cat.icon}
                      size={20}
                      tintColor={isActive ? colors.background : colors.textSecondary}
                    />
                  </View>
                  <ThemedText type="small" themeColor={isActive ? "text" : "textSecondary"}>
                    {cat.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* BANNER PROMO */}
          <View style={styles.banner}>
            <View style={styles.bannerText}>
              <ThemedText type="subtitle" style={styles.bannerTitle}>
                50% di sconto
              </ThemedText>
              <ThemedText type="small" style={styles.bannerSubtitle}>
                sul tuo primo ordine
              </ThemedText>
            </View>
            <SymbolView name="gift.fill" size={48} tintColor={colors.background} />
          </View>

          {/* LISTA RISTORANTI */}
          <ThemedText type="subtitle">Ristoranti</ThemedText>
          {isLoading ? (
            <ActivityIndicator color={colors.accent} style={styles.loader} />
          ) : isError ? (
            <ThemedText type="small" themeColor="textSecondary">
              Impossibile caricare i ristoranti. Controlla la connessione e riprova.
            </ThemedText>
          ) : (
            <View style={styles.list}>
              {visibleRestaurants.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.two,
  },
  headerLeft: {
    gap: Spacing.half,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  searchRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  search: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    height: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.card,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: Radii.card,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  categories: {
    gap: Spacing.three,
    paddingVertical: Spacing.half,
  },
  category: {
    alignItems: "center",
    gap: Spacing.one,
    width: 64,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: Radii.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.four,
    borderRadius: Radii.card,
    backgroundColor: colors.accent,
  },
  bannerText: {
    gap: Spacing.half,
  },
  bannerTitle: {
    color: colors.background,
  },
  bannerSubtitle: {
    color: colors.background,
    opacity: 0.8,
  },
  list: {
    gap: Spacing.three,
  },
  loader: {
    marginTop: Spacing.four,
  },
});
