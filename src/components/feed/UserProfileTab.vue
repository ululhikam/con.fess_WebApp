<template>
  <section class="user-profile-ig-stage" aria-label="Profil Pengguna">
    <!-- TOP BAR (IG Style: Username & Right Hamburger Menu) -->
    <div class="ig-top-bar">
      <div class="ig-top-left">
        <span class="ig-handle-title">{{ userHandle }}</span>
        <span class="ig-badge-anon" title="Pengirim Anonim">ANON</span>
      </div>

      <div class="ig-top-right">
        <button
          type="button"
          class="btn-hamburger"
          aria-label="Buka Pengaturan"
          title="Pengaturan"
          @click="showSettingsDrawer = true"
        >
          <Menu :size="24" />
        </button>
      </div>
    </div>

    <!-- PROFILE HERO (IG Style: Center Avatar, Edit Profile Button, Name & Bio) -->
    <div class="ig-profile-header">
      <!-- Centered Avatar with Story Ring Feel -->
      <div class="ig-avatar-wrapper">
        <div class="ig-avatar-ring">
          <img
            v-if="userAvatar"
            :src="userAvatar"
            :alt="displayName"
            class="ig-avatar-img"
            @error="onAvatarError"
          />
          <div v-else class="ig-avatar-fallback">
            <UserRound :size="46" />
          </div>
        </div>

        <button
          type="button"
          class="ig-avatar-edit-badge"
          aria-label="Ubah foto profil"
          title="Ubah foto profil"
          @click="openEditModal"
        >
          <Camera :size="14" />
        </button>
      </div>

      <!-- Centered Name & Username -->
      <div class="ig-user-info">
        <h2 class="ig-display-name">{{ displayName }}</h2>
        <div class="ig-username-sub">{{ userHandle }}</div>
        <p v-if="userBio" class="ig-bio-text">{{ userBio }}</p>
      </div>

      <!-- Action Button: Edit Profil -->
      <div class="ig-actions-row">
        <button type="button" class="btn-edit-profile" @click="openEditModal">
          <Edit3 :size="15" />
          <span>Edit Profil</span>
        </button>
      </div>

      <!-- Quick Stats Strip (IG Style: Fess, Mengikuti, Saldo CTF) -->
      <div class="ig-stats-strip">
        <button type="button" class="ig-stat-col" @click="activeSubTab = 'fess'">
          <span class="ig-stat-num">{{ myFessCount }}</span>
          <span class="ig-stat-lbl">Fess Saya</span>
        </button>

        <div class="ig-stat-divider" />

        <button type="button" class="ig-stat-col" @click="activeSubTab = 'following'">
          <span class="ig-stat-num">{{ followedBasesCount }}</span>
          <span class="ig-stat-lbl">Mengikuti</span>
        </button>

        <div class="ig-stat-divider" />

        <button type="button" class="ig-stat-col" @click="activeSubTab = 'saldo'">
          <span class="ig-stat-num ig-stat-num--accent">{{ balanceDisplay }}</span>
          <span class="ig-stat-lbl">Saldo CTF</span>
        </button>
      </div>
    </div>

    <!-- 4 SUB-TABS (IG Profile Tabs: Fess Saya, Tersimpan, Base yang Diikuti, Saldo & Top Up) -->
    <div class="ig-nav-tabs" role="tablist" aria-label="Tab Profil">
      <button
        type="button"
        role="tab"
        :aria-selected="activeSubTab === 'fess'"
        class="ig-tab-btn"
        :class="{ active: activeSubTab === 'fess' }"
        @click="activeSubTab = 'fess'"
      >
        <MessageSquare :size="18" />
        <span>Fess Saya</span>
      </button>

      <button
        type="button"
        role="tab"
        :aria-selected="activeSubTab === 'saved'"
        class="ig-tab-btn"
        :class="{ active: activeSubTab === 'saved' }"
        @click="activeSubTab = 'saved'"
      >
        <Bookmark :size="18" />
        <span>Tersimpan</span>
      </button>

      <button
        type="button"
        role="tab"
        :aria-selected="activeSubTab === 'following'"
        class="ig-tab-btn"
        :class="{ active: activeSubTab === 'following' }"
        @click="activeSubTab = 'following'"
      >
        <Star :size="18" />
        <span>Base Diikuti</span>
      </button>

      <button
        type="button"
        role="tab"
        :aria-selected="activeSubTab === 'saldo'"
        class="ig-tab-btn"
        :class="{ active: activeSubTab === 'saldo' }"
        @click="activeSubTab = 'saldo'"
      >
        <CreditCard :size="18" />
        <span>Saldo & Top Up</span>
      </button>
    </div>

    <!-- TAB CONTENTS -->
    <div class="ig-tab-content-area">
      <!-- TAB 1: FESS SAYA -->
      <div v-if="activeSubTab === 'fess'" class="tab-pane-fade">
        <div class="tab-pane-header">
          <span class="tab-pane-title">Riwayat Kiriman Confession</span>
          <button type="button" class="btn-create-small" @click="$emit('openCompose')">
            <Plus :size="14" /> Kirim Fess Baru
          </button>
        </div>

        <ContentSkeleton
          v-if="myFessLoading && !myFesses.length"
          type="list"
          :count="3"
          label="Memuat fess kamu…"
        />

        <AppStateView
          v-else-if="myFessError && !myFesses.length"
          variant="error"
          title="Fess kamu gagal dimuat"
          description="Terjadi kesalahan saat mengambil riwayat kirimanmu. Coba muat ulang."
          action-label="Coba lagi"
          @action="loadMyFesses"
        />

        <template v-else>
          <!-- Filter status + urutan (server-side) -->
          <div class="tab-filter-row mb-4">
            <div class="segmented-tabs-container" role="tablist" aria-label="Filter status fess">
              <button
                v-for="filter in MY_FESS_FILTERS"
                :key="filter.key"
                type="button"
                role="tab"
                :aria-selected="myFessFilter === filter.key"
                :class="['segmented-btn', { active: myFessFilter === filter.key }]"
                @click="myFessFilter = filter.key"
              >
                {{ filter.label }}
              </button>
            </div>

            <select v-model="myFessSort" class="filter-select" aria-label="Urutkan fess">
              <option value="newest">Terbaru</option>
              <option value="popular">Terpopuler</option>
            </select>
          </div>

          <div v-if="myFesses.length" class="my-fess-list">
            <FessCard
              v-for="item in myFesses"
              :key="item.id"
              :post="item"
              :show-own-status="true"
              @like="handleMyFessLike"
            />

            <!-- Lazy load: sentinel + status footer -->
            <div ref="myFessSentinel" class="feed-load-sentinel" aria-hidden="true"></div>
            <p v-if="myFessLoadingMore" class="feed-load-hint">Memuat lebih banyak…</p>
            <button
              v-else-if="myFessLoadMoreError"
              type="button"
              class="feed-load-retry"
              @click="loadMoreMyFesses"
            >
              Coba lagi memuat
            </button>
          </div>

          <div v-else class="empty-tab-state">
            <MessageSquare :size="40" class="empty-tab-icon" />
            <p class="empty-tab-title">
              {{ myFessFilter === 'semua' ? 'Belum ada fess terkirim' : 'Tidak ada fess dengan status ini' }}
            </p>
            <p class="empty-tab-sub">
              {{
                myFessFilter === 'semua'
                  ? 'Confession yang kamu kirimkan akan tersimpan secara anonim di sini.'
                  : 'Coba pilih filter status yang lain.'
              }}
            </p>
            <button
              v-if="myFessFilter === 'semua'"
              type="button"
              class="btn-primary-pill mt-4"
              @click="$emit('openCompose')"
            >
              Kirim Fess Sekarang
            </button>
          </div>
        </template>
      </div>

      <!-- TAB 2: FESS TERSIMPAN -->
      <div v-else-if="activeSubTab === 'saved'" class="tab-pane-fade">
        <div class="tab-pane-header">
          <span class="tab-pane-title">Fess Tersimpan ({{ savedTotal }})</span>
        </div>

        <ContentSkeleton
          v-if="savedLoading && !savedFesses.length"
          type="list"
          :count="3"
          label="Memuat fess tersimpan…"
        />

        <AppStateView
          v-else-if="savedError && !savedFesses.length"
          variant="error"
          title="Fess tersimpan gagal dimuat"
          description="Terjadi kesalahan saat mengambil daftar simpananmu. Coba muat ulang."
          action-label="Coba lagi"
          @action="loadSavedFesses"
        />

        <template v-else>
          <div v-if="savedFesses.length" class="my-fess-list">
            <FessCard
              v-for="item in savedFesses"
              :key="item.id"
              :post="item"
              @like="handleSavedLike"
              @bookmark="handleSavedBookmark"
            />

            <div ref="savedSentinel" class="feed-load-sentinel" aria-hidden="true"></div>
            <p v-if="savedLoadingMore" class="feed-load-hint">Memuat lebih banyak…</p>
            <button
              v-else-if="savedLoadMoreError"
              type="button"
              class="feed-load-retry"
              @click="loadMoreSavedFesses"
            >
              Coba lagi memuat
            </button>
          </div>

          <div v-else class="empty-tab-state">
            <Bookmark :size="40" class="empty-tab-icon" />
            <p class="empty-tab-title">Belum ada fess tersimpan</p>
            <p class="empty-tab-sub">
              Tekan ikon simpan di kartu fess untuk menyimpannya ke sini.
            </p>
          </div>
        </template>
      </div>

      <!-- TAB 3: BASE YANG DIIKUTI -->
      <div v-else-if="activeSubTab === 'following'" class="tab-pane-fade">
        <div class="tab-pane-header">
          <span class="tab-pane-title">Komunitas Base Diikuti ({{ followedBasesCount }})</span>
        </div>

        <ContentSkeleton
          v-if="followingLoading && !followingBases.length"
          type="list"
          :count="3"
          label="Memuat base diikuti…"
        />

        <AppStateView
          v-else-if="followingError && !followingBases.length"
          variant="error"
          title="Daftar base gagal dimuat"
          description="Terjadi kesalahan saat mengambil base yang kamu ikuti. Coba muat ulang."
          action-label="Coba lagi"
          @action="loadFollowing"
        />

        <template v-else>
          <div class="following-search-box mb-4">
            <Search :size="16" class="search-icon" />
            <input
              v-model="baseSearchQuery"
              type="text"
              placeholder="Cari base yang diikuti…"
              class="following-search-input"
            />
          </div>

          <div class="tab-filter-row mb-4">
            <select v-model="followingSort" class="filter-select" aria-label="Urutkan base diikuti">
              <option value="newest">Terbaru Diikuti</option>
              <option value="name">Nama A-Z</option>
              <option value="members">Anggota Terbanyak</option>
            </select>
          </div>

          <div v-if="followingBases.length" class="following-list">
            <div
              v-for="base in followingBases"
              :key="base.handle"
              class="following-card"
            >
              <div
                class="following-info-col"
                @click="goToBase(base.handle)"
                title="Lihat profil base"
              >
                <div class="following-avatar" :style="{ background: base.color || '#2d68ff' }">
                  {{ base.name.charAt(0) }}
                </div>
                <div class="following-details">
                  <div class="following-name">{{ base.name }}</div>
                  <div class="following-handle">{{ base.handle }} • {{ base.members }}</div>
                </div>
              </div>
              <button
                type="button"
                class="btn-unfollow"
                @click="handleUnfollow(base.handle)"
              >
                Mengikuti
              </button>
            </div>

            <!-- Lazy load: sentinel + status footer -->
            <div ref="followingSentinel" class="feed-load-sentinel" aria-hidden="true"></div>
            <p v-if="followingLoadingMore" class="feed-load-hint">Memuat lebih banyak…</p>
            <button
              v-else-if="followingLoadMoreError"
              type="button"
              class="feed-load-retry"
              @click="loadMoreFollowing"
            >
              Coba lagi memuat
            </button>
          </div>

          <div v-else class="empty-tab-state">
            <Star :size="40" class="empty-tab-icon" />
            <p class="empty-tab-title">
              {{ baseSearchQuery.trim() ? 'Tidak ada base ditemukan' : 'Belum mengikuti base' }}
            </p>
            <p class="empty-tab-sub">
              {{
                baseSearchQuery.trim()
                  ? 'Coba kata kunci lain.'
                  : 'Jelajahi dan ikuti base confession favoritmu di tab Search.'
              }}
            </p>
          </div>
        </template>
      </div>

      <!-- TAB 3: SALDO & TOP UP -->
      <div v-else-if="activeSubTab === 'saldo'" class="tab-pane-fade">
        <!-- Saldo Hero Card (read-only: balance comes from the session user) -->
        <div class="balance-ctf-card">
          <div class="balance-ctf-header">
            <div>
              <div class="balance-ctf-label">SALDO AKUN KAMU</div>
              <div class="balance-ctf-val">
                <Coins :size="32" class="balance-ctf-icon" />
                <span>{{ balanceDisplay }}</span>
                <span class="balance-ctf-unit">CTF</span>
              </div>
            </div>
            <div v-if="hasBalance" class="balance-ctf-status">
              <span class="ctf-status-pill">Status: Aktif</span>
            </div>
          </div>
          <p class="balance-ctf-note">
            1 CTF = 1 kali kirim confession reguler tanpa antrian.
          </p>
        </div>

        <div class="empty-tab-state mt-6">
          <CreditCard :size="40" class="empty-tab-icon" />
          <p class="empty-tab-title">Top Up Belum Tersedia</p>
          <p class="empty-tab-sub">
            {{
              hasBalance
                ? 'Saldo di atas diambil langsung dari akunmu. Fitur pembelian CTF belum tersedia saat ini.'
                : 'Saldo dan top up CTF belum tersedia pada akunmu saat ini.'
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- SETTINGS DRAWER / SLIDE-IN MODAL (When Hamburger Menu is clicked) -->
    <div
      v-if="showSettingsDrawer"
      class="settings-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Pengaturan"
      @click.self="showSettingsDrawer = false"
    >
      <div class="settings-drawer-panel">
        <div class="drawer-header">
          <span class="drawer-title">Pengaturan</span>
          <button
            type="button"
            class="btn-drawer-close"
            aria-label="Tutup pengaturan"
            @click="showSettingsDrawer = false"
          >
            <X :size="20" />
          </button>
        </div>

        <div class="drawer-body">
          <!-- 1. Tampilan (Theme) -->
          <div class="settings-group">
            <div class="settings-row-static">
              <div class="row-info">
                <Sun :size="18" class="row-icon" />
                <span class="row-label">Tampilan Tema</span>
              </div>
              <div class="theme-segmented-pills" role="radiogroup" aria-label="Mode tampilan">
                <button
                  type="button"
                  class="tsp-btn"
                  :class="{ active: themeMode === 'system' }"
                  @click="$emit('setTheme', 'system')"
                >
                  Sistem
                </button>
                <button
                  type="button"
                  class="tsp-btn"
                  :class="{ active: themeMode === 'light' }"
                  @click="$emit('setTheme', 'light')"
                >
                  Terang
                </button>
                <button
                  type="button"
                  class="tsp-btn"
                  :class="{ active: themeMode === 'dark' }"
                  @click="$emit('setTheme', 'dark')"
                >
                  Gelap
                </button>
              </div>
            </div>
          </div>

          <!-- Settings Items List -->
          <div class="settings-group mt-3">
            <!-- 2. Notifikasi -->
            <button
              type="button"
              class="settings-menu-item"
              @click="openSettingsSubPanel('notifications')"
            >
              <div class="row-info">
                <Bell :size="18" class="row-icon" />
                <div>
                  <div class="row-label">Notifikasi</div>
                  <div class="row-desc">Atur pemberitahuan fess & aktivitas</div>
                </div>
              </div>
              <div class="row-right-actions">
                <span v-if="notif.unreadCount.value > 0" class="badge-row-count">
                  {{ notif.unreadCount.value > 99 ? '99+' : notif.unreadCount.value }}
                </span>
                <ChevronRight :size="16" class="chevron-icon" />
              </div>
            </button>

            <!-- 3. Bantuan -->
            <button
              type="button"
              class="settings-menu-item"
              @click="openSettingsSubPanel('help')"
            >
              <div class="row-info">
                <HelpCircle :size="18" class="row-icon" />
                <div>
                  <div class="row-label">Bantuan</div>
                  <div class="row-desc">FAQ & Pusat Dukungan Fess n Curious</div>
                </div>
              </div>
              <ChevronRight :size="16" class="chevron-icon" />
            </button>

            <!-- 4. Ketentuan Layanan -->
            <button
              type="button"
              class="settings-menu-item"
              @click="openSettingsSubPanel('terms')"
            >
              <div class="row-info">
                <ScrollText :size="18" class="row-icon" />
                <div>
                  <div class="row-label">Ketentuan Layanan</div>
                  <div class="row-desc">Aturan penggunaan & panduan komunitas</div>
                </div>
              </div>
              <ChevronRight :size="16" class="chevron-icon" />
            </button>

            <!-- 5. Kebijakan Privasi -->
            <button
              type="button"
              class="settings-menu-item"
              @click="openSettingsSubPanel('privacy')"
            >
              <div class="row-info">
                <Shield :size="18" class="row-icon" />
                <div>
                  <div class="row-label">Kebijakan Privasi</div>
                  <div class="row-desc">Perlindungan data & privasi anonimitas</div>
                </div>
              </div>
              <ChevronRight :size="16" class="chevron-icon" />
            </button>

            <!-- 6. Keamanan & Ganti Password -->
            <button
              type="button"
              class="settings-menu-item"
              @click="openSettingsSubPanel('security')"
            >
              <div class="row-info">
                <KeyRound :size="18" class="row-icon" />
                <div>
                  <div class="row-label">Keamanan & Ganti Password</div>
                  <div class="row-desc">Email, kata sandi & sesi login</div>
                </div>
              </div>
              <ChevronRight :size="16" class="chevron-icon" />
            </button>
          </div>

          <!-- 7. Logout / Keluar -->
          <div class="settings-group mt-4">
            <button type="button" class="settings-menu-item item--danger" @click="confirmLogout">
              <div class="row-info">
                <LogOut :size="18" class="row-icon icon--danger" />
                <span class="row-label label--danger">Keluar dari Akun</span>
              </div>
              <ChevronRight :size="16" class="chevron-icon icon--danger" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- EDIT PROFILE MODAL -->
    <div
      v-if="showEditModal"
      class="edit-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Edit Profil"
      @click.self="showEditModal = false"
    >
      <div class="edit-modal-card">
        <div class="edit-modal-header">
          <h3 class="edit-modal-title">Edit Profil</h3>
          <button
            type="button"
            class="btn-close-modal"
            aria-label="Tutup"
            @click="showEditModal = false"
          >
            <X :size="18" />
          </button>
        </div>

        <form class="edit-modal-body" @submit.prevent="saveProfile">
          <!-- Avatar Picker with Custom Upload & Presets -->
          <div class="edit-avatar-section">
            <div class="edit-avatar-preview-box">
              <img :src="editForm.avatar" alt="Preview Foto" class="edit-avatar-preview" />
            </div>
            <div class="edit-avatar-controls">
              <div class="avatar-controls-top">
                <span class="edit-avatar-label">Foto Profil:</span>
                <label class="btn-upload-avatar-chip" :class="{ 'is-uploading': isUploadingAvatar }">
                  <Upload :size="12" />
                  <span>{{ isUploadingAvatar ? 'Mengunggah…' : 'Upload Foto' }}</span>
                  <input
                    type="file"
                    accept="image/*"
                    class="sr-only"
                    :disabled="isUploadingAvatar"
                    @change="handleAvatarFileSelect"
                  />
                </label>
              </div>
              <div class="avatar-presets">
                <button
                  v-for="(preset, i) in AVATAR_PRESETS"
                  :key="i"
                  type="button"
                  class="btn-preset-avatar"
                  :class="{ selected: editForm.avatar === preset }"
                  @click="editForm.avatar = preset"
                >
                  <img :src="preset" :alt="`Avatar ${i+1}`" />
                </button>
              </div>
            </div>
          </div>

          <!-- Display Name -->
          <div class="form-group mt-4">
            <label for="edit-name" class="form-label">Nama Tampilan</label>
            <input
              id="edit-name"
              v-model="editForm.username"
              type="text"
              class="form-input"
              placeholder="Nama kamu"
              required
            />
          </div>

          <!-- Handle: editable only when the 7-day cooldown has passed -->
          <div class="form-group mt-3">
            <div class="form-label-row">
              <label for="edit-handle" class="form-label">Username / Handle</label>
              <span v-if="!canChangeHandle" class="handle-lock-chip">
                <Clock :size="12" />
                <span>Terkunci</span>
              </span>
            </div>
            <input
              id="edit-handle"
              v-model="editForm.handle"
              type="text"
              class="form-input"
              placeholder="@username"
              maxlength="21"
              autocomplete="username"
              :disabled="!canChangeHandle"
            />
            <span v-if="canChangeHandle" class="form-hint">
              Handle bisa diganti 1 kali setiap {{ handleCooldownPeriodDays }} hari. Setelah
              disimpan, handle baru terkunci selama {{ handleCooldownPeriodDays }} hari.
            </span>
            <div v-else class="handle-cooldown-note">
              <Clock :size="14" />
              <span>
                Kamu sudah mengganti handle{{
                  handleChangedLabel ? ` pada ${handleChangedLabel}` : ''
                }}. Handle dapat diubah lagi pada
                <strong>{{ handleAvailableLabel }}</strong>
                ({{ handleCooldownDays }} hari lagi).
              </span>
            </div>
          </div>

          <!-- Bio -->
          <div class="form-group mt-2">
            <label for="edit-bio" class="form-label">Bio Profil</label>
            <textarea
              id="edit-bio"
              v-model="editForm.bio"
              rows="2"
              class="form-textarea"
              placeholder="Ceritakan tentang dirimu..."
            ></textarea>
          </div>

          <p v-if="profileSaveError" class="form-error">{{ profileSaveError }}</p>

          <div class="edit-modal-footer mt-5">
            <button
              type="button"
              class="btn-cancel"
              @click="showEditModal = false"
            >
              Batal
            </button>
            <button type="submit" class="btn-save" :disabled="isSavingProfile">
              {{ isSavingProfile ? 'Menyimpan…' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * UserProfileTab — Instagram-style User Profile tab.
 *
 * Requirements fulfilled:
 * 1. Top bar: username on left, hamburger menu (☰) on far right.
 * 2. Hamburger button opens Settings: Tampilan (theme), Notif, Bantuan, Ketentuan Layanan,
 *    Kebijakan Privasi, Keamanan & Ganti Password, Logout.
 * 3. Centered profile photo, "Edit Profil" button, Name/Username and bio below it.
 * 4. 4 interactive sub-tabs: Fess Saya, Tersimpan, Base yang Diikuti, Saldo & Top Up.
 * 5. Pinned bottom navbar stays active and visible.
 */
import { ref, computed, onMounted, onActivated, onBeforeUnmount, watch } from 'vue';
import {
  Menu,
  X,
  Edit3,
  Camera,
  UserRound,
  Sun,
  Bell,
  HelpCircle,
  ScrollText,
  Shield,
  KeyRound,
  LogOut,
  Coins,
  MessageSquare,
  Bookmark,
  Star,
  CreditCard,
  Plus,
  Search,
  ChevronRight,
  Upload,
  Clock,
} from 'lucide-vue-next';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'vue-router';
import ContentSkeleton from '../ui/ContentSkeleton.vue';
import AppStateView from '../ui/AppStateView.vue';
import FessCard from '../common/FessCard.vue';
import { api } from '../../api';
import { mapFessToPost } from '../../utils/fessMapper';
import { formatNumber } from '../../utils/format';
import { mapBase } from '../../composables/useBases';
import { useFollowBase } from '../../composables/useFollowBase';
import { useInfiniteScroll } from '../../composables/useInfiniteScroll';
import { useVisibilityRefresh } from '../../composables/useVisibilityRefresh';
import { useNotifications } from '../../composables/useNotifications';

const props = defineProps({
  themeMode: { type: String, default: 'system' },
});

const notif = useNotifications();

const emit = defineEmits([
  'setTheme',
  'logout',
  'openCompose',
  'openSubPanel',
]);

const authStore = useAuthStore();
const router = useRouter();
const { followedHandles, toggleFollowBase } = useFollowBase();

function goToBase(handle) {
  if (!handle) return;
  const clean = handle.replace(/^@/, '');
  router.push(`/base/${clean}`);
}

/* ---------- Profile State (live from auth store) ---------- */
const displayName = computed(() => authStore.user?.username || 'Pengguna Anonim');
const userHandle = computed(() => authStore.user?.handle || '@anon_user');
const userBio = computed(() => authStore.user?.bio || '');
const userAvatar = computed(() => authStore.user?.avatar || '');

/* ---------- Handle change cooldown (mirrors backend: 1x / 7 hari) ---------- */
const HANDLE_COOLDOWN_DAY_MS = 24 * 60 * 60 * 1000;

const handleChangeAvailableAt = computed(() => {
  const raw = authStore.user?.handleChangeAvailableAt;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
});

const canChangeHandle = computed(() => {
  const availableAt = handleChangeAvailableAt.value;
  return !availableAt || Date.now() >= availableAt.getTime();
});

const handleChangedLabel = computed(() => {
  const raw = authStore.user?.handleChangedAt;
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
});

const handleAvailableLabel = computed(() => {
  const availableAt = handleChangeAvailableAt.value;
  if (!availableAt) return '';
  return availableAt.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
});

const handleCooldownDays = computed(() => {
  const availableAt = handleChangeAvailableAt.value;
  if (!availableAt) return 0;
  return Math.max(
    1,
    Math.ceil((availableAt.getTime() - Date.now()) / HANDLE_COOLDOWN_DAY_MS)
  );
});

const handleCooldownPeriodDays = computed(
  () => Number(authStore.user?.handleChangeCooldownDays) || 7
);

/* ---------- Sub Tabs State ---------- */
const activeSubTab = ref('fess'); // 'fess' | 'saved' | 'following' | 'saldo'

/* ---------- Drawers & Modals ---------- */
const showSettingsDrawer = ref(false);
const showEditModal = ref(false);
const profileSaveError = ref('');
const isSavingProfile = ref(false);

/* ---------- Edit Profile Form ---------- */
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
];

const editForm = ref({
  username: '',
  handle: '',
  bio: '',
  avatar: '',
});

function openEditModal() {
  profileSaveError.value = '';
  editForm.value = {
    username: displayName.value,
    handle: userHandle.value,
    bio: userBio.value,
    avatar: userAvatar.value,
  };
  showEditModal.value = true;
}

async function handleAvatarFileSelect(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const res = await api.uploadAvatar(file);
    if (res?.url) editForm.value.avatar = res.url;
  } catch {
    // upload failed — keep the current avatar
  }
}

async function saveProfile() {
  const cleanHandle = editForm.value.handle.startsWith('@')
    ? editForm.value.handle
    : `@${editForm.value.handle}`;

  profileSaveError.value = '';
  isSavingProfile.value = true;
  try {
    const updates = {
      username: editForm.value.username.trim(),
      bio: editForm.value.bio.trim(),
      avatar: editForm.value.avatar || null,
    };

    // Only send handle when it actually changed and the cooldown has passed.
    // The backend still enforces the cooldown as the source of truth.
    if (canChangeHandle.value && cleanHandle.trim() !== userHandle.value) {
      updates.handle = cleanHandle.trim();
    }

    await authStore.updateProfile(updates);
    showEditModal.value = false;
  } catch (err) {
    profileSaveError.value = err?.message || 'Gagal menyimpan profil. Coba lagi.';
    // If another device changed the handle, refresh the cooldown metadata so
    // the field locks and the explanation appears immediately.
    if (err?.data?.code === 'HANDLE_CHANGE_COOLDOWN') {
      authStore.fetchMe().catch(() => {});
    }
  } finally {
    isSavingProfile.value = false;
  }
}

function onAvatarError(e) {
  e.target.style.display = 'none';
}

/* ---------- Tab 1: Fess Saya —— GET /users/me/fesses (filter + sort + lazy load) ---------- */
const MY_FESS_FILTERS = [
  { key: 'semua', label: 'Semua' },
  { key: 'published', label: 'Terbit' },
  { key: 'pending', label: 'Antrean' },
  { key: 'rejected', label: 'Ditolak' },
];
const MY_FESS_PAGE_SIZE = 20;

const myFesses = ref([]);
const myFessLoading = ref(false);
const myFessLoadingMore = ref(false);
const myFessLoadMoreError = ref(null);
const myFessError = ref(null);
const myFessFilter = ref('semua');
const myFessSort = ref('newest');
const myFessTotal = ref(0); // total semua status (strip statistik)
const myFessQueryTotal = ref(0); // total untuk filter aktif (lazy load)
const myFessSentinel = ref(null);
let myFessPage = 1;

const myFessHasMore = computed(() => myFesses.value.length < myFessQueryTotal.value);

function myFessParams(page) {
  return {
    page,
    limit: MY_FESS_PAGE_SIZE,
    sort: myFessSort.value,
    ...(myFessFilter.value !== 'semua' ? { status: myFessFilter.value } : {}),
  };
}

// Module-level caches across mounts for instant Instagram/X profile loading (SWR)
let cachedMyFessesData = null;
let cachedMyFessesTotal = 0;
let cachedFollowingData = null;
let cachedFollowingTotal = 0;

async function loadMyFesses() {
  myFessError.value = null;
  myFessLoadMoreError.value = null;

  // SWR: Jika cache ada dan filter 'semua', render instan tanpa skeleton
  if (cachedMyFessesData && myFessFilter.value === 'semua') {
    myFesses.value = cachedMyFessesData;
    myFessQueryTotal.value = cachedMyFessesTotal;
    myFessTotal.value = cachedMyFessesTotal;
    myFessLoading.value = false;
  } else {
    myFessLoading.value = true;
  }

  try {
    const res = await api.getMyFesses(myFessParams(1));
    const list = (res?.data ?? []).map(mapFessToPost);
    myFesses.value = list;
    myFessQueryTotal.value = res?.total ?? myFesses.value.length;
    if (myFessFilter.value === 'semua') {
      myFessTotal.value = myFessQueryTotal.value;
      cachedMyFessesData = list;
      cachedMyFessesTotal = myFessTotal.value;
    }
    myFessPage = 1;
  } catch (e) {
    if (!cachedMyFessesData) myFessError.value = e;
  } finally {
    myFessLoading.value = false;
  }
}

/** Lazy load halaman berikutnya dari daftar Fess Saya. */
async function loadMoreMyFesses() {
  if (myFessLoading.value || myFessLoadingMore.value || !myFessHasMore.value) return;
  myFessLoadingMore.value = true;
  myFessLoadMoreError.value = null;
  try {
    const nextPage = myFessPage + 1;
    const res = await api.getMyFesses(myFessParams(nextPage));
    const seen = new Set(myFesses.value.map((p) => String(p.id)));
    const extra = (res?.data ?? [])
      .map(mapFessToPost)
      .filter((p) => p && !seen.has(String(p.id)));
    myFesses.value = [...myFesses.value, ...extra];
    myFessQueryTotal.value = res?.total ?? myFessQueryTotal.value;
    myFessPage = nextPage;
  } catch (e) {
    myFessLoadMoreError.value = e;
  } finally {
    myFessLoadingMore.value = false;
  }
}

// Ganti filter/urutan → muat ulang dari halaman pertama (server-side).
watch([myFessFilter, myFessSort], () => {
  loadMyFesses();
});

/** Like dari daftar kartu profil (optimistic, disinkronkan dengan respons vote). */
async function handlePostLikeInList(listRef, payload) {
  const id = payload && typeof payload === 'object' ? payload.id : payload;
  const item = listRef.value.find((p) => String(p.id) === String(id));
  if (!item) return;

  const wasLiked = item.isLiked;
  const prevLikes = item.likes;
  item.isLiked = !wasLiked;
  item.likes = prevLikes + (item.isLiked ? 1 : -1);

  try {
    const res = await api.voteFess(id, item.isLiked ? 'up' : 'down');
    if (res && typeof res.upvotes === 'number') {
      item.likes = res.upvotes;
      item.isLiked = res.user_vote === 'up';
      item.userVote = res.user_vote ?? null;
    }
  } catch {
    item.isLiked = wasLiked;
    item.likes = prevLikes;
  }
}

function handleMyFessLike(payload) {
  return handlePostLikeInList(myFesses, payload);
}

const myFessCount = computed(() => myFessTotal.value);

useInfiniteScroll(myFessSentinel, {
  onLoad: loadMoreMyFesses,
  canLoad: () =>
    activeSubTab.value === 'fess' &&
    myFessHasMore.value &&
    !myFessLoading.value &&
    !myFessLoadingMore.value &&
    !myFessLoadMoreError.value,
  deps: () => [myFesses.value.length, myFessHasMore.value, activeSubTab.value],
});

/* ---------- Tab 2: Fess Tersimpan —— GET /users/me/bookmarks ---------- */
const SAVED_PAGE_SIZE = 20;

const savedFesses = ref([]);
const savedLoading = ref(false);
const savedLoadingMore = ref(false);
const savedLoadMoreError = ref(null);
const savedError = ref(null);
const savedTotal = ref(0);
const savedSentinel = ref(null);
let savedPage = 1;

const savedHasMore = computed(() => savedFesses.value.length < savedTotal.value);

function savedParams(page) {
  return { page, limit: SAVED_PAGE_SIZE };
}

async function loadSavedFesses() {
  savedError.value = null;
  savedLoadMoreError.value = null;
  if (!savedFesses.value.length) savedLoading.value = true;

  try {
    const res = await api.getMyBookmarks(savedParams(1));
    savedFesses.value = (res?.data ?? []).map(mapFessToPost).filter(Boolean);
    savedTotal.value = res?.total ?? savedFesses.value.length;
    savedPage = 1;
  } catch (e) {
    if (!savedFesses.value.length) savedError.value = e;
  } finally {
    savedLoading.value = false;
  }
}

async function loadMoreSavedFesses() {
  if (savedLoading.value || savedLoadingMore.value || !savedHasMore.value) return;
  savedLoadingMore.value = true;
  savedLoadMoreError.value = null;

  try {
    const nextPage = savedPage + 1;
    const res = await api.getMyBookmarks(savedParams(nextPage));
    const seen = new Set(savedFesses.value.map((item) => String(item.id)));
    const extra = (res?.data ?? [])
      .map(mapFessToPost)
      .filter((item) => item && !seen.has(String(item.id)));
    savedFesses.value = [...savedFesses.value, ...extra];
    savedTotal.value = res?.total ?? savedTotal.value;
    savedPage = nextPage;
  } catch (e) {
    savedLoadMoreError.value = e;
  } finally {
    savedLoadingMore.value = false;
  }
}

function handleSavedLike(payload) {
  return handlePostLikeInList(savedFesses, payload);
}

function handleSavedBookmark(payload) {
  if (payload?.isSaved !== false) return;
  const index = savedFesses.value.findIndex((item) => String(item.id) === String(payload.id));
  if (index === -1) return;
  savedFesses.value.splice(index, 1);
  savedTotal.value = Math.max(0, savedTotal.value - 1);

  // Offset halaman berikutnya bergeser setelah satu item dihapus; muat ulang
  // halaman pertama agar tidak ada fess yang terlewat.
  if (savedHasMore.value) loadSavedFesses();
}

watch(activeSubTab, (tab) => {
  if (tab === 'saved') loadSavedFesses();
});

useInfiniteScroll(savedSentinel, {
  onLoad: loadMoreSavedFesses,
  canLoad: () =>
    activeSubTab.value === 'saved' &&
    savedHasMore.value &&
    !savedLoading.value &&
    !savedLoadingMore.value &&
    !savedLoadMoreError.value,
  deps: () => [savedFesses.value.length, savedHasMore.value, activeSubTab.value],
});

/* ---------- Tab 3: Base yang Diikuti —— GET /users/me/following (search + sort + lazy load) ---------- */
const FOLLOWING_PAGE_SIZE = 20;
const FOLLOWING_SEARCH_DEBOUNCE_MS = 300;

const baseSearchQuery = ref('');
const followingSort = ref('newest');
const followingBases = ref([]);
const followingLoading = ref(false);
const followingLoadingMore = ref(false);
const followingLoadMoreError = ref(null);
const followingError = ref(null);
const followingQueryTotal = ref(0);
const followingLoaded = ref(false);
const followingSentinel = ref(null);
let followingPage = 1;
let followingSearchTimer = null;

const followingHasMore = computed(
  () => followingBases.value.length < followingQueryTotal.value,
);

function followingParams(page) {
  return {
    page,
    limit: FOLLOWING_PAGE_SIZE,
    sort: followingSort.value,
    ...(baseSearchQuery.value.trim() ? { search: baseSearchQuery.value.trim() } : {}),
  };
}

async function loadFollowing() {
  followingError.value = null;
  followingLoadMoreError.value = null;

  // SWR: Tampilkan data tersimpan langsung jika tidak sedang melakukan search teks
  if (cachedFollowingData && !baseSearchQuery.value.trim()) {
    followingBases.value = cachedFollowingData;
    followingQueryTotal.value = cachedFollowingTotal;
    followingLoaded.value = true;
    followingLoading.value = false;
  } else {
    followingLoading.value = true;
  }

  try {
    const res = await api.getMyFollowing(followingParams(1));
    const list = (res?.data ?? []).map(mapBase).filter(Boolean);
    followingBases.value = list;
    followingQueryTotal.value = res?.total ?? followingBases.value.length;
    if (!baseSearchQuery.value.trim()) {
      cachedFollowingData = list;
      cachedFollowingTotal = followingQueryTotal.value;
    }
    followingPage = 1;
    followingLoaded.value = true;
  } catch (e) {
    if (!cachedFollowingData) followingError.value = e;
  } finally {
    followingLoading.value = false;
  }
}

/** Lazy load halaman berikutnya dari daftar base diikuti. */
async function loadMoreFollowing() {
  if (followingLoading.value || followingLoadingMore.value || !followingHasMore.value) return;
  followingLoadingMore.value = true;
  followingLoadMoreError.value = null;
  try {
    const nextPage = followingPage + 1;
    const res = await api.getMyFollowing(followingParams(nextPage));
    const seen = new Set(followingBases.value.map((b) => b.handle));
    const extra = (res?.data ?? [])
      .map(mapBase)
      .filter((b) => b && !seen.has(b.handle));
    followingBases.value = [...followingBases.value, ...extra];
    followingQueryTotal.value = res?.total ?? followingQueryTotal.value;
    followingPage = nextPage;
  } catch (e) {
    followingLoadMoreError.value = e;
  } finally {
    followingLoadingMore.value = false;
  }
}

// Pencarian server-side dengan debounce; sort langsung memuat ulang.
watch(baseSearchQuery, () => {
  clearTimeout(followingSearchTimer);
  followingSearchTimer = setTimeout(() => {
    loadFollowing();
  }, FOLLOWING_SEARCH_DEBOUNCE_MS);
});

watch(followingSort, () => {
  loadFollowing();
});

/** Strip statistik "Mengikuti": total server, fallback cache lokal. */
const followedBasesCount = computed(() =>
  followingLoaded.value ? followingQueryTotal.value : followedHandles.value.length,
);

async function handleUnfollow(handle) {
  try {
    const stillFollowing = await toggleFollowBase(handle);
    if (!stillFollowing) {
      const target = String(handle).startsWith('@') ? String(handle) : `@${handle}`;
      const before = followingBases.value.length;
      followingBases.value = followingBases.value.filter((b) => b.handle !== target);
      if (followingBases.value.length < before) {
        followingQueryTotal.value = Math.max(0, followingQueryTotal.value - 1);
      }
    }
  } catch {
    // the composable already rolled back the optimistic update
  }
}

useInfiniteScroll(followingSentinel, {
  onLoad: loadMoreFollowing,
  canLoad: () =>
    activeSubTab.value === 'following' &&
    followingLoaded.value &&
    followingHasMore.value &&
    !followingLoading.value &&
    !followingLoadingMore.value &&
    !followingLoadMoreError.value,
  deps: () => [followingBases.value.length, followingHasMore.value, activeSubTab.value],
});

onBeforeUnmount(() => {
  clearTimeout(followingSearchTimer);
});

/* ---------- Tab 4: Saldo (read-only, from the session user) ---------- */
const balance = computed(() => authStore.user?.balance ?? 0);
const balanceDisplay = computed(() => formatNumber(balance.value));
const hasBalance = computed(() => balance.value > 0);

/* ---------- initial load ---------- */
onMounted(() => {
  loadMyFesses();
  loadFollowing();
});

/** Refresh senyap halaman 1 (tanpa skeleton) untuk kedua daftar profil. */
async function refreshMyFesses() {
  try {
    const res = await api.getMyFesses(myFessParams(1));
    myFesses.value = (res?.data ?? []).map(mapFessToPost);
    myFessQueryTotal.value = res?.total ?? myFesses.value.length;
    if (myFessFilter.value === 'semua') myFessTotal.value = myFessQueryTotal.value;
    myFessPage = 1;
  } catch {
    // Diamkan — data lama tetap ditampilkan.
  }
}

async function refreshFollowingBases() {
  try {
    const res = await api.getMyFollowing(followingParams(1));
    followingBases.value = (res?.data ?? []).map(mapBase).filter(Boolean);
    followingQueryTotal.value = res?.total ?? followingBases.value.length;
    followingPage = 1;
    followingLoaded.value = true;
  } catch {
    // Diamkan — data lama tetap ditampilkan.
  }
}

/** Sync ala native app: daftar profil disegarkan saat tab kembali aktif. */
useVisibilityRefresh(() => {
  refreshMyFesses();
  refreshFollowingBases();
  if (activeSubTab.value === 'saved') loadSavedFesses();
});

/**
 * Dengan KeepAlive, tab profil tidak di-unmount saat pindah tab — segarkan
 * senyap saat tab dipilih lagi supaya datanya tetap baru tanpa skeleton.
 */
onActivated(() => {
  if (myFesses.value.length) refreshMyFesses();
  if (followingBases.value.length) refreshFollowingBases();
  if (activeSubTab.value === 'saved') loadSavedFesses();
});

/* ---------- Settings Panel Navigation ---------- */
function openSettingsSubPanel(panelKey) {
  showSettingsDrawer.value = false;
  emit('openSubPanel', panelKey);
}

function confirmLogout() {
  showSettingsDrawer.value = false;
  emit('logout');
}
</script>

<style scoped>
.user-profile-ig-stage {
  width: 100%;
  font-family: var(--font-sans);
  color: var(--shell-text);
  padding-bottom: 24px;
}

/* ---------- TOP BAR (IG Style) ---------- */
.ig-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px 16px;
  border-bottom: 1px solid var(--shell-border);
}

.ig-top-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ig-handle-title {
  font-size: 19px;
  font-weight: 900;
  color: var(--shell-text);
  letter-spacing: -0.3px;
}

.ig-badge-anon {
  font-size: 10px;
  font-weight: 900;
  background: var(--shell-chip);
  color: var(--shell-text-muted);
  padding: 2px 7px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--shell-border);
}

