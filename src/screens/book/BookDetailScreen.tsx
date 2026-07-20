import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Share } from "react-native";
import {
  Text, useTheme, Button, Card, Surface, Divider,
  ActivityIndicator, Chip, IconButton, Portal, Modal,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getKohaAPI } from "../../api/koha";
import { Biblio, Item } from "../../types";
import { useAppStore } from "../../stores/appStore";

export default function BookDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { toggleFavorite, isFavorite, patron } = useAppStore();
  const [biblio, setBiblio] = useState<Biblio | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [biblioId, setBiblioId] = useState<number>(0);

  useEffect(() => {
    if (id) {
      const numId = parseInt(id, 10);
      setBiblioId(numId);
      loadBiblio(numId);
    }
  }, [id]);

  const loadBiblio = async (biblioId: number) => {
    setLoading(true);
    try {
      const api = getKohaAPI();
      const data = await api.getBiblio(biblioId);
      setBiblio(data);
    } catch (err: any) {
      console.error("Error loading biblio:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!biblio) return;
    try {
      await Share.share({
        message: `${biblio.title}\n${biblio.author ? `por ${biblio.author}` : ""}\nISBN: ${biblio.isbn || "N/A"}`,
      });
    } catch {}
  };

  const handleHold = async () => {
    if (!patron || !biblioId) return;
    try {
      const api = getKohaAPI();
      await api.placeHold(biblioId, patron.patron_id);
      setShowHoldModal(false);
      loadBiblio(biblioId);
    } catch (err: any) {
      console.error("Error placing hold:", err);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!biblio) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="book-off" size={64} color={theme.colors.outline} />
        <Text variant="titleMedium" style={{ marginTop: 16 }}>
          Libro no encontrado
        </Text>
      </View>
    );
  }

  const items = biblio.items || [];
  const availableItems = items.filter(
    (i) => !i.onloan && !i.itemlost && i.notforloan === 0
  );
  const fav = isFavorite(biblioId);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.coverSection, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
        <View style={[styles.coverImage, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.coverLetter, { color: theme.colors.primaryContainer }]}>
            {(biblio.title || "?")[0].toUpperCase()}
          </Text>
        </View>
      </Surface>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onBackground }]}>
            {biblio.title || "Sin titulo"}
          </Text>
          <View style={styles.actions}>
            <IconButton
              icon={fav ? "heart" : "heart-outline"}
              iconColor={fav ? "#E53935" : theme.colors.outline}
              onPress={() => toggleFavorite(biblioId)}
            />
            <IconButton icon="share-variant" iconColor={theme.colors.outline} onPress={handleShare} />
          </View>
        </View>

        {biblio.author && (
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, marginBottom: 4 }}>
            {biblio.author}
          </Text>
        )}

        <View style={styles.chipRow}>
          {biblio.isbn && (
            <Chip compact icon="barcode">
              ISBN: {biblio.isbn}
            </Chip>
          )}
          {biblio.language && (
            <Chip compact icon="translate">
              {biblio.language}
            </Chip>
          )}
          <Chip
            compact
            style={{
              backgroundColor: availableItems.length > 0 ? "#E8F5E9" : "#FFF3E0",
            }}
            textStyle={{
              color: availableItems.length > 0 ? "#2E7D32" : "#E65100",
            }}
          >
            {availableItems.length > 0
              ? `${availableItems.length} disponible(s)`
              : "No disponible"}
          </Chip>
        </View>

        {biblio.subtitle && (
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.outline }]}>
            {biblio.subtitle}
          </Text>
        )}

        <Divider style={styles.divider} />

        <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Informacion bibliografica
            </Text>
            {[
              { label: "Editorial", value: biblio.publishercode },
              { label: "Lugar", value: biblio.place },
              { label: "Ano", value: biblio.copyrightdate },
              { label: "Paginas", value: biblio.pages },
              { label: "ISSN", value: biblio.issn },
              { label: "Clasificacion", value: biblio.cn_class },
              { label: "Serie", value: biblio.seriestitle },
            ]
              .filter((f) => f.value)
              .map((field, i) => (
                <View key={i} style={styles.fieldRow}>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline, width: 100 }}>
                    {field.label}
                  </Text>
                  <Text variant="bodyMedium" style={{ flex: 1 }}>
                    {field.value}
                  </Text>
                </View>
              ))}
          </Card.Content>
        </Card>

        {items.length > 0 && (
          <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                Ejemplares ({items.length})
              </Text>
              {items.map((item, i) => (
                <View key={item.item_id || i} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text variant="bodyMedium" style={{ fontWeight: "500" }}>
                      {item.barcode || `Ejemplar ${i + 1}`}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                      {item.homebranch || ""} {item.location ? `- ${item.location}` : ""}
                    </Text>
                  </View>
                  <Chip
                    compact
                    style={{
                      backgroundColor: !item.onloan
                        ? "#E8F5E9"
                        : item.itemlost
                          ? "#FFEBEE"
                          : "#FFF3E0",
                    }}
                    textStyle={{
                      color: !item.onloan
                        ? "#2E7D32"
                        : item.itemlost
                          ? "#C62828"
                          : "#E65100",
                      fontSize: 10,
                    }}
                  >
                    {item.onloan
                      ? `Prestado`
                      : item.itemlost
                        ? "Perdido"
                        : item.notforloan === 0
                          ? "Disponible"
                          : "Solo consulta"}
                  </Chip>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {biblio.notes && (
          <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                Resumen
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {biblio.notes}
              </Text>
            </Card.Content>
          </Card>
        )}

        <View style={styles.buttonRow}>
          {availableItems.length > 0 && patron && (
            <Button
              mode="contained"
              onPress={() => setShowHoldModal(true)}
              style={styles.holdButton}
              icon="book-plus"
            >
              Reservar
            </Button>
          )}
          <Button
            mode="outlined"
            onPress={() => router.push("/search")}
            style={styles.backButton}
          >
            Volver a buscar
          </Button>
        </View>

        <View style={{ height: 48 }} />
      </View>

      <Portal>
        <Modal
          visible={showHoldModal}
          onDismiss={() => setShowHoldModal(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="titleMedium" style={{ fontWeight: "700", marginBottom: 12 }}>
            Confirmar reserva
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
            Deseas reservar "{biblio.title}"? Te notificaremos cuando este disponible.
          </Text>
          <View style={styles.modalActions}>
            <Button onPress={() => setShowHoldModal(false)} textColor={theme.colors.outline}>
              Cancelar
            </Button>
            <Button mode="contained" onPress={handleHold}>
              Confirmar
            </Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  coverSection: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  coverImage: {
    width: 120,
    height: 160,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  coverLetter: {
    fontSize: 48,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    fontWeight: "700",
    lineHeight: 28,
  },
  actions: {
    flexDirection: "row",
  },
  subtitle: {
    fontStyle: "italic",
    marginTop: 4,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  divider: {
    marginVertical: 16,
  },
  infoCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
  },
  itemInfo: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  holdButton: {
    flex: 1,
    borderRadius: 12,
  },
  backButton: {
    flex: 1,
    borderRadius: 12,
  },
  modal: {
    margin: 24,
    padding: 24,
    borderRadius: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
});
