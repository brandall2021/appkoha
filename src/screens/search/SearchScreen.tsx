import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, Modal } from "react-native";
import { Searchbar, Text, useTheme, Button, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { getKohaAPI } from "../../api/koha";
import { Biblio } from "../../types";
import { BookCardSkeleton } from "../../components/Skeleton";
import BookCardComponent from "../../components/BookCard";
import EmptyState from "../../components/EmptyState";
import FilterBar, { FilterOption } from "../../components/FilterBar";
import { useAppStore } from "../../stores/appStore";
import { useVoiceSearch } from "../../hooks/useVoiceSearch";
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
  const [voiceOpen, setVoiceOpen] = useState(false);

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

  const handleVoiceResult = useCallback(
    (text: string) => {
      const query = text.trim();
      if (!query) return;
      setVoiceOpen(false);
      setSearchQuery(query);
      addSearchHistory(query);
      setPage(1);
      doSearch(query, 1);
    },
    [addSearchHistory, doSearch]
  );

  const {
    listening,
    transcript,
    error: voiceError,
    supported: voiceSupported,
    start: startVoice,
    stop: stopVoice,
    abort: abortVoice,
    reset: resetVoice,
  } = useVoiceSearch({ onResult: handleVoiceResult });

  const micScale = useSharedValue(1);
  const micAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
  }));

  useEffect(() => {
    if (listening) {
      micScale.value = withRepeat(
        withSequence(
          withTiming(1.14, { duration: 520, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 520, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      micScale.value = withTiming(1, { duration: 180 });
    }
  }, [listening, micScale]);

  const handleStartVoice = async () => {
    resetVoice();
    setVoiceOpen(true);
    if (!voiceSupported) return;
    await startVoice();
  };

  const handleCloseVoice = () => {
    if (listening) {
      abortVoice();
    }
    resetVoice();
    setVoiceOpen(false);
  };

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
            onPress={handleStartVoice}
            accessibilityLabel="Buscar por voz"
            style={({ pressed }) => [
              styles.micButton,
              { backgroundColor: listening ? theme.colors.error : theme.colors.primary },
              pressed && { opacity: 0.82, transform: [{ scale: 0.95 }] },
            ]}
          >
            <MaterialCommunityIcons name={listening ? "microphone-off" : "microphone"} size={20} color="#FFFFFF" />
          </Pressable>
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

      <Modal visible={voiceOpen} transparent animationType="fade" onRequestClose={handleCloseVoice}>
        <View style={styles.voiceBackdrop}>
          <Surface style={[styles.voicePanel, { backgroundColor: theme.colors.surface }]} elevation={4}>
            <Animated.View
              style={[
                styles.voiceOrb,
                { backgroundColor: voiceError || !voiceSupported ? theme.colors.error : theme.colors.primary },
                micAnimatedStyle,
              ]}
            >
              <MaterialCommunityIcons
                name={voiceError || !voiceSupported ? "alert-circle" : "microphone"}
                size={40}
                color="#FFFFFF"
              />
            </Animated.View>

            <Text variant="titleMedium" style={[styles.voiceTitle, { color: theme.colors.onSurface }]}>
              {!voiceSupported ? "Voz no disponible" : voiceError ? "No pudimos escuchar" : listening ? "Escuchando..." : "Busqueda por voz"}
            </Text>

            <Text variant="bodyMedium" style={[styles.voiceText, { color: voiceError || !voiceSupported ? theme.colors.error : theme.colors.outline }]}>
              {!voiceSupported
                ? "Esta funcion requiere un build nativo de la app, no Expo Go."
                : voiceError || transcript || "Deci el titulo, autor, ISBN o tema que queres buscar."}
            </Text>

            <View style={styles.voiceActions}>
              <Button mode="text" onPress={handleCloseVoice}>
                Cancelar
              </Button>
              {listening ? (
                <Button mode="contained" icon="magnify" onPress={stopVoice}>
                  Buscar
                </Button>
              ) : voiceError ? (
                <Button mode="contained" icon="microphone" onPress={handleStartVoice}>
                  Reintentar
                </Button>
              ) : null}
            </View>
          </Surface>
        </View>
      </Modal>
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
  micButton: {
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
  voiceBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.58)",
    paddingHorizontal: 24,
  },
  voicePanel: {
    width: "100%",
    maxWidth: 360,
    borderRadius: borderRadius.xxl,
    padding: 24,
    alignItems: "center",
  },
  voiceOrb: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  voiceTitle: {
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  voiceText: {
    minHeight: 44,
    textAlign: "center",
    lineHeight: 21,
  },
  voiceActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    alignSelf: "stretch",
    marginTop: 22,
  },
});
