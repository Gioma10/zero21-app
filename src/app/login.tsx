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
import { ZoneSelect } from "@/components/zone-select";
import { Radii, Shadows, Spacing, type Palette } from "@/constants/theme";
import { DEFAULT_ZONE, zipForZone } from "@/constants/zones";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/hooks/use-theme";
import { fieldErrorsOf, signInSchema, signUpSchema } from "@/lib/validation";
import { checkDeliveryArea, deliveryAreaError } from "@/lib/geocode";

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
  // Indirizzo di consegna predefinito (raccolto in registrazione). La zona è
  // scelta da un selettore (default: Arzachena) e il CAP ne deriva.
  const [street, setStreet] = useState("");
  const [zone, setZone] = useState(DEFAULT_ZONE.name);
  const [message, setMessage] = useState<string | null>(null);
  // Errori di validazione per campo (zod). Si svuotano digitando o cambiando tab.
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  // Cancella l'errore di un campo appena l'utente lo modifica.
  function clearError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function submit() {
    setMessage(null);

    // Validazione zod: registrazione (tutti i campi) o accesso (email+password).
    if (isSignup) {
      const result = signUpSchema.safeParse({
        name,
        email,
        phone,
        street,
        zone,
        password,
        confirmPassword,
      });
      if (!result.success) {
        setErrors(fieldErrorsOf(result.error));
        return;
      }
    } else {
      const result = signInSchema.safeParse({ email, password });
      if (!result.success) {
        setErrors(fieldErrorsOf(result.error));
        return;
      }
    }
    setErrors({});

    setLoading(true);

    // In registrazione l'indirizzo deve essere nel paese di Arzachena.
    if (isSignup) {
      const area = await checkDeliveryArea(street.trim(), zone);
      const areaError = deliveryAreaError(area);
      if (areaError) {
        setLoading(false);
        setErrors({ street: areaError });
        return;
      }
    }

    const { error } = isSignup
      ? await signUp(email.trim(), password, {
          displayName: name.trim(),
          phone: phone.trim(),
          address: {
            street: street.trim(),
            city: zone, // la "città" memorizzata è la zona scelta
            zip: zipForZone(zone), // CAP derivato (Arzachena → 07021)
            notes: "",
          },
        })
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
    setErrors({});
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
                    style={[styles.input, errors.name && styles.inputError]}
                    autoCapitalize="words"
                    autoComplete="name"
                    value={name}
                    onChangeText={(t) => {
                      setName(t);
                      clearError("name");
                    }}
                  />
                  {errors.name && <FieldError text={errors.name} styles={styles} />}
                </Animated.View>
              )}
              <View>
                <TextInput
                  placeholder="Email"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, errors.email && styles.inputError]}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    clearError("email");
                  }}
                />
                {errors.email && <FieldError text={errors.email} styles={styles} />}
              </View>
              {isSignup && (
                <Animated.View {...extra}>
                  <TextInput
                    placeholder="Telefono"
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.input, errors.phone && styles.inputError]}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    value={phone}
                    onChangeText={(t) => {
                      setPhone(t);
                      clearError("phone");
                    }}
                  />
                  {errors.phone && <FieldError text={errors.phone} styles={styles} />}
                </Animated.View>
              )}
              {isSignup && (
                <Animated.View {...extra}>
                  <TextInput
                    placeholder="Indirizzo (via e civico)"
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.input, errors.street && styles.inputError]}
                    autoCapitalize="words"
                    autoComplete="street-address"
                    value={street}
                    onChangeText={(t) => {
                      setStreet(t);
                      clearError("street");
                    }}
                  />
                  {errors.street && (
                    <FieldError text={errors.street} styles={styles} />
                  )}
                </Animated.View>
              )}
              {isSignup && (
                <Animated.View {...extra}>
                  <View style={styles.addressRow}>
                    <ZoneSelect
                      value={zone}
                      onChange={(z) => {
                        setZone(z);
                        clearError("zone");
                      }}
                      style={[
                        styles.input,
                        styles.addressCity,
                        errors.zone && styles.inputError,
                      ]}
                    />
                    <View style={[styles.input, styles.addressZip, styles.zipReadonly]}>
                      <ThemedText type="small" themeColor="textSecondary">
                        CAP
                      </ThemedText>
                      <ThemedText type="default">{zipForZone(zone)}</ThemedText>
                    </View>
                  </View>
                  {errors.zone && <FieldError text={errors.zone} styles={styles} />}
                </Animated.View>
              )}
              <View>
                <TextInput
                  placeholder="Password"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, errors.password && styles.inputError]}
                  secureTextEntry
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    clearError("password");
                  }}
                />
                {errors.password && (
                  <FieldError text={errors.password} styles={styles} />
                )}
              </View>
              {isSignup && (
                <Animated.View {...extra}>
                  <TextInput
                    placeholder="Conferma password"
                    placeholderTextColor={colors.textSecondary}
                    style={[
                      styles.input,
                      errors.confirmPassword && styles.inputError,
                    ]}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={(t) => {
                      setConfirmPassword(t);
                      clearError("confirmPassword");
                    }}
                  />
                  {errors.confirmPassword && (
                    <FieldError text={errors.confirmPassword} styles={styles} />
                  )}
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

// Messaggio d'errore di un singolo campo, sotto l'input.
function FieldError({
  text,
  styles,
}: {
  text: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <ThemedText type="small" style={styles.fieldError}>
      {text}
    </ThemedText>
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
    addressRow: {
      flexDirection: "row",
      gap: Spacing.two,
    },
    addressCity: {
      flex: 1,
    },
    addressZip: {
      width: 110,
    },
    zipReadonly: {
      alignItems: "center",
      justifyContent: "center",
      gap: 0,
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
      borderWidth: 1,
    },
    fieldError: {
      color: colors.accentTertiary,
      marginTop: Spacing.one,
      marginLeft: Spacing.one,
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
