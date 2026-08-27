import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAppStore, loadPersistedState } from "../src/stores/appStore";
import { lightTheme, darkTheme } from "../src/theme";
import { usePushRegistration } from "../src/hooks/usePushRegistration";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isDarkMode } = useAppStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  usePushRegistration();

  useEffect(() => {
    loadPersistedState();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="login"
            options={{
              headerShown: true,
              title: "Iniciar sesion",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="book/[id]"
            options={{
              headerShown: true,
              title: "Detalle del libro",
            }}
          />
          <Stack.Screen
            name="novedad/[id]"
            options={{
              headerShown: true,
              title: "Novedad",
            }}
          />
          <Stack.Screen
            name="scanner"
            options={{
              headerShown: true,
              title: "Escanear",
              presentation: "fullScreenModal",
            }}
          />
          <Stack.Screen
            name="ai"
            options={{
              headerShown: true,
              title: "Asistente IA",
            }}
          />
          <Stack.Screen
            name="search"
            options={{
              headerShown: true,
              title: "Buscar",
            }}
          />
          <Stack.Screen
            name="correlatividades"
            options={{
              headerShown: true,
              title: "Correlatividades",
            }}
          />
        </Stack>
      </PaperProvider>
    </QueryClientProvider>
  );
}
