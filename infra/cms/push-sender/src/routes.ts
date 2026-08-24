import type { FastifyInstance } from "fastify";
import type { AppConfig } from "./index.js";
import type { DirectusClient } from "./directus.js";

export function registerRoutes(app: FastifyInstance, cfg: AppConfig, dc: DirectusClient): void {
  app.get("/health", async () => ({ ok: true }));

  app.post("/register", async (req, reply) => {
    const body = (req.body ?? {}) as { token?: string; tipo?: string };
    const { token, tipo } = body;
    if (!token || (tipo !== "expo" && tipo !== "web")) {
      return reply.code(400).send({ error: "token y tipo (expo|web) son obligatorios" });
    }
    await dc.createItem("push_tokens", { token, tipo, creado: new Date().toISOString() });
    return reply.code(201).send({ ok: true });
  });
}
