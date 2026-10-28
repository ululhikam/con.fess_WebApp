/**
 * src/stores/templateStore.js
 *
 * Katalog template kartu dari `GET /api/templates` (tabel `Template` di
 * backend). Frontend tidak menyimpan salinan geometri/template: pratinjau
 * selalu PNG hasil render backend, dan daftar pilihan diambil dari API.
 */
import { defineStore } from 'pinia';
import { api } from '../api';

const TTL_MS = 5 * 60 * 1000;

export const useTemplateStore = defineStore('templates', {
  state: () => ({
    items: [],
    loading: false,
    error: '',
    loadedAt: 0,
    pending: null,
  }),

  getters: {
    byKey: (state) => (key) => state.items.find((t) => t.key === key) || null,
    label: (state) => (key) => state.items.find((t) => t.key === key)?.label || key,
  },

  actions: {
    /** Muat sekali per TTL; panggilan bersamaan berbagi promise yang sama. */
    async load(force = false) {
      if (!force && this.items.length && Date.now() - this.loadedAt < TTL_MS) {
        return this.items;
      }
      if (this.pending) return this.pending;

      this.loading = true;
      this.error = '';
      this.pending = (async () => {
        try {
          const res = await api.getTemplates();
          const data = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
          this.items = data;
          this.loadedAt = Date.now();
          return data;
        } catch (err) {
          this.error = 'Gagal memuat daftar template.';
          throw err;
        } finally {
          this.loading = false;
          this.pending = null;
        }
      })();

      return this.pending;
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
