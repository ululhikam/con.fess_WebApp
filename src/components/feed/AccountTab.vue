<template>
  <section class="view-stage" aria-labelledby="account-title">
    <h1 id="account-title" class="stage-title mb-6 text-center">Akun</h1>

    <!-- User info -->
    <div class="user-info-banner-card mb-6">
      <div class="banner-avatar-icon">
        <UserRound :size="22" />
      </div>
      <div class="banner-user-details">
        <div class="banner-email-text">{{ username }}</div>
        <div class="banner-sub-note">
          Identitas akunmu tidak ditampilkan di feed. Nama samaran berbeda di setiap thread.
        </div>
      </div>
      <button
        type="button"
        class="chevron-right"
        aria-label="Buka detail akun"
        @click="$emit('openProfile')"
      >
        <ChevronRight :size="16" />
      </button>
    </div>

    <!-- Account menu -->
    <div class="akun-menu-group mb-6">
      <button
        v-for="item in ACCOUNT_ITEMS"
        :key="item.label"
        type="button"
        class="akun-menu-row"
        @click="$emit('navigate', item.action)"
      >
        <span class="row-icon"><component :is="item.icon" :size="18" /></span>
        <span class="row-label">{{ item.label }}</span>
        <span v-if="item.sub" class="row-sub">{{ item.sub }}</span>
        <span class="chevron-right"><ChevronRight :size="16" /></span>
      </button>
    </div>

    <!-- Settings -->
    <h3 class="section-title-md mb-4">Pengaturan</h3>

    <div class="akun-menu-group">
      <!-- Theme -->
      <div class="akun-menu-row">
        <span class="row-icon"><Sun :size="18" /></span>
        <span class="row-label">Tampilan</span>

        <div class="segmented-theme-pills" role="radiogroup" aria-label="Mode tampilan">
          <button
            v-for="option in THEME_OPTIONS"
            :key="option.value"
            type="button"
            role="radio"
            :aria-checked="themeMode === option.value"
            :class="['stp-btn', { active: themeMode === option.value }]"
            @click="$emit('setTheme', option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <button
        v-for="item in SETTINGS_ITEMS"
        :key="item.label"
        type="button"
        class="akun-menu-row"
        @click="$emit('navigate', item.action)"
      >
        <span class="row-icon"><component :is="item.icon" :size="18" /></span>
        <span class="row-label">{{ item.label }}</span>
        <span v-if="item.sub" class="row-sub">{{ item.sub }}</span>
        <span class="chevron-right"><ChevronRight :size="16" /></span>
      </button>

      <button type="button" class="akun-menu-row logout-row" @click="$emit('logout')">
        <span class="row-icon row-icon--danger"><LogOut :size="18" /></span>
        <span class="row-label row-label--danger">Keluar</span>
        <span class="chevron-right chevron--danger"><ChevronRight :size="16" /></span>
      </button>
    </div>
  </section>
</template>

<script setup>
/**
 * AccountTab — account & settings screen.
 * Data is declared here (const config) instead of inline in the template so
 * the markup stays readable and the list is trivial to extend.
 *
 * Emits only intent; persistence lives in the parent/store.
 */
import {
  CreditCard,
  UserRound,
  KeyRound,
  PenLine,
  Star,
  Sun,
  Bell,
  HelpCircle,
  Flag,
  ScrollText,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-vue-next';

const ACCOUNT_ITEMS = [
  { icon: CreditCard, label: 'Saldo & Top Up', sub: '1 MFC - 0 MFC beli', action: 'topup' },
  { icon: UserRound, label: 'Profil & avatar', action: 'profile' },
  { icon: KeyRound, label: 'Keamanan akun', sub: 'Email & password', action: 'security' },
  { icon: PenLine, label: 'Fess saya', action: 'my-fess' },
  { icon: Star, label: 'Base yang diikuti', action: 'following' },
];

const SETTINGS_ITEMS = [
  { icon: Bell, label: 'Notifikasi', sub: 'Aktivitas di dalam aplikasi', action: 'notifications' },
  { icon: HelpCircle, label: 'Bantuan', sub: 'internal@myfess.id', action: 'help' },
  { icon: Flag, label: 'Laporkan pelanggaran', sub: 'Konten yang melanggar', action: 'report' },
  { icon: ScrollText, label: 'Ketentuan Layanan', action: 'terms' },
  { icon: Shield, label: 'Kebijakan Privasi', action: 'privacy' },
];

const THEME_OPTIONS = [
  { value: 'system', label: 'Sistem' },
  { value: 'light', label: 'Terang' },
  { value: 'dark', label: 'Gelap' },
];

defineProps({
  username: { type: String, default: '' },
  themeMode: { type: String, default: 'system' },
});

defineEmits(['navigate', 'logout', 'setTheme', 'openProfile']);
</script>

<style scoped>
.stage-title {
  font-size: 24px;
  font-weight: 900;
  color: var(--shell-text);
}

.section-title-md {
  font-size: 15px;
  font-weight: 900;
  color: var(--shell-text);
}

.user-info-banner-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 20px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.banner-avatar-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--shell-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--shell-text);
  flex-shrink: 0;
}

.banner-user-details {
  min-width: 0;
}
.banner-email-text {
  font-weight: 800;
  font-size: 15px;
  color: var(--shell-text);
}
.banner-sub-note {
  font-size: 11.5px;
  color: var(--shell-text-muted);
  margin-top: 2px;
  line-height: 1.5;
}

.chevron-right {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  padding: 0;
  color: var(--shell-text-muted);
  cursor: pointer;
}

.akun-menu-group {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 20px;
  overflow: hidden;
}

.akun-menu-row {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 15px 18px;
  border: none;
  border-bottom: 1px solid var(--shell-border);
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  color: var(--shell-text);
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.akun-menu-row:hover {
  background: var(--shell-chip);
}
.akun-menu-row:last-child {
  border-bottom: none;
}

.row-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  flex-shrink: 0;
  color: var(--shell-text-muted);
}

.row-label {
  font-weight: 700;
}
.row-sub {
  margin-left: auto;
  font-size: 12px;
  color: var(--shell-text-dim);
  text-align: right;
}

.segmented-theme-pills {
  margin-left: auto;
  display: flex;
  background: var(--shell-chip);
  padding: 3px;
  border-radius: 10px;
}

.stp-btn {
  background: transparent;
  border: none;
  color: var(--shell-text-muted);
  font-family: inherit;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 800;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.stp-btn.active {
  background: var(--shell-sub-accent);
  color: var(--text-on-accent);
}

.row-icon--danger,
.row-label--danger,
.chevron--danger {
  color: var(--danger-text) !important;
}
</style>