.btn-hamburger {
  background: transparent;
  border: none;
  color: var(--shell-text);
  padding: 6px;
  cursor: pointer;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, transform 0.15s ease;
}

.btn-hamburger:hover {
  background: var(--shell-chip);
  transform: scale(1.05);
}

/* ---------- PROFILE HEADER ---------- */
.ig-profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 8px 18px;
}

.ig-avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 14px;
}

.ig-avatar-ring {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, var(--lime-primary) 0%, var(--shell-accent) 50%, var(--shell-sub-accent) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px var(--shadow-color);
}

.ig-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--shell-stage);
  background: var(--shell-card);
}

.ig-avatar-fallback {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--shell-card);
  color: var(--shell-text-muted);
  border: 3px solid var(--shell-stage);
}

.ig-avatar-edit-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  border: 2px solid var(--shell-stage);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  transition: transform 0.15s ease;
}

.ig-avatar-edit-badge:hover {
  transform: scale(1.1);
}

.ig-user-info {
  margin-bottom: 14px;
}

.ig-display-name {
  font-size: 20px;
  font-weight: 900;
  color: var(--shell-text);
  margin: 0;
  letter-spacing: -0.2px;
}

.ig-username-sub {
  font-size: 13px;
  font-weight: 700;
  color: var(--shell-text-muted);
  margin-top: 2px;
}

