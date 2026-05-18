/** Seconds before expiry to proactively refresh the access token. */
export const ACCESS_TOKEN_REFRESH_LEAD_SECONDS = 30;

/** Returns true when the access cookie JWT is missing or near expiry. */
export function isAccessTokenExpired(): boolean {
  try {
    const cookies = document.cookie.split('; ');
    const accessCookie = cookies.find((c) => c.startsWith('access='));
    if (!accessCookie) {
      return false;
    }
    const token = accessCookie.split('=')[1];
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
    if (typeof payload.exp !== 'number') {
      return true;
    }
    const now = Math.floor(Date.now() / 1000);
    return payload.exp - now < ACCESS_TOKEN_REFRESH_LEAD_SECONDS;
  } catch {
    return true;
  }
}
