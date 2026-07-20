import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text, useTheme, Card, Button, Avatar, Divider,
  List, Switch, Surface, IconButton,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppStore } from "../../stores/appStore";
import { getKohaAPI } from "../../api/koha";
import { Checkout, Hold } from "../../types";

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { patron, logout, isDarkMode, toggleTheme } = useAppStore();
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [holds, setHolds] = useState<Hold[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patron) loadPatronData();
  }, [patron]);

  const loadPatronData = async () => {
    if (!patron) return;
    setLoading(true);
    try {
      const api = getKohaAPI();
      const [c, h] = await Promise.all([
        api.getPatronCheckouts(patron.patron_id).catch(() => []),
        api.getPatronHolds(patron.patron_id).catch(() => []),
      ]);
      setCheckouts(Array.isArray(c) ? c : []);
      setHolds(Array.isArray(h) ? h : []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!patron) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="account-off" size={64} color={theme.colors.outline} />
        <Text variant="titleMedium" style={{ marginTop: 16 }}>
          No has iniciado sesion
        </Text>
        <Button mode="contained" onPress={() => router.push("/login")} style={{ marginTop: 16 }}>
          Iniciar sesion
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
        <Avatar.Text
          size={72}
          label={`${(patron.firstname || "")[0] || ""}${(patron.surname || "")[0] || ""}`}
          style={{ backgroundColor: theme.colors.primary }}
        />
        <Text variant="titleLarge" style={[styles.name, { color: theme.colors.onPrimaryContainer }]}>
          {patron.firstname} {patron.surname}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer }}>
          {patron.email || patron.userid}
        </Text>
        {patron.cardnumber && (
          <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer, marginTop: 4 }}>
            Socio: {patron.cardnumber}
          </Text>
        )}
      </Surface>

      <View style={styles.stats}>
        <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.statContent}>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: "800" }}>
              {checkouts.length}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              Prestamos activos
            </Text>
          </Card.Content>
        </Card>
        <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.statContent}>
            <Text variant="headlineSmall" style={{ color: "#E65100", fontWeight: "800" }}>
              {holds.length}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              Reservas
            </Text>
          </Card.Content>
        </Card>
        <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content style={styles.statContent}>
            <Text variant="headlineSmall" style={{ color: "#C62828", fontWeight: "800" }}>
              {patron.overdues_count || 0}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              Vencidos
            </Text>
          </Card.Content>
        </Card>
      </View>

      {checkouts.length > 0 && (
        <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Prestamos activos
            </Text>
            {checkouts.slice(0, 5).map((checkout, i) => (
              <View key={checkout.checkout_id || i} style={styles.listItem}>
                <MaterialCommunityIcons name="book" size={20} color={theme.colors.primary} />
                <View style={styles.listItemText}>
                  <Text variant="bodyMedium" numberOfLines={1}>
                    {checkout.item?.barcode || `Item ${checkout.item_id}`}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Vence: {new Date(checkout.due_date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      <Card style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Configuracion
          </Text>
          <View style={styles.settingRow}>
            <List.Item
              title="Modo oscuro"
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => <Switch value={isDarkMode} onValueChange={toggleTheme} />}
            />
          </View>
          <Divider />
          <List.Item
            title="Direccion del servidor"
            description={useAppStore.getState().kohaUrl}
            left={(props) => <List.Icon {...props} icon="server" />}
          />
          <Divider />
          <List.Item
            title="Cerrar sesion"
            left={(props) => <List.Icon {...props} icon="logout" color="#D32F2F" />}
            onPress={handleLogout}
            titleStyle={{ color: "#D32F2F" }}
          />
        </Card.Content>
      </Card>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  name: {
    fontWeight: "700",
    marginTop: 12,
  },
  stats: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginTop: -16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
  },
  statContent: {
    alignItems: "center",
    paddingVertical: 12,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 8,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  listItemText: {
    flex: 1,
  },
  settingRow: {},
});
