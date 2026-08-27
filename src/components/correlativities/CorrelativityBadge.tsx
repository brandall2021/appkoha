import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { borderRadius } from "../../theme";

type BadgeStatus = "aprobada" | "habilitada" | "no-habilitada";

interface Props {
  status: BadgeStatus;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  BadgeStatus,
  { bg: string; fg: string; icon: string; label: string }
> = {
  aprobada: {
    bg: "rgba(46, 125, 50, 0.12)",
    fg: "#2E7D32",
    icon: "check-circle",
    label: "Aprobada",
  },
  habilitada: {
    bg: "rgba(255, 152, 0, 0.12)",
    fg: "#E65100",
    icon: "alert-circle-outline",
    label: "Habilitada",
  },
  "no-habilitada": {
    bg: "rgba(211, 47, 47, 0.12)",
    fg: "#D32F2F",
    icon: "close-circle",
    label: "No habilitada",
  },
};

export function getCorrelativityStatus(
  aprobada: boolean,
  habilitada: boolean
): BadgeStatus {
  if (aprobada) return "aprobada";
  if (habilitada) return "habilitada";
  return "no-habilitada";
}

export default function CorrelativityBadge({ status, size = "md" }: Props) {
  const theme = useTheme();
  const config = STATUS_CONFIG[status];
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        size === "sm" && styles.badgeSm,
      ]}
    >
      <MaterialCommunityIcons
        name={config.icon as any}
        size={iconSize}
        color={config.fg}
      />
      <Text
        variant={size === "sm" ? "labelSmall" : "labelMedium"}
        style={[styles.label, { color: config.fg }]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    gap: 5,
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  label: {
    fontWeight: "600",
  },
});
