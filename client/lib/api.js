import { useAuthStore } from './store';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const { token, logout } = useAuthStore.getState();
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Could not reach the server. Is the API running?', 0);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    // Only treat 401 as "session over" when we actually sent a token. A failed sign-in
    // also returns 401 and must stay on the page to show its error.
    if (res.status === 401 && token) {
      logout();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        const next = encodeURIComponent(window.location.pathname);
        window.location.assign(`/login?expired=1&next=${next}`);
      }
    }
    throw new ApiError(message, res.status, data?.fields);
  }

  return data;
}
