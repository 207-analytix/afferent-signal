'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = login(key.trim());
    if (ok) {
      router.push('/');
    } else {
      setError('Invalid access key. Please try again.');
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-8 shadow-md dark:border-stone-800 dark:bg-stone-900">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">Afferent Signal</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50">Dashboard Access</h1>
          <p className="mt-1 text-sm text-stone-400">Enter your access key to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="key" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500">
              Access Key
            </label>
            <input
              id="key"
              type="password"
              value={key}
              onChange={(e) => { setKey(e.target.value); setError(''); }}
              placeholder="Enter access key"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            />
          </div>
          {error && (
            <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-2xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 active:bg-teal-900"
          >
            Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
