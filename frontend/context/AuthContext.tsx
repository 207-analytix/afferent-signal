'use client';
import { createContext, useContext, useMemo, useState } from 'react';

type AuthContextValue = {
  authed: boolean;
  login: (candidate: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);

  const allowed = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_DASHBOARD_KEYS ?? '';
    return raw.split(',').map((v) => v.trim()).filter(Boolean);
  }, []);

  function login(candidate: string) {
    const ok = allowed.includes(candidate);
    setAuthed(ok);
    return ok;
  }

  function logout() {
    setAuthed(false);
  }

  return <AuthContext.Provider value={{ authed, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
