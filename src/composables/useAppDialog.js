import { ref } from 'vue';

/**
 * useAppDialog — dialog global (alert/confirm) bertema aplikasi.
 * ---------------------------------------------------------------------------
 * Pengganti `window.alert()` / `window.confirm()` yang tampil dengan tema
 * bawaan browser. Hanya SATU dialog aktif pada satu waktu; komponen host
 * tunggal `<AppDialogHost>` (dipasang di App.vue) yang merender dan
 * menyelesaikan promise-nya.
 *
 * Contoh pemakaian:
 *
 *   import { alertDialog, confirmDialog } from '../composables/useAppDialog';
 *
 *   // Konfirmasi destruktif
 *   const ok = await confirmDialog({
 *     title: 'Take Down Fess',
 *     message: 'Fess akan dihapus dan tidak bisa dikembalikan.',
 *     variant: 'danger',
 *     confirmLabel: 'Take Down',
 *   });
 *   if (!ok) return;
 *
 *   // Notifikasi error
 *   await alertDialog({
 *     title: 'Gagal Menyimpan',
 *     message: err.message,
 *     variant: 'danger',
 *   });
 *
 * Opsi:
 *   - title         judul dialog (default: "Informasi" / "Konfirmasi")
 *   - message       pesan utama (wajib)
 *   - detail        kalimat sekunder opsional (di bawah pesan utama)
 *   - variant       'info' | 'success' | 'warning' | 'danger'
 *                   (default: 'info' untuk alert, 'warning' untuk confirm)
 *   - confirmLabel  label tombol utama (default: "Mengerti" / "Lanjutkan")
 *   - cancelLabel   label tombol batal, hanya untuk confirm (default: "Batal")
 *
 * Nilai kembali:
 *   - alertDialog  → Promise<void>
 *   - confirmDialog → Promise<boolean> (true = pengguna menekan tombol utama)
 */

/** Dialog yang sedang tampil, dibaca oleh <AppDialogHost>. */
const current = ref(null);
let seq = 0;

function normalizeOptions(options) {
  if (typeof options === 'string') return { message: options };
  return options || {};
}

function open(kind, options) {
  const opts = normalizeOptions(options);

  return new Promise((resolve) => {
    // Bila masih ada dialog lama yang belum ditutup, anggap dibatalkan agar
    // promise-nya tidak menggantung selamanya.
    if (current.value) {
      const previous = current.value;
      current.value = null;
      previous.resolve(false);
    }

    current.value = {
      id: ++seq,
      kind, // 'alert' | 'confirm'
      title: opts.title || (kind === 'confirm' ? 'Konfirmasi' : 'Informasi'),
      message: opts.message || '',
      detail: opts.detail || '',
      variant: opts.variant || (kind === 'confirm' ? 'warning' : 'info'),
      confirmLabel: opts.confirmLabel || (kind === 'confirm' ? 'Lanjutkan' : 'Mengerti'),
      cancelLabel: opts.cancelLabel || 'Batal',
      resolve,
    };
  });
}

/**
 * Tampilkan notifikasi satu tombol. `await alertDialog({ ... })` selesai saat
 * dialog ditutup (tombol utama / Esc / klik backdrop).
 */
export function alertDialog(options = {}) {
  return open('alert', options).then(() => undefined);
}

/**
 * Tampilkan konfirmasi dua tombol. Resolve `true` hanya bila pengguna
 * menekan tombol utama; Batal / Esc / klik backdrop → `false`.
 */
export function confirmDialog(options = {}) {
  return open('confirm', options).then((confirmed) => confirmed === true);
}

/** Dipakai oleh <AppDialogHost> — state aktif + penyelesai promise. */
export function useAppDialogHost() {
  function settle(result) {
    const dialog = current.value;
    if (!dialog) return;
    current.value = null;
    dialog.resolve(result);
  }

  return { current, settle };
}
