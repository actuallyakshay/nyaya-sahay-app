/** True when running inside React Native `WebView` (`window.ReactNativeWebView` bridge). */
export function isReactNativeWebView(): boolean {
  if (typeof window === 'undefined') return false;
  const bridge = (window as Window & { ReactNativeWebView?: unknown }).ReactNativeWebView;
  return typeof bridge === 'object' && bridge !== null && typeof (bridge as { postMessage?: unknown }).postMessage === 'function';
}
