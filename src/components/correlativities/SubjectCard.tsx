import React, { useState } from "react";
import { View, StyleSheet, Pressable, LayoutAnimation, Platform, UIManager } from "react-native";
import { Text, useTheme, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CorrelativityBadge, { getCorrelativityStatus } from "./CorrelativityBadge";
import type { GuaraníCorrelativity } from "../../lib/types/portal";
import { shadows, borderRadius, spacing } from "../../theme";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface Props {
  subject: GuaraníCorrelativity;
  allSubjects: GuaraníCorrelativity[];
}

export default function SubjectCard({ subject, allSubjects }: Props) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const hasCorrelativas = subject.correlativas.length > 0;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <Surface
      style={[styles.card, { backgroundColor: theme.colors.surface }, shadows.sm]}
      elevation={0}
    >
      <Pressable
        onPress={hasCorrelativas ? toggleExpand : undefined}
        style={({ pressed }) => [
          styles.header,
          pressed && hasCorrelativas && { opacity: 0.7 },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text
            variant="titleSmall"
            numberOfLines={2}
            style={[styles.subjectName, { color: theme.colors.onSurface }]}
          >
            {subject.materia_nombre}
          </Text>
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
            {subject.materia_codigo}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <CorrelativityBadge
            status={getCorrelativityStatus(subject.aprobada, subject.habilitada)}
          />
          {hasCorrelativas && (
            <MaterialCommunityIcons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.colors.outline}
              style={{ marginLeft: 6 }}
            />
          )}
        </View>
      </Pressable>

      {expanded && hasCorrelativas && (
        <View style={[styles.correlativasContainer, { borderTopColor: theme.colors.outlineVariant }]}>
          <Text variant="labelSmall" style={[styles.correlativasTitle, { color: theme.colors.outline }]}>
            Correlativas requeridas
          </Text>
          {subject.correlativas.map((code) => {
            const linked = allSubjects.find((s) => s.materia_codigo === code);
            const linkedStatus = linked
              ? getCorrelativityStatus(linked.aprobada, linked.habilitada)
              : "no-habilitada";

            return (
              <View key={code} style={[styles.correlativaRow, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View style={styles.correlativaLeft}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurface, fontWeight: "500" }}>
                    {linked?.materia_nombre ?? code}
                  </Text>
                  {!linked && (
                    <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                      {code}
                    </Text>
                  )}
                </View>
                <CorrelativityBadge status={linkedStatus} size="sm" />
              </View>
            );
          })}
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  subjectName: {
    fontWeight: "700",
    marginBottom: 2,
  },
  correlativasContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: 6,
  },
  correlativasTitle: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "700",
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  correlativaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.sm,
  },
  correlativaLeft: {
    flex: 1,
    marginRight: 8,
  },
});
