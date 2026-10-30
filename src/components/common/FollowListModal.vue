<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      :aria-label="tab === 'followers' ? 'Daftar Pengikut' : 'Daftar Mengikuti'"
      @click.self="close"
    >
      <div class="modal-card follow-modal-card">
        <div class="follow-modal-header">
          <!-- Tab Switcher: Follower vs Following -->
          <div class="follow-tabs-nav">
            <button
              type="button"
              class="follow-tab-btn"
              :class="{ active: tab === 'followers' }"
              @click="switchTab('followers')"
            >
              <span>Follower</span>
              <span class="follow-tab-count">{{ formatCount(followersCount) }}</span>
            </button>
            <button
              v-if="followingSource === 'me'"
              type="button"
              class="follow-tab-btn"
              :class="{ active: tab === 'following' }"
              @click="switchTab('following')"
            >
              <span>Following</span>
              <span class="follow-tab-count">{{ formatCount(followingCount) }}</span>
            </button>
          </div>
          <button type="button" class="btn-close-modal" aria-label="Tutup" @click="close">
            <X :size="18" />
          </button>
        </div>

        <!-- Search Bar -->
        <div class="follow-search-box">
          <Search :size="15" class="follow-search-icon" />
          <input
            v-model="search"
            type="text"
            class="follow-search-input"
            :placeholder="tab === 'followers' ? 'Cari di daftar follower...' : 'Cari di daftar following...'"
          />
          <button v-if="search" type="button" class="btn-clear-search" @click="search = ''">
            <X :size="13" />
          </button>
        </div>

        <!-- List Body -->
        <div class="follow-list-body custom-scrollbar">
          <div v-if="loading" class="follow-empty-state">
            <p class="empty-text">Memuat daftar…</p>
          </div>

          <div v-else-if="error" class="follow-empty-state">
            <p class="empty-text">{{ error }}</p>
            <button type="button" class="btn-retry-list" @click="loadTab(true)">Coba lagi</button>
          </div>

          <div v-else-if="!filtered.length" class="follow-empty-state">
            <Users :size="32" class="empty-icon" />
            <p class="empty-text">
              {{ search ? 'Tidak ada akun yang cocok dengan pencarian' : emptyLabel }}
            </p>
          </div>

          <div v-for="item in filtered" :key="item.id" class="follow-user-row">
            <div class="follow-user-avatar-wrap">
              <img
                v-if="item.avatar"
                :src="item.avatar"
                :alt="item.name"
                class="follow-user-avatar"
              />
              <span
                v-else
                class="follow-user-avatar follow-user-initial"
                :style="{ background: item.color || 'var(--shell-chip)' }"
              >
                {{ initials(item.name) }}
              </span>
              <span v-if="item.isVerified" class="follow-verified-dot" title="Terverifikasi">✓</span>
            </div>

            <div class="follow-user-info">
              <div class="follow-user-name-line">
                <span class="follow-user-name">{{ item.name }}</span>
                <span v-if="item.isVerified" class="verified-tag">Base</span>
              </div>
              <div class="follow-user-handle">{{ item.handle }}</div>
              <p v-if="item.bio" class="follow-user-bio">{{ item.bio }}</p>
              <p v-else-if="item.kind === 'user' && item.followedAtText" class="follow-user-bio">
                Mengikuti sejak {{ item.followedAtText }}
              </p>
            </div>

            <!-- Aksi hanya untuk base yang diikuti (unfollow real). Tidak ada follow antar-user. -->
            <button
              v-if="item.kind === 'base' && followingSource === 'me'"
              type="button"
              class="btn-follow-toggle btn-following"
              :disabled="busyId === item.id"
              @click="unfollow(item)"
            >
              <UserCheck :size="13" />
              <span>{{ busyId === item.id ? '…' : 'Mengikuti' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { X, Search, Users, UserCheck } from 'lucide-vue-next';
import { api } from '../../api';
import { toast } from '../../composables/useToast';
import { useFollowBase } from '../../composables/useFollowBase';

const props = defineProps({
  show: { type: Boolean, default: false },
  tab: { type: String, default: 'followers' }, // 'followers' | 'following'
  /** Handle base tanpa @ — sumber daftar follower (data real dari tabel Follow). */
  baseHandle: { type: String, default: '' },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  /** 'me' = tampilkan daftar base yang diikuti user login; 'none' = tidak tersedia. */
  followingSource: { type: String, default: 'none' },
});

const emit = defineEmits(['update:show', 'update:tab', 'changed']);

const { toggleFollowBase } = useFollowBase();

const search = ref('');
const loading = ref(false);
const error = ref('');
const users = ref([]);
const bases = ref([]);
const loaded = ref({ followers: false, following: false });
const busyId = ref(null);

const isImageSrc = (value) =>
  typeof value === 'string' && /^(https?:|data:|blob:|\/(?!\/))/i.test(value);

const initials = (name) => {
  const clean = String(name || 'AN').trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
};

const formatCount = (value) => {
  const count = Number(value) || 0;
  if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return count.toLocaleString('id-ID');
};

const emptyLabel = computed(() => {
  if (props.tab === 'followers') return 'Belum ada follower';
  if (props.followingSource === 'me') return 'Belum mengikuti base apa pun';
  return 'Belum ada data mengikuti';
});

const filtered = computed(() => {
  const source =
    props.tab === 'followers'
      ? users.value
      : props.followingSource === 'me'
        ? bases.value
        : [];
  const q = search.value.trim().toLowerCase();
  if (!q) return source;
  return source.filter(
    (i) =>
      i.name.toLowerCase().includes(q) ||
      String(i.handle || '').toLowerCase().includes(q)
  );
});

async function loadTab(force = false) {
  const current = props.tab;

  if (current === 'following' && props.followingSource !== 'me') return;
  if (!force && loaded.value[current]) return;

  loading.value = true;
  error.value = '';
  try {
    if (current === 'followers') {
      const res = await api.getBaseFollowers(props.baseHandle, { limit: 100 });
      users.value = (res?.data ?? []).map((u) => {
        const date = u.followed_at ? new Date(u.followed_at) : null;
        return {
          id: u.id,
          kind: 'user',
          name: u.username || u.handle || 'Pengguna',
          handle: u.handle ? (String(u.handle).startsWith('@') ? u.handle : `@${u.handle}`) : '',
          avatar: isImageSrc(u.avatar) ? u.avatar : '',
          color: '',
          bio: '',
          isVerified: false,
          followedAtText:
            date && !Number.isNaN(date.getTime())
              ? date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
              : '',
        };
      });
    } else {
      const res = await api.getMyFollowing({ limit: 100 });
      bases.value = (res?.data ?? []).map((b) => ({
        id: b.id,
        kind: 'base',
        name: b.name || 'Base',
        handle: b.handle ? (String(b.handle).startsWith('@') ? b.handle : `@${b.handle}`) : '',
        avatar: isImageSrc(b.avatar) ? b.avatar : '',
        color: b.color || '#0055FF',
        bio: b.bio || '',
        isVerified: !!(b.verified ?? b.is_verified),
      }));
    }
    loaded.value[current] = true;
  } catch (e) {
    error.value =
      current === 'followers'
        ? 'Gagal memuat daftar follower. Coba lagi.'
        : 'Gagal memuat daftar following. Coba lagi.';
  } finally {
    loading.value = false;
  }
}

function switchTab(next) {
  if (next === props.tab) return;
  emit('update:tab', next);
}

function close() {
  emit('update:show', false);
}

async function unfollow(item) {
  if (busyId.value) return;
  busyId.value = item.id;
  try {
    const nowFollowing = await toggleFollowBase(item.handle);
    if (!nowFollowing) {
      bases.value = bases.value.filter((b) => b.id !== item.id);
      emit('changed');
      toast.success(`Berhenti mengikuti ${item.handle}`);
    }
  } catch (e) {
    error.value = 'Gagal berhenti mengikuti. Periksa koneksi lalu coba lagi.';
    toast.error(error.value);
  } finally {
    busyId.value = null;
  }
}

// Muat ulang daftar setiap modal dibuka supaya angka real (follower/following) selalu segar.
watch(
  () => props.show,
  (visible) => {
    if (!visible) return;
    loaded.value = { followers: false, following: false };
    search.value = '';
    error.value = '';
    loadTab(true);
  }
);

// Ganti tab -> muat daftarnya kalau belum (dalam sesi modal ini).
watch(
  () => props.tab,
  () => {
    if (!props.show) return;
    search.value = '';
    error.value = '';
    loadTab();
  }
);
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1500;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: modalFadeIn 0.18s ease;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 20px;
  width: 100%;
  animation: modalScaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalScaleUp {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.follow-modal-card {
  max-width: 500px;
  width: 95%;
  max-height: 82vh;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.follow-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--shell-border);
  background: var(--shell-card);
}

.follow-tabs-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.follow-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  color: var(--shell-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.follow-tab-btn:hover {
  color: var(--shell-text);
  background: var(--shell-chip);
}

.follow-tab-btn.active {
  background: var(--shell-chip);
  color: var(--shell-text);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.follow-tab-count {
  font-size: 11px;
  font-weight: 900;
  background: rgba(255, 255, 255, 0.1);
  padding: 1px 7px;
  border-radius: 10px;
}

.follow-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 16px 8px;
  padding: 8px 12px;
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  border-radius: 12px;
}

.follow-search-icon {
  color: var(--shell-text-muted);
  flex-shrink: 0;
}

.follow-search-input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 12.5px;
  color: var(--shell-text);
}

.follow-search-input::placeholder {
  color: var(--shell-text-muted);
}

.btn-clear-search {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.follow-list-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 52vh;
}

.follow-user-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  transition: background 0.15s ease;
}

.follow-user-row:hover {
  background: var(--shell-chip);
}

.follow-user-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.follow-user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid var(--shell-border);
}

