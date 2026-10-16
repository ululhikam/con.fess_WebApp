<template>
  <!--
    ContentSkeleton — Dynamic layout-mirroring skeleton loader.
    Accurately mirrors real components (FessCard, BasePublicProfile, UserProfileTab, etc.)
    so that there is ZERO layout shift (CLS = 0) and the page appearance is 100% consistent.
  -->
  <div class="skeleton-stack" :class="`skeleton-type--${type}`" :aria-label="label" aria-busy="true" role="status">
    <span class="visually-hidden">{{ label }}</span>

    <!-- 1. FEED CARD (Exact 1:1 Mirror of FessCard.vue) ----------------- -->
    <template v-if="type === 'feed-card'">
      <div v-for="n in count" :key="n" class="sk-fess-card">
        <!-- Header -->
        <div class="sk-card-header">
          <div class="sk-author-group">
            <AppSkeleton variant="circle" :width="38" :height="38" />
            <div class="sk-meta-lines">
              <AppSkeleton width="110px" :lineHeight="13" />
              <AppSkeleton width="60px" :lineHeight="10" />
            </div>
          </div>
          <AppSkeleton variant="pill" width="68px" :height="22" />
        </div>

        <!-- Body text -->
        <div class="sk-card-body">
          <AppSkeleton width="100%" :lineHeight="13" />
          <AppSkeleton width="92%" :lineHeight="13" />
          <AppSkeleton width="65%" :lineHeight="13" />
        </div>

        <!-- Action bar -->
        <div class="sk-card-footer">
          <div class="sk-action-pill">
            <AppSkeleton variant="circle" :width="16" :height="16" />
            <AppSkeleton width="22px" :lineHeight="10" />
          </div>
          <div class="sk-action-pill">
            <AppSkeleton variant="circle" :width="16" :height="16" />
            <AppSkeleton width="22px" :lineHeight="10" />
          </div>
          <div class="sk-action-pill">
            <AppSkeleton variant="circle" :width="16" :height="16" />
            <AppSkeleton width="34px" :lineHeight="10" />
          </div>
          <div class="sk-actions-right">
            <AppSkeleton variant="circle" :width="28" :height="28" />
            <AppSkeleton variant="circle" :width="28" :height="28" />
          </div>
        </div>
      </div>
    </template>

    <!-- 2. BASE PUBLIC PROFILE (Exact Mirror of BasePublicProfilePage) -- -->
    <template v-else-if="type === 'profile' || type === 'base-profile'">
      <div class="sk-base-profile-hero">
        <!-- Cover Banner -->
        <div class="sk-cover-banner">
          <AppSkeleton variant="rect" width="100%" height="100%" />
        </div>

        <!-- Body content with overlapping avatar ring -->
        <div class="sk-base-hero-body">
          <div class="sk-avatar-stage">
            <div class="sk-avatar-ring">
              <AppSkeleton variant="circle" :width="74" :height="74" />
            </div>
            <AppSkeleton variant="pill" width="84px" :height="32" />
          </div>

          <!-- Title and official badge -->
          <div class="sk-identity-block">
            <div class="sk-name-row">
              <AppSkeleton width="190px" :lineHeight="22" />
              <AppSkeleton variant="pill" width="105px" :height="20" />
            </div>
            <AppSkeleton width="120px" :lineHeight="13" />
          </div>

          <!-- 3-Box Stats Grid -->
          <div class="sk-stats-grid">
            <div v-for="s in 3" :key="s" class="sk-stat-box">
              <AppSkeleton width="50%" :lineHeight="10" />
              <AppSkeleton width="70%" :lineHeight="18" />
            </div>
          </div>

          <!-- Bio -->
          <div class="sk-bio-lines">
            <AppSkeleton width="90%" :lineHeight="12" />
            <AppSkeleton width="60%" :lineHeight="12" />
          </div>

          <!-- Action buttons row -->
          <div class="sk-btn-row">
            <AppSkeleton variant="pill" width="130px" :height="38" />
            <AppSkeleton variant="pill" width="140px" :height="38" />
            <AppSkeleton variant="pill" width="100px" :height="38" />
          </div>

          <!-- Tabs -->
          <div class="sk-profile-tabs">
            <AppSkeleton variant="pill" width="110px" :height="34" />
            <AppSkeleton variant="pill" width="90px" :height="34" />
            <AppSkeleton variant="pill" width="80px" :height="34" />
          </div>
        </div>
      </div>

      <!-- Feed cards below the profile header -->
      <div class="sk-fess-card" v-for="n in 2" :key="`sub-card-${n}`">
        <div class="sk-card-header">
          <div class="sk-author-group">
            <AppSkeleton variant="circle" :width="38" :height="38" />
            <div class="sk-meta-lines">
              <AppSkeleton width="110px" :lineHeight="13" />
              <AppSkeleton width="60px" :lineHeight="10" />
            </div>
          </div>
          <AppSkeleton variant="pill" width="68px" :height="22" />
        </div>
        <div class="sk-card-body">
          <AppSkeleton width="100%" :lineHeight="13" />
          <AppSkeleton width="88%" :lineHeight="13" />
        </div>
        <div class="sk-card-footer">
          <div class="sk-action-pill">
            <AppSkeleton variant="circle" :width="16" :height="16" />
            <AppSkeleton width="22px" :lineHeight="10" />
          </div>
          <div class="sk-action-pill">
            <AppSkeleton variant="circle" :width="16" :height="16" />
            <AppSkeleton width="22px" :lineHeight="10" />
          </div>
        </div>
      </div>
    </template>

    <!-- 3. USER PROFILE (Exact Mirror of UserProfileTab.vue) ------------ -->
    <template v-else-if="type === 'user-profile'">
      <div class="sk-user-profile-hero">
        <div class="sk-user-center">
          <AppSkeleton variant="circle" :width="84" :height="84" />
          <AppSkeleton width="160px" :lineHeight="20" />
          <AppSkeleton width="110px" :lineHeight="12" />
          <AppSkeleton width="220px" :lineHeight="11" />
        </div>

        <div class="sk-user-stats-strip">
          <div v-for="s in 3" :key="s" class="sk-user-stat">
            <AppSkeleton width="40px" :lineHeight="16" />
            <AppSkeleton width="55px" :lineHeight="10" />
          </div>
        </div>

        <div class="sk-user-tabs">
          <AppSkeleton variant="pill" width="100px" :height="34" />
          <AppSkeleton variant="pill" width="100px" :height="34" />
          <AppSkeleton variant="pill" width="90px" :height="34" />
        </div>
      </div>

      <div class="sk-fess-card" v-for="n in 2" :key="`u-card-${n}`">
        <div class="sk-card-header">
          <div class="sk-author-group">
            <AppSkeleton variant="circle" :width="38" :height="38" />
            <div class="sk-meta-lines">
              <AppSkeleton width="110px" :lineHeight="13" />
              <AppSkeleton width="60px" :lineHeight="10" />
            </div>
          </div>
          <AppSkeleton variant="pill" width="68px" :height="22" />
        </div>
        <div class="sk-card-body">
          <AppSkeleton width="100%" :lineHeight="13" />
          <AppSkeleton width="90%" :lineHeight="13" />
        </div>
      </div>
    </template>

    <!-- 4. LIST / DIRECTORY (Explore, Activity, Following) -------------- -->
    <template v-else-if="type === 'list'">
      <div v-for="n in count" :key="n" class="sk-list-row">
        <AppSkeleton variant="rect" :width="42" :height="42" />
        <div class="sk-list-grow">
          <AppSkeleton width="55%" :lineHeight="13" />
          <AppSkeleton width="35%" :lineHeight="11" />
        </div>
        <AppSkeleton variant="pill" width="70px" :height="28" />
      </div>
    </template>

    <!-- 5. STATS (Admin / Metrics) -------------------------------------- -->
    <template v-else-if="type === 'stats'">
      <div class="sk-stats-grid-cards">
        <div v-for="n in count" :key="n" class="sk-stat-card">
          <div class="sk-stat-top">
            <AppSkeleton width="55%" :lineHeight="11" />
            <AppSkeleton variant="circle" :width="24" :height="24" />
          </div>
          <AppSkeleton width="45%" :lineHeight="26" />
        </div>
      </div>
    </template>

    <!-- 6. GENERIC PAGE FALLBACK ---------------------------------------- -->
    <template v-else>
      <AppSkeleton width="40%" :lineHeight="28" />
      <AppSkeleton width="65%" :lineHeight="13" />
      <div class="sk-page-blocks">
        <AppSkeleton variant="rect" width="100%" :height="180" />
        <AppSkeleton variant="rect" width="100%" :height="120" />
      </div>
    </template>
  </div>
