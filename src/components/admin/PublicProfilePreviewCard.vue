<template>
  <AdminCard title="Pratinjau Profil Publik Base">
    <template #actions>
      <span class="preview-tag text-xs font-bold">Public View Preview</span>
    </template>

    <div class="profile-hero p-6">
      <div class="flex items-center gap-4 mb-3">
        <div class="profile-avatar flex items-center justify-center text-2xl" aria-hidden="true">
          {{ profile.initial }}
        </div>
        <div>
          <h3 class="profile-name text-xl font-bold">{{ profile.name }}</h3>
          <span class="profile-handle text-xs font-mono">
            {{ profile.handle }} • {{ profile.members }}
          </span>
        </div>
      </div>

      <p class="profile-bio text-xs leading-relaxed mb-4">{{ profile.bio }}</p>

      <AdminButton variant="lime" @click="router.push(profile.route)">
        {{ profile.cta }}
        <ArrowRight :size="13" />
      </AdminButton>
    </div>
  </AdminCard>
</template>

<script setup>
/**
 * PublicProfilePreviewCard — what the base profile looks like to visitors.
 */
import { useRouter } from 'vue-router';
import { ArrowRight } from 'lucide-vue-next';
import AdminCard from './AdminCard.vue';
import AdminButton from './AdminButton.vue';

defineProps({
  profile: {
    type: Object,
    required: true,
    // { initial, name, handle, members, bio, cta, route }
  },
});

const router = useRouter();
</script>

<style scoped>
.preview-tag {
  color: var(--brand-blue);
}

.profile-hero {
  background: linear-gradient(135deg, var(--brand-blue), var(--shell-sub-accent));
  color: var(--text-on-accent);
  border-radius: var(--radius-lg);
}

.profile-avatar {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: var(--radius-lg);
  background: var(--lime-primary);
  color: var(--lime-ink);
  font-weight: 800;
}

.profile-name {
  margin: 0;
  color: var(--text-on-accent);
}

.profile-handle {
  color: var(--lime-primary);
}

.profile-bio {
  opacity: 0.85;
}
</style>