.follow-user-initial {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 900;
  color: #ffffff;
  border-radius: 50%;
}

.follow-verified-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 15px;
  height: 15px;
  background: #3b82f6;
  color: #fff;
  font-size: 9px;
  font-weight: 900;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--shell-card);
}

.follow-user-info {
  flex: 1;
  min-width: 0;
}

.follow-user-name-line {
  display: flex;
  align-items: center;
  gap: 6px;
}

.follow-user-name {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--shell-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.verified-tag {
  font-size: 9.5px;
  font-weight: 900;
  background: rgba(59, 130, 246, 0.18);
  color: #60a5fa;
  padding: 1px 6px;
  border-radius: 6px;
  flex-shrink: 0;
}

.follow-user-handle {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--shell-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.follow-user-bio {
  font-size: 11px;
  color: var(--shell-text-muted);
  margin: 3px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-follow-toggle {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
  background: var(--shell-sub-accent, #2563eb);
  color: #fff;
  border: 1px solid transparent;
  transition: all 0.18s ease;
}

.btn-follow-toggle:disabled {
  opacity: 0.6;
  cursor: wait;
}

.btn-follow-toggle.btn-following {
  background: var(--shell-chip);
  color: var(--shell-text);
  border-color: var(--shell-border);
}

.btn-follow-toggle.btn-following:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.follow-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  text-align: center;
  color: var(--shell-text-muted);
}

.empty-text {
  margin: 0;
  font-size: 12.5px;
  font-weight: 600;
}

.btn-retry-list {
  margin-top: 10px;
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  color: var(--shell-text);
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  cursor: pointer;
}

.btn-close-modal {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.btn-close-modal:hover {
  background: var(--shell-chip);
  color: var(--shell-text);
}
</style>
