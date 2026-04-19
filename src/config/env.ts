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
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  /** Origin of the API (Socket.IO uses path /api/socket.io on this host). */
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
  /** Razorpay Checkout (key id only — never put the secret in the frontend). */
  razorpayKeyId: (import.meta.env.VITE_RAZORPAY_KEY_ID as string) ?? '',
} as const;
