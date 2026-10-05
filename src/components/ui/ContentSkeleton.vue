<template>
  <!--
    Composite skeletons. Each one mirrors the real layout it replaces so the
    page does not jump when data arrives (no layout shift / CLS).
  -->
  <div class="skeleton-stack" :aria-label="label" aria-busy="true" role="status">
    <span class="visually-hidden">{{ label }}</span>

    <!-- FEED CARD ------------------------------------------------------ -->
    <template v-if="type === 'feed-card'">
      <div v-for="n in count" :key="n" class="sk-card">
        <div class="sk-row">
          <AppSkeleton variant="circle" :width="36" :height="36" />
          <div class="sk-grow">
            <AppSkeleton width="40%" :lineHeight="11" />
            <AppSkeleton width="24%" :lineHeight="9" />
          </div>
          <AppSkeleton variant="pill" :width="56" :height="20" />
        </div>
        <div class="sk-body">
          <AppSkeleton width="100%" :lineHeight="12" />
          <AppSkeleton width="92%" :lineHeight="12" />
          <AppSkeleton width="58%" :lineHeight="12" />
        </div>
        <div class="sk-actions">
          <AppSkeleton variant="circle" :width="28" :height="28" />
          <AppSkeleton variant="circle" :width="28" :height="28" />
          <AppSkeleton variant="circle" :width="28" :height="28" />
          <AppSkeleton variant="circle" :width="28" :height="28" />
        </div>
      </div>
    </template>

    <!-- LIST ROWS ------------------------------------------------------ -->
    <template v-else-if="type === 'list'">
      <div v-for="n in count" :key="n" class="sk-list-row">
        <AppSkeleton variant="rect" :width="36" :height="36" />
        <div class="sk-grow">
          <AppSkeleton width="55%" :lineHeight="12" />
          <AppSkeleton width="35%" :lineHeight="10" />
        </div>
        <AppSkeleton variant="pill" :width="16" :height="16" />
      </div>
    </template>

    <!-- STAT GRID ------------------------------------------------------ -->
    <template v-else-if="type === 'stats'">
      <div class="sk-stats">
        <div v-for="n in count" :key="n" class="sk-stat">
          <AppSkeleton width="60%" :lineHeight="10" />
          <AppSkeleton width="45%" :lineHeight="24" />
        </div>
      </div>
    </template>

    <!-- PROFILE HERO --------------------------------------------------- -->
    <template v-else-if="type === 'profile'">
      <AppSkeleton variant="rect" width="100%" :height="220" />
      <div class="sk-profile-head">
        <AppSkeleton variant="circle" :width="112" :height="112" />
        <div class="sk-grow sk-profile-meta">
          <AppSkeleton width="180" :lineHeight="24" />
          <AppSkeleton width="140" :lineHeight="13" />
          <AppSkeleton width="70%" :lineHeight="13" />
          <div class="sk-actions">
            <AppSkeleton variant="pill" :width="130" :height="36" />
            <AppSkeleton variant="pill" :width="150" :height="36" />
            <AppSkeleton variant="pill" :width="150" :height="36" />
          </div>
        </div>
      </div>
      <div class="sk-cols">
        <div v-for="c in 3" :key="c" class="sk-col">
          <AppSkeleton variant="rect" width="100%" :height="180" />
          <AppSkeleton variant="rect" width="100%" :height="120" />
        </div>
      </div>
    </template>

    <!-- GENERIC PAGE --------------------------------------------------- -->
    <template v-else>
      <AppSkeleton width="40%" :lineHeight="28" />
      <AppSkeleton width="65%" :lineHeight="13" />
      <div class="sk-cols">
        <div v-for="c in 2" :key="c" class="sk-col">
          <AppSkeleton variant="rect" width="100%" :height="200" />
        </div>
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
    validator: (v) => ['page', 'feed-card', 'list', 'stats', 'profile'].includes(v),
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

.sk-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sk-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sk-grow {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.sk-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sk-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--border-subtle);
}

.sk-list-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 12px 14px;
}

.sk-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.sk-stat {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sk-profile-head {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 0 4px;
}

.sk-profile-meta {
  gap: 10px;
  padding-top: 8px;
}

.sk-cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.sk-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 720px) {
  .sk-profile-head {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .sk-profile-meta {
    align-items: center;
  }
  .sk-profile-head .sk-actions {
    justify-content: center;
  }
}
</style>