.ig-bio-text {
  font-size: 13.5px;
  color: var(--shell-text);
  margin: 8px auto 0;
  max-width: 440px;
  line-height: 1.5;
}

.ig-actions-row {
  width: 100%;
  max-width: 380px;
  margin-bottom: 20px;
}

.btn-edit-profile {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 18px;
  background: var(--shell-chip);
  border: 1px solid var(--shell-border-strong);
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 800;
  color: var(--shell-text);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.btn-edit-profile:hover {
  background: var(--shell-card);
  border-color: var(--shell-active);
}

.ig-stats-strip {
  width: 100%;
  max-width: 420px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 12px 16px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
}

.ig-stat-col {
  background: transparent;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  font-family: inherit;
  color: inherit;
  transition: transform 0.15s ease;
}

.ig-stat-col:hover {
  transform: translateY(-2px);
}

.ig-stat-num {
  font-size: 17px;
  font-weight: 900;
  color: var(--shell-text);
}

.ig-stat-num--accent {
  color: var(--shell-active);
}

.ig-stat-lbl {
  font-size: 11px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.ig-stat-divider {
  width: 1px;
  height: 28px;
  background: var(--shell-border);
}

/* ---------- 4 SUB-TABS (IG Style) ---------- */
.ig-nav-tabs {
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid var(--shell-border);
  border-bottom: 1px solid var(--shell-border);
  margin-top: 8px;
}

.ig-tab-btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 10px;
  background: transparent;
  border: none;
  border-bottom: 2.5px solid transparent;
  color: var(--shell-text-muted);
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ig-tab-btn:hover {
  color: var(--shell-text);
}

.ig-tab-btn.active {
  color: var(--shell-active);
  border-bottom-color: var(--shell-active);
}

@media (max-width: 560px) {
  .ig-tab-btn {
    flex-direction: column;
    gap: 4px;
    font-size: 11px;
    padding: 10px 4px;
  }
}

/* ---------- TAB CONTENT AREA ---------- */
.ig-tab-content-area {
  padding-top: 18px;
}

.tab-pane-fade {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.tab-pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.tab-pane-title {
  font-size: 15px;
  font-weight: 900;
  color: var(--shell-text);
}

.btn-create-small {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  font-family: inherit;
  font-size: 12px;
  font-weight: 900;
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.btn-create-small:hover {
  transform: translateY(-1px);
}

/* Tab 1: Fess Cards */
.my-fess-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Filter status + urutan pada sub-tab (server-side) */
.tab-filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.tab-filter-row .segmented-tabs-container {
  display: flex;
  flex-wrap: wrap;
  background: var(--shell-card);
  padding: 3px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--shell-border);
  gap: 2px;
}

.tab-filter-row .segmented-btn {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  font-family: inherit;
  padding: 6px 14px;
  font-weight: 700;
  font-size: 12.5px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.tab-filter-row .segmented-btn.active {
  background: var(--shell-chip);
  color: var(--shell-text);
}

.filter-select {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  color: var(--shell-text);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  padding: 7px 12px;
  border-radius: 999px;
  cursor: pointer;
  outline: none;
}

.filter-select:focus {
  border-color: var(--shell-border-strong);
}

/* Lazy-load footer */
.feed-load-sentinel {
  height: 1px;
  width: 100%;
}

.feed-load-hint {
  text-align: center;
  font-size: 12.5px;
  color: var(--shell-text-muted);
  padding: 10px 0 4px;
  margin: 0;
}

.feed-load-retry {
  display: block;
  margin: 8px auto 0;
  background: transparent;
  border: 1px solid var(--shell-border);
  color: var(--shell-text-muted);
  border-radius: 999px;
  padding: 7px 16px;
  font-family: inherit;
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
}

.feed-load-retry:hover {
  color: var(--shell-text);
  border-color: var(--shell-border-strong);
}

.my-fess-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 16px;
  transition: border-color 0.15s ease;
}

.my-fess-card:hover {
  border-color: var(--shell-border-strong);
}

.my-fess-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.my-fess-base {
  font-weight: 900;
  font-size: 13px;
  color: var(--brand-blue);
}

.my-fess-status {
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
}

.status--approved {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status--pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.my-fess-text {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--shell-text);
  margin: 0 0 12px;
}

.my-fess-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  color: var(--shell-text-muted);
}

.my-fess-metrics {
  display: flex;
  gap: 12px;
  font-weight: 700;
}

/* Tab 3: Following List */
.following-search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.following-search-box .search-icon {
  position: absolute;
  left: 14px;
  color: var(--shell-text-muted);
}

.following-search-input {
  width: 100%;
  padding: 10px 14px 10px 40px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 13px;
  color: var(--shell-text);
  outline: none;
}

.following-search-input:focus {
  border-color: var(--shell-active);
}

.following-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.following-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 12px 14px;
}

.following-info-col {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  cursor: pointer;
  border-radius: 8px;
  padding: 4px;
  margin: -4px;
  transition: opacity 0.15s ease;
}

.following-info-col:hover {
  opacity: 0.88;
}

.following-info-col:hover .following-name {
  color: var(--shell-sub-accent, #60a5fa);
}

.following-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  color: #fff;
  font-weight: 900;
  font-size: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.following-details {
  flex: 1;
  min-width: 0;
}

.following-name {
  font-weight: 800;
  font-size: 14px;
  color: var(--shell-text);
}

.following-handle {
  font-size: 12px;
  color: var(--shell-text-muted);
}

.btn-unfollow {
  padding: 6px 14px;
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  color: var(--shell-text);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-unfollow:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #ef4444;
}

/* Tab 4: Saldo & Top Up */
.balance-ctf-card {
  background: linear-gradient(135deg, var(--brand-blue) 0%, var(--shell-sub-accent) 100%);
  color: #fff;
  border-radius: 20px;
  padding: 22px;
  box-shadow: 0 10px 30px var(--neon-blue-glow);
}

.balance-ctf-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.balance-ctf-label {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.8px;
  opacity: 0.85;
}

.balance-ctf-val {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 36px;
  font-weight: 900;
  line-height: 1.1;
  margin-top: 4px;
}

.balance-ctf-icon {
  color: var(--lime-primary);
}

.balance-ctf-unit {
  font-size: 16px;
  font-weight: 800;
  opacity: 0.9;
}

.ctf-status-pill {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 800;
}

.balance-ctf-note {
  font-size: 12px;
  opacity: 0.9;
  margin: 0;
}

.section-heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-heading-title {
  font-size: 15px;
  font-weight: 900;
  color: var(--shell-text);
}

.section-heading-hint {
  font-size: 11px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.ctf-packages-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.ctf-pkg-card {
  position: relative;
  background: var(--shell-card);
  border: 1.5px solid var(--shell-border);
  border-radius: 16px;
  padding: 16px 14px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ctf-pkg-card:hover {
  border-color: var(--shell-active);
  transform: translateY(-2px);
}

.ctf-pkg-card.active {
  border-color: var(--shell-active);
  background: var(--shell-chip);
  box-shadow: 0 4px 14px var(--shadow-color);
}

.pkg-popular-tag {
  position: absolute;
  top: -8px;
  right: 10px;
  background: var(--lime-primary);
  color: var(--lime-ink);
  font-size: 9px;
  font-weight: 900;
  padding: 2px 7px;
  border-radius: var(--radius-pill);
}

.pkg-ctf-amount {
  font-size: 20px;
  font-weight: 900;
  color: var(--shell-text);
}

.pkg-price {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--brand-blue);
  margin-top: 3px;
}

.pkg-bonus {
  font-size: 10.5px;
  font-weight: 800;
  color: #10b981;
  margin-top: 4px;
}

.checkout-box {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
  padding: 18px;
}

.checkout-summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--shell-text);
  border-bottom: 1px solid var(--shell-border);
  padding-bottom: 10px;
}

.payment-label {
  font-size: 12px;
  font-weight: 800;
  color: var(--shell-text-muted);
}

.payment-pills {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.pm-btn {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--shell-border);
  background: var(--shell-chip);
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  color: var(--shell-text);
  cursor: pointer;
  transition: all 0.15s ease;
}

.pm-btn.active {
  border-color: var(--shell-active);
  background: var(--shell-card);
  color: var(--shell-active);
  font-weight: 900;
}

.btn-bayar-ctf {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  border: none;
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 4px 16px var(--shadow-color);
  transition: transform 0.15s ease;
}

.btn-bayar-ctf:hover {
  transform: translateY(-2px);
}

.btn-bayar-ctf:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.alert-success {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid #10b981;
  color: #10b981;
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 800;
}

/* Empty states */
.empty-tab-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
}

