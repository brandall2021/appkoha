import React from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Text, Card, useTheme, TouchableRipple } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
        <Text variant="titleMedium" style={styles.title}>{title}</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
          Ver todo
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {items.map((item, index) => (
          <TouchableRipple
            key={item.biblio_id || index}
            onPress={() => onItemPress(item)}
            style={[styles.item, { backgroundColor: theme.colors.surface }]}
            borderless
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
                <Text variant="bodySmall" numberOfLines={2} style={styles.itemTitle}>
                  {item.title || "Sin titulo"}
                </Text>
                <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.outline }}>
                  {item.author || ""}
                </Text>
              </View>
            )}
          </TouchableRipple>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontWeight: "700",
  },
  scroll: {
    paddingHorizontal: 12,
  },
  item: {
    width: width * 0.35,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  defaultItem: {
    padding: 8,
    alignItems: "center",
  },
  cover: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  letter: {
    fontSize: 28,
    fontWeight: "bold",
  },
  itemTitle: {
    fontWeight: "500",
    textAlign: "center",
  },
});
