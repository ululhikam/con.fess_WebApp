<template>
  <div>
    <ConsolePageHeader
      eyebrow="Users & access"
      title="Pengguna &amp; Akses"
      subtitle="Cari akun, tinjau peran dan base yang dikelola, lalu bekukan atau buka blokir akun dengan re-auth dan audit."
      :health="summary ? `${formatNumber(summary.totals.users)} pengguna` : ''"
      health-tone="neutral"
    >
      <template #actions>
        <button type="button" class="pc-btn pc-btn--ghost" :disabled="loading" @click="refreshPage">
          <RefreshCw :size="14" :class="{ 'pc-spin': loading }" />
          {{ loading ? 'Memuat…' : 'Muat ulang' }}
        </button>
      </template>
    </ConsolePageHeader>

    <div class="pc-stats pc-stats--3">
      <div class="pc-stat pc-stat--blue">
        <p class="pc-stat__label">Total pengguna</p>
        <p class="pc-stat__value">
          {{ summary ? formatNumber(summary.totals.users) : '—' }}
        </p>
        <p class="pc-stat__hint">Seluruh akun di platform</p>
      </div>
      <div class="pc-stat pc-stat--pink">
        <p class="pc-stat__label">Akun dibekukan</p>
        <p class="pc-stat__value">
          {{ summary ? formatNumber(summary.counts.banned_users) : '—' }}
        </p>
        <p class="pc-stat__hint">Ban aktif, termasuk ban sementara</p>
      </div>
      <div class="pc-stat pc-stat--lime">
        <p class="pc-stat__label">Hasil filter</p>
        <p class="pc-stat__value">{{ formatNumber(users.total) }}</p>
        <p class="pc-stat__hint">Akun yang cocok dengan pencarian</p>
      </div>
    </div>

    <section class="pc-card">
      <div class="pc-card__head">
        <div>
          <h2 class="pc-card__title">Direktori akun</h2>
          <p class="pc-card__desc">
            Perubahan peran tetap manual di v1. Konsol ini hanya untuk pencarian dan
            moderasi akses akun.
          </p>
        </div>
        <span class="pc-badge pc-badge--neutral">Halaman {{ users.page }} / {{ users.total_pages }}</span>
      </div>

      <div class="pc-filters">
        <div class="pc-field pc-field--grow">
          <label class="pc-label" for="user-search">Cari pengguna</label>
          <div class="pc-input-icon">
            <Search :size="13" />
            <input
              id="user-search"
              v-model="search"
              class="pc-input"
              type="search"
              placeholder="Handle, username, email, atau ID"
            />
          </div>
        </div>
        <div class="pc-field">
          <label class="pc-label" for="user-role">Peran</label>
          <select id="user-role" v-model="role" class="pc-select">
            <option value="">Semua peran</option>
            <option value="User">User</option>
            <option value="Base Admin">Base Admin</option>
            <option value="Super Admin">Super Admin</option>
          </select>
        </div>
        <div class="pc-field">
          <label class="pc-label" for="user-ban">Status ban</label>
          <select id="user-ban" v-model="banned" class="pc-select">
            <option value="">Semua</option>
            <option value="true">Dibekukan</option>
            <option value="false">Tidak dibekukan</option>
          </select>
        </div>
        <div class="pc-field">
          <label class="pc-label" for="user-email">Email</label>
          <select id="user-email" v-model="emailVerified" class="pc-select">
            <option value="">Semua</option>
            <option value="true">Terverifikasi</option>
            <option value="false">Belum verifikasi</option>
          </select>
        </div>
      </div>

      <div v-if="error" class="pc-card__body">
        <div class="pc-error">
          <AlertTriangle :size="16" />
          <div>
            <strong>Daftar pengguna gagal dimuat.</strong>
            <p>{{ error }}</p>
          </div>
        </div>
      </div>

      <div v-else-if="loading && !users.data.length" class="pc-card__body pc-stack">
        <div v-for="index in 5" :key="index" class="pc-skeleton pc-skeleton--line" />
      </div>

      <div v-else-if="!users.data.length" class="pc-empty">
        <span class="pc-empty__icon"><UsersRound :size="18" /></span>
        Tidak ada pengguna yang cocok dengan filter ini.
      </div>

      <div v-else class="pc-table-wrap">
        <table class="pc-table">
          <thead>
            <tr>
              <th>Pengguna</th>
              <th>Peran</th>
              <th>Base</th>
              <th>Fess</th>
              <th>CTF</th>
              <th>Status</th>
              <th>Bergabung</th>
              <th class="pc-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users.data" :key="user.id">
              <td>
                <div class="pc-user-cell">
                  <span class="pc-user-avatar">
                    <img v-if="isAvatarImage(user.avatar)" :src="user.avatar" alt="" />
                    <template v-else>{{ initials(user) }}</template>
                  </span>
                  <span>
                    <button type="button" class="pc-entity-link" @click="openUser(user)">
                      {{ user.handle }}
                    </button>
                    <span class="pc-table__sub">{{ user.email || 'Email privat' }}</span>
                  </span>
                </div>
              </td>
              <td>
                <ConsoleStatusBadge :status="user.role" :tone="roleTone(user.role)" />
                <span class="pc-table__sub">Level {{ user.level }}</span>
              </td>
              <td>
                <div v-if="user.managed_bases.length" class="pc-base-chips">
                  <button
                    v-for="base in user.managed_bases.slice(0, 2)"
                    :key="base.id"
                    type="button"
                    class="pc-base-chip"
                    @click="openSupport(base.handle)"
                  >
                    {{ base.handle }}
                  </button>
                  <span v-if="user.managed_bases.length > 2" class="pc-small pc-muted">
                    +{{ user.managed_bases.length - 2 }}
                  </span>
                </div>
                <span v-else class="pc-small pc-muted">—</span>
              </td>
              <td class="pc-table__number">{{ formatNumber(user.fess_count) }}</td>
              <td class="pc-table__number">{{ formatNumber(user.ctf_balance) }}</td>
              <td>
                <ConsoleStatusBadge
                  :status="user.ban_active ? 'banned' : 'active'"
                  :label="user.ban_active ? 'Dibekukan' : 'Aktif'"
                  :tone="user.ban_active ? 'danger' : 'success'"
                />
                <span class="pc-table__sub">
                  {{ user.ban_active ? banExpiryLabel(user) : emailLabel(user) }}
                </span>
              </td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>
                <div class="pc-table__actions">
                  <button
                    type="button"
                    class="pc-btn pc-btn--ghost pc-btn--sm"
                    @click="openUser(user)"
                  >
                    <Eye :size="12" />
                    Detail
                  </button>
                  <button
                    v-if="user.ban_active"
                    type="button"
                    class="pc-btn pc-btn--primary pc-btn--sm"
                    @click="openUnban(user)"
                  >
                    <Unlock :size="12" />
                    Buka
                  </button>
                  <button
                    v-else
                    type="button"
                    class="pc-btn pc-btn--danger pc-btn--sm"
                    :disabled="isProtectedUser(user)"
                    :title="isProtectedUser(user) ? 'Super Admin dan akun sendiri tidak dapat dibekukan' : 'Bekukan akun'"
                    @click="openBan(user)"
                  >
                    <Ban :size="12" />
                    Bekukan
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="users.total_pages > 1" class="pc-pagination">
        <span>
          {{ users.total }} pengguna · halaman {{ users.page }} dari {{ users.total_pages }}
        </span>
        <div class="pc-pagination__buttons">
          <button
            type="button"
            class="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon"
            :disabled="users.page <= 1 || loading"
            aria-label="Halaman sebelumnya"
            @click="goPage(users.page - 1)"
          >
            <ChevronLeft :size="14" />
          </button>
          <button
            type="button"
            class="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon"
            :disabled="users.page >= users.total_pages || loading"
            aria-label="Halaman berikutnya"
            @click="goPage(users.page + 1)"
          >
            <ChevronRight :size="14" />
          </button>
        </div>
      </div>
    </section>

    <BaseSupportDrawer v-model="supportOpen" :handle="supportHandle" />

    <ConsoleDrawer
      v-model="userDrawerOpen"
      eyebrow="User detail · read-only"
      :title="selectedUser?.handle || 'Detail pengguna'"
      :subtitle="selectedUser?.email || 'Akun pengguna platform'"
    >
      <div v-if="selectedUser" class="pc-stack">
        <div class="pc-user-hero">
          <span class="pc-user-avatar pc-user-avatar--lg">
            <img v-if="isAvatarImage(selectedUser.avatar)" :src="selectedUser.avatar" alt="" />
            <template v-else>{{ initials(selectedUser) }}</template>
          </span>
          <div>
            <div class="pc-inline">
              <ConsoleStatusBadge
                :status="selectedUser.role"
                :tone="roleTone(selectedUser.role)"
              />
              <ConsoleStatusBadge
                :status="selectedUser.ban_active ? 'banned' : 'active'"
                :label="selectedUser.ban_active ? 'Dibekukan' : 'Aktif'"
                :tone="selectedUser.ban_active ? 'danger' : 'success'"
              />
            </div>
            <p class="pc-user-hero__name">{{ selectedUser.username }}</p>
            <p class="pc-user-hero__meta">
              {{ selectedUser.handle }} · level {{ selectedUser.level }} ·
              bergabung {{ formatDate(selectedUser.created_at) }}
            </p>
          </div>
        </div>

        <section class="pc-card">
          <div class="pc-card__head">
            <h3 class="pc-card__title">Identitas &amp; aktivitas</h3>
          </div>
          <div class="pc-card__body">
            <dl class="pc-kv">
              <dt>User ID</dt>
              <dd class="pc-mono">{{ selectedUser.id }}</dd>
              <dt>Email</dt>
              <dd>
                {{ selectedUser.email || '—' }}
                <span class="pc-muted">· {{ emailLabel(selectedUser) }}</span>
              </dd>
              <dt>Fess</dt>
              <dd>{{ formatNumber(selectedUser.fess_count) }}</dd>
              <dt>Saldo CTF</dt>
              <dd>{{ formatNumber(selectedUser.ctf_balance) }} CTF</dd>
              <dt>Order pembayaran</dt>
              <dd>{{ formatNumber(selectedUser.payment_order_count) }}</dd>
              <dt>Base dikelola</dt>
              <dd>
                <div v-if="selectedUser.managed_bases.length" class="pc-inline">
                  <button
                    v-for="base in selectedUser.managed_bases"
                    :key="base.id"
                    type="button"
                    class="pc-base-chip"
                    @click="openSupport(base.handle)"
                  >
                    {{ base.handle }}
                  </button>
                </div>
                <span v-else class="pc-muted">Tidak ada</span>
              </dd>
            </dl>
          </div>
        </section>

        <section class="pc-card">
          <div class="pc-card__head">
            <div>
              <h3 class="pc-card__title">Status akses</h3>
              <p class="pc-card__desc">Ban aktif langsung memutus sesi pada request berikutnya.</p>
            </div>
            <ConsoleStatusBadge
              :status="selectedUser.ban_active ? 'banned' : 'ok'"
              :label="selectedUser.ban_active ? 'Akses dibekukan' : 'Akses normal'"
            />
          </div>
          <div class="pc-card__body">
            <dl class="pc-kv">
              <dt>Alasan ban</dt>
              <dd>{{ selectedUser.ban_reason || '—' }}</dd>
              <dt>Kedaluwarsa</dt>
              <dd>{{ banExpiryLabel(selectedUser) }}</dd>
              <dt>Flag is_banned</dt>
              <dd>{{ selectedUser.is_banned ? 'true' : 'false' }}</dd>
              <dt>Email terverifikasi</dt>
              <dd>{{ selectedUser.email_verified_at ? formatDateTime(selectedUser.email_verified_at) : 'Belum' }}</dd>
            </dl>
          </div>
        </section>

        <div class="pc-callout pc-callout--lime">
          <ShieldCheck :size="15" />
          <div>
            Ban/unban membutuhkan kata sandi Super Admin dan menghasilkan audit permanen.
            Perubahan peran akun belum tersedia di v1.
          </div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="pc-btn pc-btn--ghost" @click="userDrawerOpen = false">
          Tutup
        </button>
        <template v-if="selectedUser">
          <button
            v-if="selectedUser.ban_active"
            type="button"
            class="pc-btn pc-btn--primary"
            @click="openUnban(selectedUser)"
          >
            <Unlock :size="14" />
            Buka blokir
          </button>
          <button
            v-else
            type="button"
            class="pc-btn pc-btn--danger"
            :disabled="isProtectedUser(selectedUser)"
            @click="openBan(selectedUser)"
          >
            <Ban :size="14" />
            Bekukan akun
          </button>
        </template>
      </template>
    </ConsoleDrawer>

    <ConsoleDialog
      v-model="banDialog.open"
      title="Bekukan akun"
      :subtitle="banDialog.user ? `${banDialog.user.handle} · ${banDialog.user.role}` : ''"
      eyebrow="High-risk access action · re-auth"
      confirm-label="Bekukan akun"
      tone="danger"
      :loading="banDialog.loading"
      :confirm-disabled="!banCanSubmit"
      :error="banDialog.error"
      @confirm="submitBan"
    >
      <div v-if="banDialog.user" class="pc-summary">
        <div class="pc-summary__row">
          <span class="pc-summary__label">Akun</span>
          <span class="pc-summary__value">{{ banDialog.user.handle }}</span>
        </div>
        <div class="pc-summary__row">
          <span class="pc-summary__label">Email</span>
          <span class="pc-summary__value">{{ banDialog.user.email || '—' }}</span>
        </div>
      </div>

      <div class="pc-dialog-grid">
        <div class="pc-field">
          <label class="pc-label" for="ban-duration">Durasi</label>
          <select id="ban-duration" v-model="banDialog.duration" class="pc-select">
            <option value="0">Permanen</option>
            <option value="24">24 jam</option>
            <option value="168">7 hari</option>
            <option value="720">30 hari</option>
            <option value="custom">Kustom</option>
          </select>
        </div>
        <div v-if="banDialog.duration === 'custom'" class="pc-field">
          <label class="pc-label" for="ban-hours">Jumlah jam</label>
          <input
            id="ban-hours"
            v-model="banDialog.customHours"
            class="pc-input"
            type="number"
            min="1"
            max="8760"
            step="1"
            inputmode="numeric"
          />
        </div>
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="ban-reason">Alasan ban</label>
          <textarea
            id="ban-reason"
            v-model="banDialog.reason"
            class="pc-textarea"
            maxlength="500"
            placeholder="Jelaskan pelanggaran atau alasan keamanan."
          />
        </div>
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="ban-password">Kata sandi Super Admin</label>
          <input
            id="ban-password"
            v-model="banDialog.password"
            class="pc-input"
            type="password"
            autocomplete="current-password"
            placeholder="Konfirmasi kata sandi"
          />
        </div>
      </div>

      <div class="pc-callout pc-callout--danger" style="margin-top: 12px">
        <Ban :size="15" />
        <div>
          Akun akan langsung kehilangan akses. Ban sementara berakhir otomatis saat
          kedaluwarsa, tetapi tetap tercatat di audit.
        </div>
      </div>
    </ConsoleDialog>

    <ConsoleDialog
      v-model="unbanDialog.open"
      title="Buka blokir akun"
      :subtitle="unbanDialog.user ? `${unbanDialog.user.handle} · ${unbanDialog.user.role}` : ''"
      eyebrow="High-risk access action · re-auth"
      confirm-label="Buka blokir"
      tone="primary"
      :loading="unbanDialog.loading"
      :confirm-disabled="!unbanCanSubmit"
      :error="unbanDialog.error"
      @confirm="submitUnban"
    >
      <div v-if="unbanDialog.user" class="pc-summary">
        <div class="pc-summary__row">
          <span class="pc-summary__label">Akun</span>
          <span class="pc-summary__value">{{ unbanDialog.user.handle }}</span>
        </div>
        <div class="pc-summary__row">
          <span class="pc-summary__label">Alasan ban</span>
          <span class="pc-summary__value">{{ unbanDialog.user.ban_reason || '—' }}</span>
        </div>
      </div>

      <div class="pc-dialog-grid">
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="unban-reason">Catatan pembukaan (opsional)</label>
          <textarea
            id="unban-reason"
            v-model="unbanDialog.reason"
            class="pc-textarea"
            maxlength="500"
            placeholder="Catatan untuk audit, misalnya banding diterima."
          />
        </div>
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="unban-password">Kata sandi Super Admin</label>
          <input
            id="unban-password"
            v-model="unbanDialog.password"
            class="pc-input"
            type="password"
            autocomplete="current-password"
            placeholder="Konfirmasi kata sandi"
          />
        </div>
      </div>

      <div class="pc-callout" style="margin-top: 12px">
        <Unlock :size="15" />
        <div>Akun dapat masuk kembali setelah re-auth berhasil dan audit tercatat.</div>
      </div>
    </ConsoleDialog>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import {
  AlertTriangle,
  Ban,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Search,
  ShieldCheck,
  Unlock,
  UsersRound,
} from 'lucide-vue-next';
import { api } from '../../api';
import { useAuthStore } from '../../stores/authStore';
import { toast } from '../../composables/useToast';
import BaseSupportDrawer from '../../components/super-admin/BaseSupportDrawer.vue';
import ConsoleDialog from '../../components/super-admin/ConsoleDialog.vue';
import ConsoleDrawer from '../../components/super-admin/ConsoleDrawer.vue';
import ConsolePageHeader from '../../components/super-admin/ConsolePageHeader.vue';
import ConsoleStatusBadge from '../../components/super-admin/ConsoleStatusBadge.vue';
import { formatDate, formatDateTime, formatNumber } from '../../utils/console';
import { isAvatarImage } from '../../utils/avatar';

