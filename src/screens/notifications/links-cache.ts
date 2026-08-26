import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LinkUtil } from "../../api/cms";

const KEY_CACHE_LINKS = "cache.links_utiles";

export async function cachearLinks(links: LinkUtil[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_CACHE_LINKS, JSON.stringify(links));
  } catch {}
}

export async function leerLinksCache(): Promise<LinkUtil[] | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_CACHE_LINKS);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
