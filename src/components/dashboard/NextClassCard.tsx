import React, { useMemo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text, useTheme, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getGuaraníSchedule } from "../../lib/api/auth";
import type { GuaraníSchedule } from "../../lib/types/portal";
import { shadows, borderRadius, spacing } from "../../theme";

const DAY_MAP: Record<string, number> = {
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  domingo: 0,
};

function getNextClass(schedule: GuaraníSchedule[]): GuaraníSchedule | null {
  if (schedule.length === 0) return null;

  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const upcoming: GuaraníSchedule[] = [];
  const later: GuaraníSchedule[] = [];

  for (const item of schedule) {
    const dayNum = DAY_MAP[item.dia.toLowerCase()];
    if (dayNum === undefined) continue;

    const [h, m] = item.hora_inicio.split(":").map(Number);
    const itemMinutes = h * 60 + m;

    if (dayNum > currentDay || (dayNum === currentDay && itemMinutes > currentMinutes)) {
      upcoming.push(item);
    } else {
      later.push(item);
    }
  }

  upcoming.sort((a, b) => {
    const da = DAY_MAP[a.dia.toLowerCase()]!;
    const db = DAY_MAP[b.dia.toLowerCase()]!;
    if (da !== db) return da - db;
    const [ah, am] = a.hora_inicio.split(":").map(Number);
    const [bh, bm] = b.hora_inicio.split(":").map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });

  if (upcoming.length > 0) return upcoming[0];

  later.sort((a, b) => {
    const da = DAY_MAP[a.dia.toLowerCase()]!;
    const db = DAY_MAP[b.dia.toLowerCase()]!;
    if (da !== db) return da - db;
    const [ah, am] = a.hora_inicio.split(":").map(Number);
    const [bh, bm] = b.hora_inicio.split(":").map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });

  return later[0] ?? null;
}

export default function NextClassCard() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["guarani", "schedule"],
    queryFn: getGuaraníSchedule,
  });

  const schedule: GuaraníSchedule[] = data?.data ?? [];
  const nextClass = useMemo(() => getNextClass(schedule), [schedule]);

  if (isLoading) {
    return (
      <Surface style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
        <View style={styles.loadingRow}>
          <View style={[styles.loadingPulse, { backgroundColor: theme.colors.outlineVariant }]} />
          <View style={{ flex: 1 }}>
            <View style={[styles.loadingBar, { backgroundColor: theme.colors.outlineVariant, width: "60%" }]} />
            <View style={[styles.loadingBar, { backgroundColor: theme.colors.outlineVariant, width: "40%", marginTop: 6 }]} />
          </View>
        </View>
      </Surface>
    );
  }

  if (!nextClass) {
    return null;
  }

  return (
    <Pressable
      onPress={() => router.push("/horarios")}
      style={({ pressed }) => [
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.85 },
      ]}
    >
      <Surface
        style={[styles.card, { backgroundColor: theme.colors.primaryContainer }]}
        elevation={0}
      >
        <View style={styles.header}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={theme.colors.primary} />
          <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Proxima clase
          </Text>
        </View>
        <Text variant="titleMedium" style={[styles.subjectName, { color: theme.colors.onPrimaryContainer }]} numberOfLines={2}>
          {nextClass.materia_nombre}
        </Text>
        <View style={styles.detailsRow}>
          <View style={[styles.chip, { backgroundColor: `${theme.colors.primary}18` }]}>
            <MaterialCommunityIcons name="calendar" size={14} color={theme.colors.primary} />
            <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: "600" }}>
              {nextClass.dia}
            </Text>
          </View>
          <View style={[styles.chip, { backgroundColor: `${theme.colors.primary}18` }]}>
            <MaterialCommunityIcons name="clock" size={14} color={theme.colors.primary} />
            <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: "600" }}>
              {nextClass.hora_inicio} - {nextClass.hora_fin}
            </Text>
          </View>
          {nextClass.aula && (
            <View style={[styles.chip, { backgroundColor: `${theme.colors.primary}18` }]}>
              <MaterialCommunityIcons name="map-marker" size={14} color={theme.colors.primary} />
              <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: "600" }}>
                {nextClass.aula}
              </Text>
            </View>
          )}
        </View>
      </Surface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.sm,
  },
  subjectName: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: spacing.md,
  },
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
    gap: 5,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  loadingPulse: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
  },
  loadingBar: {
    height: 12,
    borderRadius: 6,
  },
});