const authStore = useAuthStore();

const summary = ref(null);
const users = ref({ data: [], total: 0, page: 1, total_pages: 1 });
const search = ref('');
const role = ref('');
const banned = ref('');
const emailVerified = ref('');
const page = ref(1);
const loading = ref(false);
const error = ref('');

const supportOpen = ref(false);
const supportHandle = ref('');

const userDrawerOpen = ref(false);
const selectedUser = ref(null);

const banDialog = reactive({
  open: false,
  user: null,
  reason: '',
  duration: '24',
  customHours: '24',
  password: '',
  loading: false,
  error: '',
});

const unbanDialog = reactive({
  open: false,
  user: null,
  reason: '',
  password: '',
  loading: false,
  error: '',
});

const banDurationHours = computed(() => {
  if (banDialog.duration !== 'custom') return Number(banDialog.duration);
  return Number(banDialog.customHours);
});

const banCanSubmit = computed(() => {
  if (!banDialog.user || banDialog.reason.trim().length < 3) return false;
  if (!banDialog.password.trim()) return false;
  const hours = banDurationHours.value;
  if (banDialog.duration === 'custom') {
    if (!Number.isInteger(hours) || hours < 1 || hours > 8760) return false;
  }
  return true;
});

const unbanCanSubmit = computed(() =>
  Boolean(unbanDialog.user && unbanDialog.password.trim())
);

