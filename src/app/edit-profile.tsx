import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radii, Spacing, type Palette } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/hooks/use-theme";
import { isValidPhone, normalizePhone } from "@/lib/validation";

// Mentre l'utente digita teniamo solo cifre, spazi e un + iniziale: niente
// lettere o simboli. Così l'input resta leggibile ma sempre "pulibile".
function sanitizePhoneInput(raw: string): string {
  const kept = raw.replace(/[^\d\s+]/g, "");
  // Il + è ammesso solo come primo carattere (prefisso internazionale).
  return kept.charAt(0) + kept.slice(1).replace(/\+/g, "");
}

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const email = user?.email ?? "";
  const [displayName, setDisplayName] = useState(
    (user?.user_metadata?.display_name as string) || "",
  );
  const [phone, setPhone] = useState((user?.user_metadata?.phone as string) || "");
  const [saving, setSaving] = useState(false);

  // Errore mostrato solo dopo che l'utente ha iniziato a scrivere il numero.
  const phoneError =
    phone.trim().length > 0 && !isValidPhone(phone)
      ? "Numero di cellulare non valido (es. 333 1234567)"
      : null;

  async function save() {
    if (!displayName.trim()) {
      Alert.alert("Nome mancante", "Inserisci il tuo nome.");
      return;
    }
    if (!isValidPhone(phone)) {
      Alert.alert(
        "Telefono non valido",
        "Inserisci un numero di cellulare italiano valido (es. 333 1234567).",
      );
      return;
    }
    setSaving(true);
    const { error } = await updateProfile({
      displayName: displayName.trim(),
      phone: normalizePhone(phone),
    });
    setSaving(false);
    if (error) {
      Alert.alert("Errore", "Non è stato possibile salvare le modifiche.");
      return;
    }
    router.back();
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <SymbolView name="chevron.left" size={20} tintColor={colors.text} />
          </Pressable>
          <ThemedText type="smallBold">Modifica profilo</ThemedText>
          <View style={{ width: 20 }} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ThemedText type="small" themeColor="textSecondary">
              Nome e telefono usati per i tuoi ordini e per farti contattare dal rider.
            </ThemedText>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                Nome
              </ThemedText>
              <TextInput
                placeholder="Nome"
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                autoCapitalize="words"
                value={displayName}
                onChangeText={setDisplayName}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                Telefono
              </ThemedText>
              <TextInput
                placeholder="333 1234567"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, phoneError && styles.inputError]}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
                maxLength={16}
                value={phone}
                onChangeText={(v) => setPhone(sanitizePhoneInput(v))}
              />
              {phoneError ? (
                <ThemedText type="small" themeColor="accentTertiary" style={styles.label}>
                  {phoneError}
                </ThemedText>
              ) : null}
            </View>

            <View style={styles.field}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
                Email
              </ThemedText>
              <View style={[styles.input, styles.readonly]}>
                <ThemedText type="default" themeColor="textSecondary" numberOfLines={1}>
                  {email}
                </ThemedText>
              </View>
            </View>
          </ScrollView>

          <SafeAreaView edges={["bottom"]} style={styles.footer}>
            <Pressable
              style={[styles.save, saving && styles.saveDisabled]}
              onPress={save}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={colors.onAccent} />
              ) : (
                <ThemedText type="default" style={styles.saveText}>
                  Salva modifiche
                </ThemedText>
              )}
            </Pressable>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    screen: { flex: 1 },
    safe: { flex: 1 },
    flex: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.three,
    },
    content: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.two,
      gap: Spacing.three,
    },
    field: {
      gap: Spacing.one,
    },
    label: {
      paddingHorizontal: Spacing.one,
    },
    input: {
      height: 54,
      paddingHorizontal: Spacing.three,
      borderRadius: Radii.card,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      color: colors.text,
      fontSize: 16,
    },
    inputError: {
      borderColor: colors.accentTertiary,
    },
    readonly: {
      justifyContent: "center",
      opacity: 0.7,
    },
    footer: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.two,
    },
    save: {
      height: 56,
      borderRadius: Radii.card,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
    },
    saveDisabled: { opacity: 0.6 },
    saveText: {
      color: colors.onAccent,
      fontWeight: "700",
      fontSize: 16,
    },
  });
