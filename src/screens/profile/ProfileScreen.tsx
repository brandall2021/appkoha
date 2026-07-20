import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, Pressable, Animated } from "react-native";
import {
  Text, useTheme, Button, Avatar, Divider,
  List, Switch, Surface,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppStore } from "../../stores/appStore";
import { getKohaAPI } from "../../api/koha";
import { Checkout, Hold } from "../../types";
import { shadows, borderRadius } from "../../theme";

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { patron, logout, isDarkMode, toggleTheme } = useAppStore();
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [holds, setHolds] = useState<Hold[]>([]);
  const [loading, setLoading] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (patron) loadPatronData();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 100,
        useNativeDriver: true,
      }),
    ]).start();
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
        <Text variant="titleMedium" style={{ marginTop: 16, color: theme.colors.onBackground }}>
          No has iniciado sesion
        </Text>
        <Button mode="contained" onPress={() => router.push("/login")} style={{ marginTop: 16, borderRadius: borderRadius.lg }}>
          Iniciar sesion
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Profile Header */}
        <View style={[styles.header, { backgroundColor: isDarkMode ? "#1A2E1A" : "#E8F5E9" }]}>
          <View style={styles.avatarContainer}>
            <Avatar.Text
              size={80}
              label={`${(patron.firstname || "")[0] || ""}${(patron.surname || "")[0] || ""}`}
              style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
              labelStyle={{ fontSize: 28, fontWeight: "700" }}
            />
            <View style={[styles.onlineIndicator, { backgroundColor: "#4CAF50" }]} />
          </View>
          <Text variant="titleLarge" style={[styles.name, { color: theme.colors.onBackground }]}>
            {patron.firstname} {patron.surname}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
            {patron.email || patron.userid}
          </Text>
          {patron.cardnumber && (
            <View style={[styles.cardNumber, { backgroundColor: `${theme.colors.primary}12` }]}>
              <MaterialCommunityIcons name="card-account-details" size={14} color={theme.colors.primary} />
              <Text variant="bodySmall" style={{ color: theme.colors.primary, marginLeft: 4, fontWeight: "600" }}>
                Socio #{patron.cardnumber}
              </Text>
            </View>
          )}
        </View>

        {/* Stats Cards */}
        <View style={styles.stats}>
          {[
            { value: checkouts.length, label: "Prestamos", icon: "book-open-variant", color: theme.colors.primary },
            { value: holds.length, label: "Reservas", icon: "bookmark-plus", color: "#E65100" },
            { value: patron.overdues_count || 0, label: "Vencidos", icon: "alert-circle", color: "#C62828" },
          ].map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: theme.colors.surface }, shadows.sm]}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}12` }]}>
                <MaterialCommunityIcons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text variant="headlineSmall" style={{ color: stat.color, fontWeight: "800" }}>
                {stat.value}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Active Loans */}
        {checkouts.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }, shadows.sm]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="book-open-variant" size={18} color={theme.colors.primary} />
              <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Prestamos activos
              </Text>
            </View>
            {checkouts.slice(0, 5).map((checkout, i) => (
              <View key={checkout.checkout_id || i} style={[styles.listItem, { borderBottomColor: theme.colors.outlineVariant }]}>
                <View style={[styles.listItemIcon, { backgroundColor: `${theme.colors.primary}08` }]}>
                  <MaterialCommunityIcons name="book" size={16} color={theme.colors.primary} />
                </View>
                <View style={styles.listItemText}>
                  <Text variant="bodyMedium" numberOfLines={1} style={{ color: theme.colors.onSurface, fontWeight: "500" }}>
                    {checkout.item?.barcode || `Item ${checkout.item_id}`}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Vence: {new Date(checkout.due_date).toLocaleDateString()}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={18} color={theme.colors.outline} />
              </View>
            ))}
          </View>
        )}

        {/* Settings */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }, shadows.sm]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cog" size={18} color={theme.colors.primary} />
            <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Configuracion
            </Text>
          </View>

          {/* Dark Mode Toggle */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: "rgba(123, 31, 162, 0.08)" }]}>
                <MaterialCommunityIcons name="theme-light-dark" size={18} color="#7B1FA2" />
              </View>
              <View>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: "500" }}>
                  Modo oscuro
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  Cambia la apariencia de la app
                </Text>
              </View>
            </View>
            <Switch value={isDarkMode} onValueChange={toggleTheme} />
          </View>

          <Divider style={styles.settingDivider} />

          {/* Server URL */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: "rgba(0, 137, 123, 0.08)" }]}>
                <MaterialCommunityIcons name="server" size={18} color="#00897B" />
              </View>
              <View>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: "500" }}>
                  Servidor Koha
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }} numberOfLines={1}>
                  {useAppStore.getState().kohaUrl}
                </Text>
              </View>
            </View>
          </View>

          <Divider style={styles.settingDivider} />

          {/* Logout */}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.settingItem,
              pressed && { backgroundColor: "rgba(211, 47, 47, 0.04)" },
            ]}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: "rgba(211, 47, 47, 0.08)" }]}>
                <MaterialCommunityIcons name="logout" size={18} color="#D32F2F" />
              </View>
              <Text variant="bodyMedium" style={{ color: "#D32F2F", fontWeight: "500" }}>
                Cerrar sesion
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color="#D32F2F" />
          </Pressable>
        </View>

        <View style={{ height: 32 }} />
      </Animated.View>
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
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    borderRadius: 40,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  name: {
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardNumber: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    marginTop: 12,
  },
  stats: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginTop: -20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: 14,
    alignItems: "center",
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: borderRadius.lg,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontWeight: "700",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  listItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  listItemText: {
    flex: 1,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  settingDivider: {
    backgroundColor: "rgba(0,0,0,0.04)",
  },
});
