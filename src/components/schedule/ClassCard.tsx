import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { GuaraníSchedule } from "../../lib/types/portal";
import { shadows, borderRadius, spacing } from "../../theme";

interface ClassCardProps {
  item: GuaraníSchedule;
}

export function ClassCard({ item }: ClassCardProps) {
  const theme = useTheme();

  return (
    <Surface
      style={[styles.card, { backgroundColor: theme.colors.surface }, shadows.sm]}
      elevation={0}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="school"
          size={22}
          color={theme.colors.primary}
        />
      </View>
      <View style={styles.info}>
        <Text
          variant="titleSmall"
          style={[styles.name, { color: theme.colors.onSurface }]}
          numberOfLines={2}
        >
          {item.materia_nombre}
        </Text>
        <View style={styles.details}>
          <View style={[styles.chip, { backgroundColor: `${theme.colors.primary}18` }]}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={theme.colors.primary} />
            <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: "600" }}>
              {item.hora_inicio} - {item.hora_fin}
            </Text>
          </View>
          {item.aula ? (
            <View style={[styles.chip, { backgroundColor: `${theme.colors.secondary}18` }]}>
              <MaterialCommunityIcons name="map-marker-outline" size={14} color={theme.colors.secondary} />
              <Text variant="labelSmall" style={{ color: theme.colors.secondary, fontWeight: "600" }}>
                {item.aula}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: "rgba(27, 94, 32, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: "700",
    marginBottom: 6,
  },
  details: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    gap: 4,
  },
});
