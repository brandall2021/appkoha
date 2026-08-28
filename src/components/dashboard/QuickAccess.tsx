import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text, useTheme, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { shadows, borderRadius, spacing } from "../../theme";

interface QuickAccessItem {
  icon: string;
  label: string;
  route: string;
  color: string;
}

const ITEMS: QuickAccessItem[] = [
  { icon: "school", label: "Guaraní", route: "/guarani", color: "#1B5E20" },
  { icon: "magnify", label: "Buscar", route: "/search", color: "#00695C" },
  { icon: "newspaper-variant-outline", label: "Novedades", route: "/novedades", color: "#E65100" },
  { icon: "link-variant", label: "Links Utiles", route: "/links-utiles", color: "#7B1FA2" },
];

export default function QuickAccess() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
        Accesos rapidos
      </Text>
      <View style={styles.grid}>
        {ITEMS.map((item) => (
          <Pressable
            key={item.route + item.label}
            onPress={() => router.push(item.route as any)}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: theme.colors.surface },
              shadows.sm,
              pressed && { transform: [{ scale: 0.96 }], opacity: 0.85 },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${item.color}15` }]}>
              <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
            </View>
            <Text variant="bodySmall" style={[styles.label, { color: theme.colors.onSurface }]} numberOfLines={2}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: spacing.sm,
    fontSize: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: "47%",
    borderRadius: borderRadius.lg,
    padding: 16,
    alignItems: "center",
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 13,
  },
});
