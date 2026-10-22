/**
 * Menyalin teks ke clipboard dengan fallback untuk browser/konteks yang
 * tidak mengizinkan Clipboard API (mis. halaman non-HTTPS atau iframe).
 */
export async function copyText(text) {
  const value = String(text ?? '');
  if (!value) throw new Error('Tidak ada teks untuk disalin.');

  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Lanjut ke fallback di bawah.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, value.length);

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } finally {
    textarea.remove();
  }

  if (!copied) throw new Error('Clipboard tidak tersedia.');
}
