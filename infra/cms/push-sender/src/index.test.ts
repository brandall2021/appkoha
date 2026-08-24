import { describe, expect, it } from "vitest";
import { buildApp } from "./index.js";

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
