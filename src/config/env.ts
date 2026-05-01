function apiOriginFromBase(apiBaseUrl: string): string {
  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return '';
  }
}

const apiTimeoutMs = 180000;

export const env = {
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string) ?? '',
  /**
   * Direct GCP origin for Socket.IO (WebSocket — cannot go through the Vercel
   * rewrite proxy). Set VITE_SOCKET_ORIGIN explicitly in production to the GCP
   * run.app URL; falls back to deriving it from VITE_API_BASE_URL for local dev.
   */
  socketOrigin:
    (import.meta.env.VITE_SOCKET_ORIGIN as string) ||
    apiOriginFromBase((import.meta.env.VITE_API_BASE_URL as string) ?? ''),
  /** @deprecated use socketOrigin for Socket.IO, apiBaseUrl for HTTP */
  apiOrigin: apiOriginFromBase((import.meta.env.VITE_API_BASE_URL as string) ?? ''),
  apiTimeoutMs,
  /** Web FCM: set `VITE_FIREBASE_*` + `VITE_FIREBASE_VAPID_KEY` in `.env`. */
  firebase:
     {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string ?? '',
        authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) ?? '',
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string ?? '',
        storageBucket:
          (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) ?? '',
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string ?? '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID as string ?? '',
      }
,
  firebaseVapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY as string ?? '',
} as const;
