import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Searchbar, Text, useTheme, SegmentedButtons } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getKohaAPI } from "../../api/koha";
import { Biblio } from "../../types";
import BookCard from "../../components/BookCard";
import EmptyState from "../../components/EmptyState";
import FilterBar, { FilterOption } from "../../components/FilterBar";
import { useAppStore } from "../../stores/appStore";

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
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Buscar por titulo, autor, ISBN..."
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
          inputStyle={{ fontSize: 15 }}
          elevation={1}
        />
      </View>

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

      {loading && results.length === 0 ? (
        <EmptyState title="Buscando..." loading />
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
          renderItem={({ item }) => (
            <BookCard
              biblio={item}
              onPress={() => router.push(`/book/${item.biblio_id}`)}
              viewMode={viewMode}
            />
          )}
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator style={{ padding: 16 }} color={theme.colors.primary} />
            ) : null
          }
          ListEmptyComponent={null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchBar: {
    borderRadius: 16,
  },
  list: {
    paddingVertical: 8,
  },
});
