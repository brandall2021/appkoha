import React from "react";
import { Text } from "react-native-paper";
import { stripHtml } from "./strip-html";

export interface HTMLSimpleProps {
  html: string;
}

export function HTMLSimple({ html }: HTMLSimpleProps) {
  const texto = stripHtml(html);
  return <Text variant="bodyMedium">{texto}</Text>;
}
