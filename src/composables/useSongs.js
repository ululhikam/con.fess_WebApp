/**
 * src/composables/useSongs.js
 * ---------------------------------------------------------------------------
 * Catalog search for the "Lagu di Posting" feature, backed by GET /songs.
 */

import { ref } from 'vue';
import { api } from '../api';

export function useSongs() {
  const songs = ref([]);
  const loading = ref(false);
  const error = ref(null);

  /** Search the song catalog (debounce at call site or via watch). */
  async function searchSongs(query = '', { genre, sort, limit = 40 } = {}) {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.getSongs({
        query: query || undefined,
        genre: genre || undefined,
        sort: sort || undefined,
        limit,
      });
      songs.value = res?.data ?? res ?? [];
      return songs.value;
    } catch (e) {
      error.value = e;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return { songs, loading, error, searchSongs };
}
