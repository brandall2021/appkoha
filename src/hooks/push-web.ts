import type { TokenPlataforma } from "./usePushRegistration";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export async function registrarTokenWeb(): Promise<TokenPlataforma | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return null;
  }
  if (typeof Notification === "undefined") return null;
  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") return null;

  const vapid = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  if (!vapid) return null;

  const reg = await navigator.serviceWorker.register("/push-service-worker.js");
  await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapid).buffer as ArrayBuffer,
  });
  return { token: JSON.stringify(sub), tipo: "web" };
}
