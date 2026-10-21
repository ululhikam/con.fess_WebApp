/**
 * Menyimpan ticket verifikasi email jangka pendek di sessionStorage.
 * Ticket hanya berlaku 30 menit dan tidak boleh dianggap sebagai sesi login.
 */
const KEY = 'fess_email_verification';

export function saveVerification({
  ticket,
  verification_ticket: verificationTicket,
  email,
  email_sent: emailSent,
  needs_send: needsSend,
} = {}) {
  try {
    const resolvedTicket = ticket || verificationTicket;
    if (!resolvedTicket || !email) return;
    sessionStorage.setItem(
      KEY,
      JSON.stringify({
        ticket: resolvedTicket,
        email,
        email_sent: Boolean(emailSent),
        needs_send: Boolean(needsSend),
      }),
    );
  } catch {
    // sessionStorage bisa diblokir; halaman tetap bisa memakai query ticket.
  }
}

export function readVerification() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearVerification() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/**
 * Target halaman verifikasi. Ticket ditaruh di fragment (bukan query) agar
 * tidak ikut terkirim ke server; halaman verifikasi membersihkannya setelah
 * dibaca, sementara sessionStorage tetap menjadi sumber utama.
 */
export function verificationRoute(result = {}) {
  const query = {};
  if (result.email) query.email = result.email;
  if (result.email_sent === false) query.sent = '0';
  const hash = result.verification_ticket
    ? `#${new URLSearchParams({ ticket: result.verification_ticket }).toString()}`
    : '';
  return { name: 'VerifyEmail', query, hash };
}
