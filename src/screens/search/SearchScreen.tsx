import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { Searchbar, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { getKohaAPI } from "../../api/koha";
import { Biblio } from "../../types";
import { BookCardSkeleton } from "../../components/Skeleton";
import BookCardComponent from "../../components/BookCard";
import EmptyState from "../../components/EmptyState";
import FilterBar, { FilterOption } from "../../components/FilterBar";
import { useAppStore } from "../../stores/appStore";
import { shadows, borderRadius } from "../../theme";

const materialFilters: FilterOption[] = [
  { label: "Todos", value: "all", icon: "book" },
  { label: "Libros", value: "book", icon: "book-open-variant" },
  { label: "Revistas", value: "serial", icon: "newspaper" },
  { label: "Tesis", value: "thesis", icon: "school" },
  { label: "Digital", value: "digital", icon: "laptop" },
  { label: "Audiovisual", value: "audiovisual", icon: "video" },
];

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string }>();
  const { addSearchHistory } = useAppStore();
  const [searchQuery, setSearchQuery] = useState(params.query || "");
  const [results, setResults] = useState<Biblio[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(["all"]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const doSearch = useCallback(
    async (q: string, pageNum: number = 1) => {
      if (!q.trim()) return;
      setLoading(true);
      try {
        const api = getKohaAPI();
        const data = await api.searchBiblios(q.trim(), pageNum);
        if (pageNum === 1) {
          setResults(data.biblios);
        } else {
          setResults((prev) => [...prev, ...data.biblios]);
        }
        setHasMore(data.biblios.length >= 20);
      } catch (err: any) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (params.query) {
      setSearchQuery(params.query);
      addSearchHistory(params.query);
      doSearch(params.query);
    }
  }, [params.query]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      addSearchHistory(searchQuery.trim());
      setPage(1);
      doSearch(searchQuery.trim(), 1);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading && searchQuery.trim()) {
      const nextPage = page + 1;
      setPage(nextPage);
      doSearch(searchQuery.trim(), nextPage);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search Header */}
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <View style={[styles.searchBarContainer, shadows.sm]}>
            <Searchbar
              placeholder="Buscar por titulo, autor, ISBN..."
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              value={searchQuery}
              style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
              inputStyle={{ fontSize: 15, color: theme.colors.onSurface }}
              elevation={0}
            />
          </View>
          <Pressable
            onPress={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            style={({ pressed }) => [
              styles.viewToggle,
              { backgroundColor: theme.colors.surfaceVariant },
              pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
            ]}
          >
            <MaterialCommunityIcons
              name={viewMode === "list" ? "view-grid" : "view-list"}
              size={20}
              color={theme.colors.onSurface}
            />
          </Pressable>
        </View>
      </View>

      {/* Filters */}
      <FilterBar
        filters={materialFilters}
        selected={selectedMaterial}
        onSelect={(value) => {
          if (value === "all") {
            setSelectedMaterial(["all"]);
          } else {
            setSelectedMaterial((prev) => {
              const filtered = prev.filter((v) => v !== "all" && v !== value);
              return filtered.length === 0 ? [value] : [...filtered, value];
            });
          }
        }}
        multi
      />

      {/* Results */}
      {loading && results.length === 0 ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <BookCardSkeleton key={i} viewMode={viewMode} />
          ))}
        </View>
      ) : results.length === 0 && searchQuery ? (
        <EmptyState
          icon="book-search"
          title="Sin resultados"
          description={`No se encontraron libros para "${searchQuery}"`}
        />
      ) : !searchQuery ? (
        <EmptyState
          icon="magnify"
          title="Busca tu libro"
          description="Escribe un titulo, autor, ISBN o palabra clave"
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.biblio_id)}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
              <BookCardComponent
                biblio={item}
                onPress={() => router.push(`/book/${item.biblio_id}`)}
                viewMode={viewMode}
              />
            </Animated.View>
          )}
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <View style={styles.footerLoader}>
                <MaterialCommunityIcons name="loading" size={24} color={theme.colors.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={null}
        />
      )}

      {/* Results Count */}
      {results.length > 0 && (
        <View style={[styles.resultCount, { backgroundColor: theme.colors.surfaceVariant }]}>
          <MaterialCommunityIcons name="magnify" size={14} color={theme.colors.outline} />
          <Text variant="bodySmall" style={{ color: theme.colors.outline, marginLeft: 4 }}>
            {results.length} resultado(s) encontrado(s)
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchBarContainer: {
    flex: 1,
    borderRadius: borderRadius.xl,
  },
  searchBar: {
    borderRadius: borderRadius.xl,
    height: 50,
  },
  viewToggle: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  skeletonContainer: {
    paddingVertical: 8,
  },
  list: {
    paddingVertical: 8,
  },
  footerLoader: {
    padding: 16,
    alignItems: "center",
  },
  resultCount: {
    position: "absolute",
    bottom: 16,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.pill,
  },
});
