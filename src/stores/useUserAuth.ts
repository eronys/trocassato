import { create } from "zustand";

import { apiGet, apiPost, type ApiError } from "@/utils/api";

export type PublicUser = {
  id: string;
  full_name: string;
  email: string;
  cpf: string;
  photo_url: string;
  status: string;
  level: string;
  invited_by_user_id: string | null;
  wallet_name: string;
  is_host: boolean;
  created_at: string;
};

type UserAuthState = {
  user: PublicUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

function toMessage(err: unknown): string {
  const e = err as ApiError;
  return e?.message || "Erro";
}

export const useUserAuth = create<UserAuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await apiPost<{ ok: boolean }>("/auth/login", { email, password });
      await get().refresh();
      return true;
    } catch (err) {
      set({ error: toMessage(err) });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  logout: async () => {
    set({ loading: true, error: null });
    try {
      await apiPost<{ ok: boolean }>("/auth/logout");
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const me = await apiGet<PublicUser>("/auth/me");
      set({ user: me });
    } catch {
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
}));
