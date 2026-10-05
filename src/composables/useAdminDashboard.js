/**
 * src/composables/useAdminDashboard.js
 * ---------------------------------------------------------------------------
 * Behaviour for the Base Admin dashboard:
 *   - useAdminSession     → role switching / logout for the shared admin nav
 *   - useAdminDashboard   → tab state + live moderation counters + overview stats
 *   - useFessModeration   → store-backed approve / hide / canvas export actions
 *   - useBaseSettings     → reactive form model for the settings card
 *
 * Static copy lives in src/data/adminData.js.
 */

import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useFessStore } from '../stores/fessStore';
import { BASE_ADMIN_TABS, BASE_OVERVIEW_STAT_DEFS, BASE_SETTINGS_FIELDS } from '../data/adminData';

/** Role selector + logout, shared by both admin dashboards. */
export function useAdminSession() {
  const authStore = useAuthStore();
  const router = useRouter();

  const role = computed(() => authStore.user?.role || 'User');
  const isSuperAdmin = computed(() => authStore.isSuperAdmin);

  function switchRole(nextRole) {
    authStore.switchRole(nextRole);
  }

  function logout() {
    authStore.logout();
    router.push('/login');
  }

  return { role, isSuperAdmin, switchRole, logout };
}

/** Tab navigation, live counters and the derived overview stat cards. */
export function useAdminDashboard() {
  const fessStore = useFessStore();

  const activeTab = ref(BASE_ADMIN_TABS[0].id);
  const showNewBaseModal = ref(false);

  const pendingCount = computed(
    () => fessStore.fesses.filter((f) => f.status === 'pending').length,
  );
  const approvedCount = computed(
    () => fessStore.fesses.filter((f) => f.status === 'approved').length,
  );

  /** Static stat definitions + the two live counters, ready for StatCardGrid. */
  const overviewStats = computed(() => {
    const live = {
      pending: String(pendingCount.value),
      approved: String(approvedCount.value),
    };
    return BASE_OVERVIEW_STAT_DEFS.map((def) => ({
      ...def,
      value: def.value ?? live[def.key] ?? '',
    }));
  });

  const activeTabLabel = computed(
    () => BASE_ADMIN_TABS.find((tab) => tab.id === activeTab.value)?.label ?? '',
  );

  return {
    activeTab,
    activeTabLabel,
    showNewBaseModal,
    pendingCount,
    approvedCount,
    overviewStats,
  };
}

function exportCanvas(fess) {
  alert(`Kartu Canvas PNG untuk Confession #${fess.id} telah diexport ke Meta Auto-Poster!`);
}

/** Approve / hide / export actions shared by the content and moderation cards. */
export function useFessModeration() {
  const fessStore = useFessStore();

  const fesses = computed(() => fessStore.fesses);

  return {
    fesses,
    approve: (id) => fessStore.approveFess(id),
    hide: (id) => fessStore.rejectFess(id),
    exportCanvas,
  };
}

/** Reactive model for the "Pengaturan Auto-Base" form fields. */
export function useBaseSettings(fields = BASE_SETTINGS_FIELDS) {
  const form = reactive(Object.fromEntries(fields.map((field) => [field.key, field.value ?? ''])));

  return { form };
}
