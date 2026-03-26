export const env = {
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
} as const;
