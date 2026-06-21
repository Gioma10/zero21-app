import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Radii, Shadows, Spacing, type Palette } from "@/constants/theme";
import { availableZones } from "@/constants/zones";
import { useTheme } from "@/hooks/use-theme";

// Selettore di zona di consegna. Mostra le zone attive (oggi solo Arzachena);
// quando se ne aggiungono altre in constants/zones.ts compaiono qui da sole.
export function ZoneSelect({
  value,
  onChange,
  style,
}: {
  value: string;
  onChange: (zoneName: string) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [open, setOpen] = useState(false);
  const zones = availableZones();

  return (
    <>
      <Pressable
        style={[style, styles.trigger]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Seleziona la zona di consegna"
      >
        <ThemedText
          type="default"
          style={{ color: value ? colors.text : colors.textSecondary }}
          numberOfLines={1}
        >
          {value || "Zona"}
        </ThemedText>
        <SymbolView
          name="chevron.up.chevron.down"
          size={14}
          tintColor={colors.textSecondary}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <ThemedText type="smallBold" style={styles.sheetTitle}>
              Zona di consegna
            </ThemedText>
            {zones.map((z) => {
              const selected = z.name === value;
              return (
                <Pressable
                  key={z.name}
                  style={styles.option}
                  onPress={() => {
                    onChange(z.name);
                    setOpen(false);
                  }}
                >
                  <View style={styles.optionInfo}>
                    <ThemedText type="default">{z.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      CAP {z.zip}
                    </ThemedText>
                  </View>
                  {selected && (
                    <SymbolView
                      name="checkmark"
                      size={16}
                      tintColor={colors.accent}
                    />
                  )}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    trigger: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: Radii.lg,
      borderTopRightRadius: Radii.lg,
      padding: Spacing.three,
      paddingBottom: Spacing.six,
      gap: Spacing.one,
      ...Shadows.soft,
    },
    sheetTitle: {
      paddingVertical: Spacing.two,
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.two,
      borderRadius: Radii.card,
    },
    optionInfo: {
      gap: 2,
    },
  });
