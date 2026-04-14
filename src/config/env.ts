function apiOriginFromBase(apiBaseUrl: string): string {
  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return '';
  }
}

export const env = {
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  /** Origin of the API (Socket.IO uses path /api/socket.io on this host). */
  apiOrigin: apiOriginFromBase((import.meta.env.VITE_API_BASE_URL as string) ?? ''),
} as const;
