import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, ActivityIndicator, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Props {
  icon?: string;
  title: string;
  description?: string;
  loading?: boolean;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, loading, action }: Props) {
  const theme = useTheme();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
          {title}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={(icon as any) || "book-open-variant"}
        size={64}
        color={theme.colors.outline}
      />
      <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
        {title}
      </Text>
      {description && (
        <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.outline }]}>
          {description}
        </Text>
      )}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  title: {
    marginTop: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  description: {
    marginTop: 8,
    textAlign: "center",
  },
  action: {
    marginTop: 24,
  },
});
