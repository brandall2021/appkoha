import { vi, describe, expect, it } from "vitest";

const { mockPush, mockRemove } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRemove: vi.fn(),
}));

vi.mock("react-native", () => ({ Platform: { OS: "ios" } }));
vi.mock("expo-constants", () => ({
  default: { expoConfig: { extra: { eas: { projectId: "test-project-id" } } } },
}));
vi.mock("expo-notifications", () => ({
  getPermissionsAsync: vi.fn(),
  requestPermissionsAsync: vi.fn(),
  getExpoPushTokenAsync: vi.fn(),
  addNotificationResponseReceivedListener: vi.fn().mockReturnValue({ remove: mockRemove }),
}));
vi.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush }) }));
vi.mock("./push-web", () => ({ registrarTokenWeb: vi.fn() }));

import { extraerIdDeNotificacion } from "./usePushRegistration";

describe("extraerIdDeNotificacion", () => {
  it("extrae id string del payload", () => {
    expect(extraerIdDeNotificacion({ id: "42" })).toBe("42");
  });
  it("extrae id numerico del payload", () => {
    expect(extraerIdDeNotificacion({ id: 7 })).toBe("7");
  });
  it("devuelve null si no hay id", () => {
    expect(extraerIdDeNotificacion(undefined)).toBeNull();
    expect(extraerIdDeNotificacion({ otra: "cosa" })).toBeNull();
    expect(extraerIdDeNotificacion(null)).toBeNull();
  });
});
