import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import {
  Text, useTheme, Card, Button, Chip, IconButton, Divider,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getKohaAPI } from "../../api/koha";
import { useAppStore } from "../../stores/appStore";
import { Checkout } from "../../types";
import EmptyState from "../../components/EmptyState";

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
            <Text variant="titleLarge" style={{ fontWeight: "700" }}>
              Mis prestamos
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              {checkouts.length} prestamo(s) activo(s)
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="book-check"
            title="Sin prestamos activos"
            description="No tienes libros prestados actualmente"
          />
        }
        renderItem={({ item }) => {
          const overdue = isOverdue(item.due_date);
          return (
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text variant="titleSmall" numberOfLines={2}>
                      {item.item?.barcode || `Item #${item.item_id}`}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                      Prestado: {new Date(item.checkout_date).toLocaleDateString()}
                    </Text>
                  </View>
                  {overdue ? (
                    <Chip compact style={{ backgroundColor: "#FFEBEE" }} textStyle={{ color: "#C62828" }}>
                      Vencido
                    </Chip>
                  ) : (
                    <Chip compact style={{ backgroundColor: "#E8F5E9" }} textStyle={{ color: "#2E7D32" }}>
                      Activo
                    </Chip>
                  )}
                </View>
                <Divider style={{ marginVertical: 8 }} />
                <View style={styles.cardFooter}>
                  <View>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                      Fecha de devolucion
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={{ color: overdue ? "#C62828" : theme.colors.onSurface, fontWeight: "600" }}
                    >
                      {new Date(item.due_date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => handleRenew(item.checkout_id)}
                    icon="refresh"
                    textColor={theme.colors.primary}
                  >
                    Renovar
                  </Button>
                </View>
              </Card.Content>
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardInfo: { flex: 1, marginRight: 8 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
