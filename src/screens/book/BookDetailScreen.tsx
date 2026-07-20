import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, Share, Pressable, Animated } from "react-native";
import {
  Text, useTheme, Button, Surface, Divider,
  Chip, IconButton, Portal, Modal,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getKohaAPI } from "../../api/koha";
import { Biblio, Item } from "../../types";
import { useAppStore } from "../../stores/appStore";
import { shadows, borderRadius, motion } from "../../theme";
import { BookCardSkeleton } from "../../components/Skeleton";

export default function BookDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { toggleFavorite, isFavorite, patron, isDarkMode } = useAppStore();
  const [biblio, setBiblio] = useState<Biblio | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [biblioId, setBiblioId] = useState<number>(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const coverScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (id) {
      const numId = parseInt(id, 10);
      setBiblioId(numId);
      loadBiblio(numId);
    }
  }, [id]);

  useEffect(() => {
    if (!loading && biblio) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 100,
          useNativeDriver: true,
        }),
        Animated.spring(coverScale, {
          toValue: 1,
          damping: 15,
          stiffness: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, biblio]);

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
        <BookCardSkeleton />
      </View>
    );
  }

  if (!biblio) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <MaterialCommunityIcons name="book-off" size={64} color={theme.colors.outline} />
        <Text variant="titleMedium" style={{ marginTop: 16, color: theme.colors.onBackground }}>
          Libro no encontrado
        </Text>
        <Button mode="text" onPress={() => router.back()} style={{ marginTop: 8 }}>
          Volver
        </Button>
      </View>
    );
  }

  const items = biblio.items || [];
  const availableItems = items.filter(
    (i) => !i.onloan && !i.itemlost && i.notforloan === 0
  );
  const fav = isFavorite(biblioId);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Hero Cover Section */}
      <View style={[styles.coverSection, { backgroundColor: isDarkMode ? "#1A1A1A" : "#F5F5F5" }]}>
        <Animated.View
          style={[
            styles.coverImage,
            {
              backgroundColor: theme.colors.primaryContainer,
              transform: [{ scale: coverScale }],
            },
            shadows.xl,
          ]}
        >
          <Text style={[styles.coverLetter, { color: theme.colors.primary }]}>
            {(biblio.title || "?")[0].toUpperCase()}
          </Text>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Title & Actions */}
        <View style={styles.titleRow}>
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onBackground }]}>
            {biblio.title || "Sin titulo"}
          </Text>
          <View style={styles.actions}>
            <Pressable
              onPress={() => toggleFavorite(biblioId)}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: `${fav ? "#E53935" : theme.colors.surfaceVariant}15` },
                pressed && { transform: [{ scale: 0.9 }], opacity: 0.7 },
              ]}
            >
              <MaterialCommunityIcons
                name={fav ? "heart" : "heart-outline"}
                size={22}
                color={fav ? "#E53935" : theme.colors.outline}
              />
            </Pressable>
            <Pressable
              onPress={handleShare}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: `${theme.colors.surfaceVariant}15` },
                pressed && { transform: [{ scale: 0.9 }], opacity: 0.7 },
              ]}
            >
              <MaterialCommunityIcons name="share-variant" size={20} color={theme.colors.outline} />
            </Pressable>
          </View>
        </View>

        {/* Author */}
        {biblio.author && (
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface, marginBottom: 4 }}>
            {biblio.author}
          </Text>
        )}

        {/* Chips */}
        <View style={styles.chipRow}>
          {biblio.isbn && (
            <Chip compact icon="barcode" style={[styles.chip, { backgroundColor: theme.colors.surfaceVariant }]}>
              ISBN: {biblio.isbn}
            </Chip>
          )}
          {biblio.language && (
            <Chip compact icon="translate" style={[styles.chip, { backgroundColor: theme.colors.surfaceVariant }]}>
              {biblio.language}
            </Chip>
          )}
          <Chip
            compact
            style={[
              styles.chip,
              {
                backgroundColor: availableItems.length > 0 ? "rgba(46, 125, 50, 0.12)" : "rgba(230, 81, 0, 0.12)",
              },
            ]}
            textStyle={{
              color: availableItems.length > 0 ? "#2E7D32" : "#E65100",
              fontWeight: "600",
            }}
          >
            {availableItems.length > 0
              ? `${availableItems.length} disponible(s)`
              : "No disponible"}
          </Chip>
        </View>

        {/* Subtitle */}
        {biblio.subtitle && (
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.outline }]}>
            {biblio.subtitle}
          </Text>
        )}

        <Divider style={styles.divider} />

        {/* Bibliographic Info Card */}
        <Surface style={[styles.infoCard, { backgroundColor: theme.colors.surface }, shadows.sm]} elevation={0}>
          <View style={styles.infoCardHeader}>
            <MaterialCommunityIcons name="information-outline" size={18} color={theme.colors.primary} />
            <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Informacion bibliografica
            </Text>
          </View>
          {[
            { label: "Editorial", value: biblio.publishercode, icon: "office-building" },
            { label: "Lugar", value: biblio.place, icon: "map-marker" },
            { label: "Ano", value: biblio.copyrightdate, icon: "calendar" },
            { label: "Paginas", value: biblio.pages, icon: "book-open-page-variant" },
            { label: "ISSN", value: biblio.issn, icon: "barcode" },
            { label: "Clasificacion", value: biblio.cn_class, icon: "tag" },
            { label: "Serie", value: biblio.seriestitle, icon: "bookmark" },
          ]
            .filter((f) => f.value)
            .map((field, i) => (
              <View key={i} style={[styles.fieldRow, { borderBottomColor: theme.colors.outlineVariant }]}>
                <MaterialCommunityIcons name={field.icon as any} size={14} color={theme.colors.outline} style={{ marginRight: 8 }} />
                <Text variant="bodySmall" style={{ color: theme.colors.outline, width: 80 }}>
                  {field.label}
                </Text>
                <Text variant="bodyMedium" style={{ flex: 1, color: theme.colors.onSurface }}>
                  {field.value}
                </Text>
              </View>
            ))}
        </Surface>

        {/* Items/Copies Card */}
        {items.length > 0 && (
          <Surface style={[styles.infoCard, { backgroundColor: theme.colors.surface }, shadows.sm]} elevation={0}>
            <View style={styles.infoCardHeader}>
              <MaterialCommunityIcons name="book-multiple" size={18} color={theme.colors.primary} />
              <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Ejemplares ({items.length})
              </Text>
            </View>
            {items.map((item, i) => (
              <View key={item.item_id || i} style={[styles.itemRow, { borderBottomColor: theme.colors.outlineVariant }]}>
                <View style={styles.itemInfo}>
                  <Text variant="bodyMedium" style={{ fontWeight: "600", color: theme.colors.onSurface }}>
                    {item.barcode || `Ejemplar ${i + 1}`}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    {item.homebranch || ""} {item.location ? `- ${item.location}` : ""}
                  </Text>
                </View>
                <Chip
                  compact
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor: !item.onloan
                        ? "rgba(46, 125, 50, 0.12)"
                        : item.itemlost
                          ? "rgba(198, 40, 40, 0.12)"
                          : "rgba(230, 81, 0, 0.12)",
                    },
                  ]}
                  textStyle={{
                    color: !item.onloan
                      ? "#2E7D32"
                      : item.itemlost
                        ? "#C62828"
                        : "#E65100",
                    fontSize: 10,
                    fontWeight: "600",
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
          </Surface>
        )}

        {/* Notes Card */}
        {biblio.notes && (
          <Surface style={[styles.infoCard, { backgroundColor: theme.colors.surface }, shadows.sm]} elevation={0}>
            <View style={styles.infoCardHeader}>
              <MaterialCommunityIcons name="text-box-outline" size={18} color={theme.colors.primary} />
              <Text variant="titleSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Resumen
              </Text>
            </View>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, lineHeight: 22 }}>
              {biblio.notes}
            </Text>
          </Surface>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          {availableItems.length > 0 && patron && (
            <Button
              mode="contained"
              onPress={() => setShowHoldModal(true)}
              style={[styles.holdButton, { backgroundColor: theme.colors.primary }]}
              contentStyle={{ paddingVertical: 6 }}
              labelStyle={{ fontWeight: "700" }}
              icon="book-plus"
              buttonColor={theme.colors.primary}
            >
              Reservar
            </Button>
          )}
          <Button
            mode="outlined"
            onPress={() => router.push("/search")}
            style={[styles.backButton, { borderColor: theme.colors.outlineVariant }]}
            labelStyle={{ color: theme.colors.onSurface }}
          >
            Volver a buscar
          </Button>
        </View>

        <View style={{ height: 48 }} />
      </Animated.View>

      {/* Hold Modal */}
      <Portal>
        <Modal
          visible={showHoldModal}
          onDismiss={() => setShowHoldModal(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }, shadows.xl]}
        >
          <View style={styles.modalHeader}>
            <View style={[styles.modalIcon, { backgroundColor: "rgba(46, 125, 50, 0.12)" }]}>
              <MaterialCommunityIcons name="book-plus" size={28} color="#2E7D32" />
            </View>
          </View>
          <Text variant="titleMedium" style={[styles.modalTitle, { color: theme.colors.onBackground }]}>
            Confirmar reserva
          </Text>
          <Text variant="bodyMedium" style={[styles.modalDescription, { color: theme.colors.outline }]}>
            Deseas reservar "{biblio.title}"? Te notificaremos cuando este disponible.
          </Text>
          <View style={styles.modalActions}>
            <Button
              onPress={() => setShowHoldModal(false)}
              textColor={theme.colors.outline}
              style={styles.modalCancelButton}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleHold}
              style={styles.modalConfirmButton}
              buttonColor="#2E7D32"
            >
              Confirmar reserva
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
    height: 240,
    justifyContent: "center",
    alignItems: "center",
  },
  coverImage: {
    width: 140,
    height: 190,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  coverLetter: {
    fontSize: 56,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    fontWeight: "800",
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
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
  chip: {
    borderRadius: borderRadius.pill,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  infoCard: {
    marginBottom: 14,
    borderRadius: borderRadius.lg,
    padding: 16,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontWeight: "700",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    height: 26,
    borderRadius: borderRadius.pill,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  holdButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
  },
  backButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
  },
  modal: {
    margin: 24,
    padding: 28,
    borderRadius: borderRadius.xl,
    alignItems: "center",
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  modalDescription: {
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalCancelButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
  modalConfirmButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
});
