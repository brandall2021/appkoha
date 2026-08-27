import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text, useTheme, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { shadows, borderRadius, spacing } from "../../theme";

const MOCK_NEWS = [
  {
    id: 1,
    titulo: "Inscripcion al semestre 2026-2",
    resumen: "Abierta la inscripcion para el segundo semestre. Consulta los requisitos en la secretaria.",
    fecha: "2026-08-20",
    icon: "school" as const,
    color: "#1B5E20",
  },
  {
    id: 2,
    titulo: "Biblioteca: nuevo horarioExtendido",
    resumen: "A partir de septiembre la biblioteca abrira de 8 a 22 hs.",
    fecha: "2026-08-18",
    icon: "book-open-variant" as const,
    color: "#00695C",
  },
  {
    id: 3,
    titulo: "Workshop de investigacion",
    resumen: "Jornada de capacitacion en metodos de investigacion. Cupos limitados.",
    fecha: "2026-08-15",
    icon: "microscope" as const,
    color: "#E65100",
  },
];

export default function RecentNews() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Novedades recientes
        </Text>
        <Pressable onPress={() => router.push("/novedades")}>
          <Text variant="labelMedium" style={{ color: theme.colors.primary, fontWeight: "600" }}>
            Ver todo
          </Text>
        </Pressable>
      </View>

      {MOCK_NEWS.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => router.push(`/novedad/${item.id}`)}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: theme.colors.surface },
            shadows.sm,
            pressed && { transform: [{ scale: 0.98 }], opacity: 0.85 },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${item.color}15` }]}>
            <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
          </View>
          <View style={styles.content}>
            <Text variant="bodyMedium" style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={1}>
              {item.titulo}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }} numberOfLines={2}>
              {item.resumen}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.outline} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: borderRadius.lg,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
    marginBottom: 2,
  },
});
