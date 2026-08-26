import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { registrarTokenWeb } from "./push-web";

export interface TokenPlataforma {
  token: string;
  tipo: "expo" | "web";
}

export function extraerIdDeNotificacion(data: unknown): string | null {
  if (data && typeof data === "object" && "id" in data) {
    const id = (data as { id: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return String(id);
  }
  return null;
}

async function obtenerTokenPlataforma(): Promise<TokenPlataforma | null> {
  if (Platform.OS === "web") return registrarTokenWeb();
  const settings = await Notifications.getPermissionsAsync();
  let granted = settings.granted;
  if (!granted && settings.canAskAgain) {
    granted = (await Notifications.requestPermissionsAsync()).granted;
  }
  if (!granted) return null;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return null;
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return { token: data, tipo: "expo" };
}

export function usePushRegistration(): void {
  const router = useRouter();
  const registrado = useRef(false);

  useEffect(() => {
    if (registrado.current) return;
    registrado.current = true;
    obtenerTokenPlataforma()
      .then((t) => {
        if (!t) return;
        return fetch(`${process.env.EXPO_PUBLIC_PUSH_URL}/register`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-shared-secret": process.env.EXPO_PUBLIC_PUSH_SECRET ?? "",
          },
          body: JSON.stringify(t),
        });
      })
      .catch(() => {
        /* reintento en próximo arranque: registrado.current se resetea al recargar */
      });
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const id = extraerIdDeNotificacion(response.notification.request.content.data);
      if (id) router.push(`/novedad/${id}`);
    });
    return () => sub.remove();
  }, [router]);
}
