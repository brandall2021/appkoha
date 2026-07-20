import React, { useState, useRef } from "react";
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import {
  Text, useTheme, TextInput, IconButton, Surface, Chip,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getKohaAPI } from "../../api/koha";
import { Biblio } from "../../types";
import { useRouter } from "expo-router";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  results?: Biblio[];
}

export default function AIScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content:
        "Hola! Soy tu asistente de busqueda. Puedo ayudarte a encontrar libros por tema, autor o cualquier palabra clave. Ejemplos:\n\n- \"Libros de inteligencia artificial\"\n- \"Tesis de derecho constitucional\"\n- \"Libros disponibles sobre economia\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const query = input.trim();
    setInput("");
    setLoading(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const api = getKohaAPI();
      const data = await api.searchBiblios(query, 1, 5);
      const results = data.biblios || [];

      let response = "";
      if (results.length === 0) {
        response = `No encontre libros para "${query}". Intenta con otros terminos.`;
      } else {
        response = `Encontre ${results.length} libro(s) que podrian interesarte:`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: response,
          results,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Lo siento, hubo un error al buscar. Intenta de nuevo.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.role === "user"
          ? [styles.userBubble, { backgroundColor: theme.colors.primary }]
          : [styles.assistantBubble, { backgroundColor: theme.colors.surfaceVariant }],
      ]}
    >
      <Text
        variant="bodyMedium"
        style={{
          color: item.role === "user" ? "#FFFFFF" : theme.colors.onSurface,
        }}
      >
        {item.content}
      </Text>

      {item.results && item.results.length > 0 && (
        <View style={styles.results}>
          {item.results.map((biblio) => (
            <Surface
              key={biblio.biblio_id}
              style={[styles.resultCard, { backgroundColor: theme.colors.surface }]}
              elevation={1}
            >
              <View
                style={[
                  styles.resultCover,
                  { backgroundColor: theme.colors.primaryContainer },
                ]}
              >
                <Text style={{ color: theme.colors.primary, fontWeight: "bold", fontSize: 16 }}>
                  {(biblio.title || "?")[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.resultInfo}>
                <Text variant="bodySmall" numberOfLines={2} style={{ fontWeight: "600" }}>
                  {biblio.title}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  {biblio.author || ""}
                </Text>
              </View>
            </Surface>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
        inverted={false}
      />

      <View style={[styles.inputBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant }]}>
        <TextInput
          placeholder="Pregunta sobre libros..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          mode="outlined"
          style={styles.textInput}
          right={
            <IconButton
              icon="send"
              iconColor={theme.colors.primary}
              onPress={handleSend}
              disabled={loading || !input.trim()}
            />
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: "92%",
  },
  userBubble: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  results: {
    marginTop: 12,
    gap: 8,
  },
  resultCard: {
    flexDirection: "row",
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  resultCover: {
    width: 36,
    height: 48,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  resultInfo: {
    flex: 1,
  },
  inputBar: {
    padding: 12,
    borderTopWidth: 0.5,
  },
  textInput: {
    borderRadius: 24,
  },
});
