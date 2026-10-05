<template>
  <AdminCard :title="summary.title">
    <div class="community-grid">
      <div class="community-cell p-4 rounded-xl border">
        <span class="community-caption text-xs font-bold text-muted block mb-2">
          {{ summary.moderator.caption }}
        </span>
        <div class="flex items-center gap-3">
          <div class="member-avatar flex items-center justify-center font-bold" aria-hidden="true">
            {{ summary.moderator.initial }}
          </div>
          <div>
            <div class="text-sm font-bold">{{ summary.moderator.name }}</div>
            <div class="text-xs text-muted">{{ summary.moderator.access }}</div>
          </div>
        </div>
      </div>

      <div class="community-cell p-4 rounded-xl border">
        <span class="community-caption text-xs font-bold text-muted block mb-2">
          {{ summary.blacklist.caption }}
        </span>
        <div class="text-sm font-bold">{{ summary.blacklist.value }}</div>
        <div class="text-xs text-muted">{{ summary.blacklist.hint }}</div>
      </div>
    </div>
  </AdminCard>
</template>

<script setup>
/**
 * CommunityCard — moderator + blacklist summary of the managed base.
 */
import AdminCard from './AdminCard.vue';

defineProps({
  summary: {
    type: Object,
    required: true,
    // { title, moderator: { caption, initial, name, access }, blacklist: {...} }
  },
});
</script>

<style scoped>
.community-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.community-cell {
  background: var(--bg-surface-2);
}

.member-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: var(--radius-pill);
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
}

@media (max-width: 640px) {
  .community-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
