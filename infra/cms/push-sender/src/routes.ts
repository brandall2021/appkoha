import type { FastifyInstance } from "fastify";
import type { AppConfig } from "./index.js";

export function registerRoutes(app: FastifyInstance, cfg: AppConfig): void {
  app.get("/health", async () => ({ ok: true }));
}
