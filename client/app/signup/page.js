import AuthForm from '@/components/AuthForm';

export const metadata = { title: 'Sign up · Referral Network' };

export default function SignupPage({ searchParams }) {
  return <AuthForm mode="signup" searchParams={searchParams} />;
}
