import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import {
  Alert,
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
import { useCart } from "@/context/cart";
import { useTheme } from "@/hooks/use-theme";
import { SLOT_FULL_ERROR, useCreateOrder } from "@/hooks/use-orders";
import { useDeliveryFee } from "@/hooks/use-settings";
import { useRestaurant } from "@/hooks/use-restaurants";
import {
  useDeliverySlots,
  type AvailableSlotGroup,
} from "@/hooks/use-delivery-slots";
import { formatSlotTime, hasOpeningHours } from "@/lib/slots";
import { ZoneSelect } from "@/components/zone-select";
import { DEFAULT_ZONE, isValidZone, zipForZone } from "@/constants/zones";
import { checkDeliveryArea, deliveryAreaError } from "@/lib/geocode";
import { type DeliveryAddress } from "@/types";

export default function CartScreen() {
  const cart = useCart();
  const createOrder = useCreateOrder();
  const { user } = useAuth();
  // Verifica dell'area di consegna in corso (geocodifica dell'indirizzo).
  const [verifying, setVerifying] = useState(false);
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Indirizzo di consegna: parte dal default salvato sul profilo
  // (user_metadata.address) e resta modificabile per questo ordine. Il cart è
  // dietro il gate di autenticazione, quindi `user` è già disponibile al mount.
  const [address, setAddress] = useState<DeliveryAddress>(() => {
    const saved = user?.user_metadata?.address as
      | Partial<DeliveryAddress>
      | undefined;
    // `city` ospita la zona: se il valore salvato non è una zona attiva,
    // ripieghiamo sulla zona predefinita (Arzachena).
    const zone =
      saved?.city && isValidZone(saved.city) ? saved.city : DEFAULT_ZONE.name;
    return {
      street: saved?.street ?? "",
      city: zone,
      zip: zipForZone(zone),
      notes: saved?.notes ?? "",
    };
  });
  const setField = (key: keyof DeliveryAddress) => (value: string) =>
    setAddress((prev) => ({ ...prev, [key]: value }));
  // Cambiando zona aggiorniamo anche il CAP derivato.
  const setZone = (zone: string) =>
    setAddress((prev) => ({ ...prev, city: zone, zip: zipForZone(zone) }));

  // Telefono di contatto: pre-compilato dal profilo, modificabile per l'ordine.
  const [phone, setPhone] = useState<string>(
    () => (user?.user_metadata?.phone as string | undefined) ?? "",
  );

  // Costo di consegna UNICO di piattaforma (gestito da admin). Finché carica
  // usiamo 0.
  const { data: deliveryFee = 0 } = useDeliveryFee();
  const total = cart.subtotal + deliveryFee;

  // --- Fascia di consegna ---
  // Tutti i piatti sono dello stesso ristorante: il vendorId = restaurantId.
  const vendorId = cart.items[0]?.dish.restaurantId;
  const { data: restaurant } = useRestaurant(vendorId ?? "");
  const slotsQuery = useDeliverySlots(restaurant);
  // Il ristorante gestisce fasce orarie? (se no, ordine "appena possibile").
  const slotsConfigured = hasOpeningHours(restaurant?.openingHours);
  const slotGroups = slotsQuery.data?.groups ?? [];
  const hasFreeSlot = slotGroups.some((g) => g.slots.some((s) => !s.full));
  const [slot, setSlot] = useState<string | null>(null);

  async function checkout() {
    // Tutti i piatti del carrello appartengono allo stesso ristorante:
    // il vendorId dell'ordine è il restaurantId dei piatti (calcolato sopra).
    if (!vendorId) {
      Alert.alert("Errore", "Carrello vuoto.");
      return;
    }
    const mixed = cart.items.some((i) => i.dish.restaurantId !== vendorId);
    if (mixed) {
      Alert.alert(
        "Ristoranti diversi",
        "Il carrello contiene piatti di ristoranti diversi. Puoi ordinare da un solo ristorante alla volta.",
      );
      return;
    }

    // L'indirizzo di consegna è obbligatorio: serve al ristorante per consegnare.
    if (!address.street.trim() || !address.city.trim()) {
      Alert.alert(
        "Indirizzo mancante",
        "Inserisci la via e seleziona la zona di consegna.",
      );
      return;
    }

    // Telefono di contatto obbligatorio: serve al ristorante per la consegna.
    if (!phone.trim()) {
      Alert.alert(
        "Telefono mancante",
        "Inserisci un numero di telefono di contatto.",
      );
      return;
    }

    // Fascia di consegna: se il ristorante gestisce gli orari, la scelta è
    // obbligatoria (evita ordini simultanei). Altrimenti resta "appena possibile".
    if (slotsConfigured && !slot) {
      Alert.alert(
        "Scegli un orario",
        hasFreeSlot
          ? "Seleziona una fascia di consegna per procedere."
          : "Nessuna fascia disponibile al momento. Riprova più tardi.",
      );
      return;
    }

    // L'indirizzo (eventualmente modificato qui) deve essere nel paese di
    // Arzachena: riverifichiamo prima di creare l'ordine.
    setVerifying(true);
    const area = await checkDeliveryArea(address.street.trim(), address.city.trim());
    setVerifying(false);
    const areaError = deliveryAreaError(area);
    if (areaError) {
      Alert.alert("Indirizzo fuori zona", areaError);
      return;
    }

    createOrder.mutate(
      {
        items: cart.items.map((i) => ({
          name: i.dish.name,
          qty: i.qty,
          price: i.dish.price,
        })),
        total,
        deliveryFee,
        vendorId,
        address,
        phone,
        // Fascia scelta solo se il ristorante gestisce gli orari.
        deliverySlot: slotsConfigured ? slot : null,
      },
      {
        onSuccess: (order) => {
          cart.clear();
          router.replace({ pathname: "/order-success", params: { id: order.id } });
        },
        onError: (error) => {
          // La fascia si è riempita tra la scelta e l'invio (garanzia DB):
          // invitiamo a riscegliere e rinfreschiamo la disponibilità.
          if (error instanceof Error && error.message === SLOT_FULL_ERROR) {
            setSlot(null);
            slotsQuery.refetch();
            Alert.alert(
              "Fascia esaurita",
              "Quella fascia si è appena riempita. Scegline un'altra.",
            );
            return;
          }
          Alert.alert("Errore", "Non è stato possibile inviare l'ordine. Riprova.");
        },
      },
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <SymbolView name="chevron.left" size={20} tintColor={colors.text} />
          </Pressable>
          <ThemedText type="smallBold">Il tuo carrello</ThemedText>
          <Pressable onPress={cart.clear} hitSlop={8} disabled={cart.items.length === 0}>
            <ThemedText type="small" style={{ color: colors.accent }}>
              Svuota
            </ThemedText>
          </Pressable>
        </View>

        {cart.items.length === 0 ? (
          <View style={styles.empty}>
            <SymbolView name="cart" size={48} tintColor={colors.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">
              Il carrello è vuoto
            </ThemedText>
          </View>
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              {/* ARTICOLI */}
              {cart.items.map(({ dish, qty }) => (
                <View key={dish.id} style={styles.item}>
                  <Image
                    source={dish.image}
                    style={styles.itemImage}
                    contentFit="cover"
                    transition={200}
                  />
                  <View style={styles.itemInfo}>
                    <ThemedText type="smallBold" numberOfLines={1}>
                      {dish.name}
                    </ThemedText>
                    <ThemedText type="small" style={styles.price}>
                      € {dish.price.toFixed(2)}
                    </ThemedText>
                  </View>

                  {/* STEPPER quantità */}
                  <View style={styles.stepper}>
                    <Pressable
                      style={styles.stepBtn}
                      onPress={() => cart.decrement(dish.id)}
                      hitSlop={6}
                    >
                      <SymbolView name="minus" size={14} tintColor={colors.accent} />
                    </Pressable>
                    <ThemedText type="smallBold" style={styles.qty}>
                      {qty}
                    </ThemedText>
                    <Pressable
                      style={styles.stepBtn}
                      onPress={() => cart.increment(dish.id)}
                      hitSlop={6}
                    >
                      <SymbolView name="plus" size={14} tintColor={colors.accent} />
                    </Pressable>
                  </View>
                </View>
              ))}

              {/* INDIRIZZO DI CONSEGNA */}
              <View style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <SymbolView
                    name="mappin.and.ellipse"
                    size={18}
                    tintColor={colors.accent}
                  />
                  <ThemedText type="smallBold">Indirizzo di consegna</ThemedText>
                </View>
                <TextInput
                  placeholder="Via e civico"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.addressInput}
                  autoCapitalize="words"
                  value={address.street}
                  onChangeText={setField("street")}
                />
                <TextInput
                  placeholder="Telefono di contatto"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.addressInput}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  value={phone}
                  onChangeText={setPhone}
                />
                <View style={styles.addressRow}>
                  <ZoneSelect
                    value={address.city}
                    onChange={setZone}
                    style={[styles.addressInput, styles.addressCity]}
                  />
                  <View
                    style={[
                      styles.addressInput,
                      styles.addressZip,
                      styles.zipReadonly,
                    ]}
                  >
                    <ThemedText type="small" themeColor="textSecondary">
                      CAP
                    </ThemedText>
                    <ThemedText type="smallBold">{address.zip}</ThemedText>
                  </View>
                </View>
                <TextInput
                  placeholder="Note per il rider (scala, citofono…)"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.addressInput}
                  value={address.notes}
                  onChangeText={setField("notes")}
                />
              </View>

              {/* FASCIA DI CONSEGNA — solo se il ristorante gestisce gli orari */}
              {slotsConfigured && (
                <SlotPicker
                  groups={slotGroups}
                  selected={slot}
                  onSelect={setSlot}
                  loading={slotsQuery.isLoading}
                  hasFree={hasFreeSlot}
                  styles={styles}
                  colors={colors}
                />
              )}

              {/* RIEPILOGO */}
              <View style={styles.summary}>
                <SummaryRow label="Subtotale" value={cart.subtotal} />
                <SummaryRow label="Consegna" value={deliveryFee} />
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <ThemedText type="smallBold">Totale</ThemedText>
                  <ThemedText type="default" style={styles.total}>
                    € {total.toFixed(2)}
                  </ThemedText>
                </View>
              </View>
            </ScrollView>

            {/* CHECKOUT */}
            <SafeAreaView edges={["bottom"]} style={styles.footer}>
              <Pressable
                style={[
                  styles.checkout,
                  (createOrder.isPending || verifying) && styles.checkoutDisabled,
                ]}
                onPress={checkout}
                disabled={createOrder.isPending || verifying}
              >
                <ThemedText type="default" style={styles.checkoutText}>
                  {verifying
                    ? "Verifica indirizzo..."
                    : createOrder.isPending
                      ? "Invio in corso..."
                      : "Procedi al pagamento"}
                </ThemedText>
              </Pressable>
            </SafeAreaView>
          </>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

// Riga "etichetta ........ valore €". Layout-only, nessun colore proprio.
function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={summaryRowStyle}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        € {value.toFixed(2)}
      </ThemedText>
    </View>
  );
}

const summaryRowStyle = {
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
};

// Selettore delle fasce di consegna, raggruppate per giorno (Oggi/Domani). Le
// fasce piene sono disabilitate: gli ordini si distribuiscono nel tempo.
function SlotPicker({
  groups,
  selected,
  onSelect,
  loading,
  hasFree,
  styles,
  colors,
}: {
  groups: AvailableSlotGroup[];
  selected: string | null;
  onSelect: (start: string) => void;
  loading: boolean;
  hasFree: boolean;
  styles: ReturnType<typeof createStyles>;
  colors: Palette;
}) {
  return (
    <View style={styles.slotCard}>
      <View style={styles.addressHeader}>
        <SymbolView name="clock" size={18} tintColor={colors.accent} />
        <ThemedText type="smallBold">Quando vuoi la consegna?</ThemedText>
      </View>

      {loading ? (
        <ThemedText type="small" themeColor="textSecondary">
          Carico le fasce disponibili…
        </ThemedText>
      ) : !hasFree ? (
        <ThemedText type="small" themeColor="textSecondary">
          Nessuna fascia disponibile al momento. Riprova più tardi.
        </ThemedText>
      ) : (
        groups.map((group) => (
          <View key={group.label} style={styles.slotGroup}>
            <ThemedText type="small" themeColor="textSecondary">
              {group.label}
            </ThemedText>
            <View style={styles.slotRow}>
              {group.slots.map((s) => {
                const isSelected = s.start === selected;
                return (
                  <Pressable
                    key={s.start}
                    disabled={s.full}
                    onPress={() => onSelect(s.start)}
                    style={[
                      styles.slotChip,
                      isSelected && styles.slotChipSelected,
                      s.full && styles.slotChipFull,
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={[
                        styles.slotChipText,
                        isSelected && styles.slotChipTextSelected,
                        s.full && styles.slotChipTextFull,
                      ]}
                    >
                      {formatSlotTime(s.start)}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    screen: { flex: 1 },
    safe: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.three,
    },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.three,
    },
    content: {
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.four,
      gap: Spacing.three,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.three,
      padding: Spacing.two,
      borderRadius: Radii.card,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    itemImage: {
      width: 64,
      height: 64,
      borderRadius: Radii.sm,
    },
    itemInfo: {
      flex: 1,
      gap: Spacing.half,
    },
    price: {
      color: colors.accent,
      fontWeight: "700",
    },
    stepper: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.two,
    },
    stepBtn: {
      width: 28,
      height: 28,
      borderRadius: Radii.sm,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.accent,
    },
    qty: {
      minWidth: 16,
      textAlign: "center",
    },
    addressCard: {
      gap: Spacing.two,
      padding: Spacing.three,
      borderRadius: Radii.card,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    addressHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.two,
      marginBottom: Spacing.one,
    },
    addressInput: {
      height: 48,
      paddingHorizontal: Spacing.three,
      borderRadius: Radii.sm,
      backgroundColor: colors.background,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      color: colors.text,
      fontSize: 15,
    },
    addressRow: {
      flexDirection: "row",
      gap: Spacing.two,
    },
    slotCard: {
      gap: Spacing.two,
      padding: Spacing.three,
      borderRadius: Radii.card,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    slotGroup: {
      gap: Spacing.one,
    },
    slotRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.two,
    },
    slotChip: {
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      borderRadius: Radii.sm,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    slotChipSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    slotChipFull: {
      opacity: 0.4,
    },
    slotChipText: {
      color: colors.text,
      fontWeight: "600",
    },
    slotChipTextSelected: {
      color: colors.background,
    },
    slotChipTextFull: {
      textDecorationLine: "line-through",
      color: colors.textSecondary,
    },
    addressCity: {
      flex: 1,
    },
    addressZip: {
      width: 96,
    },
    zipReadonly: {
      alignItems: "center",
      justifyContent: "center",
    },
    summary: {
      gap: Spacing.two,
      paddingTop: Spacing.two,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginVertical: Spacing.one,
    },
    total: {
      color: colors.accent,
      fontWeight: "700",
      fontSize: 18,
    },
    footer: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.two,
    },
    checkout: {
      height: 56,
      borderRadius: Radii.card,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
    },
    checkoutDisabled: {
      opacity: 0.6,
    },
    checkoutText: {
      color: colors.background,
      fontWeight: "700",
      fontSize: 16,
    },
  });
