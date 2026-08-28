import React from "react";
import { ScrollView, RefreshControl, View, Linking } from "react-native";
import { Text, Button, List, Card } from "react-native-paper";
import { useTheme } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchLinks } from "../../lib/api/links";

export function LinksUtilesScreen() {
  const theme = useTheme();
  const links = useQuery({
    queryKey: ["links"],
    queryFn: () => fetchLinks(),
  });

  if (links.isLoading) {
    return (
      <View style={{ padding: 24 }}>
        <Text>Cargando enlaces...</Text>
      </View>
    );
  }

  if (links.isError) {
    return (
      <View style={{ padding: 24 }}>
        <Text>No se pudieron cargar los enlaces.</Text>
        <Button mode="contained" style={{ marginTop: 12 }} onPress={() => links.refetch()}>
          Reintentar
        </Button>
      </View>
    );
  }

  const items = links.data?.data ?? [];
  const destacado = items.find((l) => l.destacado);
  const resto = items.filter((l) => !l.destacado);

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl refreshing={links.isRefetching} onRefresh={() => links.refetch()} />
      }
    >
      {items.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 32 }}>No hay enlaces por ahora.</Text>
      )}

      {destacado && (
        <Card
          mode="elevated"
          style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: "#E8F5E9" }}
          onPress={() => void Linking.openURL(destacado.url)}
        >
          <Card.Title
            title={destacado.titulo}
            titleVariant="titleMedium"
            left={(props) => (
              <MaterialCommunityIcons
                {...props}
                size={24}
                color="#2E7D32"
                name={(destacado.icono as any) || "link"}
              />
            )}
            right={() => <List.Icon icon="open-in-new" />}
          />
        </Card>
      )}

      {resto.length > 0 && (
        <>
          <List.Subheader>Otros enlaces</List.Subheader>
          {resto.map((l) => (
            <List.Item
              key={l.id}
              title={l.titulo}
              left={(props) => <List.Icon {...props} icon={(l.icono as any) || "link"} />}
              right={() => <List.Icon icon="open-in-new" />}
              onPress={() => void Linking.openURL(l.url)}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}
