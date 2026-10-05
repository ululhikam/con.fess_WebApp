<template>
  <header class="profile-cover-section">
    <!-- High-res Cover Art -->
    <div class="cover-art-container">
      <img :src="COVER_IMAGE.src" :alt="COVER_IMAGE.alt" class="cover-bg-image" />
      <div class="cover-gradient-overlay" aria-hidden="true"></div>
      <div class="cover-hud-badge">
        <span class="hud-pill font-bold">VERIFIED BASE CREATOR</span>
      </div>
    </div>

    <!-- Centered Avatar & Profile Summary -->
    <div class="profile-header-card container">
      <div class="avatar-center-wrapper">
        <img :src="user.avatar" :alt="`${user.username} avatar`" class="main-avatar-img" />
        <span
          class="status-online-dot"
          title="Online now"
          role="img"
          aria-label="Online now"
        ></span>
      </div>

      <div class="user-identity-block">
        <h1 class="user-display-name">
          {{ user.username }}
          <span
            class="verified-check"
            title="Verified Creator"
            role="img"
            aria-label="Verified Creator"
          >
            <BadgeCheck :size="14" aria-hidden="true" />
          </span>
        </h1>
        <p class="user-handle-location">
          <span class="text-blue font-bold">{{ user.handle }}</span> • {{ locationText }}
        </p>
        <p class="user-bio-text">{{ user.bio }}</p>

        <!-- Quick Actions Bar -->
        <div class="header-action-buttons flex justify-center gap-2 sm:gap-3 mt-4 flex-wrap">
          <ProfileButton variant="lime">Follow Creator</ProfileButton>
          <ProfileButton variant="blue">Kirim Direct Fess</ProfileButton>
          <ProfileButton variant="gray">Pengaturan Akun</ProfileButton>
        </div>
      </div>

      <!-- Profile Tab Navigation Bar (Horizontal Swipeable on Mobile) -->
      <div
        class="profile-nav-tabs flex items-center justify-start sm:justify-center gap-2 mt-6 overflow-x-auto no-scrollbar py-1"
        role="tablist"
        aria-label="Bagian profil"
      >
        <button
          v-for="tab in tabs"
          :key="tab"
          type="button"
          role="tab"
          :aria-selected="modelValue === tab"
          :class="['tab-pill-btn', modelValue === tab ? 'active-tab' : '']"
          @click="$emit('update:modelValue', tab)"
        >
          {{ tab }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
/**
 * ProfileHero — cover art, avatar stage, identity block, action buttons and
 * the profile tab bar. Pure presentation: the active tab arrives as `modelValue`.
 */
import { BadgeCheck } from 'lucide-vue-next';
import ProfileButton from './ProfileButton.vue';
import { COVER_IMAGE } from '../../data/profileData';

defineProps({
  user: { type: Object, required: true },
  tabs: { type: Array, default: () => [] },
  locationText: { type: String, default: '' },
  modelValue: { type: String, default: '' },
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
/* COVER SECTION */
.profile-cover-section {
  background: var(--bg-surface);
  box-shadow: 0 4px 20px var(--shadow-color);
  margin-bottom: 24px;
}

.cover-art-container {
  height: 280px;
  position: relative;
  overflow: hidden;
}

.cover-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 56, 255, 0.4) 100%);
}

.cover-hud-badge {
  position: absolute;
  top: 16px;
  right: 24px;
}

.hud-pill {
  background: var(--lime-primary);
  color: var(--lime-ink);
  font-size: 11px;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* HEADER CARD & CENTER AVATAR */
.profile-header-card {
  position: relative;
  text-align: center;
  padding-bottom: 20px;
}

.avatar-center-wrapper {
  position: relative;
  display: inline-block;
  margin-top: -70px;
}

.main-avatar-img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid var(--bg-surface);
  box-shadow: 0 10px 30px var(--shadow-color);
}

.status-online-dot {
  width: 20px;
  height: 20px;
  background: var(--success);
  border: 4px solid var(--bg-surface);
  border-radius: 50%;
  position: absolute;
  bottom: 8px;
  right: 12px;
}

.user-display-name {
  font-size: 28px;
  font-weight: 900;
  color: var(--text-main);
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.verified-check {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  font-size: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.user-handle-location {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.user-bio-text {
  font-size: 14px;
  color: var(--text-secondary);
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.5;
}

/* TAB NAVIGATION */
.tab-pill-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-weight: 700;
  font-size: 13px;
  padding: 8px 20px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-pill-btn.active-tab,
.tab-pill-btn:hover {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
}

@media (max-width: 768px) {
  .cover-art-container {
    height: 160px;
  }

  .main-avatar-img {
    width: 80px;
    height: 80px;
  }

  .avatar-center-wrapper {
    margin-top: -40px;
  }

  .user-display-name {
    font-size: 20px;
  }

  .tab-pill-btn {
    padding: 6px 14px;
    font-size: 12px;
    flex-shrink: 0;
  }

  .header-action-buttons {
    flex-direction: column;
    width: 100%;
  }
}
</style>
