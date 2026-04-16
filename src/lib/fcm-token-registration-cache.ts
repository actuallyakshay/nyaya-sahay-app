const LAST_SENT_KEY = 'nyaya_sahay_fcm_last_sent';

export function getLastSentFcmToken(): string | null {
  try {
    return localStorage.getItem(LAST_SENT_KEY);
  } catch {
    return null;
  }
}

export function rememberFcmTokenSent(token: string): void {
  try {
    localStorage.setItem(LAST_SENT_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearFcmTokenRegistrationCache(): void {
  try {
    localStorage.removeItem(LAST_SENT_KEY);
  } catch {
    /* ignore */
  }
}
