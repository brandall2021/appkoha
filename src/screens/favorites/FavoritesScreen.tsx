import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Text, useTheme, Card, Button, Chip, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getKohaAPI } from "../../api/koha";
import { useAppStore } from "../../stores/appStore";
import { Hold } from "../../types";
import EmptyState from "../../components/EmptyState";

export default function FavoritesScreen() {
  const theme = useTheme();
  const { favorites, toggleFavorite } = useAppStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [favorites]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const api = getKohaAPI();
      const results = await Promise.all(
        favorites.map(async (id) => {
          try {
            return await api.getBiblio(id);
          } catch {
            return null;
          }
        })
      );
      setItems(results.filter(Boolean));
    } catch {} finally {
      setLoading(false);
    }
  };

  if (favorites.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="heart-outline"
          title="Sin favoritos"
          description="Guarda libros favoritos desde su ficha de detalles"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.biblio_id)}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="titleLarge" style={{ fontWeight: "700" }}>
              Mis favoritos
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              {favorites.length} libro(s) guardado(s)
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cardContent}>
              <View style={[styles.cover, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text style={{ color: theme.colors.primary, fontSize: 24, fontWeight: "bold" }}>
                  {(item.title || "?")[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.info}>
                <Text variant="titleSmall" numberOfLines={2}>
                  {item.title}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  {item.author || "Desconocido"}
                </Text>
              </View>
              <IconButton
                icon="heart"
                iconColor="#E53935"
                onPress={() => toggleFavorite(item.biblio_id)}
              />
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cover: {
    width: 50,
    height: 68,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
});
