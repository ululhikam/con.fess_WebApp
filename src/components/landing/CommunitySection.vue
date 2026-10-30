<template>
  <section id="komunitas" class="lp-base-showcase" aria-labelledby="komunitas-title">
    <LandingSectionHead
      class="showcase-head"
      row
      badge="JELAJAHI BASE"
      title="Temukan Komunitas Favoritmu"
      title-id="komunitas-title"
    >
      <router-link to="/login" class="showcase-cta">
        Jelajahi Semua Base <ArrowRight :size="15" />
      </router-link>
    </LandingSectionHead>

    <!-- Loading skeleton (no fake data) -->
    <div v-if="loading" class="base-cards-grid" aria-hidden="true">
      <div v-for="n in 4" :key="n" class="base-card-item is-skeleton">
        <div class="bci-top">
          <div class="bci-icon skeleton-block" />
          <div class="bci-meta">
            <div class="skeleton-line skeleton-line-lg" />
            <div class="skeleton-line skeleton-line-sm" />
          </div>
        </div>
        <div class="skeleton-line" />
        <div class="skeleton-line skeleton-line-sm" />
      </div>
    </div>

    <!-- Live base directory (grid hidden gracefully when the API returns none) -->
    <div v-else-if="showcaseBases.length" class="base-cards-grid">
      <article v-for="base in showcaseBases" :key="base.handle" class="base-card-item">
        <div class="bci-top">
          <div class="bci-icon" :style="{ background: base.color }" aria-hidden="true">
            <img
              v-if="isAvatarImage(base.avatar) && !failedAvatars[base.handle]"
              :src="base.avatar"
              alt=""
              class="bci-icon-img"
              @error="failedAvatars[base.handle] = true"
            />
            <span v-else class="bci-icon-initial">{{ avatarInitials(base.name, base.initial) }}</span>
          </div>
          <div class="bci-meta">
            <h3>{{ base.name }}</h3>
            <span>{{ base.handle }}</span>
          </div>
          <span v-if="base.members > 0" class="bci-badge">
            {{ formatMembers(base.members) }} anggota
          </span>
        </div>
        <p v-if="base.bio" class="bci-desc">{{ base.bio }}</p>
        <div class="bci-footer">
          <router-link to="/login" class="bci-join-btn">
            Kirim Fess Ke Base <ArrowRight :size="15" />
          </router-link>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
/**
 * CommunitySection — `#komunitas` showcase of community bases.
 * Live data from GET /bases via the shared useBases() cache.
 */
import { computed, onMounted, ref } from 'vue';
import { ArrowRight } from 'lucide-vue-next';
import LandingSectionHead from './LandingSectionHead.vue';
import { useBases } from '../../composables/useBases';
import { avatarInitials, isAvatarImage } from '../../utils/avatar';

const { bases, loading, ensureLoaded } = useBases();

/** The landing page teases the first few real bases; the rest live behind the CTA. */
const showcaseBases = computed(() => bases.value.slice(0, 4));

/** Foto base yang gagal dimuat (URL mati) jatuh kembali ke inisial. */
const failedAvatars = ref({});

/** 14200 -> "14.2K" compact format for the members badge. */
function formatMembers(count) {
  const n = Number(count) || 0;
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

onMounted(() => {
  /* Best-effort fetch: if it fails the cards stay hidden. */
  ensureLoaded().catch(() => {});
});
</script>

<style scoped>
.lp-base-showcase {
  margin-bottom: 90px;
}

.showcase-head {
  margin-bottom: 36px;
}

/* Solid "dark" pill CTA inside the light container */
.showcase-cta {
  background: var(--text-main);
  color: var(--bg-surface);
  border: none;
  padding: 10px 26px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.showcase-cta:hover {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
}

.base-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.base-card-item {
  background: var(--bg-surface-2);
  border-radius: 24px;
  padding: 28px;
  border: 1px solid var(--border-subtle);
  transition: transform 0.2s ease;
}

.base-card-item:hover {
  transform: translateY(-4px);
}

/* LOADING SKELETON (shown while GET /bases is in flight) */
.is-skeleton {
  pointer-events: none;
}

.skeleton-block,
.skeleton-line {
  background: var(--border-subtle);
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}

.skeleton-block {
  border-radius: 14px;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.skeleton-line-lg {
  width: 140px;
  height: 14px;
}

.skeleton-line-sm {
  width: 90px;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.45;
  }
}

.bci-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.bci-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  color: var(--brand-blue-ink);
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.bci-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: inherit;
}

.bci-icon-initial {
  font-size: 16px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.bci-meta h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
}

.bci-meta span {
  font-size: 12px;
  color: var(--text-muted);
}

.bci-badge {
  margin-left: auto;
  background: var(--shell-chip);
  color: var(--brand-blue);
  font-weight: 800;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 999px;
}

.bci-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.bci-join-btn {
  color: var(--brand-blue);
  font-weight: 800;
  font-size: 14px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

@media (max-width: 992px) {
  .base-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .base-cards-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .base-card-item {
    padding: 18px 16px;
    border-radius: 18px;
  }

  .showcase-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .showcase-cta {
    padding: 7px 18px;
    font-size: 12px;
  }
}
</style>
