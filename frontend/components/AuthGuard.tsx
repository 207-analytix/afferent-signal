'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { authed } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authed && pathname !== '/login') router.replace('/login');
  }, [authed, pathname, router]);

  if (!authed) return null;
  return <>{children}</>;
}
