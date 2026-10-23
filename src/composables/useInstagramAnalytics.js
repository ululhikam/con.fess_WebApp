/**
 * Cache bersama untuk analitik Instagram di dashboard Base Admin.
 *
 * Meta Graph API punya rate limit per jam, sementara panel analitik memuat
 * ulang setiap kali tab berpindah. Cache 5 menit di frontend + backend
 * mencegah request berulang untuk data yang sama.
 */

import { ref } from 'vue';
import { api } from '../api';

const CACHE_TTL_MS = 5 * 60 * 1000;

const account = ref(null);
const accountData = ref(null);
const accountMessage = ref('');
const accountError = ref(null);
const accountLoading = ref(false);
const accountFetchedAt = ref(0);

const media = ref([]);
const mediaMessage = ref('');
const mediaError = ref(null);
const mediaLoading = ref(false);
const mediaFetchedAt = ref(0);

let accountInflight = null;
let mediaInflight = null;

function isFresh(fetchedAt) {
  return fetchedAt > 0 && Date.now() - fetchedAt < CACHE_TTL_MS;
}

function applyAccountResponse(payload) {
  account.value = payload?.account || null;
  accountData.value = payload?.data || null;
  accountMessage.value = payload?.message || '';
  accountFetchedAt.value = Date.now();
}

function applyMediaResponse(payload) {
  media.value = Array.isArray(payload?.data?.media) ? payload.data.media : [];
  mediaMessage.value = payload?.message || '';
  mediaFetchedAt.value = Date.now();
}

/** Muat insights akun + audiens (dipakai tab ringkasan & komunitas). */
async function loadAccountInsights({ force = false } = {}) {
  if (!force && isFresh(accountFetchedAt.value)) return;
  if (accountInflight) return accountInflight;

  accountLoading.value = true;
  accountError.value = null;

  accountInflight = (async () => {
    try {
      applyAccountResponse(await api.getInstagramInsights());
    } catch (error) {
      accountError.value = error;
    } finally {
      accountLoading.value = false;
      accountInflight = null;
    }
  })();

  return accountInflight;
}

/** Muat insights konten media (khusus tab konten, dimuat lazy). */
async function loadMediaInsights({ force = false } = {}) {
  if (!force && isFresh(mediaFetchedAt.value)) return;
  if (mediaInflight) return mediaInflight;

  mediaLoading.value = true;
  mediaError.value = null;

  mediaInflight = (async () => {
    try {
      applyMediaResponse(await api.getInstagramMediaInsights());
    } catch (error) {
      mediaError.value = error;
    } finally {
      mediaLoading.value = false;
      mediaInflight = null;
    }
  })();

  return mediaInflight;
}

export function useInstagramAnalytics() {
  return {
    account,
    accountData,
    accountMessage,
    accountError,
    accountLoading,
    accountFetchedAt,
    media,
    mediaMessage,
    mediaError,
    mediaLoading,
    mediaFetchedAt,
    loadAccountInsights,
    loadMediaInsights,
  };
}
