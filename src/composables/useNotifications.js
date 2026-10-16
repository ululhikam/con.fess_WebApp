import { ref, computed } from 'vue';
import { api } from '../api';
import { useAuthStore } from '../stores/authStore';

// Module-level singleton state across components
const unreadCount = ref(0);
const lastChecked = ref(0);
let inflightCount = null;
let pollTimer = null;

export function useNotifications() {
  const authStore = useAuthStore();

  const hasUnread = computed(() => unreadCount.value > 0);
  const displayCount = computed(() => {
    if (unreadCount.value <= 0) return '';
    if (unreadCount.value > 99) return '99+';
    return String(unreadCount.value);
  });

  async function fetchUnreadCount(force = false) {
    if (!authStore.isAuthenticated) {
      unreadCount.value = 0;
      return 0;
    }

    const now = Date.now();
    // Cache for 8 seconds unless forced
    if (!force && now - lastChecked.value < 8000) {
      return unreadCount.value;
    }

    if (inflightCount) return inflightCount;

    inflightCount = api
      .getUnreadNotificationCount()
      .then((res) => {
        const count = Number(res?.unread_count ?? 0);
        unreadCount.value = isNaN(count) ? 0 : count;
        lastChecked.value = Date.now();
        return unreadCount.value;
      })
      .catch(() => unreadCount.value)
      .finally(() => {
        inflightCount = null;
      });

    return inflightCount;
  }

  function setUnreadCount(count) {
    const val = Number(count);
    unreadCount.value = isNaN(val) ? 0 : Math.max(0, val);
  }

  function decrementUnread(amount = 1) {
    unreadCount.value = Math.max(0, unreadCount.value - amount);
  }

  function clearUnread() {
    unreadCount.value = 0;
  }

  function startPolling(intervalMs = 30000) {
    if (pollTimer) return;
    fetchUnreadCount();
    pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible' && authStore.isAuthenticated) {
        fetchUnreadCount(true);
      }
    }, intervalMs);
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  return {
    unreadCount,
    hasUnread,
    displayCount,
    fetchUnreadCount,
    setUnreadCount,
    decrementUnread,
    clearUnread,
    startPolling,
    stopPolling,
  };
}
