import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, Chip, useTheme, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
      <FlatList
        horizontal
        data={filters}
        keyExtractor={(item) => item.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isSelected = multi
            ? selected.includes(item.value)
            : selected[0] === item.value;

          return (
            <Chip
              selected={isSelected}
              onPress={() => onSelect(item.value)}
              mode={isSelected ? "flat" : "outlined"}
              style={[
                styles.chip,
                isSelected && { backgroundColor: theme.colors.primaryContainer },
              ]}
              textStyle={
                isSelected ? { color: theme.colors.primary } : { color: theme.colors.onSurface }
              }
              icon={item.icon as any}
            >
              {item.label}
            </Chip>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  list: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    borderRadius: 20,
  },
});
