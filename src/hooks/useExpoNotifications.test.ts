import { describe, expect, it, vi, beforeEach } from "vitest";

const {
  mockSetNotificationHandler,
  mockRequestPermissionsAsync,
  mockGetPermissionsAsync,
  mockGetExpoPushTokenAsync,
  mockAddNotificationResponseReceivedListener,
  mockAddNotificationReceivedListener,
} = vi.hoisted(() => ({
  mockSetNotificationHandler: vi.fn(),
  mockRequestPermissionsAsync: vi.fn().mockResolvedValue({ status: "granted" }),
  mockGetPermissionsAsync: vi.fn().mockResolvedValue({ status: "granted" }),
  mockGetExpoPushTokenAsync: vi.fn().mockResolvedValue({ data: "ExponentPushToken[abc123]" }),
  mockAddNotificationResponseReceivedListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
  mockAddNotificationReceivedListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
}));

vi.mock("expo-notifications", () => ({
  setNotificationHandler: (...a: any[]) => mockSetNotificationHandler(...a),
  getPermissionsAsync: (...a: any[]) => mockGetPermissionsAsync(...a),
  requestPermissionsAsync: (...a: any[]) => mockRequestPermissionsAsync(...a),
  getExpoPushTokenAsync: (...a: any[]) => mockGetExpoPushTokenAsync(...a),
  addNotificationResponseReceivedListener: (...a: any[]) => mockAddNotificationResponseReceivedListener(...a),
  addNotificationReceivedListener: (...a: any[]) => mockAddNotificationReceivedListener(...a),
}));

vi.mock("expo-router", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: { setItem: vi.fn(), getItem: vi.fn() },
}));

import { handleNotificationResponseFactory, requestPermissionsCore } from "./useExpoNotifications";

describe("useExpoNotifications — module-level side effects", () => {
  it("setNotificationHandler is called on module import", async () => {
    await import("./useExpoNotifications");
    expect(mockSetNotificationHandler).toHaveBeenCalled();
    expect(mockSetNotificationHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        handleNotification: expect.any(Function),
      }),
    );
  });

  // Listener registration (addNotificationResponseReceivedListener /
  // addNotificationReceivedListener) happens inside useEffect, which only fires
  // when the hook renders in a React tree. Testing this requires jsdom or a
  // React renderer — not available in this vitest node environment.
  // Covered indirectly by the handleNotificationResponseFactory tests below.
});

describe("handleNotificationResponseFactory", () => {
  it("navigates to /novedad/{id} when data.novedadId is present", () => {
    const push = vi.fn();
    const handler = handleNotificationResponseFactory(push);
    handler({
      notification: {
        request: { content: { data: { novedadId: "42" } } },
      },
    } as any);
    expect(push).toHaveBeenCalledWith("/novedad/42");
  });

  it("does not navigate when novedadId is missing", () => {
    const push = vi.fn();
    const handler = handleNotificationResponseFactory(push);
    handler({
      notification: {
        request: { content: { data: {} } },
      },
    } as any);
    expect(push).not.toHaveBeenCalled();
  });
});

describe("requestPermissionsCore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns granted true and token on success", async () => {
    const result = await requestPermissionsCore();
    expect(result).toEqual({ granted: true, token: "ExponentPushToken[abc123]" });
    expect(mockRequestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockGetExpoPushTokenAsync).toHaveBeenCalledTimes(1);
  });

  it("returns granted false when denied", async () => {
    mockRequestPermissionsAsync.mockResolvedValueOnce({ status: "denied" });
    const result = await requestPermissionsCore();
    expect(result).toEqual({ granted: false, token: null });
    expect(mockGetExpoPushTokenAsync).not.toHaveBeenCalled();
  });
});
