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
  pushToken: string | null;
  requestPermissions: () => Promise<boolean>;
  lastNotification: Notifications.Notification | null;
}

export function useExpoNotifications(): ExpoNotificationsState {
  const router = useRouter();
  const lastNotification = useRef<Notifications.Notification | null>(null);
  const pushTokenRef = useRef<string | null>(null);

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;
      if (data?.novedadId) {
        router.push(`/novedad/${data.novedadId}`);
      }
    },
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
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return false;
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      pushTokenRef.current = tokenData.data;
      await AsyncStorage.setItem(KEY_PUSH_TOKEN, tokenData.data);
    } catch {
      // Token fetch failed
    }
    return true;
  }, []);

  return {
    pushToken: pushTokenRef.current,
    requestPermissions,
    lastNotification: lastNotification.current,
  };
}
