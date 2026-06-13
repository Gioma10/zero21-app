import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function submit() {
    setMessage(null);

    if (isSignup && password !== confirmPassword) {
      setMessage("Le password non coincidono");
      return;
    }

    setLoading(true);
    const { error } = isSignup
      ? await signUp(email.trim(), password, { displayName: name.trim(), phone: phone.trim() })
      : await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      setMessage(error);
    } else if (isSignup) {
      setMessage("Registrazione completata! Ora puoi accedere.");
      setMode("signin");
    }
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.content}>
            <ThemedText type="title" style={styles.brand}>
              zero21
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
              {isSignup ? "Crea il tuo account" : "Bentornato, accedi per ordinare"}
            </ThemedText>

            <View style={styles.form}>
              {isSignup && (
                <TextInput
                  placeholder="Nome"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.input}
                  autoCapitalize="words"
                  autoComplete="name"
                  value={name}
                  onChangeText={setName}
                />
              )}
              <TextInput
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
              {isSignup && (
                <TextInput
                  placeholder="Telefono"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.input}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  value={phone}
                  onChangeText={setPhone}
                />
              )}
              <TextInput
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              {isSignup && (
                <TextInput
                  placeholder="Conferma password"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.input}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              )}

              {message && (
                <ThemedText type="small" style={styles.message}>
                  {message}
                </ThemedText>
              )}

              <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={submit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <ThemedText type="default" style={styles.buttonText}>
                    {isSignup ? "Registrati" : "Accedi"}
                  </ThemedText>
                )}
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                setMessage(null);
                setMode(isSignup ? "signin" : "signup");
              }}
            >
              <ThemedText type="small" themeColor="textSecondary" style={styles.toggle}>
                {isSignup ? "Hai già un account? Accedi" : "Non hai un account? Registrati"}
              </ThemedText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    screen: { flex: 1 },
    safe: { flex: 1 },
    kav: { flex: 1 },
    content: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: Spacing.four,
      gap: Spacing.two,
    },
    brand: {
      textAlign: "center",
      color: colors.accent,
    },
    subtitle: {
      textAlign: "center",
      marginBottom: Spacing.three,
    },
    form: {
      gap: Spacing.three,
    },
    input: {
      height: 52,
      paddingHorizontal: Spacing.three,
      borderRadius: Radii.card,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      color: colors.text,
      fontSize: 16,
    },
    message: {
      color: colors.accentSecondary,
      textAlign: "center",
    },
    button: {
      height: 56,
      borderRadius: Radii.card,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: colors.background,
      fontWeight: "700",
      fontSize: 16,
    },
    toggle: {
      textAlign: "center",
      marginTop: Spacing.three,
    },
  });
