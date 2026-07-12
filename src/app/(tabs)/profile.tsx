import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SFSymbol, SymbolView } from "expo-symbols";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PressableScale } from "@/components/pressable-scale";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radii, Shadows, Spacing, type Palette } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/hooks/use-theme";

const menuItems: { icon: SFSymbol; label: string; route?: string }[] = [
  { icon: "mappin.and.ellipse", label: "I miei indirizzi", route: "/addresses" },
  { icon: "questionmark.circle.fill", label: "Aiuto" },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const email = user?.email ?? "";
  const displayName =
    (user?.user_metadata?.display_name as string) || email.split("@")[0] || "Utente";
  const phone = (user?.user_metadata?.phone as string) || "";
  const initial = displayName.charAt(0).toUpperCase() || "?";

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Intestazione utente */}
          <View style={styles.userRow}>
            <LinearGradient
              colors={[colors.accentBright, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <ThemedText style={styles.avatarText}>{initial}</ThemedText>
            </LinearGradient>
            <View style={styles.userInfo}>
              <ThemedText type="serif" numberOfLines={1} style={styles.userName}>
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
            {menuItems.map((item, i) => (
              <Pressable
                key={item.label}
                style={[styles.row, i === menuItems.length - 1 && styles.rowLast]}
                onPress={item.route ? () => router.push(item.route as never) : undefined}
              >
                <View style={styles.rowIcon}>
                  <SymbolView name={item.icon} size={18} tintColor={colors.accent} />
                </View>
                <ThemedText type="default" style={styles.rowLabel}>
                  {item.label}
                </ThemedText>
                <SymbolView name="chevron.right" size={14} tintColor={colors.textSecondary} />
              </Pressable>
            ))}
          </View>

          {/* Logout */}
          <PressableScale style={styles.logout} onPress={signOut} scaleTo={0.98}>
            <SymbolView
              name="rectangle.portrait.and.arrow.right.fill"
              size={18}
              tintColor={colors.accentTertiary}
            />
            <ThemedText type="smallBold" style={styles.logoutText}>
              Esci
            </ThemedText>
          </PressableScale>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    screen: { flex: 1 },
    safe: { flex: 1 },
    content: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.four,
      paddingBottom: Spacing.six,
      gap: Spacing.four,
    },
    userRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.three,
    },
    avatar: {
      width: 76,
      height: 76,
      borderRadius: Radii.pill,
      alignItems: "center",
      justifyContent: "center",
      ...Shadows.soft,
    },
    avatarText: {
      fontSize: 30,
      fontWeight: "700",
      color: colors.onAccent,
    },
    userInfo: {
      flex: 1,
      gap: 2,
    },
    userName: {
      fontSize: 24,
    },
    menu: {
      borderRadius: Radii.lg,
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
    rowLast: {
      borderBottomWidth: 0,
    },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: Radii.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.backgroundSelected,
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
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    logoutText: {
      color: colors.accentTertiary,
    },
  });
