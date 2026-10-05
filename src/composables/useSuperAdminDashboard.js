/**
 * src/composables/useSuperAdminDashboard.js
 * ---------------------------------------------------------------------------
 * Behaviour for the Super Admin dashboard: security control rows with a
 * working on/off switch state (rendered with role="switch" + aria-checked).
 *
 * Static copy lives in src/data/adminData.js.
 */

import { ref, computed } from 'vue';
import { SECURITY_CONTROL_ROWS } from '../data/adminData';

export function useSuperAdminDashboard() {
  const rows = ref(SECURITY_CONTROL_ROWS.map((row) => ({ ...row, on: row.defaultOn ?? true })));

  const securityRows = computed(() => rows.value);

  function toggleSecurityRow(id) {
    const row = rows.value.find((r) => r.id === id);
    if (row) row.on = !row.on;
  }

  return { securityRows, toggleSecurityRow };
}
