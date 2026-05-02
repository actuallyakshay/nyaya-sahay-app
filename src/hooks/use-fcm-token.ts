import { updateUserFcmToken } from '@/api-client';
import { env } from '@/config/env';
import { toast } from '@/hooks/use-toast';
import { playCaseMessageChime } from '@/lib/case-notify-sound';
import { getMessagingInstance } from '@/lib/firebase';
import { getCookie } from '@/lib/helpers';
import { getToken, onMessage } from 'firebase/messaging';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FCM_SENT_KEY = 'fcm_token_sent';

function lastSentToken(): string | null {
  try {
    return localStorage.getItem(FCM_SENT_KEY);
  } catch {
    return null;
  }
}

function rememberSent(token: string) {
  try {
    localStorage.setItem(FCM_SENT_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearFcmTokenRegistrationCache() {
  try {
    localStorage.removeItem(FCM_SENT_KEY);
  } catch {
    /* ignore */
  }
}

function isLoggedIn() {
  return !!getCookie('x-active-role');
}

function isAndroidNativeShell() {
  if (typeof window === 'undefined') return false;
  const w = window as Window & {
    __samvidhanNativeApp?: boolean;
    __samvidhanNativePlatform?: string;
  };
  return w.__samvidhanNativeApp === true && w.__samvidhanNativePlatform === 'android';
}

function waitForInjectedNativeToken(timeoutMs = 25000): Promise<string | null> {
  if (typeof window === 'undefined' || !isAndroidNativeShell()) {
    return Promise.resolve(null);
  }
  const w = window as Window & { nativeFCMToken?: string };
  if (typeof w.nativeFCMToken === 'string' && w.nativeFCMToken.length > 0) {
    return Promise.resolve(w.nativeFCMToken);
  }
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      window.removeEventListener('nativeTokenReady', onReady);
      resolve(null);
    }, timeoutMs);
    const onReady = () => {
      window.clearTimeout(timer);
      window.removeEventListener('nativeTokenReady', onReady);
      const t = w.nativeFCMToken;
      resolve(typeof t === 'string' && t.length > 0 ? t : null);
    };
    window.addEventListener('nativeTokenReady', onReady);
  });
}

async function pushTokenToBackend(token: string) {
  if (lastSentToken() === token) return;
  try {
    await updateUserFcmToken({ fcmToken: token });
    rememberSent(token);
  } catch {
    /* retry on next navigation */
  }
}

async function syncAndroidInjectedToken() {
  const token = await waitForInjectedNativeToken();
  if (token) await pushTokenToBackend(token);
}

async function syncWebPushToken() {
  if (
    typeof window === 'undefined' ||
    !('Notification' in window) ||
    !('serviceWorker' in navigator)
  ) {
    return;
  }

  const messaging = await getMessagingInstance();
  if (!messaging) return;

  if (Notification.permission === 'default') await Notification.requestPermission();
  if (Notification.permission !== 'granted') return;

  let reg: ServiceWorkerRegistration | null = null;
  try {
    reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    await navigator.serviceWorker.ready;
  } catch {
    return;
  }
  if (!reg) return;

  let token: string;
  try {
    token = await getToken(messaging, {
      vapidKey: env.firebaseVapidKey,
      serviceWorkerRegistration: reg,
    });
  } catch {
    return;
  }
  if (!token) return;
  await pushTokenToBackend(token);
}

export async function syncFcmToken() {
  if (!isLoggedIn()) return;
  if (isAndroidNativeShell()) {
    await syncAndroidInjectedToken();
    return;
  }
  await syncWebPushToken();
}

function subscribeForeground(
  messaging: NonNullable<Awaited<ReturnType<typeof getMessagingInstance>>>
) {
  return onMessage(messaging, async (payload) => {
    const title =
      payload.notification?.title ?? payload.data?.title ?? 'Notification';
    const body = payload.notification?.body ?? payload.data?.body ?? '';
    const icon =
      (payload.notification as { icon?: string } | undefined)?.icon ??
      payload.data?.icon;

    toast({ title, description: body || undefined });
    void playCaseMessageChime();

    if (Notification.permission !== 'granted') return;
    try {
      const swReg = await navigator.serviceWorker.ready;
      const data = Object.fromEntries(
        Object.entries(payload.data ?? {}).filter(([, v]) => v != null && v !== '')
      ) as Record<string, string>;

      await swReg.showNotification(title, {
        body: body || undefined,
        icon: icon || undefined,
        tag: data.tag ?? data.caseId ?? `fcm-${Date.now()}`,
        ...(Object.keys(data).length ? { data } : {}),
      });
    } catch {
      /* toast already shown */
    }
  });
}

export function useFcmToken() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined' || !isAndroidNativeShell()) return;
    const onReady = () => void syncFcmToken();
    window.addEventListener('nativeTokenReady', onReady);
    return () => window.removeEventListener('nativeTokenReady', onReady);
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) return;
    void syncFcmToken();
  }, [pathname]);

  useEffect(() => {
    if (!isLoggedIn() || isAndroidNativeShell()) return;

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void getMessagingInstance().then((messaging) => {
      if (cancelled || !messaging) return;
      unsubscribe = subscribeForeground(messaging);
    });

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
