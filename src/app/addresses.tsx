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
import { ZoneSelect } from "@/components/zone-select";
import { Radii, Spacing, type Palette } from "@/constants/theme";
import { DEFAULT_ZONE, isValidZone, zipForZone } from "@/constants/zones";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/hooks/use-theme";
import { emptyAddress, type DeliveryAddress } from "@/types";

export default function AddressesScreen() {
  const { user, updateAddress } = useAuth();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const saved = user?.user_metadata?.address as
    | Partial<DeliveryAddress>
    | undefined;
  // `city` ospita la zona: fallback alla zona predefinita se non più valida.
  const initialZone =
    saved?.city && isValidZone(saved.city) ? saved.city : DEFAULT_ZONE.name;
  const [address, setAddress] = useState<DeliveryAddress>({
    ...emptyAddress,
    street: saved?.street ?? "",
    city: initialZone,
    zip: zipForZone(initialZone),
    notes: saved?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);

  const setField = (key: keyof DeliveryAddress) => (value: string) =>
    setAddress((prev) => ({ ...prev, [key]: value }));
  // Cambiando zona aggiorniamo anche il CAP derivato.
  const setZone = (zone: string) =>
    setAddress((prev) => ({ ...prev, city: zone, zip: zipForZone(zone) }));

  async function save() {
    if (!address.street.trim() || !address.city.trim()) {
      Alert.alert("Indirizzo incompleto", "Inserisci la via e seleziona la zona.");
      return;
    }
    setSaving(true);
    const { error } = await updateAddress({
      street: address.street.trim(),
      city: address.city.trim(),
      zip: address.zip.trim(),
      notes: address.notes.trim(),
    });
    setSaving(false);
    if (error) {
      Alert.alert("Errore", "Non è stato possibile salvare l'indirizzo.");
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
          <ThemedText type="smallBold">I miei indirizzi</ThemedText>
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
              {"È l'indirizzo predefinito: pre-compila il checkout ad ogni ordine."}
            </ThemedText>

            <TextInput
              placeholder="Via e civico"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              autoCapitalize="words"
              value={address.street}
              onChangeText={setField("street")}
            />
            <View style={styles.row}>
              <ZoneSelect
                value={address.city}
                onChange={setZone}
                style={[styles.input, styles.city]}
              />
              <View style={[styles.input, styles.zip, styles.zipReadonly]}>
                <ThemedText type="small" themeColor="textSecondary">
                  CAP
                </ThemedText>
                <ThemedText type="default">{address.zip}</ThemedText>
              </View>
            </View>
            <TextInput
              placeholder="Note per il rider (scala, citofono…)"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
              value={address.notes}
              onChangeText={setField("notes")}
            />
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
                  Salva indirizzo
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
    row: {
      flexDirection: "row",
      gap: Spacing.two,
    },
    city: { flex: 1 },
    zip: { width: 110 },
    zipReadonly: {
      alignItems: "center",
      justifyContent: "center",
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
