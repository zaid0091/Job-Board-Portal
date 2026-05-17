/**
 * WebSockets are used for notifications and chat (no polling).
 * - Set VITE_WS_ENABLED=true to force on in production.
 * - Set VITE_WS_ENABLED=false to force off.
 * - When unset, enabled automatically in Vite dev (Daphne + Vite proxy required).
 */
export function isWebSocketEnabled(): boolean {
  const flag = import.meta.env.VITE_WS_ENABLED;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return import.meta.env.DEV;
}
