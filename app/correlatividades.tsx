import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, useTheme, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { shadows, borderRadius, spacing } from "../src/theme";

export default function CorrelatividadesRoute() {
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
        Correlatividades
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.outline, marginBottom: spacing.lg }}>
        Estado de correlativas por materia
      </Text>

      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }, shadows.sm]}>
        <MaterialCommunityIcons name="link-variant" size={28} color={theme.colors.outline} />
        <Text variant="bodyMedium" style={{ color: theme.colors.outline, marginTop: 8 }}>
          Proximamente: consulta de correlativas
        </Text>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  title: { fontWeight: "800", letterSpacing: -0.3 },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
});
