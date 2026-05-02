import { updateUserFcmToken } from '@/api-client';
import { env } from '@/config/env';
import { toast } from '@/hooks/use-toast';
import { playCaseMessageChime } from '@/lib/case-notify-sound';
import {
  getLastSentFcmToken,
  rememberFcmTokenSent,
} from '@/lib/fcm-token-registration-cache';
import { getMessagingInstance } from '@/lib/firebase';
import { getCookie } from '@/lib/helpers';
import { getToken, onMessage } from 'firebase/messaging';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ─── guards ──────────────────────────────────────────────────────────────────

function isLoggedIn() {
  return !!getCookie('x-active-role');
}

function isBrowserSupported() {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator
  );
}

// ─── service worker ───────────────────────────────────────────────────────────

async function getServiceWorkerReg(): Promise<ServiceWorkerRegistration | null> {
  try {
    const reg = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
      { scope: '/' }
    );
    await navigator.serviceWorker.ready;
    return reg;
  } catch (err) {
    console.warn('[FCM] service worker registration failed', err);
    return null;
  }
}

// ─── token sync ───────────────────────────────────────────────────────────────

/**
 * Gets the FCM token and sends it to the backend.
 * Deduped — skips the API call if the token hasn't changed since last sync.
 * Safe to call multiple times.
 */
export async function syncFcmToken(): Promise<void> {
  if (!isLoggedIn()) {
    console.warn('[FCM] skipped: not logged in (x-active-role cookie missing)');
    return;
  }
  if (!isBrowserSupported()) {
    console.warn('[FCM] skipped: browser does not support notifications/serviceWorker');
    return;
  }

  const messaging = await getMessagingInstance();
  if (!messaging) {
    console.warn('[FCM] skipped: getMessagingInstance returned null (Firebase env vars missing or FCM not supported)');
    return;
  }

  // Ask for permission if not yet decided; bail if denied.
  if (Notification.permission === 'default')
    await Notification.requestPermission();
  if (Notification.permission !== 'granted') {
    console.warn('[FCM] skipped: notification permission not granted:', Notification.permission);
    return;
  }

  const reg = await getServiceWorkerReg();
  if (!reg) {
    console.warn('[FCM] skipped: service worker registration failed');
    return;
  }

  let token: string;
  try {
    token = await getToken(messaging, {
      vapidKey: env.firebaseVapidKey,
      serviceWorkerRegistration: reg,
    });
  } catch (err) {
    console.warn('[FCM] skipped: getToken failed (VAPID key missing or invalid?)', err);
    return;
  }

  if (!token) {
    console.warn('[FCM] skipped: getToken returned empty token');
    return;
  }
  if (getLastSentFcmToken() === token) {
    console.log('[FCM] skipped: token unchanged since last sync');
    return;
  }

  try {
    await updateUserFcmToken({ fcmToken: token });
    rememberFcmTokenSent(token);
    console.log('[FCM] token synced to backend');
  } catch (err) {
    console.warn('[FCM] API call failed (will retry on next route change)', err);
  }
}

// ─── foreground handler ───────────────────────────────────────────────────────

/**
 * Shows an in-app toast + OS notification when a push arrives while the tab is active.
 * When the tab is in the background, the service worker handles it instead.
 */
async function handleForegroundMessage(
  messaging: Awaited<ReturnType<typeof getMessagingInstance>>
) {
  if (!messaging) return () => {};

  return onMessage(messaging, async (payload) => {
    const title =
      payload.notification?.title ?? payload.data?.title ?? 'Notification';
    const body = payload.notification?.body ?? payload.data?.body ?? '';
    const icon =
      (payload.notification as { icon?: string } | undefined)?.icon ??
      payload.data?.icon;

    // In-app toast + chime (always shown when foreground).
    toast({ title, description: body || undefined });
    void playCaseMessageChime();

    // Also show OS notification so Android WebView / Chrome surface it properly.
    if (Notification.permission !== 'granted') return;
    try {
      const swReg = await navigator.serviceWorker.ready;
      const data = Object.fromEntries(
        Object.entries(payload.data ?? {}).filter(
          ([, v]) => v != null && v !== ''
        )
      ) as Record<string, string>;

      await swReg.showNotification(title, {
        body: body || undefined,
        icon: icon || undefined,
        tag: data.tag ?? data.caseId ?? `fcm-${Date.now()}`,
        ...(Object.keys(data).length ? { data } : {}),
      });
    } catch {
      // Best-effort — toast already shown above.
    }
  });
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export function useFcmToken() {
  const { pathname } = useLocation();

  // Re-sync token on every route change (covers page refresh + SPA navigation).
  useEffect(() => {
    if (!isLoggedIn()) return;
    void syncFcmToken();
  }, [pathname]);

  // Subscribe to foreground messages for the lifetime of the session.
  useEffect(() => {
    if (!isLoggedIn()) return;

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    getMessagingInstance().then((messaging) => {
      if (cancelled) return;
      handleForegroundMessage(messaging).then((unsub) => {
        if (cancelled) {
          unsub();
          return;
        }
        unsubscribe = unsub;
      });
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []); // intentionally once — the subscription outlives route changes
}

// ─── component ────────────────────────────────────────────────────────────────

/** Drop this inside <BrowserRouter> once to wire up FCM for the whole app. */
export function FcmTokenSync() {
  useFcmToken();
  return null;
}
