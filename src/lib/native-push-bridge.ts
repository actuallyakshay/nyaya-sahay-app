/** Set by the native shell before the first document load (`App.js` injected JS). */
export function getNativeShellPlatform(): 'android' | 'ios' | undefined {
  if (typeof window === 'undefined') return undefined;
  const p = (window as Window & { __samvidhanNativePlatform?: string }).__samvidhanNativePlatform;
  if (p === 'android' || p === 'ios') return p;
  return undefined;
}

/** Samvidhan React Native shell (injected); does not depend on `ReactNativeWebView` timing. */
export function isSamvidhanNativeShell(): boolean {
  if (typeof window === 'undefined') return false;
  return (window as Window & { __samvidhanNativeApp?: boolean }).__samvidhanNativeApp === true;
}

/**
 * Android WebView cannot use Firebase Web FCM (`isSupported()` is false). The shell
 * registers FCM via `expo-notifications` and delivers the device token here.
 */
export function shouldUseAndroidNativePushBridge(): boolean {
  return isSamvidhanNativeShell() && getNativeShellPlatform() === 'android';
}

function getReactNativePostMessageBridge(): { postMessage(msg: string): void } | null {
  const bridge = (window as Window & { ReactNativeWebView?: { postMessage(msg: string): void } })
    .ReactNativeWebView;
  if (typeof bridge?.postMessage === 'function') return bridge;
  return null;
}

/** RN injects `ReactNativeWebView` slightly after our pre-content script; wait before posting. */
function waitForReactNativePostMessageBridge(maxWaitMs: number): Promise<{ postMessage(msg: string): void } | null> {
  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      const bridge = getReactNativePostMessageBridge();
      if (bridge) {
        resolve(bridge);
        return;
      }
      if (Date.now() - started >= maxWaitMs) {
        console.warn(
          '[FCM] ReactNativeWebView.postMessage still missing after',
          maxWaitMs,
          'ms (open in Samvidhan dev build, not Expo Go)'
        );
        resolve(null);
        return;
      }
      window.setTimeout(tick, 50);
    };
    tick();
  });
}

let requestSeq = 0;

/**
 * Asks the React Native host for the Android FCM device token (via `expo-notifications`).
 * Resolves `null` on timeout, permission denial, or missing bridge.
 */
export async function requestNativeAndroidFcmToken(timeoutMs = 25000): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  if (!shouldUseAndroidNativePushBridge()) return null;

  const bridge = await waitForReactNativePostMessageBridge(10000);
  if (!bridge) return null;

  const requestId = `npush-${++requestSeq}-${Date.now()}`;

  return new Promise((resolve) => {
    const done = (value: string | null) => {
      window.clearTimeout(timer);
      window.removeEventListener('samvidhan-native-push-token', onEvent as EventListener);
      resolve(value);
    };

    const onEvent = (ev: Event) => {
      const d = (ev as CustomEvent<{ requestId?: string; ok?: boolean; token?: string; error?: string }>)
        .detail;
      if (!d || d.requestId !== requestId) return;
      if (d.ok && typeof d.token === 'string' && d.token.length > 0) {
        done(d.token);
        return;
      }
      console.warn('[FCM] native Android token request failed:', d.error ?? 'unknown');
      done(null);
    };

    const timer = window.setTimeout(() => {
      console.warn('[FCM] native Android token request timed out (no response from app shell)');
      done(null);
    }, timeoutMs);

    window.addEventListener('samvidhan-native-push-token', onEvent as EventListener);
    bridge.postMessage(JSON.stringify({ type: 'REQUEST_NATIVE_PUSH_TOKEN', requestId }));
  });
}
