'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function Header() {
  const { token, user, hydrated, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const signOut = () => {
    logout();
    router.push('/login');
  };

  const navLink = (href, label) => (
    <Link href={href} aria-current={pathname === href ? 'page' : undefined}>
      {label}
    </Link>
  );

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">Referral Network</Link>
        <nav aria-label="Main">
          {navLink('/', 'Jobs')}
          {navLink('/dashboard', 'Dashboard')}
        </nav>
        {/* Render nothing for auth until storage is read, to avoid a Sign in flash for signed-in users. */}
        <div className="header-auth">
          {hydrated && token && (
            <>
              <span className="user-email" title={user?.email}>{user?.email ?? '…'}</span>
              <button type="button" className="btn btn-ghost" onClick={signOut}>Sign out</button>
            </>
          )}
          {hydrated && !token && (
            <>
              {navLink('/login', 'Sign in')}
              <Link href="/signup" className="btn btn-small">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
