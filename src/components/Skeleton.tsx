import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { useTheme } from "react-native-paper";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonPlaceholder({ width, height = 16, borderRadius = 8, style }: SkeletonProps) {
  const theme = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.surfaceVariant,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function BookCardSkeleton({ viewMode = "list" }: { viewMode?: "grid" | "list" }) {
  if (viewMode === "grid") {
    return (
      <View style={styles.gridCard}>
        <SkeletonPlaceholder width={100} height={140} borderRadius={8} />
        <SkeletonPlaceholder width="80%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
        <SkeletonPlaceholder width="60%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
    );
  }

  return (
    <View style={styles.listCard}>
      <SkeletonPlaceholder width={60} height={80} borderRadius={8} />
      <View style={styles.listInfo}>
        <SkeletonPlaceholder width="90%" height={16} borderRadius={4} />
        <SkeletonPlaceholder width="70%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
        <View style={styles.chipRow}>
          <SkeletonPlaceholder width={50} height={24} borderRadius={12} />
          <SkeletonPlaceholder width={70} height={24} borderRadius={12} />
        </View>
      </View>
    </View>
  );
}

export function HomeScreenSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <SkeletonPlaceholder width={48} height={48} borderRadius={14} />
          <View style={{ marginLeft: 12 }}>
            <SkeletonPlaceholder width={120} height={20} borderRadius={4} />
            <SkeletonPlaceholder width={80} height={12} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        </View>
        <SkeletonPlaceholder width={100} height={32} borderRadius={20} />
      </View>

      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <SkeletonPlaceholder width="100%" height={48} borderRadius={16} />
      </View>

      <View style={styles.featureRow}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.featureCard}>
            <SkeletonPlaceholder width={44} height={44} borderRadius={12} />
            <SkeletonPlaceholder width={60} height={10} borderRadius={4} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
  },
  featureCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  gridCard: {
    borderRadius: 12,
    flex: 1,
    margin: 4,
    alignItems: "center",
    padding: 8,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
  },
  listInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chipRow: {
    flexDirection: "row",
    marginTop: 6,
    gap: 4,
  },
});
