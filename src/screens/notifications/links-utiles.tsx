import React, { useEffect } from "react";
import { List } from "react-native-paper";
import { Linking } from "react-native";
import { ordenarLinks, type LinkUtil } from "../../api/cms";
import { cachearLinks } from "./links-cache";

export function LinksUtiles({ links }: { links: LinkUtil[] }) {
  useEffect(() => {
    if (links.length > 0) void cachearLinks(links);
  }, [links]);

  const ordenados = ordenarLinks(links);

  return (
    <>
      <List.Subheader>Links útiles</List.Subheader>
      {ordenados.map((l) => (
        <List.Item
          key={l.id}
          title={l.titulo}
          left={(props) => <List.Icon {...props} icon={l.icono} />}
          onPress={() => void Linking.openURL(l.url)}
        />
      ))}
    </>
  );
}
