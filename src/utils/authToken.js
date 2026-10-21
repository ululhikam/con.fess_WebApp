/** Utilitas JWT ringan untuk membaca masa berlaku sesi di browser. */

export function parseJwtPayload(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/** Waktu kedaluwarsa token dalam epoch milidetik, atau null jika tidak valid. */
export function getTokenExpiry(token) {
  const payload = parseJwtPayload(token);
  return typeof payload?.exp === 'number' ? payload.exp * 1000 : null;
}

/** Token tanpa `exp` dianggap tidak valid agar tidak ada sesi abadi. */
export function isTokenExpired(token, skewMs = 0) {
  const expiry = getTokenExpiry(token);
  if (!expiry) return true;
  return expiry <= Date.now() + skewMs;
}
