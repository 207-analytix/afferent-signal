'use client';
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const SUPABASE_URL = 'https://wznicchxpogzdiqeyckg.supabase.co';
const PING_INTERVAL_MS = 30_000;
const MIN_ACCURACY_M = 100;

export interface GeofenceEvent {
  type: 'enter' | 'dwell' | 'exit';
  store_id: string;
  store_name: string;
  lat: number;
  lng: number;
}

interface UseGeofenceOptions {
  onEvent?: (event: GeofenceEvent) => void;
  enabled?: boolean;
}

export function useGeofence({ onEvent, enabled = true }: UseGeofenceOptions = {}) {
  const watchIdRef = useRef<number | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);

  const sendPing = useCallback(async (position: GeolocationPosition) => {
    if (position.coords.accuracy > MIN_ACCURACY_M) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      await fetch(`${SUPABASE_URL}/functions/v1/as-geofence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy_m: Math.round(position.coords.accuracy),
          recorded_at: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.warn('[useGeofence] ping failed', err);
    }
  }, []);

  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !('geolocation' in navigator)) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        lastPositionRef.current = pos;
        sendPing(pos);
      },
      (err) => console.warn('[useGeofence] watch error', err.message),
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 10_000 }
    );

    pingTimerRef.current = setInterval(() => {
      if (lastPositionRef.current) sendPing(lastPositionRef.current);
    }, PING_INTERVAL_MS);

    // Listen for geofence events from Supabase Realtime
    const channel = supabase
      .channel('as-geofence-events')
      .on('broadcast', { event: 'geofence' }, ({ payload }) => {
        if (onEvent) onEvent(payload as GeofenceEvent);
      })
      .subscribe();

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [enabled, onEvent, sendPing]);

  return {
    isTracking: enabled,
    forceSync: () => { if (lastPositionRef.current) sendPing(lastPositionRef.current); },
  };
}
