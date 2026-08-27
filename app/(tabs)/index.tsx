import React from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { Text, useTheme, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/stores/authStore";
import NextClassCard from "../../src/components/dashboard/NextClassCard";
import QuickAccess from "../../src/components/dashboard/QuickAccess";
import RecentNews from "../../src/components/dashboard/RecentNews";
import { spacing, borderRadius, shadows } from "../../src/theme";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos dias";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function HomeTab() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.greetingSection}>
        <Text variant="headlineSmall" style={[styles.greetingText, { color: theme.colors.onBackground }]}>
          {getGreeting()}
        </Text>
        <Text variant="bodyLarge" style={[styles.nameText, { color: theme.colors.primary }]}>
          {user?.name ?? "Estudiante"}
        </Text>
      </View>

      <NextClassCard />
      <QuickAccess />
      <RecentNews />

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  greetingSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  greetingText: {
    fontWeight: "600",
    marginBottom: 2,
  },
  nameText: {
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  bottomPad: {
    height: 40,
  },
});
