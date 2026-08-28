import React, { useState } from "react";
import { ScrollView, RefreshControl, View, StyleSheet } from "react-native";
import { Text, useTheme, Surface, Chip } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import {
  getGuaraníStudent,
  getGuaraníSchedule,
  getGuaraníSubjects,
  getGuaraníCorrelativities,
} from "../../lib/api/auth";
import { spacing, borderRadius } from "../../theme";

type Seccion = "datos" | "horarios" | "materias" | "correlativas";

const SECCIONES: { key: Seccion; label: string; icon: string }[] = [
  { key: "datos", label: "Datos", icon: "account" },
  { key: "horarios", label: "Horarios", icon: "calendar-clock" },
  { key: "materias", label: "Materias", icon: "book-open-variant" },
  { key: "correlativas", label: "Correlatividades", icon: "link" },
];

const DIAS: Record<string, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
};

function hora(i: { hora_inicio: string; hora_fin: string }): string {
  const fmt = (h: string) => {
    const [hh, mm] = h.split(":").slice(0, 2).map(Number);
    return `${String(hh).padStart(2, "0")}:${String(mm ?? 0).padStart(2, "0")}`;
  };
  return `${fmt(i.hora_inicio)} - ${fmt(i.hora_fin)}`;
}

export function GuaraniScreen() {
  const theme = useTheme();
  const [seccion, setSeccion] = useState<Seccion>("datos");

  const student = useQuery({ queryKey: ["guarani", "student"], queryFn: getGuaraníStudent });
  const schedule = useQuery({ queryKey: ["guarani", "schedule"], queryFn: getGuaraníSchedule });
  const subjects = useQuery({ queryKey: ["guarani", "subjects"], queryFn: getGuaraníSubjects });
  const correl = useQuery({ queryKey: ["guarani", "correlativities"], queryFn: getGuaraníCorrelativities });

  const refetchAll = () => {
    void student.refetch();
    void schedule.refetch();
    void subjects.refetch();
    void correl.refetch();
  };

  const refreshing =
    student.isRefetching || schedule.isRefetching || subjects.isRefetching || correl.isRefetching;

  const isError =
    student.isError || schedule.isError || subjects.isError || correl.isError;

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetchAll} />}
    >
      <Text variant="headlineSmall" style={styles.title}>
        Acceso Guaraní
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.outline, marginHorizontal: spacing.lg, marginBottom: spacing.md }}>
        Tu estado académico en la UNT
      </Text>

      <View style={styles.chips}>
        {SECCIONES.map((s) => (
          <Chip
            key={s.key}
            selected={seccion === s.key}
            onPress={() => setSeccion(s.key)}
            style={{ marginBottom: 6 }}
            showSelectedCheck={false}
          >
            <View style={styles.chipInner}>
              <MaterialCommunityIcons
                name={s.icon as any}
                size={16}
                color={seccion === s.key ? theme.colors.primary : theme.colors.outline}
              />
              <Text style={{ color: seccion === s.key ? theme.colors.primary : theme.colors.onSurface }}>
                {" "}{s.label}
              </Text>
            </View>
          </Chip>
        ))}
      </View>

      {isError && (
        <Surface style={[styles.emptyCard, { backgroundColor: theme.colors.errorContainer }]}>
          <MaterialCommunityIcons name="alert-circle" size={28} color={theme.colors.error} />
          <Text variant="bodyMedium" style={{ color: theme.colors.error, marginTop: 8, textAlign: "center" }}>
            No se pudieron cargar los datos de Guaraní.
          </Text>
        </Surface>
      )}

      {seccion === "datos" && <SeccionDatos data={student.data?.data} loading={student.isLoading} />}
      {seccion === "horarios" && <SeccionHorarios data={schedule.data?.data} loading={schedule.isLoading} />}
      {seccion === "materias" && <SeccionMaterias data={subjects.data?.data} loading={subjects.isLoading} />}
      {seccion === "correlativas" && <SeccionCorrelativas data={correl.data?.data} loading={correl.isLoading} />}
    </ScrollView>
  );
}