let searchTimer = null;

function initials(user) {
  const source = user?.username || user?.handle || '??';
  return String(source).replace(/^@/, '').slice(0, 2).toUpperCase();
}

function roleTone(value) {
  if (value === 'Super Admin') return 'lime';
  if (value === 'Base Admin') return 'blue';
  return 'neutral';
}

function isProtectedUser(user) {
  if (!user) return true;
  return user.id === authStore.user?.id || user.role === 'Super Admin';
}

function emailLabel(user) {
  return user.email_verified_at ? 'Email terverifikasi' : 'Email belum diverifikasi';
}

function banExpiryLabel(user) {
  if (!user?.ban_active) return 'Tidak ada ban aktif';
  if (!user.ban_expires_at) return 'Permanen';
  return `S.d. ${formatDateTime(user.ban_expires_at)}`;
}

async function loadSummary() {
  try {
    summary.value = await api.getAdminOpsSummary();
  } catch {
    summary.value = null;
  }
}

async function loadUsers() {
  loading.value = true;
  error.value = '';
  try {
    const params = { page: page.value, limit: 25 };
    if (search.value.trim()) params.q = search.value.trim();
    if (role.value) params.role = role.value;
    if (banned.value) params.banned = banned.value;
    if (emailVerified.value) params.email_verified = emailVerified.value;
    users.value = await api.getAdminUsers(params);
  } catch (err) {
    error.value = err?.message || 'Gagal memuat daftar pengguna.';
  } finally {
    loading.value = false;
  }
}

