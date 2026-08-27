import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { SkeletonPlaceholder } from "../Skeleton";
import { borderRadius, spacing } from "../../theme";

export function ScheduleSkeleton() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.dayRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonPlaceholder
            key={i}
            width={56}
            height={40}
            borderRadius={20}
          />
        ))}
      </View>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.cardSkeleton}>
          <SkeletonPlaceholder width={44} height={44} borderRadius={borderRadius.md} />
          <View style={styles.cardInfo}>
            <SkeletonPlaceholder width="80%" height={16} borderRadius={4} />
            <View style={styles.cardChips}>
              <SkeletonPlaceholder width={80} height={24} borderRadius={12} />
              <SkeletonPlaceholder width={60} height={24} borderRadius={12} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  dayRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: spacing.md,
  },
  cardSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardChips: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
});
