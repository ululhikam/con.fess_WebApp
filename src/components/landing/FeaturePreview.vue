<template>
  <!-- PREVIEW: KIRIM CONFESS ANONIM -->
  <div v-if="type === 'anonim'" class="trio-bottom-preview preview-1">
    <div class="blue-avatar-pill">
      <div class="mini-avatar">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=baseclub" alt="" />
      </div>
      <div class="pill-meta">
        <span class="pm-handle">base_sender</span>
        <span class="pm-sub">23 422 fess terkirim</span>
      </div>
    </div>
    <div class="green-token-tag"><span>100% ANONIM</span></div>
  </div>

  <!-- PREVIEW: AUTO-PUBLISH SOSMED -->
  <div v-else-if="type === 'autopublish'" class="trio-bottom-preview preview-2">
    <div class="dual-pills-row">
      <div class="blue-val-pill">AUTO POST</div>
      <div class="dark-token-pill">INSTANT</div>
    </div>
    <div class="mini-green-badge-arrow" aria-hidden="true">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#000"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7,7 17,7 17,17" />
      </svg>
    </div>
  </div>

  <!-- PREVIEW: ANALITIK & REAKSI -->
  <div v-else class="trio-bottom-preview preview-3">
    <div class="speech-bubble-green">
      <div class="sb-label">EST. TOTAL PEMBACA</div>
      <div class="sb-val">188.342 K</div>
      <div class="sb-tail"></div>
    </div>
  </div>
</template>

<script setup>
/**
 * FeaturePreview — the mock-UI illustration sitting at the bottom of each
 * feature card. Picked by `type` (anonim | autopublish | analitik).
 */
defineProps({
  type: { type: String, default: 'anonim' },
});
</script>

<style scoped>
.trio-bottom-preview {
  margin-top: 32px;
}

.preview-1 {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.blue-avatar-pill {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  padding: 10px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.mini-avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #ffe082; /* illustration backdrop */
  overflow: hidden;
}

.mini-avatar img {
  width: 100%;
  height: 100%;
}

.pill-meta {
  display: flex;
  flex-direction: column;
}

.pm-handle {
  font-weight: 800;
  font-size: 13px;
}

.pm-sub {
  font-size: 11px;
  opacity: 0.8;
}

.green-token-tag {
  align-self: flex-end;
  background: var(--lime-primary);
  color: var(--lime-ink);
  font-weight: 900;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 999px;
}

.preview-2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.dual-pills-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.blue-val-pill {
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  font-weight: 800;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 999px;
}

.dark-token-pill {
  background: var(--neon-blue-hover);
  color: var(--text-on-accent);
  font-weight: 900;
  font-size: 13px;
  padding: 10px 18px;
  border-radius: 999px;
}

.mini-green-badge-arrow {
  width: 38px;
  height: 38px;
  background: var(--lime-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-3 {
  display: flex;
  justify-content: center;
}

.speech-bubble-green {
  position: relative;
  background: var(--lime-primary);
  color: var(--lime-ink);
  padding: 16px 24px;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 8px 24px var(--lime-glow);
}

.sb-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.sb-val {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.sb-tail {
  position: absolute;
  bottom: -10px;
  left: 24px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 12px solid var(--lime-primary);
}
</style>
