import React from "react";
import { View, StyleSheet, ScrollView, Dimensions, Pressable } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { shadows, borderRadius } from "../theme";

const { width } = Dimensions.get("window");

interface Props {
  title: string;
  items: any[];
  onItemPress: (item: any) => void;
  renderItem?: (item: any) => React.ReactNode;
}

export default function HorizontalCarousel({ title, items, onItemPress, renderItem }: Props) {
  const theme = useTheme();

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
            {title}
          </Text>
          <View style={[styles.count, { backgroundColor: `${theme.colors.primary}12` }]}>
            <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: "600" }}>
              {items.length}
            </Text>
          </View>
        </View>
        <Pressable style={({ pressed }) => styles.viewAllBtn}>
          <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: "600" }}>
            Ver todo
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={14} color={theme.colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        snapToInterval={width * 0.35 + 20}
        decelerationRate="fast"
      >
        {items.map((item, index) => (
          <Pressable
            key={item.biblio_id || index}
            onPress={() => onItemPress(item)}
            style={({ pressed }) => [
              styles.item,
              { backgroundColor: theme.colors.surface },
              shadows.sm,
              pressed && { transform: [{ scale: 0.96 }], opacity: 0.85 },
            ]}
          >
            {renderItem ? (
              renderItem(item)
            ) : (
              <View style={styles.defaultItem}>
                <View
                  style={[
                    styles.cover,
                    { backgroundColor: theme.colors.primaryContainer },
                  ]}
                >
                  <Text style={[styles.letter, { color: theme.colors.primary }]}>
                    {(item.title || "?")[0].toUpperCase()}
                  </Text>
                </View>
                <Text
                  variant="bodySmall"
                  numberOfLines={2}
                  style={[styles.itemTitle, { color: theme.colors.onSurface }]}
                >
                  {item.title || "Sin titulo"}
                </Text>
                <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.outline, marginTop: 2 }}>
                  {item.author || ""}
                </Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontWeight: "700",
  },
  count: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  scroll: {
    paddingHorizontal: 12,
    paddingRight: 20,
  },
  item: {
    width: width * 0.35,
    marginHorizontal: 8,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  defaultItem: {
    padding: 10,
    alignItems: "center",
  },
  cover: {
    width: "100%",
    height: 120,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  letter: {
    fontSize: 28,
    fontWeight: "bold",
  },
  itemTitle: {
    fontWeight: "600",
    textAlign: "center",
  },
});
