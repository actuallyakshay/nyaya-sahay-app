/**
 * In-memory access token for Socket.IO auth.
 *
 * Kept here (not in localStorage/sessionStorage) so XSS cannot read it and
 * iOS ITP cannot interfere. Cleared on page refresh intentionally — the axios
 * interceptor re-populates it from the first refresh-token round-trip.
 */
let _accessToken: string | null = null;

export const setAccessToken = (token: string): void => {
  _accessToken = token;
};

export const getAccessToken = (): string | null => _accessToken;

export const clearAccessToken = (): void => {
  _accessToken = null;
};
