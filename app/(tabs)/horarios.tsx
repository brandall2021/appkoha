import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, useTheme, ActivityIndicator, List, Divider, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getGuaraníSchedule } from "../../src/lib/api/auth";
import { GuaraníSchedule } from "../../src/lib/types/portal";
import { shadows, borderRadius, spacing } from "../../src/theme";

export default function HorariosTab() {
  const theme = useTheme();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["guarani", "schedule"],
    queryFn: getGuaraníSchedule,
  });

  const schedule: GuaraníSchedule[] = data?.data ?? [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
        Horarios
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.outline, marginBottom: spacing.lg }}>
        Tu cronograma de cursada
      </Text>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : isError ? (
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }, shadows.sm]}>
          <MaterialCommunityIcons name="alert-circle" size={28} color={theme.colors.error} />
          <Text variant="bodyMedium" style={{ color: theme.colors.error, marginTop: 8 }}>
            No se pudieron cargar los horarios
          </Text>
        </Surface>
      ) : schedule.length === 0 ? (
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }, shadows.sm]}>
          <MaterialCommunityIcons name="calendar-blank" size={28} color={theme.colors.outline} />
          <Text variant="bodyMedium" style={{ color: theme.colors.outline, marginTop: 8 }}>
            No hay horarios disponibles
          </Text>
        </Surface>
      ) : (
        <Surface style={[styles.card, { backgroundColor: theme.colors.surface }, shadows.sm]}>
          {schedule.map((item, i) => (
            <View key={`${item.materia_codigo}-${i}`}>
              {i > 0 && <Divider />}
              <List.Item
                title={item.materia_nombre}
                description={`${item.dia} · ${item.hora_inicio} - ${item.hora_fin} · ${item.aula}`}
                left={(props) => (
                  <List.Icon {...props} icon="calendar-clock" color={theme.colors.primary} />
                )}
                titleStyle={{ fontWeight: "600" }}
              />
            </View>
          ))}
        </Surface>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  title: { fontWeight: "800", letterSpacing: -0.3 },
  center: { paddingVertical: 48, alignItems: "center" },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
  },
});