</template>

<script setup>
import AppSkeleton from './AppSkeleton.vue';

defineProps({
  type: {
    type: String,
    default: 'page',
    validator: (v) =>
      ['page', 'feed-card', 'list', 'stats', 'profile', 'base-profile', 'user-profile'].includes(v),
  },
  count: { type: Number, default: 3 },
  label: { type: String, default: 'Memuat konten…' },
});
</script>

<style scoped>
.skeleton-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

/* 1. FEED CARD SKELETON (Pixel-perfect mirror of FessCard.vue) */
.sk-fess-card {
  background: var(--shell-card, #131722);
  border: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
  border-radius: 20px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.sk-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sk-author-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sk-meta-lines {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sk-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
}

.sk-card-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
}

.sk-action-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 999px;
}

.sk-actions-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 2. BASE PROFILE SKELETON (Exact mirror of BasePublicProfilePage.vue) */
.sk-base-profile-hero {
  background: var(--shell-card, #131722);
  border: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  margin-bottom: 20px;
}

.sk-cover-banner {
  height: 135px;
  width: 100%;
}

.sk-base-hero-body {
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sk-avatar-stage {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: -37px;
}

.sk-avatar-ring {
  padding: 4px;
  border-radius: 50%;
  background: var(--shell-card, #131722);
}

.sk-identity-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sk-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.sk-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 6px 0;
}

.sk-stat-box {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid var(--shell-border, rgba(255, 255, 255, 0.06));
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.sk-bio-lines {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sk-btn-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 4px 0;
}

.sk-profile-tabs {
  display: flex;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
}

/* 3. USER PROFILE SKELETON */
.sk-user-profile-hero {
  background: var(--shell-card, #131722);
  border: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
  border-radius: 20px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.sk-user-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.sk-user-stats-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  width: 100%;
  padding: 8px 0;
}

.sk-user-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.sk-user-tabs {
  display: flex;
  gap: 10px;
  justify-content: center;
  width: 100%;
}

/* 4. LIST SKELETON */
.sk-list-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--shell-card, #131722);
  border: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
  border-radius: 14px;
  padding: 12px 16px;
}

.sk-list-grow {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 5. STATS CARDS */
.sk-stats-grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.sk-stat-card {
  background: var(--shell-card, #131722);
  border: 1px solid var(--shell-border, rgba(255, 255, 255, 0.08));
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sk-stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sk-page-blocks {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}

@media (max-width: 600px) {
  .sk-stats-grid {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
  }
}
</style>