.empty-tab-icon {
  color: var(--shell-text-dim);
  margin-bottom: 12px;
}

.empty-tab-title {
  font-size: 16px;
  font-weight: 900;
  color: var(--shell-text);
  margin: 0;
}

.empty-tab-sub {
  font-size: 12.5px;
  color: var(--shell-text-muted);
  max-width: 320px;
  margin: 6px auto 0;
}

.btn-primary-pill {
  padding: 8px 20px;
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  border: none;
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
}

/* ---------- SETTINGS DRAWER / SLIDE-IN (IG Style) ---------- */
.settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: flex-end;
  animation: fadeInOverlay 0.2s ease;
}

@keyframes fadeInOverlay {
  from { opacity: 0; }
  to { opacity: 1; }
}

.settings-drawer-panel {
  width: 100%;
  max-width: 360px;
  height: 100%;
  background: var(--shell-header-bg);
  backdrop-filter: blur(20px);
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--shell-border);
}

.drawer-title {
  font-size: 18px;
  font-weight: 900;
  color: var(--shell-text);
}

.btn-drawer-close {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.btn-drawer-close:hover {
  color: var(--shell-text);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.settings-group {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
  overflow: hidden;
}

.settings-row-static {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
}

.theme-segmented-pills {
  display: flex;
  background: var(--shell-chip);
  padding: 3px;
  border-radius: 10px;
}

.tsp-btn {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tsp-btn.active {
  background: var(--shell-sub-accent);
  color: var(--text-on-accent);
}

.settings-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--shell-border);
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
}

.settings-menu-item:last-child {
  border-bottom: none;
}

.settings-menu-item:hover {
  background: var(--shell-chip);
}

.row-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.row-icon {
  color: var(--shell-text-muted);
  flex-shrink: 0;
}

.row-label {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--shell-text);
}

