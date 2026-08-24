import type { FastifyInstance } from "fastify";
import type { AppConfig } from "./index.js";
import type { DirectusClient } from "./directus.js";
import { enviarATodos, type SendDeps } from "./send.js";

export function registerRoutes(app: FastifyInstance, cfg: AppConfig, dc: DirectusClient, deps: SendDeps): void {
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

  app.post("/send", async (req, reply) => {
    if (req.headers["x-shared-secret"] !== cfg.sharedSecret) {
      return reply.code(403).send({ error: "forbidden" });
    }
    const { titulo, id } = (req.body ?? {}) as { titulo?: string; id?: string };
    if (!titulo || !id) return reply.code(400).send({ error: "titulo e id son obligatorios" });
    await enviarATodos(dc, deps, {
      title: "Biblioteca",
      body: titulo,
      data: { id, url: `/novedad/${id}` },
    });
    return reply.code(202).send({ ok: true });
  });
}