async function refreshPage() {
  await Promise.all([loadUsers(), loadSummary()]);
}

function goPage(nextPage) {
  page.value = nextPage;
  loadUsers();
}

function openSupport(handle) {
  if (!handle) return;
  userDrawerOpen.value = false;
  supportOpen.value = true;
  supportHandle.value = handle;
}

function openUser(user) {
  selectedUser.value = user;
  userDrawerOpen.value = true;
}

function openBan(user) {
  if (!user || isProtectedUser(user)) return;
  userDrawerOpen.value = false;
  banDialog.user = user;
  banDialog.reason = '';
  banDialog.duration = '24';
  banDialog.customHours = '24';
  banDialog.password = '';
  banDialog.error = '';
  banDialog.loading = false;
  banDialog.open = true;
}

function openUnban(user) {
  if (!user) return;
  userDrawerOpen.value = false;
  unbanDialog.user = user;
  unbanDialog.reason = '';
  unbanDialog.password = '';
  unbanDialog.error = '';
  unbanDialog.loading = false;
  unbanDialog.open = true;
}

async function submitBan() {
  if (!banCanSubmit.value || !banDialog.user) return;
  banDialog.loading = true;
  banDialog.error = '';
  try {
    await api.banAdminUser(banDialog.user.id, {
      reason: banDialog.reason.trim(),
      duration_hours: banDurationHours.value,
      password: banDialog.password,
    });
    toast.success(`Akun ${banDialog.user.handle} dibekukan.`);
    banDialog.open = false;
    selectedUser.value = null;
    await refreshPage();
  } catch (err) {
    banDialog.error = err?.message || 'Akun gagal dibekukan.';
  } finally {
    banDialog.loading = false;
  }
}