.row-desc {
  font-size: 11px;
  color: var(--shell-text-muted);
  margin-top: 1px;
}

.chevron-icon {
  color: var(--shell-text-dim);
}

.row-right-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-row-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  box-shadow: 0 2px 6px rgba(220, 38, 38, 0.35);
}

.item--danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.icon--danger,
.label--danger {
  color: #ef4444 !important;
}

/* ---------- EDIT PROFILE MODAL ---------- */
.edit-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeInOverlay 0.2s ease;
}

.edit-modal-card {
  width: 100%;
  max-width: 380px;
  background: var(--shell-header-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--shell-border-strong);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}

.edit-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-bottom: 1px solid var(--shell-border);
}

.edit-modal-title {
  margin: 0;
  font-size: 15px;
  font-weight: 900;
  color: var(--shell-text);
}

.btn-close-modal {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  cursor: pointer;
  padding: 4px;
}

.edit-modal-body {
  padding: 14px 18px;
}

.edit-avatar-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.edit-avatar-preview-box {
  position: relative;
  flex-shrink: 0;
}

.edit-avatar-preview {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--shell-active);
  flex-shrink: 0;
}

.avatar-controls-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.edit-avatar-label {
  font-size: 11px;
  font-weight: 800;
  color: var(--shell-text-muted);
}

