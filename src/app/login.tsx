import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import Animated, { FadeIn, FadeOut, useReducedMotion } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { PressableScale } from "@/components/pressable-scale";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Radii, Shadows, Spacing, type Palette } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/hooks/use-theme";

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const colors = useTheme();
  const reduceMotion = useReducedMotion();
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

  function switchMode(next: "signin" | "signup") {
    setMessage(null);
    setMode(next);
  }

  const extra = reduceMotion ? {} : { entering: FadeIn.duration(220), exiting: FadeOut.duration(120) };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo + tagline */}
            <View style={styles.brandBlock}>
              <Image
                source={require("@/assets/images/logo-mark.png")}
                style={styles.logo}
                contentFit="contain"
              />
              <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
                Il meglio della Costa Smeralda, a casa tua.
              </ThemedText>
            </View>

            {/* Segmented control Accedi / Registrati */}
            <View style={styles.segment}>
              {(["signin", "signup"] as const).map((m) => {
                const active = mode === m;
                return (
                  <Pressable
                    key={m}
                    style={[styles.segmentItem, active && styles.segmentItemActive]}
                    onPress={() => switchMode(m)}
                  >
                    <ThemedText
                      type="smallBold"
                      style={{ color: active ? colors.onAccent : colors.textSecondary }}
                    >
                      {m === "signin" ? "Accedi" : "Registrati"}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.form}>
              {isSignup && (
                <Animated.View {...extra}>
                  <TextInput
                    placeholder="Nome"
                    placeholderTextColor={colors.textSecondary}
                    style={styles.input}
                    autoCapitalize="words"
                    autoComplete="name"
                    value={name}
                    onChangeText={setName}
                  />
                </Animated.View>
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
                <Animated.View {...extra}>
                  <TextInput
                    placeholder="Telefono"
                    placeholderTextColor={colors.textSecondary}
                    style={styles.input}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </Animated.View>
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
                <Animated.View {...extra}>
                  <TextInput
                    placeholder="Conferma password"
                    placeholderTextColor={colors.textSecondary}
                    style={styles.input}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </Animated.View>
              )}

              {message && (
                <Animated.View {...(reduceMotion ? {} : { entering: FadeIn.duration(200) })}>
                  <ThemedText type="smallBold" style={styles.message}>
                    {message}
                  </ThemedText>
                </Animated.View>
              )}

              <PressableScale
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={submit}
                disabled={loading}
                scaleTo={0.97}
              >
                {loading ? (
                  <ActivityIndicator color={colors.onAccent} />
                ) : (
                  <ThemedText type="default" style={styles.buttonText}>
                    {isSignup ? "Crea account" : "Accedi"}
                  </ThemedText>
                )}
              </PressableScale>
            </View>
          </ScrollView>
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
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.six,
      gap: Spacing.four,
    },
    brandBlock: {
      alignItems: "center",
      gap: Spacing.two,
    },
    logo: {
      width: 140,
      height: 140,
      borderRadius: Radii.card,
    },
    subtitle: {
      textAlign: "center",
      maxWidth: 260,
    },
    segment: {
      flexDirection: "row",
      padding: 4,
      borderRadius: Radii.pill,
      backgroundColor: colors.backgroundSelected,
    },
    segmentItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: Spacing.two + 2,
      borderRadius: Radii.pill,
    },
    segmentItemActive: {
      backgroundColor: colors.accent,
      ...Shadows.soft,
    },
    form: {
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
    message: {
      color: colors.accentTertiary,
      textAlign: "center",
    },
    button: {
      height: 56,
      borderRadius: Radii.card,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
      ...Shadows.soft,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: colors.onAccent,
      fontWeight: "700",
      fontSize: 16,
    },
  });
