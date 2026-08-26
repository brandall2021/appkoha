import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { SkeletonPlaceholder } from "../../components/Skeleton";

export function NovedadesSkeleton() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <SkeletonPlaceholder width="100%" height={160} borderRadius={0} />
          <View style={styles.cardBody}>
            <SkeletonPlaceholder width="75%" height={18} borderRadius={4} />
            <SkeletonPlaceholder width="40%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
            <SkeletonPlaceholder width="90%" height={12} borderRadius={4} style={{ marginTop: 10 }} />
            <SkeletonPlaceholder width="60%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  cardBody: {
    padding: 12,
  },
});
