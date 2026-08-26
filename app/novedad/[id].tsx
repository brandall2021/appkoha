import React from "react";
import { ScrollView } from "react-native";
import { Card, Text } from "react-native-paper";
import { useLocalSearchParams, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchNoticias } from "../../src/api/cms";
import { HTMLSimple } from "../../src/screens/notifications/html-simple";

function cmsUrl(): string {
  const extra = require("expo-constants").expoConfig?.extra as Record<string, string> | undefined;
  return (process.env.EXPO_PUBLIC_CMS_URL ?? extra?.cmsUrl ?? "") as string;
}

export default function DetalleNovedad() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["noticias"],
    queryFn: () => fetchNoticias(cmsUrl()),
  });
  const noticia = data?.find((n) => n.id === id);

  return (
    <ScrollView>
      <Stack.Screen options={{ title: noticia?.titulo ?? "Novedad" }} />
      {isLoading && <Text style={{ padding: 24 }}>Cargando…</Text>}
      {!isLoading && !noticia && <Text style={{ padding: 24 }}>No se encontró la novedad.</Text>}
      {noticia && (
        <Card style={{ margin: 16 }}>
          {noticia.imagenUrl && <Card.Cover source={{ uri: noticia.imagenUrl }} />}
          <Card.Title title={noticia.titulo} subtitle={new Date(noticia.fecha).toLocaleDateString()} />
          <Card.Content>
            <HTMLSimple html={noticia.cuerpo} />
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}
