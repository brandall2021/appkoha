import Fastify, { type FastifyInstance } from "fastify";
import { registerRoutes } from "./routes.js";
import { createDirectusClient, type DirectusClient } from "./directus.js";

export interface AppConfig {
  sharedSecret: string;
  vapidPublicKey: string;
  vapidPrivateKey: string;
  directusUrl?: string;
  directusServiceToken?: string;
}

export function buildApp(cfg: AppConfig, directus?: DirectusClient): FastifyInstance {
  if (!cfg.sharedSecret) throw new Error("SHARED_SECRET es obligatorio");
  const dc =
    directus ??
    createDirectusClient(cfg.directusUrl ?? "", cfg.directusServiceToken ?? "");
  const app = Fastify({ logger: false });
  registerRoutes(app, cfg, dc);
  return app;
}
