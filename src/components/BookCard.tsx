import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text, Chip, useTheme } from "react-native-paper";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Image } from "react-native";
import { Biblio } from "../types";
import { motion, borderRadius, shadows } from "../theme";

interface Props {
  biblio: Biblio;
  onPress: () => void;
  viewMode?: "grid" | "list";
}

function AnimatedBookCard({ biblio, onPress, viewMode = "list" }: Props) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const hasItems = biblio.items && biblio.items.length > 0;
  const availableItems = hasItems
    ? biblio.items!.filter((i) => !i.onloan && !i.itemlost && i.notforloan === 0)
    : [];
  const isAvailable = availableItems.length > 0;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.97, motion.spring.snappy);
    translateY.value = withTiming(-2, { duration: motion.timing.fast });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, motion.spring.bouncy);
    translateY.value = withTiming(0, { duration: motion.timing.fast });
  };

  if (viewMode === "grid") {
    return (
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View
          style={[
            styles.gridCard,
            { backgroundColor: theme.colors.surface },
            shadows.md,
            animatedStyle,
          ]}
        >
          <View style={[styles.coverPlaceholder, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={[styles.coverLetter, { color: theme.colors.primary }]}>
              {(biblio.title || "?")[0].toUpperCase()}
            </Text>
          </View>
          <Text variant="bodySmall" numberOfLines={2} style={[styles.gridTitle, { color: theme.colors.onSurface }]}>
            {biblio.title || "Sin titulo"}
          </Text>
          <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.outline }}>
            {biblio.author || "Desconocido"}
          </Text>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={[
          styles.listCard,
          { backgroundColor: theme.colors.surface },
          shadows.md,
          animatedStyle,
        ]}
      >
        <View style={[styles.listCover, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text style={[styles.coverLetter, { color: theme.colors.primary }]}>
            {(biblio.title || "?")[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.listInfo}>
          <Text variant="titleSmall" numberOfLines={2} style={{ color: theme.colors.onSurface }}>
            {biblio.title || "Sin titulo"}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 2 }} numberOfLines={1}>
            {biblio.author || "Desconocido"}
          </Text>
          <View style={styles.chipRow}>
            {biblio.isbn && (
              <Chip compact style={[styles.chip, { backgroundColor: theme.colors.surfaceVariant }]} textStyle={[styles.chipText, { color: theme.colors.outline }]}>
                ISBN
              </Chip>
            )}
            <Chip
              compact
              style={[
                styles.chip,
                {
                  backgroundColor: isAvailable ? "rgba(46, 125, 50, 0.12)" : "rgba(230, 81, 0, 0.12)",
                },
              ]}
              textStyle={{
                color: isAvailable ? "#2E7D32" : "#E65100",
                fontSize: 10,
                fontWeight: "600",
              }}
            >
              {isAvailable ? "Disponible" : "No disponible"}
            </Chip>
          </View>
        </View>
        <View style={styles.chevron}>
          <Text style={{ color: theme.colors.outline, fontSize: 18 }}>›</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function BookCard(props: Props) {
  return <AnimatedBookCard {...props} />;
}

const styles = StyleSheet.create({
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 16,
    borderRadius: borderRadius.lg,
    padding: 12,
  },
  listCover: {
    width: 60,
    height: 80,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  gridCard: {
    borderRadius: borderRadius.lg,
    flex: 1,
    margin: 4,
    padding: 12,
    alignItems: "center",
  },
  coverPlaceholder: {
    width: 100,
    height: 140,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  coverLetter: {
    fontSize: 32,
    fontWeight: "bold",
  },
  gridTitle: {
    textAlign: "center",
    fontWeight: "600",
  },
  chipRow: {
    flexDirection: "row",
    marginTop: 6,
    gap: 4,
  },
  chip: {
    height: 24,
    borderRadius: borderRadius.pill,
  },
  chipText: {
    fontSize: 10,
  },
  chevron: {
    marginLeft: 4,
  },
});
