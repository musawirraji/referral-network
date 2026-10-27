'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Field from './Field';
import { api } from '@/lib/api';
import { useAuthStore, useToastStore } from '@/lib/store';

// Only allow same-site paths, so ?next= can't be used to bounce users to another domain.
const safeNext = (next) => (typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/');

export default function AuthForm({ mode, searchParams = {} }) {
  const isSignup = mode === 'signup';
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const showToast = useToastStore((s) => s.showToast);

  const [values, setValues] = useState({ email: '', password: '' });
  const [fields, setFields] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const missing = {};
    if (!values.email.trim()) missing.email = 'Email is required';
    if (!values.password) missing.password = 'Password is required';
    setFields(missing);
    if (Object.keys(missing).length) return;

    setLoading(true);
    try {
      const { token, user } = await api(`/api/auth/${isSignup ? 'signup' : 'signin'}`, {
        method: 'POST',
        body: values,
      });
      setAuth(token, user);
      showToast(isSignup ? 'Account created' : 'Signed in');
      router.replace(safeNext(searchParams.next));
    } catch (err) {
      setFields(err.fields || {});
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <section className="card narrow">
      <h1>{isSignup ? 'Create an account' : 'Sign in'}</h1>
      {searchParams.expired && !error && (
        <p className="notice" role="status">Your session expired. Please sign in again.</p>
      )}
      {searchParams.next && !searchParams.expired && !error && (
        <p className="notice" role="status">Sign in to continue.</p>
      )}

      <form onSubmit={onSubmit} noValidate>
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={onChange}
          error={fields.email}
          required
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          hint={isSignup ? 'At least 8 characters.' : undefined}
          value={values.password}
          onChange={onChange}
          error={fields.password}
          required
        />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <p className="muted switch">
        {isSignup ? 'Already have an account? ' : 'New here? '}
        <Link href={`${isSignup ? '/login' : '/signup'}${searchParams.next ? `?next=${encodeURIComponent(safeNext(searchParams.next))}` : ''}`}>{isSignup ? 'Sign in' : 'Create an account'}</Link>
      </p>
    </section>
  );
}
