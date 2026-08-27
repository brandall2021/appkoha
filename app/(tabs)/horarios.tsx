import React, { useState, useMemo, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { Text, useTheme, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getGuaraníSchedule } from "../../src/lib/api/auth";
import { GuaraníSchedule } from "../../src/lib/types/portal";
import { shadows, borderRadius, spacing } from "../../src/theme";
import { DaySelector } from "../../src/components/schedule/DaySelector";
import { ClassCard } from "../../src/components/schedule/ClassCard";
import { ScheduleSkeleton } from "../../src/components/schedule/ScheduleSkeleton";

const DAY_ORDER: Record<string, number> = {
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
};

function getCurrentDay(): string {
  const day = new Date().getDay();
  const map: Record<number, string> = { 1: "lunes", 2: "martes", 3: "miercoles", 4: "jueves", 5: "viernes" };
  return map[day] ?? "lunes";
}

export default function HorariosTab() {
  const theme = useTheme();
  const [selectedDay, setSelectedDay] = useState(getCurrentDay);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["guarani", "schedule"],
    queryFn: getGuaraníSchedule,
  });

  const schedule: GuaraníSchedule[] = data?.data ?? [];

  const filtered = useMemo(() => {
    const dayClasses = schedule.filter(
      (item) => item.dia.toLowerCase() === selectedDay
    );
    dayClasses.sort((a, b) => {
      const [ah, am] = a.hora_inicio.split(":").map(Number);
      const [bh, bm] = b.hora_inicio.split(":").map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    });
    return dayClasses;
  }, [schedule, selectedDay]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const dayLabel = selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
    >
      <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
        Horarios
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.outline, marginBottom: spacing.md }}>
        Tu cronograma de cursada
      </Text>

      {isLoading ? (
        <ScheduleSkeleton />
      ) : isError ? (
        <Surface style={[styles.emptyCard, { backgroundColor: theme.colors.errorContainer }]}>
          <MaterialCommunityIcons name="alert-circle" size={28} color={theme.colors.error} />
          <Text variant="bodyMedium" style={{ color: theme.colors.error, marginTop: 8 }}>
            No se pudieron cargar los horarios
          </Text>
        </Surface>
      ) : (
        <>
          <DaySelector selectedDay={selectedDay} onDaySelect={setSelectedDay} />

          {filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="calendar-blank" size={48} color={theme.colors.outline} />
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginTop: spacing.md, fontWeight: "600" }}>
                Sin clases el {dayLabel}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.outline, marginTop: 4, textAlign: "center" }}>
                No tenés materias programadas para este día
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {filtered.map((item) => (
                <ClassCard key={`${item.materia_codigo}-${item.hora_inicio}`} item={item} />
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: spacing.xl },
  title: { paddingHorizontal: spacing.lg, fontWeight: "800", letterSpacing: -0.3 },
  emptyCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});
