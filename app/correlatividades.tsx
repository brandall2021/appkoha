import React from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { getGuaraníCorrelativities } from "../src/lib/api/auth";
import type { GuaraníCorrelativity } from "../src/lib/types/portal";
import SubjectCard from "../src/components/correlativities/SubjectCard";
import { SkeletonPlaceholder } from "../src/components/Skeleton";
import EmptyState from "../src/components/EmptyState";
import { spacing, borderRadius } from "../src/theme";

function CorrelatividadesSkeleton() {
  return (
    <View style={skeletonStyles.container}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={skeletonStyles.card}>
          <View style={skeletonStyles.cardContent}>
            <View style={{ flex: 1 }}>
              <SkeletonPlaceholder width="70%" height={16} borderRadius={4} />
              <SkeletonPlaceholder width="40%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
            </View>
            <SkeletonPlaceholder width={90} height={26} borderRadius={13} />
          </View>
        </View>
      ))}
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  container: { paddingTop: spacing.md },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default function CorrelatividadesRoute() {
  const theme = useTheme();
  const { data, isLoading, isError, isRefetching, refetch } = useQuery({
    queryKey: ["guarani", "correlativities"],
    queryFn: getGuaraníCorrelativities,
  });

  const correlativities: GuaraníCorrelativity[] = data?.data ?? [];

  if (isLoading) {
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
        <CorrelatividadesSkeleton />
      </ScrollView>
    );
  }

  if (isError) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
      >
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          Correlatividades
        </Text>
        <EmptyState
          icon="alert-circle-outline"
          title="No se pudieron cargar las correlatividades"
          description="Verifica tu conexion e intenta nuevamente."
          action={
            <Text
              variant="labelLarge"
              style={{ color: theme.colors.primary, fontWeight: "700" }}
              onPress={() => refetch()}
            >
              Reintentar
            </Text>
          }
        />
      </ScrollView>
    );
  }

  if (correlativities.length === 0) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
      >
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          Correlatividades
        </Text>
        <EmptyState
          icon="link-variant"
          title="Sin correlatividades"
          description="No se encontraron correlatividades para tu carrera."
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
      }
    >
      <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
        Correlatividades
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.outline, marginBottom: spacing.lg }}>
        {correlativities.length} materias
      </Text>

      {correlativities.map((subject) => (
        <SubjectCard
          key={subject.materia_codigo}
          subject={subject}
          allSubjects={correlativities}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: spacing.xl },
  title: {
    fontWeight: "800",
    letterSpacing: -0.3,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
});