.btn-upload-avatar-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 800;
  color: #0055ff;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-upload-avatar-chip:hover {
  background: rgba(0, 85, 255, 0.1);
  border-color: #0055ff;
}

[data-theme='dark'] .btn-upload-avatar-chip {
  color: #60a5fa;
}

.avatar-presets {
  display: flex;
  gap: 6px;
}

.btn-preset-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  padding: 0;
  border: 2px solid transparent;
  overflow: hidden;
  cursor: pointer;
  background: none;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.btn-preset-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-preset-avatar.selected {
  border-color: var(--shell-active);
  transform: scale(1.1);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.handle-lock-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.12);
  color: var(--warning-text, #b45309);
  font-size: 10px;
  font-weight: 800;
}

.form-hint {
  font-size: 10.5px;
  line-height: 1.45;
  color: var(--shell-text-muted);
}

.handle-cooldown-note {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-top: 4px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-text, #b45309);
  font-size: 10.5px;
  line-height: 1.5;
}

.handle-cooldown-note svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.handle-cooldown-note strong {
  font-weight: 900;
}

.form-label {
  font-size: 11.5px;
  font-weight: 800;
  color: var(--shell-text-muted);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--shell-border);
  background: var(--shell-card);
  font-family: inherit;
  font-size: 13px;
  color: var(--shell-text);
  outline: none;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--shell-active);
}

.form-input:disabled {
  opacity: 0.72;
  cursor: not-allowed;
  background: var(--shell-chip);
}

.edit-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}

.btn-cancel {
  padding: 7px 15px;
  border-radius: var(--radius-pill);
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  color: var(--shell-text);
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.btn-save {
  padding: 7px 18px;
  border-radius: var(--radius-pill);
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
  border: none;
  font-family: inherit;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

@media (max-width: 600px) {
  .edit-modal-card {
    max-width: 340px;
    width: 92%;
    border-radius: 18px;
  }

  .edit-modal-body {
    padding: 12px 14px;
  }

  .form-input,
  .form-textarea {
    padding: 7px 10px;
    font-size: 12.5px;
  }
}
</style>
