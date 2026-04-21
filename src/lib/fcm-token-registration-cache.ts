const CACHE_KEY = 'fcm_token_sent';

export function getLastSentFcmToken(): string | null {
  try {
    return localStorage.getItem(CACHE_KEY);
  } catch {
    return null;
  }
}

export function rememberFcmTokenSent(token: string): void {
  try {
    localStorage.setItem(CACHE_KEY, token);
  } catch {
    // ignore — storage quota or private browsing
  }
}

export function clearFcmTokenRegistrationCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}
