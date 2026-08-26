import React from "react";
import { ScrollView, RefreshControl, View } from "react-native";
import { Card, Text, Button } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { fetchNoticias, fetchLinks } from "../../api/cms";
import { leerLinksCache } from "./links-cache";
import { LinksUtiles } from "./links-utiles";
import { NovedadesSkeleton } from "./novedades-skeleton";
import { stripHtml } from "./strip-html";

function cmsUrl(): string {
  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;
  return (process.env.EXPO_PUBLIC_CMS_URL ?? extra?.cmsUrl ?? "") as string;
}

export function NovedadesScreen() {
  const router = useRouter();
  const noticias = useQuery({
    queryKey: ["noticias"],
    queryFn: () => fetchNoticias(cmsUrl()),
  });

  const links = useQuery({
    queryKey: ["links"],
    queryFn: async () => {
      try {
        return await fetchLinks(cmsUrl());
      } catch {
        const cached = await leerLinksCache();
        return cached ?? [];
      }
    },
  });

  if (noticias.isLoading) return <NovedadesSkeleton />;

  if (noticias.isError) {
    return (
      <View style={{ padding: 24 }}>
        <Text>No se pudieron cargar las novedades.</Text>
        <Button mode="contained" onPress={() => noticias.refetch()}>
          Reintentar
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={noticias.isRefetching} onRefresh={() => noticias.refetch()} />
      }
    >
      {links.data && links.data.length > 0 && <LinksUtiles links={links.data} />}
      {(noticias.data ?? []).length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 32 }}>No hay novedades por ahora.</Text>
      )}
      {(noticias.data ?? []).map((n) => (
        <Card
          key={n.id}
          style={{ marginHorizontal: 16, marginBottom: 12 }}
          onPress={() => router.push(`/novedad/${n.id}`)}
        >
          {n.imagenUrl && <Card.Cover source={{ uri: n.imagenUrl }} />}
          <Card.Title title={n.titulo} subtitle={new Date(n.fecha).toLocaleDateString()} />
          <Card.Content>
            <Text variant="bodySmall" numberOfLines={2}>
              {stripHtml(n.cuerpo)}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}
