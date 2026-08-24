import { afterEach, describe, expect, it, vi } from "vitest";
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

describe("buildApp sin cliente inyectado", () => {
  const prevUrl = process.env.DIRECTUS_URL;
  const prevToken = process.env.DIRECTUS_SERVICE_TOKEN;

  afterEach(() => {
    vi.unstubAllGlobals();
    if (prevUrl === undefined) delete process.env.DIRECTUS_URL;
    else process.env.DIRECTUS_URL = prevUrl;
    if (prevToken === undefined) delete process.env.DIRECTUS_SERVICE_TOKEN;
    else process.env.DIRECTUS_SERVICE_TOKEN = prevToken;
  });

  it("crea el cliente desde DIRECTUS_URL/DIRECTUS_SERVICE_TOKEN de env", async () => {
    process.env.DIRECTUS_URL = "http://cms-test:8055";
    process.env.DIRECTUS_SERVICE_TOKEN = "token-de-test";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 1 } }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);
    const app = buildApp({
      sharedSecret: "s",
      vapidPublicKey: "x",
      vapidPrivateKey: "y",
    });
    const res = await app.inject({
      method: "POST",
      url: "/register",
      payload: { token: "abc", tipo: "expo" },
    });
    expect(res.statusCode).toBe(201);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://cms-test:8055/items/push_tokens",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ authorization: "Bearer token-de-test" }),
      })
    );
    await app.close();
  });
});
