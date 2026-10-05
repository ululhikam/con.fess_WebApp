<template>
  <ProfileCard title="James's Poll">
    <p class="poll-question mb-4">{{ question }}</p>

    <div class="poll-options-list flex flex-col gap-3">
      <button
        v-for="opt in options"
        :key="opt.id"
        type="button"
        :class="['poll-option-box', selected === opt.id ? 'active-poll-box' : '']"
        :aria-pressed="selected === opt.id"
        @click="$emit('select', opt.id)"
      >
        <span class="poll-option-head mb-1">
          <span class="poll-name">{{ opt.name }}</span>
          <span class="poll-percent font-bold text-blue">{{ opt.percent }}%</span>
        </span>
        <span class="poll-progress-bar">
          <span class="poll-progress-fill" :style="{ width: opt.percent + '%' }"></span>
        </span>
      </button>
    </div>

    <ProfileButton variant="lime" size="sm" class="w-full mt-4">
      Vote Now! <Vote :size="14" aria-hidden="true" />
    </ProfileButton>
  </ProfileCard>
</template>

<script setup>
/**
 * PollCard — single-choice poll with static result bars.
 * The selected option id is owned by src/composables/useProfile.js.
 */
import { Vote } from 'lucide-vue-next';
import ProfileCard from './ProfileCard.vue';
import ProfileButton from './ProfileButton.vue';

defineProps({
  question: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  selected: { type: [Number, String], default: null },
});

defineEmits(['select']);
</script>

<style scoped>
.poll-question {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
  line-height: 1.5;
}

.poll-option-box {
  display: block;
  width: 100%;
  text-align: left;
  font-family: inherit;
  font-size: inherit;
  color: var(--text-main);
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.poll-option-box.active-poll-box {
  border-color: var(--brand-blue);
  background: var(--bg-inset);
}

.poll-option-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.poll-name {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-main);
}

.poll-progress-bar {
  display: block;
  height: 6px;
  background: var(--border-subtle);
  border-radius: var(--radius-pill);
  overflow: hidden;
  margin-top: 4px;
}

.poll-progress-fill {
  display: block;
  height: 100%;
  background: var(--brand-blue);
  border-radius: var(--radius-pill);
}
</style>
