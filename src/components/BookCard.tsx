import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, Chip, useTheme } from "react-native-paper";
import { Image } from "react-native";
import { Biblio } from "../types";

interface Props {
  biblio: Biblio;
  onPress: () => void;
  viewMode?: "grid" | "list";
}

export default function BookCard({ biblio, onPress, viewMode = "list" }: Props) {
  const theme = useTheme();
  const hasItems = biblio.items && biblio.items.length > 0;
  const availableItems = hasItems
    ? biblio.items!.filter((i) => !i.onloan && !i.itemlost && i.notforloan === 0)
    : [];
  const isAvailable = availableItems.length > 0;

  if (viewMode === "grid") {
    return (
      <Card style={[styles.gridCard, { backgroundColor: theme.colors.surface }]} onPress={onPress}>
        <Card.Content style={styles.gridContent}>
          <View style={[styles.coverPlaceholder, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={[styles.coverLetter, { color: theme.colors.primary }]}>
              {(biblio.title || "?")[0].toUpperCase()}
            </Text>
          </View>
          <Text variant="bodySmall" numberOfLines={2} style={styles.gridTitle}>
            {biblio.title || "Sin titulo"}
          </Text>
          <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.outline }}>
            {biblio.author || "Desconocido"}
          </Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={[styles.listCard, { backgroundColor: theme.colors.surface }]} onPress={onPress}>
      <Card.Content style={styles.listContent}>
        <View style={[styles.listCover, { backgroundColor: theme.colors.primaryContainer }]}>
          <Text style={[styles.coverLetter, { color: theme.colors.primary }]}>
            {(biblio.title || "?")[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.listInfo}>
          <Text variant="titleSmall" numberOfLines={2}>
            {biblio.title || "Sin titulo"}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }} numberOfLines={1}>
            {biblio.author || "Desconocido"}
          </Text>
          <View style={styles.chipRow}>
            {biblio.isbn && (
              <Chip compact style={styles.chip} textStyle={styles.chipText}>
                ISBN
              </Chip>
            )}
            <Chip
              compact
              style={[
                styles.chip,
                { backgroundColor: isAvailable ? "#E8F5E9" : "#FFF3E0" },
              ]}
              textStyle={{
                color: isAvailable ? "#2E7D32" : "#E65100",
                fontSize: 10,
              }}
            >
              {isAvailable ? "Disponible" : "No disponible"}
            </Chip>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  listCard: {
    marginBottom: 8,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  listContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  listCover: {
    width: 60,
    height: 80,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  gridCard: {
    borderRadius: 12,
    flex: 1,
    margin: 4,
  },
  gridContent: {
    alignItems: "center",
    padding: 8,
  },
  coverPlaceholder: {
    width: 100,
    height: 140,
    borderRadius: 8,
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
    fontWeight: "500",
  },
  chipRow: {
    flexDirection: "row",
    marginTop: 4,
    gap: 4,
  },
  chip: {
    height: 24,
  },
  chipText: {
    fontSize: 10,
  },
});
