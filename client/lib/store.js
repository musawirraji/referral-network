'use client';

import { create } from 'zustand';

const TOKEN_KEY = 'referral_token';

// localStorage can throw (private mode, blocked storage), so every access is guarded.
const storage = {
  get: () => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set: (v) => {
    try { localStorage.setItem(TOKEN_KEY, v); } catch {}
  },
  clear: () => {
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
  },
};

// Only the token is persisted. The user is re-fetched from /api/auth/me on load, so a
// stale or tampered role in storage can never drive the UI.
export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  // False until localStorage has been read, so guards don't redirect during the first render.
  hydrated: false,
  hydrate: () => set({ token: storage.get(), hydrated: true }),
  setAuth: (token, user) => {
    storage.set(token);
    set({ token, user });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    storage.clear();
    set({ token: null, user: null });
  },
}));

export const useToastStore = create((set) => ({
  toast: null,
  // The id lets the Toast component restart its timer when the same message repeats.
  showToast: (message, type = 'success') => set({ toast: { id: Date.now(), message, type } }),
  hideToast: () => set({ toast: null }),
}));