function SeccionDatos({ data, loading }: { data?: any; loading?: boolean }) {
  const theme = useTheme();
  if (loading) return <Cargando />;
  if (!data) return null;
  return (
    <View style={styles.wrap}>
      <CardRow icon="account" titulo="Nombre" valor={data.nombre} />
      <CardRow icon="card-account-details" titulo="Padrón" valor={String(data.padron)} />
      <CardRow icon="school" titulo="Carrera" valor={data.carrera} />
      <CardRow
        icon={data.estado === "activo" ? "check-circle" : "alert-circle"}
        titulo="Estado"
        valor={data.estado}
        colorProp={data.estado === "activo" ? "#2E7D32" : theme.colors.error}
      />
    </View>
  );
}

function SeccionHorarios({ data, loading }: { data?: any[]; loading?: boolean }) {
  const theme = useTheme();
  if (loading) return <Cargando />;
  const items = data ?? [];
  return (
    <View style={styles.wrap}>
      {items.length === 0 && <Vacio texto="No hay horarios cargados." />}
      {items.map((it, i) => (
        <Surface key={i} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="calendar-clock" size={22} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="titleSmall" style={{ fontWeight: "700" }}>{it.materia_nombre}</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
              {DIAS[it.dia] ?? it.dia} · {hora(it)}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Aula {it.aula}</Text>
          </View>
        </Surface>
      ))}
    </View>
  );
}

function SeccionMaterias({ data, loading }: { data?: any[]; loading?: boolean }) {
  const theme = useTheme();
  if (loading) return <Cargando />;
  const items = data ?? [];
  return (
    <View style={styles.wrap}>
      {items.length === 0 && <Vacio texto="No hay materias cargadas." />}
      {items.map((it, i) => (
        <Surface key={i} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="book-open-variant" size={22} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="titleSmall" style={{ fontWeight: "700" }}>{it.materia_nombre}</Text>
            {it.correlativas?.length > 0 && (
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                Correlativas: {it.correlativas.join(", ")}
              </Text>
            )}
          </View>
        </Surface>
      ))}
    </View>
  );
}

function SeccionCorrelativas({ data, loading }: { data?: any[]; loading?: boolean }) {
  const theme = useTheme();
  if (loading) return <Cargando />;
  const items = data ?? [];
  return (
    <View style={styles.wrap}>
      {items.length === 0 && <Vacio texto="No hay correlatividades cargadas." />}
      {items.map((it, i) => (
        <Surface key={i} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name={it.aprobada ? "check-circle" : it.habilitada ? "play-circle" : "lock"}
              size={22}
              color={it.aprobada ? "#2E7D32" : it.habilitada ? theme.colors.primary : theme.colors.outline}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="titleSmall" style={{ fontWeight: "700" }}>{it.materia_nombre}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              {it.aprobada ? "Aprobada" : it.habilitada ? "Habilitada" : "Bloqueada"}
              {it.correlativas?.length > 0 ? ` · Corr: ${it.correlativas.join(", ")}` : ""}
            </Text>
          </View>
        </Surface>
      ))}
    </View>
  );
}

function CardRow({ icon, titulo, valor, colorProp }: { icon: string; titulo: string; valor: string; colorProp?: string }) {
  const theme = useTheme();
  const color = colorProp ?? theme.colors.primary;
  return (
    <Surface style={[styles.card, { backgroundColor: theme.colors.surface, marginHorizontal: spacing.lg }]}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}15` }]}>
        <MaterialCommunityIcons name={icon as any} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>{titulo}</Text>
        <Text variant="titleSmall" style={{ fontWeight: "700", color }}>{valor}</Text>
      </View>
    </Surface>
  );
}

function Cargando() {
  const theme = useTheme();
  return <Text style={{ padding: spacing.lg, color: theme.colors.outline }}>Cargando...</Text>;
}

function Vacio({ texto }: { texto: string }) {
  const theme = useTheme();
  return <Text style={{ textAlign: "center", marginTop: 32, color: theme.colors.outline }}>{texto}</Text>;
}

const styles = StyleSheet.create({
  title: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    alignItems: "center",
  },
  chipInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  wrap: {
    gap: 10,
    paddingHorizontal: spacing.md,
  },
  emptyCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: borderRadius.lg,
    padding: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
});
