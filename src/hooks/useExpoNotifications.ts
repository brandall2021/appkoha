import { useRef, useEffect, useCallback } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_PUSH_TOKEN = "push.token";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface ExpoNotificationsState {
  /** Push token de Expo, o null si no se ha obtenido aún. No es reactivo (ref). */
  pushToken: string | null;
  /** Solicita permisos de notificación y obtiene el push token. */
  requestPermissions: () => Promise<boolean>;
  /** Última notificación recibida. No es reactiva (ref). */
  lastNotification: Notifications.Notification | null;
}

/** Extraído para testing sin DOM. */
export function handleNotificationResponseFactory(
  pushTo: (path: string) => void,
): (response: Notifications.NotificationResponse) => void {
  return (response) => {
    const data = response.notification.request.content.data;
    if (data?.novedadId) {
      pushTo(`/novedad/${data.novedadId}`);
    }
  };
}

/** Extraído para testing sin DOM. */
export async function requestPermissionsCore(): Promise<{ granted: boolean; token: string | null }> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return { granted: false, token: null };
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    await AsyncStorage.setItem(KEY_PUSH_TOKEN, tokenData.data);
    return { granted: true, token: tokenData.data };
  } catch {
    return { granted: true, token: null };
  }
}

/**
 * Hook para gestionar notificaciones push con Expo.
 *
 * Registra listeners para notificaciones entrantes y respuestas del usuario.
 * Navega a `/novedad/{novedadId}` cuando el usuario toca una notificación.
 *
 * **Gotcha — refs no reactivas:** `pushToken` y `lastNotification` se almacenan
 * en `useRef`, por lo que NO provocan re-render al cambiarse. El componente
 * consumidor debe forzar re-render por otra vía (invalidación de query,
 * estado local, etc.) para observar valores actualizados de estos campos.
 */
export function useExpoNotifications(): ExpoNotificationsState {
  const router = useRouter();
  const lastNotification = useRef<Notifications.Notification | null>(null);
  const pushTokenRef = useRef<string | null>(null);

  const handleNotificationResponse = useCallback(
    handleNotificationResponseFactory((path) => router.push(path)),
    [router],
  );

  const handleNotification = useCallback((notification: Notifications.Notification) => {
    lastNotification.current = notification;
  }, []);

  useEffect(() => {
    const subResponse = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    const subReceived = Notifications.addNotificationReceivedListener(handleNotification);
    return () => {
      subResponse.remove();
      subReceived.remove();
    };
  }, [handleNotificationResponse, handleNotification]);

  useEffect(() => {
    (async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        if (existingStatus !== "granted") return;
        const tokenData = await Notifications.getExpoPushTokenAsync();
        pushTokenRef.current = tokenData.data;
        await AsyncStorage.setItem(KEY_PUSH_TOKEN, tokenData.data);
      } catch {
        // Token fetch failed silently
      }
    })();
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const { granted } = await requestPermissionsCore();
    return granted;
  }, []);

  return {
    pushToken: pushTokenRef.current,
    requestPermissions,
    lastNotification: lastNotification.current,
  };
}
