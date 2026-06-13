import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OrderCard } from "@/components/order-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useOrders } from "@/hooks/use-orders";
import { useTheme } from "@/hooks/use-theme";

export default function OrdersScreen() {
  const colors = useTheme();
  const { data: orders = [], isLoading, isError, refetch, isRefetching } = useOrders();

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.safe}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <ThemedText type="small" themeColor="textSecondary">
              Impossibile caricare gli ordini.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <OrderCard order={item} />}
            ListHeaderComponent={
              <ThemedText type="subtitle" style={styles.title}>
                I tuoi ordini
              </ThemedText>
            }
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary">
                Nessun ordine ancora. Fai il tuo primo ordine dal menù!
              </ThemedText>
            }
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={colors.accent}
              />
            }
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  title: {
    marginBottom: Spacing.one,
  },
});
