import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Pressable } from "react-native";
import {
  Text, useTheme, Button, Chip, Divider,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { getKohaAPI } from "../../api/koha";
import { useAppStore } from "../../stores/appStore";
import { Checkout } from "../../types";
import EmptyState from "../../components/EmptyState";
import { shadows, borderRadius } from "../../theme";

export default function LoansScreen() {
  const theme = useTheme();
  const { patron } = useAppStore();
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCheckouts();
  }, []);

  const loadCheckouts = async () => {
    if (!patron) return;
    setLoading(true);
    try {
      const api = getKohaAPI();
      const data = await api.getPatronCheckouts(patron.patron_id);
      setCheckouts(Array.isArray(data) ? data : []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRenew = async (checkoutId: number) => {
    try {
      const api = getKohaAPI();
      await api.renewCheckout(checkoutId);
      loadCheckouts();
    } catch (err: any) {
      console.error("Renewal error:", err);
    }
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (!patron) {
    return (
      <EmptyState
        icon="account-off"
        title="Inicia sesion"
        description="Inicia sesion para ver tus prestamos"
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={checkouts}
        keyExtractor={(item) => String(item.checkout_id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadCheckouts(); }} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View>
                <Text variant="titleLarge" style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
                  Mis prestamos
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  {checkouts.length} prestamo(s) activo(s)
                </Text>
              </View>
              {checkouts.length > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.badgeText}>{checkouts.length}</Text>
                </View>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="book-check"
            title="Sin prestamos activos"
            description="No tienes libros prestados actualmente"
          />
        }
        renderItem={({ item, index }) => {
          const overdue = isOverdue(item.due_date);
          const daysLeft = getDaysUntilDue(item.due_date);

          return (
            <Animated.View entering={FadeInDown.delay(index * 70).springify()}>
              <View style={[styles.card, { backgroundColor: theme.colors.surface }, shadows.sm]}>
                {/* Status Indicator */}
                <View style={[styles.statusIndicator, { backgroundColor: overdue ? "#EF5350" : "#4CAF50" }]} />

                <View style={styles.cardContent}>
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardInfo}>
                      <View style={styles.iconContainer}>
                        <MaterialCommunityIcons
                          name="book-open-page-variant"
                          size={20}
                          color={theme.colors.primary}
                        />
                      </View>
                      <View style={styles.titleColumn}>
                        <Text variant="titleSmall" numberOfLines={2} style={{ color: theme.colors.onSurface, fontWeight: "600" }}>
                          {item.item?.barcode || `Item #${item.item_id}`}
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                          Prestado: {new Date(item.checkout_date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Chip
                      compact
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor: overdue ? "rgba(239, 83, 80, 0.12)" : "rgba(76, 175, 80, 0.12)",
                        },
                      ]}
                      textStyle={{
                        color: overdue ? "#EF5350" : "#4CAF50",
                        fontWeight: "600",
                        fontSize: 10,
                      }}
                    >
                      {overdue ? "Vencido" : "Activo"}
                    </Chip>
                  </View>

                  <Divider style={styles.divider} />

                  {/* Card Footer */}
                  <View style={styles.cardFooter}>
                    <View style={styles.dueInfo}>
                      <MaterialCommunityIcons
                        name={overdue ? "alert-circle" : "clock-outline"}
                        size={16}
                        color={overdue ? "#EF5350" : theme.colors.outline}
                      />
                      <View style={{ marginLeft: 6 }}>
                        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                          Devolucion
                        </Text>
                        <Text
                          variant="bodyMedium"
                          style={{
                            color: overdue ? "#EF5350" : theme.colors.onSurface,
                            fontWeight: "600",
                          }}
                        >
                          {new Date(item.due_date).toLocaleDateString()}
                          {!overdue && daysLeft >= 0 && (
                            <Text style={{ color: theme.colors.outline, fontWeight: "400" }}>
                              {" "}(en {daysLeft} dia{daysLeft !== 1 ? "s" : ""})
                            </Text>
                          )}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => handleRenew(item.checkout_id)}
                      style={({ pressed }) => [
                        styles.renewButton,
                        { borderColor: theme.colors.primary },
                        pressed && { backgroundColor: `${theme.colors.primary}12` },
                      ]}
                    >
                      <MaterialCommunityIcons name="refresh" size={16} color={theme.colors.primary} />
                      <Text style={[styles.renewButtonText, { color: theme.colors.primary }]}>
                        Renovar
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Animated.View>
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: {
    paddingBottom: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: borderRadius.lg,
    flexDirection: "row",
    overflow: "hidden",
  },
  statusIndicator: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    marginRight: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: "rgba(27, 94, 32, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  titleColumn: {
    flex: 1,
  },
  statusChip: {
    height: 26,
    borderRadius: borderRadius.pill,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dueInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  renewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    borderWidth: 1.5,
    gap: 4,
  },
  renewButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
