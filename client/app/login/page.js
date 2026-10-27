import AuthForm from '@/components/AuthForm';

export const metadata = { title: 'Sign in · Referral Network' };

// Server page passes searchParams down, which avoids a Suspense boundary for useSearchParams.
export default function LoginPage({ searchParams }) {
  return <AuthForm mode="signin" searchParams={searchParams} />;
}
