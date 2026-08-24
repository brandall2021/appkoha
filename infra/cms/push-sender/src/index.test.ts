import { afterEach, describe, expect, it, vi } from "vitest";
import { buildApp } from "./index.js";
import { enviarATodos, type PushPayload } from "./send.js";

function makeDirectusStub() {
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

describe("enviarATodos", () => {
  const payload: PushPayload = {
    title: "Biblioteca",
    body: "Nueva noticia",
    data: { id: "42", url: "/novedad/42" },
  };

  it("enruta expo y web según tipo", async () => {
    const dc = makeDirectusStub();
    dc.listItems.mockResolvedValue([
      { id: "1", token: "ExponentPushToken[abc]", tipo: "expo" },
      { id: "2", token: '{"endpoint":"https://push"}', tipo: "web" },
    ]);
    const enviarExpo = vi.fn().mockResolvedValue(200);
    const enviarWeb = vi.fn().mockResolvedValue(201);
    const out = await enviarATodos(dc, { enviarExpo, enviarWeb }, payload);
    expect(out.enviados).toBe(2);
    expect(out.limpiados).toBe(0);
    expect(enviarExpo).toHaveBeenCalledWith("ExponentPushToken[abc]", payload);
    expect(enviarWeb).toHaveBeenCalledWith('{"endpoint":"https://push"}', payload);
  });

  it("elimina tokens vencidos (404/410)", async () => {
    const dc = makeDirectusStub();
    dc.listItems.mockResolvedValue([
      { id: "1", token: "viejo-expo", tipo: "expo" },
      { id: "2", token: "ok-web", tipo: "web" },
    ]);
    const enviarExpo = vi.fn().mockResolvedValue(410);
    const enviarWeb = vi.fn().mockResolvedValue(200);
    const out = await enviarATodos(dc, { enviarExpo, enviarWeb }, payload);
    expect(out.limpiados).toBe(1);
    expect(dc.deleteItem).toHaveBeenCalledWith("push_tokens", "1");
  });
});

describe("POST /send", () => {
  it("403 sin secreto correcto", async () => {
    const app = buildApp({ sharedSecret: "s", vapidPublicKey: "x", vapidPrivateKey: "y" }, makeDirectusStub());
    const res = await app.inject({ method: "POST", url: "/send", headers: { "x-shared-secret": "mal" }, payload: { titulo: "t", id: "1" } });
    expect(res.statusCode).toBe(403);
    await app.close();
  });

  it("202 con payload correcto y arma data {id,url}", async () => {
    const dc = makeDirectusStub();
    dc.listItems.mockResolvedValue([{ id: "9", token: "T", tipo: "expo" }]);
    const enviarExpo = vi.fn().mockResolvedValue(200);
    const enviarWeb = vi.fn();
    const app = buildApp(
      { sharedSecret: "s", vapidPublicKey: "x", vapidPrivateKey: "y" },
      dc,
      { enviarExpo, enviarWeb }
    );
    const res = await app.inject({
      method: "POST",
      url: "/send",
      headers: { "x-shared-secret": "s" },
      payload: { titulo: "Novedad", id: "9" },
    });
    expect(res.statusCode).toBe(202);
    expect(enviarExpo).toHaveBeenCalledWith("T", expect.objectContaining({ data: { id: "9", url: "/novedad/9" } }));
    await app.close();
  });
});
