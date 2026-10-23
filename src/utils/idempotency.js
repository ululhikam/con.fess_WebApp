/**
 * Stable, unique idempotency keys for money-moving requests. Kept in one place
 * so retries can reuse the same key and never create a duplicate charge/payout.
 */
export function createIdempotencyKey(prefix = 'op') {
  const safePrefix = String(prefix || 'op').replace(/[^a-zA-Z0-9:_-]/g, '').slice(0, 40) || 'op';
  try {
    if (globalThis.crypto?.randomUUID) return `${safePrefix}:${globalThis.crypto.randomUUID()}`;
  } catch {
    // fall through to the timestamp fallback
  }
  return `${safePrefix}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
}
