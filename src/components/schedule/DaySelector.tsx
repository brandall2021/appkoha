import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { borderRadius, spacing } from "../../theme";

const DAYS = [
  { key: "lunes", short: "Lun", num: 1 },
  { key: "martes", short: "Mar", num: 2 },
  { key: "miercoles", short: "Mie", num: 3 },
  { key: "jueves", short: "Jue", num: 4 },
  { key: "viernes", short: "Vie", num: 5 },
] as const;

interface DaySelectorProps {
  selectedDay: string;
  onDaySelect: (day: string) => void;
}

export function DaySelector({ selectedDay, onDaySelect }: DaySelectorProps) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {DAYS.map((day) => {
        const isSelected = selectedDay === day.key;
        return (
          <Pressable
            key={day.key}
            onPress={() => onDaySelect(day.key)}
            style={({ pressed }) => [
              styles.dayPill,
              {
                backgroundColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.surfaceVariant,
                borderColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.outlineVariant,
              },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text
              variant="labelMedium"
              style={{
                color: isSelected ? theme.colors.onPrimary : theme.colors.onSurface,
                fontWeight: isSelected ? "700" : "500",
              }}
            >
              {day.short}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: 8,
  },
  dayPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    alignItems: "center",
    minWidth: 56,
  },
});
