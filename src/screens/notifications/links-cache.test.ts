import { describe, expect, it, vi, beforeEach } from "vitest";
import { cachearLinks, leerLinksCache } from "./links-cache";

const mockSetItem = vi.fn().mockResolvedValue(undefined);
const mockGetItem = vi.fn();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: { setItem: (...a: any[]) => mockSetItem(...a), getItem: (...a: any[]) => mockGetItem(...a) },
}));

describe("cachearLinks / leerLinksCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cachearLinks stores JSON string", async () => {
    const links = [{ id: "1", titulo: "T", url: "http://x", icono: "link", orden: 1, destacado: false }];
    await cachearLinks(links);
    expect(mockSetItem).toHaveBeenCalledWith(
      "cache.links_utiles",
      JSON.stringify(links),
    );
  });

  it("leerLinksCache returns parsed JSON", async () => {
    const links = [{ id: "2", titulo: "X", url: "http://y", icono: "link", orden: 2, destacado: true }];
    mockGetItem.mockResolvedValueOnce(JSON.stringify(links));
    const result = await leerLinksCache();
    expect(result).toEqual(links);
  });

  it("leerLinksCache returns null on empty", async () => {
    mockGetItem.mockResolvedValueOnce(null);
    const result = await leerLinksCache();
    expect(result).toBeNull();
  });

  it("leerLinksCache returns null on error", async () => {
    mockGetItem.mockRejectedValueOnce(new Error("fail"));
    const result = await leerLinksCache();
    expect(result).toBeNull();
  });
});
