import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { getKohaAPI } from "../../api/koha";
import { useAppStore } from "../../stores/appStore";
import EmptyState from "../../components/EmptyState";
import { shadows, borderRadius } from "../../theme";

export default function FavoritesScreen() {
  const theme = useTheme();
  const { favorites, toggleFavorite, isDarkMode } = useAppStore();
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
            <View style={styles.headerRow}>
              <View>
                <Text variant="titleLarge" style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
                  Mis favoritos
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  {favorites.length} libro(s) guardado(s)
                </Text>
              </View>
              <View style={[styles.heartIcon, { backgroundColor: "rgba(229, 57, 53, 0.12)" }]}>
                <MaterialCommunityIcons name="heart" size={20} color="#E53935" />
              </View>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 60).springify()}
            layout={Layout.springify()}
          >
            <View style={[styles.card, { backgroundColor: theme.colors.surface }, shadows.sm]}>
              <View style={[styles.cover, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text style={[styles.coverLetter, { color: theme.colors.primary }]}>
                  {(item.title || "?")[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.info}>
                <Text variant="titleSmall" numberOfLines={2} style={{ color: theme.colors.onSurface, fontWeight: "600" }}>
                  {item.title}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 2 }}>
                  {item.author || "Desconocido"}
                </Text>
                {item.isbn && (
                  <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 4 }}>
                    ISBN: {item.isbn}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={() => toggleFavorite(item.biblio_id)}
                style={({ pressed }) => [
                  styles.removeButton,
                  { backgroundColor: "rgba(229, 57, 53, 0.08)" },
                  pressed && { backgroundColor: "rgba(229, 57, 53, 0.16)", transform: [{ scale: 0.9 }] },
                ]}
              >
                <MaterialCommunityIcons name="heart" size={20} color="#E53935" />
              </Pressable>
            </View>
          </Animated.View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: {
    paddingBottom: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  heartIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  cover: {
    width: 56,
    height: 76,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  coverLetter: {
    fontSize: 26,
    fontWeight: "bold",
  },
  info: {
    flex: 1,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});
