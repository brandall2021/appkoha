import Fastify, { type FastifyInstance } from "fastify";
import { registerRoutes } from "./routes.js";
import { createDirectusClient, type DirectusClient } from "./directus.js";
import { enviarExpoReal, enviarWebReal, type SendDeps } from "./send.js";

export interface AppConfig {
  sharedSecret: string;
  vapidPublicKey: string;
  vapidPrivateKey: string;
  directusUrl?: string;
  directusServiceToken?: string;
}

export function buildApp(cfg: AppConfig, directus?: DirectusClient, deps?: SendDeps): FastifyInstance {
  if (!cfg.sharedSecret) throw new Error("SHARED_SECRET es obligatorio");
  const dc =
    directus ??
    createDirectusClient(
      cfg.directusUrl ?? process.env.DIRECTUS_URL ?? "",
      cfg.directusServiceToken ?? process.env.DIRECTUS_SERVICE_TOKEN ?? ""
    );
  const resolvedDeps: SendDeps = deps ?? {
    enviarExpo: enviarExpoReal,
    enviarWeb: enviarWebReal(cfg.vapidPublicKey, cfg.vapidPrivateKey),
  };
  const app = Fastify({ logger: false });
  registerRoutes(app, cfg, dc, resolvedDeps);
  return app;
}
