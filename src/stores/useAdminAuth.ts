import { create } from "zustand";

import { apiPost, type ApiError } from "@/utils/api";

type AdminAuthState = {
  isAuthed: boolean;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setAuthed: (value: boolean) => void;
};

function toMessage(err: unknown): string {
  const e = err as ApiError;
  return e?.message || "Erro";
}

export const useAdminAuth = create<AdminAuthState>((set) => ({
  isAuthed: false,
  loading: false,
  error: null,
  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      await apiPost<{ ok: boolean }>("/api/admin/auth/login", { username, password });
      set({ isAuthed: true });
      return true;
    } catch (err) {
      set({ error: toMessage(err), isAuthed: false });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  logout: async () => {
    set({ loading: true, error: null });
    try {
      await apiPost<{ ok: boolean }>("/api/admin/auth/logout");
    } finally {
      set({ isAuthed: false, loading: false });
    }
  },
  setAuthed: (value) => set({ isAuthed: value }),
}));
