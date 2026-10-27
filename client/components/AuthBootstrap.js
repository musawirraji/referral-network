'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

// Reads the saved token once on load, then confirms it with the server. If the token is
// expired, api() handles the 401 by clearing auth and sending the user to /login.
export default function AuthBootstrap() {
  useEffect(() => {
    useAuthStore.getState().hydrate();
    if (!useAuthStore.getState().token) return;
    api('/api/auth/me')
      .then(({ user }) => useAuthStore.getState().setUser(user))
      .catch(() => {});
  }, []);

  return null;
}
