import { describe, expect, it, vi } from "vitest";
import { buildApp } from "./index.js";
import type { DirectusClient } from "./directus.js";

function makeDirectusStub(): DirectusClient {
  return {
    createItem: vi.fn().mockResolvedValue(undefined),
    listItems: vi.fn().mockResolvedValue([]),
    deleteItem: vi.fn().mockResolvedValue(undefined),
  };
}

describe("push-sender", () => {
  it("GET /health responde ok", async () => {
    const app = buildApp({
      sharedSecret: "test-secret",
      vapidPublicKey: "x",
      vapidPrivateKey: "y",
    });
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
    await app.close();
  });

  it("rechuta arrancar sin SHARED_SECRET", () => {
    expect(() =>
      buildApp({ sharedSecret: "", vapidPublicKey: "x", vapidPrivateKey: "y" })
    ).toThrow(/SHARED_SECRET/);
  });
});

describe("POST /register", () => {
  it("guarda token válido y responde 201", async () => {
    const dc = makeDirectusStub();
    const app = buildApp(
      { sharedSecret: "s", vapidPublicKey: "x", vapidPrivateKey: "y" },
      dc
    );
    const res = await app.inject({
      method: "POST",
      url: "/register",
      payload: { token: "abc", tipo: "expo" },
    });
    expect(res.statusCode).toBe(201);
    expect(dc.createItem).toHaveBeenCalledWith("push_tokens", {
      token: "abc",
      tipo: "expo",
      creado: expect.any(String),
    });
    await app.close();
  });

  it("rechaza 400 si falta token o tipo inválido", async () => {
    const dc = makeDirectusStub();
    const app = buildApp(
      { sharedSecret: "s", vapidPublicKey: "x", vapidPrivateKey: "y" },
      dc
    );
    const r1 = await app.inject({ method: "POST", url: "/register", payload: { tipo: "expo" } });
    const r2 = await app.inject({ method: "POST", url: "/register", payload: { token: "a", tipo: "otro" } });
    expect(r1.statusCode).toBe(400);
    expect(r2.statusCode).toBe(400);
    expect(dc.createItem).not.toHaveBeenCalled();
    await app.close();
  });
});
