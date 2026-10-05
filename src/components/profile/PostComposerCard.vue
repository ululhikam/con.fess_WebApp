<template>
  <ProfileCard>
    <div class="flex items-center gap-3 mb-3">
      <img :src="user.avatar" :alt="`${user.username} avatar`" class="mini-composer-avatar" />
      <textarea
        :value="modelValue"
        class="composer-textarea"
        placeholder="Share a confession or post status update to #BASECLUB..."
        aria-label="Tulis confession baru"
        rows="2"
        @input="$emit('update:modelValue', $event.target.value)"
      ></textarea>
    </div>

    <div class="flex justify-between items-center pt-3 border-t">
      <div class="flex gap-2">
        <button type="button" class="btn-attach">
          <Camera :size="14" aria-hidden="true" /> Photo
        </button>
        <button type="button" class="btn-attach">
          <Music :size="14" aria-hidden="true" /> Music
        </button>
        <button type="button" class="btn-attach">
          <Zap :size="14" aria-hidden="true" /> Tag Base
        </button>
      </div>

      <ProfileButton variant="lime" size="sm" @click="$emit('submit')">
        Post Confess <Rocket :size="14" aria-hidden="true" />
      </ProfileButton>
    </div>
  </ProfileCard>
</template>

<script setup>
/**
 * PostComposerCard — status update box above the timeline.
 * Controlled via `modelValue`; publishing is handled by the caller
 * (src/composables/useProfile.js → submitPost).
 */
import ProfileCard from './ProfileCard.vue';
import ProfileButton from './ProfileButton.vue';
import { Camera, Music, Zap, Rocket } from 'lucide-vue-next';

defineProps({
  user: { type: Object, required: true },
  modelValue: { type: String, default: '' },
});

defineEmits(['update:modelValue', 'submit']);
</script>

<style scoped>
.mini-composer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.composer-textarea {
  flex: 1;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: 13px;
  outline: none;
  resize: none;
  background: var(--bg-surface-2);
  color: var(--text-main);
}

.composer-textarea:focus {
  border-color: var(--brand-blue);
  background: var(--bg-surface);
}

.btn-attach {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
</style>
