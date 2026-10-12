<template>
  <section class="view-stage" aria-labelledby="activity-title">
    <div class="stage-header-row mb-4">
      <h1 id="activity-title" class="stage-title">Notifikasi</h1>

      <div class="segmented-tabs-container" role="tablist" aria-label="Jenis aktivitas">
        <button
          v-for="filter in (filters.length ? filters : DEFAULT_FILTERS)"
          :key="filter.key"
          type="button"
          role="tab"
          :aria-selected="modelValue === filter.key"
          :class="['segmented-btn', { active: modelValue === filter.key }]"
          @click="$emit('update:modelValue', filter.key)"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <ContentSkeleton v-if="loading" type="list" :count="3" label="Memuat aktivitas…" />

    <AppStateView
      v-else-if="error"
      variant="error"
      title="Aktivitas gagal dimuat"
      action-label="Coba lagi"
      @action="$emit('retry')"
    />

    <!-- Active User Notifications List -->
    <div v-else-if="filteredNotifications.length" class="notif-stream-list">
      <div
        v-for="notif in filteredNotifications"
        :key="notif.id"
        class="notif-card-item"
        :class="{ unread: notif.unread }"
      >
        <div class="notif-icon-col" :class="notif.type">
          <component :is="notif.icon" :size="18" />
        </div>
        <div class="notif-content-col">
          <div class="notif-title-row">
            <span class="notif-title">{{ notif.title }}</span>
            <span class="notif-time">{{ notif.time }}</span>
          </div>
          <p class="notif-desc">{{ notif.desc }}</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-aktivitas-center">
      <Inbox class="empty-icon" :size="34" :stroke-width="1.5" aria-hidden="true" />
      <p class="empty-main-text">Belum ada aktivitas.</p>
      <p class="empty-sub-text">Hanya aktivitas akunmu yang tampil di sini.</p>
    </div>
  </section>
</template>

<script setup>
/**
 * ActivityTab — notifications & activity feed for regular users.
 * Clean harmonized card layout, zero emojis.
 */
import { ref, computed } from 'vue';
import {
  Inbox,
  CheckCircle2,
  Heart,
  MessageCircle,
  Flag,
} from 'lucide-vue-next';
import ContentSkeleton from '../ui/ContentSkeleton.vue';
import AppStateView from '../ui/AppStateView.vue';

const props = defineProps({
  filters: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: [Error, Object, String], default: null },
  modelValue: { type: String, default: 'semua' },
});

defineEmits(['update:modelValue', 'retry']);

const DEFAULT_FILTERS = [
  { key: 'semua', label: 'Semua' },
  { key: 'fess', label: 'Fess Kamu' },
  { key: 'laporan', label: 'Laporan' },
];

const notifications = ref([
  {
    id: 'notif_u1',
    category: 'fess',
    icon: CheckCircle2,
    type: 'type-approved',
    title: 'Confession Disetujui & Terbit',
    desc: 'Confession anonim kamu di @codememfess telah disetujui admin dan terbit ke timeline.',
    time: '15m lalu',
    unread: true,
  },
  {
    id: 'notif_u2',
    category: 'fess',
    icon: Heart,
    type: 'type-like',
    title: 'Mendapat 50+ Suka Baru',
    desc: 'Confession kamu seputar tips junior programmer disukai oleh lebih dari 50 pengguna.',
    time: '1j lalu',
    unread: true,
  },
  {
    id: 'notif_u3',
    category: 'fess',
    icon: MessageCircle,
    type: 'type-comment',
    title: 'Balasan Baru di Fess Kamu',
    desc: '@anon_pembaca membalas fess kamu: "Setuju banget gan, saya juga pernah ngalamin hal yang sama..."',
    time: '3j lalu',
    unread: false,
  },
  {
    id: 'notif_u4',
    category: 'laporan',
    icon: Flag,
    type: 'type-report',
    title: 'Status Laporan Konten',
    desc: 'Laporan kamu terkait pelanggaran konten fess telah ditinjau dan ditindaklanjuti oleh tim moderasi.',
    time: 'Kemarin',
    unread: false,
  },
]);

const filteredNotifications = computed(() => {
  if (props.modelValue === 'semua') return notifications.value;
  return notifications.value.filter((n) => n.category === props.modelValue);
});
</script>

<style scoped>
.stage-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.stage-title {
  font-size: 22px;
  font-weight: 900;
  color: var(--shell-text);
  margin: 0;
}

.segmented-tabs-container {
  display: flex;
  background: var(--shell-card);
  padding: 3px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--shell-border);
  gap: 2px;
}

.segmented-btn {
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

.segmented-btn.active {
  background: var(--shell-chip);
  color: var(--shell-text);
}

/* Notification stream list */
.notif-stream-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notif-card-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 16px;
  transition: border-color 0.15s ease;
}

.notif-card-item.unread {
  border-color: var(--shell-border-strong);
  background: var(--shell-card-subtle);
}

.notif-icon-col {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--shell-border);
  background: var(--shell-chip);
  color: var(--shell-text);
}

.notif-icon-col.type-approved {
  color: #10b981;
}

.notif-icon-col.type-like {
  color: #ef4444;
}

.notif-icon-col.type-comment {
  color: var(--shell-text);
}

.notif-icon-col.type-report {
  color: #f59e0b;
}

.notif-content-col {
  flex: 1;
  min-width: 0;
}

.notif-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.notif-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--shell-text);
}

.notif-time {
  font-size: 11.5px;
  color: var(--shell-text-dim);
  flex-shrink: 0;
}

.notif-desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--shell-text-muted);
  margin: 0;
}

.empty-aktivitas-center {
  background: var(--shell-card);
  border-radius: 20px;
  border: 1px dashed var(--shell-border-strong);
  padding: 60px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  color: var(--shell-text-muted);
  margin-bottom: 12px;
}

.empty-main-text {
  font-size: 15px;
  font-weight: 800;
  margin: 0 0 4px;
  color: var(--shell-text);
}

.empty-sub-text {
  font-size: 12.5px;
  color: var(--shell-text-dim);
  margin: 0;
}

@media (max-width: 520px) {
  .stage-header-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .stage-header-row .segmented-tabs-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  .stage-header-row .segmented-btn {
    flex: 1;
    padding: 6px 4px;
    font-size: 11.5px;
    text-align: center;
  }
  .notif-card-item {
    padding: 12px;
    gap: 10px;
  }
}
</style>
