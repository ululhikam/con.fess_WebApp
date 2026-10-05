<template>
  <div class="user-app-layout">
    <AppHeader @openCompose="isComposerOpen = true" />

    <main class="app-main-centered-stage">
      <div class="centered-content-wrapper">
        <!-- HOME -->
        <FeedHomeTab
          v-if="activeNav === 'home'"
          v-model="homeTab"
          :posts="feedPosts"
          :followed-handles="followedHandles"
          :loading="loading"
          :error="error"
          @like="toggleLike"
          @findMore="activeNav = 'search'"
          @retry="reload"
        />

        <!-- SEARCH -->
        <ExploreSearchTab
          v-else-if="activeNav === 'search'"
          v-model:query="searchQuery"
          v-model:category="selectedCategory"
          v-model:mode="searchTab"
          :bases="filteredBases"
          :categories="FEED_CATEGORIES"
          :loading="loading"
          :is-following="isFollowing"
          @toggle-follow="toggleFollowBase"
        />

        <!-- AKTIVITAS -->
        <ActivityTab
          v-else-if="activeNav === 'aktivitas'"
          v-model="aktivitasTab"
          :filters="ACTIVITY_FILTERS"
          :loading="loading"
          :error="error"
          @retry="reload"
        />

        <!-- AKUN -->
        <AccountTab
          v-else
          :username="authStore.user?.username || 'ululhikam69@gmail.com'"
          :theme-mode="themeMode"
          @navigate="handleAccountAction"
          @setTheme="setMode"
          @logout="handleLogout"
          @openProfile="router.push('/profile')"
        />
      </div>
    </main>

    <BottomNavBar
      :active="activeNav"
      @navChange="activeNav = $event"
      @openCompose="isComposerOpen = true"
    />

    <ComposerModal
      v-model="isComposerOpen"
      :bases="exploreBases"
      :default-base="selectedBase"
      @submit="handlePublish"
    />
  </div>
</template>

<script setup>
/**
 * FeedPage — application shell.
 * Owns navigation state only; each screen lives in its own component under
 * src/components/feed/, data in src/data/, and behaviour in src/composables/.
 */
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

import AppHeader from '../components/layout/AppHeader.vue';
import BottomNavBar from '../components/layout/BottomNavBar.vue';
import FeedHomeTab from '../components/feed/FeedHomeTab.vue';
import ExploreSearchTab from '../components/feed/ExploreSearchTab.vue';
import ActivityTab from '../components/feed/ActivityTab.vue';
import AccountTab from '../components/feed/AccountTab.vue';
import ComposerModal from '../components/feed/ComposerModal.vue';

import { useAuthStore } from '../stores/authStore';
import { useFeedPosts } from '../composables/useFeedPosts';
import { useFollowBase } from '../composables/useFollowBase';
import { useTheme } from '../composables/useTheme';
import { useAsyncData } from '../composables/useAsyncData';
import { ALL_BASES, FEED_CATEGORIES } from '../data/bases';
import { ACTIVITY_FILTERS } from '../data/mockPosts';

const router = useRouter();
const authStore = useAuthStore();
const { mode: themeMode, setMode } = useTheme();

/* ---------- domain state ---------- */
const { feedPosts, toggleLike, publish } = useFeedPosts();
const { followedHandles, isFollowing, toggleFollowBase } = useFollowBase(['@ustfess']);

/* ---------- navigation ---------- */
const activeNav = ref('home');
const homeTab = ref('forYou');
const searchTab = ref('base');
const aktivitasTab = ref('semua');

/* ---------- discovery ---------- */
const searchQuery = ref('');
const selectedCategory = ref('Semua');

const exploreBases = ALL_BASES;

const filteredBases = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return ALL_BASES.filter((base) => {
    const matchesQuery =
      !q || base.name.toLowerCase().includes(q) || base.handle.toLowerCase().includes(q);
    const matchesCategory =
      selectedCategory.value === 'Semua' || base.category === selectedCategory.value;
    return matchesQuery && matchesCategory;
  });
});

/* ---------- initial load (drives the skeleton) ---------- */
const { loading, error, reload } = useAsyncData(
  async () => {
    // Stand-in for `api.fetchFeed()`; swap this for a real request.
    await Promise.resolve();
    return true;
  },
  { delay: 650 },
);

/* ---------- composer ---------- */
const isComposerOpen = ref(false);
const selectedBase = ref(ALL_BASES[0]?.handle ?? '@unermenfess');

function handlePublish({ base, content }) {
  const source = ALL_BASES.find((b) => b.handle === base);
  const accepted = publish({
    handle: base,
    content,
    avatarBg: source?.color ?? '#7000FF',
    avatarText: source?.initial ?? 'FESS',
  });

  if (accepted) {
    activeNav.value = 'home';
    homeTab.value = 'forYou';
  }
}

/* ---------- actions ---------- */
function handleAccountAction(action) {
  const routes = { profile: '/profile', 'my-fess': '/profile' };
  if (routes[action]) router.push(routes[action]);
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.user-app-layout {
  min-height: 100vh;
  background-color: var(--shell-bg);
  color: var(--shell-text);
  font-family: var(--font-sans);
  display: flex;
  flex-direction: column;
  padding-bottom: 84px; /* room for the fixed bottom nav */
}

.app-main-centered-stage {
  flex: 1;
  padding: 24px 16px 40px;
  background: var(--shell-stage);
  display: flex;
  justify-content: center;
}

.centered-content-wrapper {
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .user-app-layout {
    padding-bottom: 78px;
  }
  .app-main-centered-stage {
    padding: 16px 12px 32px;
  }
}
</style>
