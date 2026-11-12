import { tel } from './tel';

/**
 * Keeps the screen on while the page is visible (Screen Wake Lock API). The lock is released by the browser when the
 * tab is hidden, so it is requested again each time the page becomes visible. The API exists only in a secure context
 * (https, localhost, or an origin the browser is told to treat as secure); elsewhere this does nothing.
 */
export function keepAwake(): void {
  const wl = (navigator as Navigator & { wakeLock?: WakeLock }).wakeLock;
  if (!wl) { tel.log('wakelock', { ok: false, why: window.isSecureContext ? 'unsupported' : 'insecure-context' }); return; }
  let lock: WakeLockSentinel | null = null, logged = false;
  const acquire = async () => {
    if (document.visibilityState !== 'visible' || (lock && !lock.released)) return;
    try {
      lock = await wl.request('screen');
      if (!logged) { logged = true; tel.log('wakelock', { ok: true }); }
    } catch (e) {
      if (!logged) { logged = true; tel.log('wakelock', { ok: false, why: String((e as Error)?.name ?? e) }); }
    }
  };
  document.addEventListener('visibilitychange', acquire);
  // Some browsers want a user gesture for the first request.
  window.addEventListener('pointerdown', acquire, { passive: true });
  void acquire();
}
