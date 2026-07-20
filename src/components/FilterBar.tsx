import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { borderRadius } from "../theme";

export interface FilterOption {
  label: string;
  value: string;
  icon?: string;
}

interface Props {
  filters: FilterOption[];
  selected: string[];
  onSelect: (value: string) => void;
  multi?: boolean;
}

export default function FilterBar({ filters, selected, onSelect, multi = false }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {filters.map((item) => {
          const isSelected = multi
            ? selected.includes(item.value)
            : selected[0] === item.value;

          return (
            <Pressable
              key={item.value}
              onPress={() => onSelect(item.value)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primaryContainer
                    : "transparent",
                  borderColor: isSelected
                    ? theme.colors.primary
                    : theme.colors.outlineVariant,
                  borderWidth: isSelected ? 0 : 1,
                },
                pressed && { opacity: 0.75, transform: [{ scale: 0.96 }] },
              ]}
            >
              {item.icon && (
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={16}
                  color={isSelected ? theme.colors.primary : theme.colors.outline}
                  style={{ marginRight: 6 }}
                />
              )}
              <Text
                style={{
                  color: isSelected ? theme.colors.primary : theme.colors.onSurface,
                  fontWeight: isSelected ? "700" : "500",
                  fontSize: 13,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  list: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
  },
});
