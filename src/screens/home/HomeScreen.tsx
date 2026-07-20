import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { Searchbar, Text, useTheme, Card, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppStore } from "../../stores/appStore";
import HorizontalCarousel from "../../components/HorizontalCarousel";

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { patron, searchHistory, isDarkMode } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      useAppStore.getState().addSearchHistory(searchQuery.trim());
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const features = [
    { icon: "barcode-scan", label: "Escanear ISBN", route: "/scanner" },
    { icon: "qrcode-scan", label: "Escanear QR", route: "/scanner" },
    { icon: "microphone", label: "Busqueda por voz", route: "/search" },
    { icon: "robot", label: "Asistente IA", route: "/ai" },
  ];

  const recentSearches = searchHistory.slice(0, 5);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
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
          <Surface style={[styles.greeting, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              Hola,
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
              {patron.firstname || patron.surname}
            </Text>
          </Surface>
        )}
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar libros, autores, ISBN..."
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
          inputStyle={{ fontSize: 15 }}
          elevation={1}
        />
      </View>

      <View style={styles.quickActions}>
        {features.map((feat, i) => (
          <Card
            key={i}
            style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push(feat.route as any)}
          >
            <Card.Content style={styles.featureContent}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                <MaterialCommunityIcons name={feat.icon as any} size={22} color={theme.colors.primary} />
              </View>
              <Text variant="bodySmall" style={styles.featureLabel} numberOfLines={2}>
                {feat.label}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      {recentSearches.length > 0 && (
        <View style={styles.section}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Busquedas recientes
          </Text>
          {recentSearches.map((q, i) => (
            <Card
              key={i}
              style={[styles.historyCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => router.push(`/search?query=${encodeURIComponent(q)}`)}
            >
              <Card.Content style={styles.historyContent}>
                <MaterialCommunityIcons name="history" size={18} color={theme.colors.outline} />
                <Text variant="bodyMedium" style={{ marginLeft: 12 }}>
                  {q}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      )}

      <View style={styles.bannerSection}>
        <Card style={[styles.banner, { backgroundColor: theme.colors.primaryContainer }]} onPress={() => router.push("/search")}>
          <Card.Content style={styles.bannerContent}>
            <MaterialCommunityIcons name="library" size={40} color={theme.colors.primary} />
            <View style={styles.bannerText}>
              <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: "700" }}>
                Explora el catalogo
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                Miles de libros disponibles
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  greeting: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    borderRadius: 16,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
  },
  featureCard: {
    flex: 1,
    borderRadius: 12,
  },
  featureContent: {
    alignItems: "center",
    paddingVertical: 8,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  featureLabel: {
    textAlign: "center",
    fontWeight: "500",
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 10,
  },
  historyCard: {
    marginBottom: 4,
    borderRadius: 10,
  },
  historyContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  bannerSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  banner: {
    borderRadius: 16,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  bannerText: {
    flex: 1,
  },
  bottomPadding: {
    height: 32,
  },
});
