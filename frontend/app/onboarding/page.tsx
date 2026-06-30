'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePush } from '../../hooks/usePush';
import { supabase } from '../../lib/supabaseClient';

export default function OnboardingPage() {
  const router = useRouter();
  const { status, requestPermission } = usePush();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) { setAuthError(error.message); setLoading(false); return; }
    setStep(2);
    setLoading(false);
  }

  async function handlePermissions() {
    await requestPermission();
    setStep(3);
  }

  function handleFinish() {
    router.push('/home');
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
      {step === 1 && (
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="text-5xl mb-3">📡</div>
            <h1 className="text-2xl font-bold">Afferent Signal</h1>
            <p className="text-gray-400 mt-2 text-sm">Your shopping rescue companion. Find missing items, get alternatives, earn rewards.</p>
          </div>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
            />
            {authError && <p className="text-red-400 text-xs">{authError}</p>}
            <button
              onClick={handleSignUp}
              disabled={loading || !email || !password}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl py-3 font-semibold text-sm transition"
            >
              {loading ? 'Creating account…' : 'Get started'}
            </button>
          </div>
          <p className="text-center text-xs text-gray-500">
            Already have an account?{' '}
            <a href="/login" className="text-indigo-400 underline">Sign in</a>
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="text-5xl">🔔</div>
          <h2 className="text-xl font-bold">Enable notifications</h2>
          <p className="text-gray-400 text-sm">We'll alert you when a store near you has missing items — before you make the trip.</p>
          <div className="space-y-3">
            <div className="bg-gray-800 rounded-xl p-4 text-left text-sm space-y-2">
              <p className="flex gap-2"><span>📍</span><span>Location — to detect nearby stores</span></p>
              <p className="flex gap-2"><span>🔔</span><span>Notifications — to alert you before you shop</span></p>
              <p className="flex gap-2"><span>🎁</span><span>Rewards — earned every time you report</span></p>
            </div>
            <button
              onClick={handlePermissions}
              className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 font-semibold text-sm transition"
            >
              {status === 'requesting' ? 'Requesting…' : 'Allow & continue'}
            </button>
            <button onClick={() => setStep(3)} className="text-gray-500 text-xs underline">Skip for now</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="text-5xl">✅</div>
          <h2 className="text-xl font-bold">You're all set</h2>
          <p className="text-gray-400 text-sm">Walk into any store and we'll guide you to what's missing, what's nearby, and what you've earned.</p>
          <button
            onClick={handleFinish}
            className="w-full bg-emerald-600 hover:bg-emerald-500 rounded-xl py-3 font-semibold text-sm transition"
          >
            Start shopping smarter →
          </button>
        </div>
      )}
    </main>
  );
}
