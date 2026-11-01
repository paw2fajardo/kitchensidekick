import { useEffect, useState, useCallback, useRef } from 'react';

export interface WakeLockState {
  isSupported: boolean;
  isActive: boolean;
  error: string | null;
  requestLock: () => Promise<void>;
  releaseLock: () => Promise<void>;
}

/**
 * Screen WakeLock Hook
 *
 * Implements FE-10:
 * Keeps tablet and mobile screen active during hands-free cooking in Focus Mode.
 * Re-acquires lock automatically on visibility change if page becomes active again.
 */
export function useWakeLock(): WakeLockState {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    setIsSupported(typeof navigator !== 'undefined' && 'wakeLock' in navigator);
  }, []);

  const requestLock = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      setError('WakeLock API not supported on this browser');
      return;
    }

    try {
      if (sentinelRef.current && !sentinelRef.current.released) {
        return;
      }
      const sentinel = await navigator.wakeLock.request('screen');
      sentinelRef.current = sentinel;
      setIsActive(true);
      setError(null);

      sentinel.addEventListener('release', () => {
        setIsActive(false);
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not request screen lock';
      setError(msg);
      setIsActive(false);
    }
  }, []);

  const releaseLock = useCallback(async () => {
    if (sentinelRef.current && !sentinelRef.current.released) {
      await sentinelRef.current.release();
      sentinelRef.current = null;
      setIsActive(false);
    }
  }, []);

  // Re-acquire on window visibility change
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isActive && sentinelRef.current?.released) {
        await requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (sentinelRef.current && !sentinelRef.current.released) {
        sentinelRef.current.release().catch(() => {});
      }
    };
  }, [isActive, requestLock]);

  return {
    isSupported,
    isActive,
    error,
    requestLock,
    releaseLock,
  };
}
