<template>
  <ProfileCard title="Profile Intro">
    <div
      v-for="(section, i) in sections"
      :key="section.label"
      :class="['intro-group', { 'mb-3': i < sections.length - 1 }]"
    >
      <span class="intro-label">{{ section.label }}</span>
      <p class="intro-val">{{ section.value }}</p>
    </div>

    <div class="intro-group">
      <span class="intro-label">Other Social Networks:</span>
      <div class="flex flex-col gap-2 mt-2">
        <a
          v-for="link in socialLinks"
          :key="link.key"
          :href="link.href"
          :class="['social-btn', `${link.key}-btn`]"
        >
          {{ link.label }}
        </a>
      </div>
    </div>
  </ProfileCard>
</template>

<script setup>
/**
 * ProfileIntroCard — "Profile Intro" widget: bio sections + social links.
 * The copy itself lives in src/data/profileData.js, keyed by the current user.
 */
import { computed } from 'vue';
import ProfileCard from './ProfileCard.vue';
import { buildIntroSections, buildSocialLinks } from '../../data/profileData';

const props = defineProps({
  user: { type: Object, required: true },
});

const sections = computed(() => buildIntroSections(props.user));
const socialLinks = computed(() => buildSocialLinks(props.user));
</script>

<style scoped>
.intro-label {
  font-size: 12px;
  font-weight: 800;
  color: var(--text-main);
  display: block;
  margin-bottom: 2px;
}

.intro-val {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.social-btn {
  display: block;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
}

/* Social network brand chips stay decorative. */
.facebook-btn {
  background: var(--social-blue-bg);
  color: var(--social-blue-fg);
}

.twitter-btn {
  background: var(--social-green-bg);
  color: var(--social-green-fg);
}

.github-btn {
  background: var(--bg-inset);
  color: var(--text-main);
}
</style>
