/**
 * Shared formatting/labels for the Super Admin platform console.
 * Keep display logic here so tables and drawers stay consistent.
 */

const idrFormatter = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
});

export function formatIdr(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 'Rp0';
  return `Rp${idrFormatter.format(number)}`;
}

export function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? idrFormatter.format(number) : '0';
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? dateTimeFormatter.format(date) : '—';
}

export function formatDate(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? dateFormatter.format(date) : '—';
}

export function relativeTime(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';
  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'baru saja';
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return formatDate(date);
}

export function shortId(value, keep = 8) {
  const text = String(value || '');
  if (text.length <= keep * 2) return text || '—';
  return `${text.slice(0, keep)}…${text.slice(-keep)}`;
}

export function titleCase(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function statusTone(status) {
  const key = String(status || '').toLowerCase();
  if (
    ['ok', 'active', 'connected', 'paid', 'verified', 'approved', 'success', 'true'].includes(
      key
    )
  ) {
    return 'success';
  }
  if (
    ['pending', 'requested', 'warning', 'manual', 'lazy', 'degraded', 'unknown', 'info'].includes(
      key
    )
  ) {
    return 'warning';
  }
  if (
    ['error', 'failed', 'rejected', 'banned', 'danger', 'invalid_signature', 'disabled'].includes(
      key
    )
  ) {
    return 'danger';
  }
  if (['super admin', 'base admin', 'user'].includes(key)) return 'blue';
  return 'neutral';
}

export function statusLabel(status) {
  const key = String(status ?? '').toLowerCase();
  const map = {
    requested: 'Menunggu review',
    approved: 'Disetujui',
    paid: 'Sudah dibayar',
    rejected: 'Ditolak',
    failed: 'Gagal',
    cancelled: 'Dibatalkan',
    pending: 'Pending',
    expired: 'Kedaluwarsa',
    refunded: 'Refund',
    partial_refund: 'Refund sebagian',
    chargeback: 'Chargeback',
    invalid_signature: 'Signature invalid',
    received: 'Diterima',
    processed: 'Diproses',
    ignored: 'Diabaikan',
    verified: 'Terverifikasi',
    unverified: 'Belum verifikasi',
    ok: 'Normal',
    error: 'Error',
    active: 'Aktif',
    connected: 'Terhubung',
    disconnected: 'Terputus',
    idle: 'Tidak terhubung',
    manual: 'Manual',
    lazy: 'Lazy',
    unknown: 'Tidak diketahui',
    disabled: 'Nonaktif',
    true: 'Ya',
    false: 'Tidak',
  };
  return map[key] || titleCase(status);
}

export function roleLabel(role) {
  return role || 'User';
}

export function payoutActionLabel(action) {
  return (
    {
      approve: 'Setujui payout',
      reject: 'Tolak payout',
      mark_paid: 'Tandai sudah dibayar',
      mark_failed: 'Tandai transfer gagal',
    }[action] || 'Review payout'
  );
}

export function safeJson(value) {
  if (value == null) return '—';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
