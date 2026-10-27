'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function AuthGuard({ children }) {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !token) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, token, pathname, router]);

  if (!hydrated || !token) {
    return <p className="status" role="status">Checking your session…</p>;
  }
  return children;
}
