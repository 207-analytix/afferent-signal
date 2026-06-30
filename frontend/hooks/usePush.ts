'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const SUPABASE_URL = 'https://wznicchxpogzdiqeyckg.supabase.co';
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export type PushStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported';

export function usePush() {
  const [status, setStatus] = useState<PushStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const registerServiceWorker = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) return null;
    try {
      // Use /sw.js in production; Blob fallback for dev
      return await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    } catch {
      // Fallback: inline SW via Blob (local dev without HTTPS)
      return navigator.serviceWorker.controller
        ? (await navigator.serviceWorker.ready)
        : null;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      setStatus('unsupported');
      return;
    }
    setStatus('requesting');
    setError(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }

      const reg = await registerServiceWorker();
      if (!reg) { setStatus('unsupported'); return; }

      if (!VAPID_PUBLIC_KEY) {
        console.warn('[usePush] NEXT_PUBLIC_VAPID_PUBLIC_KEY not set — skipping subscription');
        setStatus('granted');
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setStatus('denied'); return; }

      await fetch(`${SUPABASE_URL}/functions/v1/as-push-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ subscription }),
      });

      setStatus('granted');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setStatus('denied');
    }
  }, [registerServiceWorker]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') setStatus('granted');
      else if (Notification.permission === 'denied') setStatus('denied');
    }
  }, []);

  return { status, error, requestPermission };
}
