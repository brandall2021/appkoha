import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { shadows, borderRadius, spacing } from "../../theme";
import type { NoticiaApi } from "../../lib/api/news";

interface Props {
  noticia: NoticiaApi;
}

export function NewsCard({ noticia }: Props) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/novedad/${noticia.id}`)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface },
        shadows.sm,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.85 },
      ]}
    >
      {noticia.imagen_url ? (
        <Card.Cover source={{ uri: noticia.imagen_url }} style={styles.cover} />
      ) : (
        <View style={[styles.iconWrap, { backgroundColor: `${theme.colors.primary}15` }]}>
          <MaterialCommunityIcons name="newspaper-variant-outline" size={28} color={theme.colors.primary} />
        </View>
      )}
      <View style={styles.body}>
        <Text variant="titleSmall" style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={2}>
          {noticia.titulo}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 4 }}>
          {new Date(noticia.fecha).toLocaleDateString()}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={2}>
          {noticia.resumen}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  cover: {
    height: 160,
  },
  iconWrap: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    padding: spacing.md,
  },
  title: {
    fontWeight: "700",
    marginBottom: 2,
  },
});
