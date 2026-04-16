import { updateUserFcmToken } from '@/api-client';
import { env } from '@/config/env';
import {
  getLastSentFcmToken,
  rememberFcmTokenSent,
} from '@/lib/fcm-token-registration-cache';
import { getCookie } from '@/lib/helpers';
import { toast } from '@/hooks/use-toast';
import { getApps, initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const dev = import.meta.env.DEV;
const dbg = (msg: string, ...rest: unknown[]) => {
  if (dev) console.info('[FCM]', msg, ...rest);
};

async function getMessagingIfReady() {
  if (!env.firebase || !(await isSupported())) return null;
  const app = getApps()[0] ?? initializeApp(env.firebase);
  return getMessaging(app);
}

/** Register FCM token and POST to `/api/users/update-fcm-token`. Safe to call often (deduped). */
export async function syncFcmToken(): Promise<void> {
  const vapid = env.firebaseVapidKey;

  if (typeof window === 'undefined' || !getCookie('x-active-role')) return;
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

  const messaging = await getMessagingIfReady();

  let perm = Notification.permission;
  if (perm === 'default') perm = await Notification.requestPermission();

  let reg: ServiceWorkerRegistration;
  try {
    reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    await navigator.serviceWorker.ready;
  } catch (e) {
    dbg('service worker failed', e);
    return;
  }

  let token: string;
  try {
    token = await getToken(messaging, {
      vapidKey: vapid,
      serviceWorkerRegistration: reg,
    });
  } catch (e) {
    dbg('getToken failed', e);
    return;
  }

  if (!token || getLastSentFcmToken() === token) return;

  try {
    await updateUserFcmToken({ fcmToken: token });
    rememberFcmTokenSent(token);
  } catch (e) {
    if (dev) console.warn('[FCM] update-fcm-token failed', e);
  }
}

/** Re-sync when the route changes while logged in (covers refresh + SPA navigation). */
export function useFcmToken() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!getCookie('x-active-role')) return;
    void syncFcmToken();
  }, [pathname]);

  /**
   * Foreground: Web FCM does not show OS notifications by itself — use the same SW API as push.
   * That way laptop Chrome / Android Chrome surface a real notification even when the tab is open.
   */
  useEffect(() => {
    if (!getCookie('x-active-role')) return;
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    void (async () => {
      const messaging = await getMessagingIfReady();
      if (cancelled || !messaging) return;
      unsubscribe = onMessage(messaging, (payload) => {
        const n = payload.notification;
        const title =
          n?.title ?? (payload.data?.title as string | undefined) ?? 'Notification';
        const body =
          n?.body ?? (payload.data?.body as string | undefined) ?? '';
        const icon =
          (n as { icon?: string })?.icon ??
          (payload.data?.icon as string | undefined) ??
          undefined;
        const tag =
          (payload.data?.tag as string | undefined) ??
          (payload.data?.caseId as string | undefined) ??
          (payload as { messageId?: string }).messageId ??
          `fcm-${Date.now()}`;

        // In-app: always show (Chrome may "succeed" at showNotification but show no banner).
        toast({ title, description: body || undefined });

        if (Notification.permission !== 'granted') return;

        void (async () => {
          try {
            const swReg = await navigator.serviceWorker.ready;
            // Only string values are safe for notification `data` (structured clone / FCM).
            const data: Record<string, string> = {};
            if (payload.data) {
              for (const [k, v] of Object.entries(payload.data)) {
                if (v != null && v !== '') data[k] = String(v);
              }
            }
            const mid = (payload as { messageId?: string }).messageId;
            if (mid) data.fcmMessageId = mid;

            await swReg.showNotification(title, {
              body: body || undefined,
              icon: icon || undefined,
              tag,
              ...(Object.keys(data).length > 0 ? { data } : {}),
            });
          } catch (e) {
            dbg('foreground showNotification failed', e);
          }
        })();
      });
    })();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [pathname]);
}

export function FcmTokenSync() {
  useFcmToken();
  return null;
}
