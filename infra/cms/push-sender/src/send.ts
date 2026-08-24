import webpush from "web-push";
import type { DirectusClient } from "./directus.js";

export interface PushPayload {
  title: string;
  body: string;
  data: { id: string; url: string };
}

export interface SendDeps {
  enviarExpo(token: string, p: PushPayload): Promise<number>;
  enviarWeb(subscriptionJson: string, p: PushPayload): Promise<number>;
}

export async function enviarExpoReal(token: string, p: PushPayload): Promise<number> {
  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ to: token, title: p.title, body: p.body, data: p.data, sound: "default" }),
  });
  return res.status;
}

export function enviarWebReal(vapidPublicKey: string, vapidPrivateKey: string) {
  return async (subscriptionJson: string, p: PushPayload): Promise<number> => {
    try {
      await webpush.sendNotification(JSON.parse(subscriptionJson), Buffer.from(JSON.stringify(p)), {
        vapidDetails: {
          subject: process.env.VAPID_SUBJECT ?? "mailto:admin@institucion.edu.ar",
          publicKey: vapidPublicKey,
          privateKey: vapidPrivateKey,
        },
      });
      return 201;
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      return status ?? 500;
    }
  };
}

const VENCIDO = new Set([404, 410]);

export async function enviarATodos(
  dc: DirectusClient,
  deps: SendDeps,
  payload: PushPayload
): Promise<{ enviados: number; limpiados: number }> {
  const tokens = await dc.listItems<{ id: string; token: string; tipo: string }>("push_tokens");
  let enviados = 0;
  let limpiados = 0;
  for (const row of tokens) {
    try {
      const status =
        row.tipo === "expo"
          ? await deps.enviarExpo(row.token, payload)
          : await deps.enviarWeb(row.token, payload);
      if (VENCIDO.has(status)) {
        await dc.deleteItem("push_tokens", row.id);
        limpiados++;
      } else if (status >= 200 && status < 300) {
        enviados++;
      }
    } catch (err) {
      console.error(`fallo envío a ${row.tipo}:${row.id}`, err);
    }
  }
  return { enviados, limpiados };
}
