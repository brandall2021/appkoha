import Fastify, { type FastifyInstance } from "fastify";
import { registerRoutes } from "./routes.js";

export interface AppConfig {
  sharedSecret: string;
  vapidPublicKey: string;
  vapidPrivateKey: string;
}

export function buildApp(cfg: AppConfig): FastifyInstance {
  if (!cfg.sharedSecret) throw new Error("SHARED_SECRET es obligatorio");
  const app = Fastify({ logger: false });
  registerRoutes(app, cfg);
  return app;
}
