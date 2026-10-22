import { reactive } from 'vue';

/**
 * useToast — notifikasi ringkas global di tengah atas layar.
 * ---------------------------------------------------------------------------
 * Satu antrean toast dipakai seluruh aplikasi. Komponen host tunggal
 * `<AppToastHost>` (dipasang di App.vue) yang merender antrean tersebut.
 *
 * Contoh pemakaian:
 *
 *   import { toast } from '../composables/useToast';
 *
 *   toast.success('Perubahan berhasil disimpan.');
 *   toast.error('Gagal menyimpan. Coba lagi.');
 *   toast.info('Tautan disalin ke clipboard.');
 *
 * Opsi:
 *   - type     'success' | 'error' | 'warning' | 'info' | 'pending'
 *   - duration ms sebelum toast hilang (0 = tetap sampai ditutup manual)
 */

const DEFAULT_DURATION = 3200;
const ERROR_DURATION = 5200;
const MAX_VISIBLE = 4;

export const toastItems = reactive([]);

const timers = new Map();
let sequence = 0;

function clearTimer(id) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
}

function dismiss(id) {
  const index = toastItems.findIndex((item) => item.id === id);
  if (index < 0) return;
  clearTimer(id);
  toastItems.splice(index, 1);
}

function schedule(item) {
  if (!item.duration) return;
  clearTimer(item.id);
  timers.set(
    item.id,
    setTimeout(() => dismiss(item.id), item.duration),
  );
}

function show(message, options = {}) {
  const text = String(message ?? '').trim();
  if (!text) return null;

  const type = ['success', 'error', 'warning', 'info', 'pending'].includes(options.type)
    ? options.type
    : 'success';
  const fallbackDuration = type === 'error' ? ERROR_DURATION : DEFAULT_DURATION;
  const duration =
    Number.isFinite(options.duration) && options.duration >= 0
      ? options.duration
      : fallbackDuration;

  // Aksi berulang dengan pesan sama me-render ulang toast supaya timer dan
  // indikator durasinya mulai dari awal, bukan berhenti di tengah.
  const duplicateIndex = toastItems.findIndex(
    (item) => item.message === text && item.type === type,
  );
  if (duplicateIndex >= 0) {
    clearTimer(toastItems[duplicateIndex].id);
    toastItems.splice(duplicateIndex, 1);
  }

  const item = {
    id: `toast-${++sequence}`,
    message: text,
    type,
    duration,
  };

  toastItems.push(item);
  while (toastItems.length > MAX_VISIBLE) {
    dismiss(toastItems[0].id);
  }
  schedule(item);
  return item.id;
}

export const toast = {
  show,
  success: (message, options = {}) => show(message, { ...options, type: 'success' }),
  error: (message, options = {}) => show(message, { ...options, type: 'error' }),
  warning: (message, options = {}) => show(message, { ...options, type: 'warning' }),
  info: (message, options = {}) => show(message, { ...options, type: 'info' }),
  pending: (message, options = {}) => show(message, { ...options, type: 'pending' }),
  dismiss,
  clear() {
    toastItems.forEach((item) => clearTimer(item.id));
    toastItems.splice(0, toastItems.length);
  },
};

export function useToast() {
  return toast;
}
