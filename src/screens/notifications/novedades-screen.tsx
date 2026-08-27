import React from "react";
import { ScrollView, RefreshControl, View } from "react-native";
import { Text, Button } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { fetchNews } from "../../lib/api/news";
import { NewsCard } from "../../components/news/NewsCard";
import { NovedadesSkeleton } from "./novedades-skeleton";

export function NovedadesScreen() {
  const noticias = useQuery({
    queryKey: ["news"],
    queryFn: () => fetchNews(),
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

  const items = noticias.data?.data ?? [];

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={noticias.isRefetching} onRefresh={() => noticias.refetch()} />
      }
    >
      {items.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 32 }}>No hay novedades por ahora.</Text>
      )}
      {items.map((n) => (
        <NewsCard key={n.id} noticia={n} />
      ))}
    </ScrollView>
  );
}
