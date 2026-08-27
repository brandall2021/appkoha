import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { useLocalSearchParams, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchNewsById } from "../../src/lib/api/news";
import { HTMLSimple } from "../../src/screens/notifications/html-simple";

export default function DetalleNovedad() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["news", id],
    queryFn: () => fetchNewsById(id!),
    enabled: !!id,
  });

  const noticia = data?.data;

  return (
    <ScrollView>
      <Stack.Screen options={{ title: noticia?.titulo ?? "Novedad" }} />
      {isLoading && <Text style={styles.centered}>Cargando…</Text>}
      {!isLoading && !noticia && <Text style={styles.centered}>No se encontró la novedad.</Text>}
      {noticia && (
        <Card style={styles.card}>
          {noticia.imagen_url && <Card.Cover source={{ uri: noticia.imagen_url }} />}
          <Card.Title title={noticia.titulo} subtitle={new Date(noticia.fecha).toLocaleDateString()} />
          <Card.Content>
            <HTMLSimple html={noticia.cuerpo} />
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { padding: 24 },
  card: { margin: 16 },
});
