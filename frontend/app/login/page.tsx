'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = login(value.trim());
    if (!ok) setError('Invalid access key');
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white/90 p-8 shadow-xl dark:border-stone-700 dark:bg-stone-900/90">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">Afferent Signal</p>
          <h1 className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-50">Operator Access</h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Enter your dashboard key to access the signal matrix.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Access Key</span>
            <input
              type="password"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(''); }}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-stone-700 dark:bg-stone-800"
              placeholder="Enter key"
            />
          </label>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-2xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
