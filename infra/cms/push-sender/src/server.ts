import { buildApp } from "./index.js";

const app = buildApp({
  sharedSecret: require_env("SHARED_SECRET"),
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY ?? "",
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ?? "",
});
app.listen({ port: Number(process.env.PORT ?? 8056), host: "0.0.0.0" });

function require_env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} es obligatorio`);
  return v;
}
