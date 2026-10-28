/**
 * src/stores/templateStore.js
 *
 * Katalog template kartu dari `GET /api/templates` (tabel `Template` di
 * backend). Frontend tidak menyimpan salinan geometri/template: pratinjau
 * selalu PNG hasil render backend, dan daftar pilihan diambil dari API.
 *
 * Template bisa dimiliki satu base (eksklusif) atau menjadi katalog bersama.
 * Karena itu daftar dimuat per `base_handle`: base hanya menerima template
 * miliknya + katalog bersama, tidak pernah template milik base lain.
 */
import { defineStore } from 'pinia';
import { api } from '../api';

const TTL_MS = 5 * 60 * 1000;

function normalizeScope(handle) {
  return String(handle || '').trim();
}

export const useTemplateStore = defineStore('templates', {
  state: () => ({
    items: [],
    baseHandle: '',
    loading: false,
    error: '',
    loadedAt: 0,
    /** Cache per scope: '' = katalog bersama, '@base' = template base itu. */
    cache: {},
    pending: {},
  }),

  getters: {
    byKey: (state) => (key) => state.items.find((t) => t.key === key) || null,
    label: (state) => (key) => state.items.find((t) => t.key === key)?.label || key,
  },

  actions: {
    applyScope(scope, items, loadedAt) {
      this.baseHandle = scope;
      this.items = items;
      this.loadedAt = loadedAt;
    },

    /**
     * Muat katalog untuk satu base. Panggilan bersamaan untuk scope yang sama
     * berbagi promise; hasil scope lama tidak menimpa scope yang sedang aktif.
     */
    async loadForBase(handle = '', force = false) {
      const scope = normalizeScope(handle);
      const cached = this.cache[scope];

      if (
        !force &&
        cached &&
        cached.items.length &&
        Date.now() - cached.loadedAt < TTL_MS
      ) {
        if (this.baseHandle !== scope) {
          this.applyScope(scope, cached.items, cached.loadedAt);
        }
        return cached.items;
      }

      if (this.pending[scope]) return this.pending[scope];

      this.baseHandle = scope;
      this.loading = true;
      this.error = '';

      const promise = (async () => {
        try {
          const res = await api.getTemplates(scope || undefined);
          const data = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
          const loadedAt = Date.now();

          this.cache = { ...this.cache, [scope]: { items: data, loadedAt } };
          if (this.baseHandle === scope) {
            this.items = data;
            this.loadedAt = loadedAt;
          }
          return data;
        } catch (err) {
          if (this.baseHandle === scope) {
            this.error = 'Gagal memuat daftar template.';
          }
          throw err;
        } finally {
          const nextPending = { ...this.pending };
          delete nextPending[scope];
          this.pending = nextPending;
          if (this.baseHandle === scope) this.loading = false;
        }
      })();

      this.pending = { ...this.pending, [scope]: promise };
      return promise;
    },

    /** Katalog bersama (dipakai sebelum base dipilih). */
    async load(force = false) {
      return this.loadForBase('', force);
    },

    /** Apakah key tersedia di scope yang sedang aktif? */
    has(key) {
      return this.items.some((t) => t.key === key);
    },

    /** Key acak untuk composer; string kosong bila katalog belum termuat. */
    randomKey() {
      if (!this.items.length) return '';
      return this.items[Math.floor(Math.random() * this.items.length)].key;
    },

    /** Rasio kartu untuk CSS (semua template baru 4:5, tapi tetap dinamis). */
    aspectRatio(key) {
      const t = this.byKey(key);
      if (t?.width && t?.height) return `${t.width} / ${t.height}`;
      return '4 / 5';
    },
  },
});
