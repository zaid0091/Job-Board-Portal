/**
 * Django Channels WebSockets are mounted at /ws/... (not under /api/v1/).
 * In dev, Vite proxies /ws → backend:8000 (see vite.config.ts).
 */
export function buildWebSocketUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;

  const explicit = import.meta.env.VITE_WS_URL as string | undefined;
  if (explicit) {
    return `${explicit.replace(/\/$/, '')}${normalized}`;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}${normalized}`;
}
