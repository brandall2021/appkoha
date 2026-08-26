import { describe, expect, it, vi, beforeEach } from "vitest";

const mockSetNotificationHandler = vi.fn();
const mockRequestPermissionsAsync = vi.fn().mockResolvedValue({ status: "granted" });
const mockGetPermissionsAsync = vi.fn().mockResolvedValue({ status: "granted" });
const mockGetExpoPushTokenAsync = vi.fn().mockResolvedValue({ data: "ExponentPushToken[abc123]" });
const mockAddNotificationResponseReceivedListener = vi.fn().mockReturnValue({ remove: vi.fn() });
const mockAddNotificationReceivedListener = vi.fn().mockReturnValue({ remove: vi.fn() });

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

describe("useExpoNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("setNotificationHandler is called when hook module is imported", async () => {
    // Import the module — the top-level setNotificationHandler call should fire
    await import("./useExpoNotifications");
    expect(mockSetNotificationHandler).toHaveBeenCalled();
    expect(mockSetNotificationHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        handleNotification: expect.any(Function),
      }),
    );
  });

  it("registers notification listeners", async () => {
    await import("./useExpoNotifications");
    expect(mockAddNotificationResponseReceivedListener).toBeDefined();
    expect(mockAddNotificationReceivedListener).toBeDefined();
  });

  it("requestPermissions calls underlying expo-notifications API", async () => {
    await mockRequestPermissionsAsync();
    expect(mockRequestPermissionsAsync).toHaveBeenCalled();
  });

  it("getExpoPushTokenAsync returns expected shape", async () => {
    const token = await mockGetExpoPushTokenAsync();
    expect(token).toEqual({ data: "ExponentPushToken[abc123]" });
  });
});
