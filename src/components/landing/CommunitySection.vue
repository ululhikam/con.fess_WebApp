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

    <div class="base-cards-grid">
      <article v-for="base in landingSampleBases" :key="base.handle" class="base-card-item">
        <div class="bci-top">
          <div class="bci-icon" :style="{ background: base.color }" aria-hidden="true">
            {{ base.initial }}
          </div>
          <div class="bci-meta">
            <h3>{{ base.name }}</h3>
            <span>{{ base.handle }}</span>
          </div>
          <span class="bci-badge">{{ base.members }} anggota</span>
        </div>
        <p class="bci-desc">{{ base.desc }}</p>
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
 * CommunitySection — `#komunitas` showcase of sample community bases.
 */
import { ArrowRight } from 'lucide-vue-next';
import LandingSectionHead from './LandingSectionHead.vue';
import { landingSampleBases } from '../../data/landingData';
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
  }

  .showcase-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