async function submitUnban() {
  if (!unbanCanSubmit.value || !unbanDialog.user) return;
  unbanDialog.loading = true;
  unbanDialog.error = '';
  try {
    await api.unbanAdminUser(unbanDialog.user.id, {
      reason: unbanDialog.reason.trim() || null,
      password: unbanDialog.password,
    });
    toast.success(`Blokir akun ${unbanDialog.user.handle} dibuka.`);
    unbanDialog.open = false;
    selectedUser.value = null;
    await refreshPage();
  } catch (err) {
    unbanDialog.error = err?.message || 'Blokir akun gagal dibuka.';
  } finally {
    unbanDialog.loading = false;
  }
}

watch(search, () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    page.value = 1;
    loadUsers();
  }, 350);
});

watch([role, banned, emailVerified], () => {
  page.value = 1;
  loadUsers();
});

onMounted(() => {
  loadOverview();
});

function loadOverview() {
  loadUsers();
  loadSummary();
}

onBeforeUnmount(() => {
  window.clearTimeout(searchTimer);
});
</script>

<style scoped>
.pc-input-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.pc-input-icon > svg {
  position: absolute;
  left: 10px;
  color: var(--text-muted);
  pointer-events: none;
}

.pc-input-icon .pc-input {
  padding-left: 30px;
}

