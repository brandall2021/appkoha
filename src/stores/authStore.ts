import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setTokenProvider } from "../lib/api/client";
import * as authApi from "../lib/api/auth";
import type { PortalUser } from "../lib/types/portal";

const TOKEN_KEY = "@portal_token";

interface AuthState {
  user: PortalUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  async login(email, password) {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(email, password);
      await AsyncStorage.setItem(TOKEN_KEY, res.token);
      set({ user: res.user, token: res.token, isLoading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión";
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  async register(name, email, password) {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register(name, email, password);
      await AsyncStorage.setItem(TOKEN_KEY, res.token);
      set({ user: res.user, token: res.token, isLoading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al registrarse";
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  async logout() {
    const { token } = get();
    try {
      if (token) await authApi.logout();
    } catch {
      // ignore logout network errors
    }
    await AsyncStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null });
  },

  async loadToken() {
    set({ isLoading: true });
    const stored = await AsyncStorage.getItem(TOKEN_KEY);
    if (!stored) {
      set({ isLoading: false });
      return;
    }
    setTokenProvider(async () => get().token);
    try {
      set({ token: stored });
      const { data: user } = await authApi.getMe();
      set({ user, isLoading: false });
    } catch {
      await AsyncStorage.removeItem(TOKEN_KEY);
      set({ token: null, user: null, isLoading: false });
    }
  },

  clearError() {
    set({ error: null });
  },
}));

setTokenProvider(async () => useAuthStore.getState().token);
