import { SFSymbol, SymbolView } from "expo-symbols";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radii, Spacing } from "@/constants/theme";
import { useAuth } from "@/context/auth";

const colors = Colors.dark;

const menuItems: { icon: SFSymbol; label: string }[] = [
  { icon: "mappin.and.ellipse", label: "I miei indirizzi" },
  { icon: "creditcard.fill", label: "Metodi di pagamento" },
  { icon: "bell.fill", label: "Notifiche" },
  { icon: "questionmark.circle.fill", label: "Aiuto" },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const email = user?.email ?? "";
  const displayName = (user?.user_metadata?.display_name as string) || email.split("@")[0] || "Utente";
  const phone = (user?.user_metadata?.phone as string) || "";
  const initial = displayName.charAt(0).toUpperCase() || "?";

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Intestazione utente */}
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>{initial}</ThemedText>
            </View>
            <View style={styles.userInfo}>
              <ThemedText type="subtitle" numberOfLines={1}>
                {displayName}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {email}
              </ThemedText>
              {phone ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {phone}
                </ThemedText>
              ) : null}
            </View>
          </View>

          {/* Voci di menu */}
          <View style={styles.menu}>
            {menuItems.map((item) => (
              <Pressable key={item.label} style={styles.row}>
                <SymbolView name={item.icon} size={20} tintColor={colors.accent} />
                <ThemedText type="default" style={styles.rowLabel}>
                  {item.label}
                </ThemedText>
                <SymbolView name="chevron.right" size={14} tintColor={colors.textSecondary} />
              </Pressable>
            ))}
          </View>

          {/* Logout */}
          <Pressable style={styles.logout} onPress={signOut}>
            <SymbolView
              name="rectangle.portrait.and.arrow.right.fill"
              size={20}
              tintColor="#FF6B6B"
            />
            <ThemedText type="default" style={styles.logoutText}>
              Esci
            </ThemedText>
          </Pressable>
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
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundSelected,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.accent,
  },
  userInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  menu: {
    borderRadius: Radii.card,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    flex: 1,
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: "#FF6B6B33",
  },
  logoutText: {
    color: "#FF6B6B",
    fontWeight: "700",
  },
});
