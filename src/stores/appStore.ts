import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Patron } from "../types";

interface AppState {
  isDarkMode: boolean;
  toggleTheme: () => void;

  patron: Patron | null;
  setPatron: (patron: Patron | null) => void;
  logout: () => void;

  favorites: number[];
  toggleFavorite: (biblioId: number) => void;
  isFavorite: (biblioId: number) => boolean;

  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;

  kohaUrl: string;
  setKohaUrl: (url: string) => void;

  isConfigured: boolean;
  setConfigured: (configured: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isDarkMode: true,
  toggleTheme: () => set((s) => ({ isDarkMode: !s.isDarkMode })),

  patron: null,
  setPatron: (patron) => set({ patron }),
  logout: () => {
    set({ patron: null });
    AsyncStorage.removeItem("patron");
  },

  favorites: [],
  toggleFavorite: (biblioId) =>
    set((s) => {
      const exists = s.favorites.includes(biblioId);
      const newFavs = exists
        ? s.favorites.filter((id) => id !== biblioId)
        : [...s.favorites, biblioId];
      AsyncStorage.setItem("favorites", JSON.stringify(newFavs));
      return { favorites: newFavs };
    }),
  isFavorite: (biblioId) => get().favorites.includes(biblioId),

  searchHistory: [],
  addSearchHistory: (query) =>
    set((s) => {
      const newHistory = [query, ...s.searchHistory.filter((q) => q !== query)].slice(0, 20);
      AsyncStorage.setItem("searchHistory", JSON.stringify(newHistory));
      return { searchHistory: newHistory };
    }),
  clearSearchHistory: () => {
    set({ searchHistory: [] });
    AsyncStorage.removeItem("searchHistory");
  },

  kohaUrl: "",
  setKohaUrl: (url) => {
    set({ kohaUrl: url });
    AsyncStorage.setItem("kohaUrl", url);
  },

  isConfigured: false,
  setConfigured: (configured) => set({ isConfigured: configured }),
}));

export async function loadPersistedState() {
  const [url, favorites, history, patronStr] = await Promise.all([
    AsyncStorage.getItem("kohaUrl"),
    AsyncStorage.getItem("favorites"),
    AsyncStorage.getItem("searchHistory"),
    AsyncStorage.getItem("patron"),
  ]);

  const state = useAppStore.getState();
  if (url) state.setKohaUrl(url);
  if (favorites) state.favorites = JSON.parse(favorites);
  if (history) state.searchHistory = JSON.parse(history);
  if (patronStr) state.setPatron(JSON.parse(patronStr));
}