.pc-entity-link {
  display: inline;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text-main);
  font: inherit;
  font-size: 11px;
  font-weight: 900;
  text-align: left;
  cursor: pointer;
}

.pc-entity-link:hover {
  color: var(--lime-text);
  text-decoration: underline;
}

.pc-user-cell {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 170px;
}

.pc-user-avatar {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  overflow: hidden;
  border: 1px solid var(--border-strong);
  border-radius: 50%;
  background: var(--bg-inset);
  color: var(--text-main);
  font-size: 10px;
  font-weight: 900;
}

.pc-user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pc-user-avatar--lg {
  width: 52px;
  height: 52px;
  font-size: 15px;
}

.pc-user-hero {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--bg-inset);
}

.pc-user-hero__name {
  margin: 7px 0 0;
  color: var(--text-main);
  font-size: 14px;
  font-weight: 900;
}

.pc-user-hero__meta {
  margin: 3px 0 0;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.5;
}

.pc-base-chips {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.pc-base-chip {
  padding: 2px 6px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-pill);
  background: var(--bg-inset);
  color: var(--text-secondary);
  font: inherit;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
}

.pc-base-chip:hover {
  border-color: var(--lime-primary);
  color: var(--lime-text);
}

@media (max-width: 680px) {
  .pc-card__head {
    flex-direction: column;
  }

  .pc-filters {
    align-items: stretch;
  }
}
</style>
