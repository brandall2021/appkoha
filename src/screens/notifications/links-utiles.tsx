import React, { useEffect } from "react";
import { View } from "react-native";
import { List, Card, Text } from "react-native-paper";
import { Linking } from "react-native";
import { ordenarLinks, type LinkUtil } from "../../api/cms";
import { cachearLinks } from "./links-cache";

export function LinksUtiles({ links }: { links: LinkUtil[] }) {
  useEffect(() => {
    if (links.length > 0) void cachearLinks(links);
  }, [links]);

  const ordenados = ordenarLinks(links);
  const destacado = ordenados.find((l) => l.destacado);
  const resto = ordenados.filter((l) => l.id !== destacado?.id);

  return (
    <View>
      {destacado && (
        <Card
          mode="elevated"
          style={{ marginHorizontal: 16, marginTop: 12, marginBottom: 8, backgroundColor: "#E8F5E9" }}
          onPress={() => void Linking.openURL(destacado.url)}
        >
          <Card.Title
            title={destacado.titulo}
            titleVariant="titleMedium"
            left={(props) => <List.Icon {...props} icon={destacado.icono} color="#2E7D32" />}
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
              left={(props) => <List.Icon {...props} icon={l.icono} />}
              right={() => <List.Icon icon="open-in-new" />}
              onPress={() => void Linking.openURL(l.url)}
            />
          ))}
        </>
      )}
    </View>
  );
}
