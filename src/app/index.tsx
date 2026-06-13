import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DishCard } from "@/components/dish-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { categories, dishes, restaurant } from "@/data/mock";

const colors = Colors.dark;

export default function HomeScreen() {
  // memoria: quale categoria è attiva (parte da "all")
  const [selected, setSelected] = useState("all");

  // lista derivata: tutti i piatti, o solo quelli della sezione scelta
  const visibleDishes =
    selected === "all" ? dishes : dishes.filter((d) => d.section === selected);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">
                Ciao 👋
              </ThemedText>
              <View style={styles.location}>
                <SymbolView
                  name="location.fill"
                  size={16}
                  tintColor={colors.accent}
                />
                <ThemedText type="smallBold">{restaurant.location}</ThemedText>
              </View>
            </View>
            <Pressable style={styles.profileBtn}>
              <SymbolView name="bell.fill" size={20} tintColor={colors.text} />
            </Pressable>
          </View>

          {/* RICERCA */}
          <View style={styles.search}>
            <SymbolView
              name="magnifyingglass"
              size={18}
              tintColor={colors.textSecondary}
            />
            <TextInput
              placeholder="Cerca un piatto..."
              placeholderTextColor={colors.textSecondary}
              style={styles.searchInput}
            />
          </View>

          {/* CATEGORIE (scroll orizzontale) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}
          >
            {categories.map((cat) => {
              const isActive = cat.id === selected;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelected(cat.id)}
                  style={[
                    styles.chip,
                    { borderColor: isActive ? colors.accent : colors.border },
                    isActive && { backgroundColor: colors.backgroundSelected },
                  ]}
                >
                  <SymbolView
                    name={cat.icon}
                    size={16}
                    tintColor={isActive ? colors.accent : colors.textSecondary}
                  />
                  <ThemedText
                    type="small"
                    themeColor={isActive ? "text" : "textSecondary"}
                  >
                    {cat.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* LISTA PIATTI (scroll verticale) */}
          <ThemedText type="subtitle">Menù</ThemedText>
          <View style={styles.list}>
            {visibleDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </View>
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
  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    marginTop: Spacing.half,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: Radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  search: {
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
  categories: {
    gap: Spacing.two,
    paddingVertical: Spacing.half,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.card,
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
  categories: {
    gap: Spacing.two,
    paddingVertical: Spacing.half,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  list: {
    gap: Spacing.three,
  },
});
