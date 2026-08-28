import React, { useEffect } from "react";
import { Tabs, Redirect } from "expo-router";
import { useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/stores/authStore";

export default function TabLayout() {
  const theme = useTheme();
  const { token, isLoading, loadToken } = useAuthStore();

  useEffect(() => {
    loadToken();
  }, [loadToken]);

  if (!isLoading && !token) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: {
          borderTopColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.surface,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="horarios"
        options={{
          title: "Horarios",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-clock" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Buscar",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favoritos",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="novedades"
        options={{
          title: "Novedades",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell-ring" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="guarani"
        options={{
          title: "Guaraní",
          headerTitle: "Acceso Guaraní",
          href: null,
        }}
      />
      <Tabs.Screen
        name="links-utiles"
        options={{
          title: "Links Utiles",
          headerTitle: "Links Utiles",
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cuenta",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
