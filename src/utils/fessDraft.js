/**
 * Draf confession di perangkat.
 *
 * Isi confession bersifat sensitif (sering berisi cerita pribadi), jadi draf
 * tidak disimpan selamanya dan tidak menyertakan media:
 * - TTL 24 jam, bukan 7 hari seperti sebelumnya — draf lama yang terlupakan di
 *   komputer bersama tidak menyisakan teks sensitif berhari-hari.
 * - `media` tidak ikut disimpan. Entri media memuat URL/data-URL yang bisa
 *   berukuran besar dan tetap dapat dibuka dari localStorage tanpa login.
 * - Draf kedaluwarsa dihapus saat dibaca, bukan hanya diabaikan.
 */
export const DRAFT_KEY = 'fess_draft';
export const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export function saveDraft(draft) {
  const payload = {
    baseHandle: draft.baseHandle || '',
    content: draft.content || '',
    carouselOrder: Array.isArray(draft.carouselOrder) ? draft.carouselOrder : [],
    topic: draft.topic || '',
    scheduledAt: draft.scheduledAt || null,
    song: draft.song || null,
    template: draft.template || 'default',
    quotedFess: draft.quotedFess || null,
    isRandomTemplate: draft.isRandomTemplate === true,
    savedAt: Date.now(),
    isDraft: true,
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  return payload;
}

export function readDraft(now = Date.now()) {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    const draft = JSON.parse(raw);
    const savedAt = Number(draft?.savedAt);
    if (!draft?.isDraft || !Number.isFinite(savedAt) || now - savedAt > DRAFT_TTL_MS) {
      clearDraft();
      return null;
    }
    return draft;
  } catch {
    clearDraft();
    return null;
  }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}
