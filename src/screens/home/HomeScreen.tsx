import React, { useState, useCallback, useRef } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from "react-native";
import { Searchbar, Text, useTheme, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useAppStore } from "../../stores/appStore";
import HorizontalCarousel from "../../components/HorizontalCarousel";
import { HomeScreenSkeleton } from "../../components/Skeleton";
import { motion, borderRadius, shadows } from "../../theme";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { patron, searchHistory, isDarkMode } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = useSharedValue(0);
  const headerScale = useSharedValue(1);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      useAppStore.getState().addSearchHistory(searchQuery.trim());
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const features = [
    { icon: "barcode-scan", label: "Escanear ISBN", route: "/scanner", color: "#2E7D32" },
    { icon: "qrcode-scan", label: "Escanear QR", route: "/scanner", color: "#00897B" },
    { icon: "microphone", label: "Busqueda por voz", route: "/search", color: "#E65100" },
    { icon: "robot", label: "Asistente IA", route: "/ai", color: "#7B1FA2" },
  ];

  const recentSearches = searchHistory.slice(0, 5);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <HomeScreenSkeleton />
      </View>
    );
  }

  return (
    <AnimatedScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons name="book-open-variant" size={28} color={theme.colors.primary} />
          </View>
          <View>
            <Text variant="headlineSmall" style={[styles.appName, { color: theme.colors.onBackground }]}>
              KohaLibrary
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              Tu biblioteca digital
            </Text>
          </View>
        </View>
        {patron && (
          <Pressable onPress={() => router.push("/profile")}>
            <Surface style={[styles.greeting, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                Hola,
              </Text>
              <Text variant="bodyMedium" style={{ fontWeight: "600", color: theme.colors.onSurface }}>
                {patron.firstname || patron.surname}
              </Text>
            </Surface>
          </Pressable>
        )}
      </Animated.View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar libros, autores, ISBN..."
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }, shadows.sm]}
          inputStyle={{ fontSize: 15, color: theme.colors.onSurface }}
          elevation={0}
          trailingIcon={() => (
            <MaterialCommunityIcons
              name="microphone"
              size={20}
              color={theme.colors.outline}
              style={{ marginRight: 8 }}
            />
          )}
        />
      </View>

      {/* Quick Actions - 2x2 Grid */}
      <View style={styles.quickActionsContainer}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Accesos rapidos
        </Text>
        <View style={styles.quickActionsGrid}>
          {features.map((feat, i) => (
            <Pressable
              key={i}
              onPress={() => router.push(feat.route as any)}
              style={({ pressed }) => [
                styles.featureCard,
                { backgroundColor: theme.colors.surface },
                shadows.sm,
                pressed && { transform: [{ scale: 0.96 }], opacity: 0.85 },
              ]}
            >
              <View style={[styles.featureIcon, { backgroundColor: `${feat.color}15` }]}>
                <MaterialCommunityIcons name={feat.icon as any} size={24} color={feat.color} />
              </View>
              <Text variant="bodySmall" style={[styles.featureLabel, { color: theme.colors.onSurface }]} numberOfLines={2}>
                {feat.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="history" size={18} color={theme.colors.outline} />
            <Text variant="titleMedium" style={[styles.sectionTitleText, { color: theme.colors.onBackground }]}>
              Busquedas recientes
            </Text>
          </View>
          {recentSearches.map((q, i) => (
            <Pressable
              key={i}
              onPress={() => router.push(`/search?query=${encodeURIComponent(q)}`)}
              style={({ pressed }) => [
                styles.historyCard,
                { backgroundColor: theme.colors.surfaceVariant },
                pressed && { opacity: 0.7 },
              ]}
            >
              <MaterialCommunityIcons name="history" size={16} color={theme.colors.outline} />
              <Text variant="bodyMedium" style={[styles.historyText, { color: theme.colors.onSurface }]}>
                {q}
              </Text>
              <MaterialCommunityIcons name="arrow-top-right" size={14} color={theme.colors.outline} />
            </Pressable>
          ))}
        </View>
      )}

      {/* Banner */}
      <View style={styles.bannerSection}>
        <Pressable
          onPress={() => router.push("/search")}
          style={({ pressed }) => [
            styles.banner,
            {
              backgroundColor: isDarkMode ? theme.colors.primaryContainer : theme.colors.primary,
            },
            shadows.lg,
            pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
          ]}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerIconContainer}>
              <MaterialCommunityIcons name="library" size={36} color="#FFFFFF" />
            </View>
            <View style={styles.bannerText}>
              <Text variant="titleMedium" style={styles.bannerTitle}>
                Explora el catalogo
              </Text>
              <Text variant="bodySmall" style={styles.bannerSubtitle}>
                Miles de libros disponibles para ti
              </Text>
            </View>
            <MaterialCommunityIcons name="arrow-right" size={24} color="rgba(255,255,255,0.8)" />
          </View>
        </Pressable>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomPadding} />
    </AnimatedScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontWeight: "800",
    letterSpacing: -0.5,
    fontSize: 22,
  },
  greeting: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    borderRadius: borderRadius.xl,
    height: 52,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 12,
    fontSize: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  featureCard: {
    width: "47%",
    borderRadius: borderRadius.lg,
    padding: 16,
    alignItems: "center",
  },
  featureIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  featureLabel: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 13,
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitleText: {
    fontWeight: "700",
    fontSize: 16,
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    marginBottom: 6,
    gap: 12,
  },
  historyText: {
    flex: 1,
    fontWeight: "500",
  },
  bannerSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  banner: {
    borderRadius: borderRadius.xl,
    padding: 20,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  bannerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 17,
  },
  bannerSubtitle: {
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  bottomPadding: {
    height: 40,
  },
});
