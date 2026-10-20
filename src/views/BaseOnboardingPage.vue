<template>
  <div class="onb-shell">
    <div class="onb-card">
      <header class="onb-head">
        <div class="onb-brand">Fess n Curious</div>
        <div class="onb-head-right">
          <span v-if="accountLabel" class="onb-account" :title="accountLabel">{{ accountLabel }}</span>
          <button
            type="button"
            class="onb-logout-head-btn"
            title="Keluar dari akun ini jika salah masuk akun"
            @click="handleLogout"
          >
            <LogOut :size="12" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      <!-- Step indicator -->
      <div class="onb-steps" aria-label="Langkah pengisian profil base">
        <div
          v-for="s in STEPS"
          :key="s.step"
          class="onb-step"
          :class="{ active: step === s.step, done: step > s.step }"
        >
          <span class="onb-step-dot">{{ step > s.step ? '✓' : s.step }}</span>
          <span class="onb-step-label">{{ s.label }}</span>
        </div>
      </div>

      <!-- STEP 1: IDENTITAS BASE -->
      <section v-if="step === 1" class="onb-pane">
        <h1 class="onb-title">Lengkapi Profil Base</h1>
        <p class="onb-desc">
          Akunmu terdaftar sebagai Base Admin. Buat base komunitasmu dulu sebelum masuk ke dashboard.
        </p>

        <label class="onb-label" for="onb-name">Nama Base</label>
        <input
          id="onb-name"
          v-model.trim="form.name"
          type="text"
          class="onb-input"
          placeholder="contoh: Code & Memes Base"
          @input="suggestHandle"
        />

        <label class="onb-label" for="onb-handle">Username / Handle Base</label>
        <input
          id="onb-handle"
          v-model.trim="form.handle"
          type="text"
          class="onb-input"
          placeholder="@namabase"
          @input="handleTouched = true"
        />
        <p class="onb-hint">3–20 karakter, hanya huruf, angka, underscore, dan titik.</p>

        <label class="onb-label">Kategori Base</label>
        <div class="onb-chips">
          <button
            v-for="c in CATEGORIES"
            :key="c"
            type="button"
            class="onb-chip"
            :class="{ active: form.category === c }"
            @click="form.category = c"
          >
            {{ c }}
          </button>
        </div>

        <p v-if="errorMessage" class="onb-error">{{ errorMessage }}</p>

        <div class="onb-nav onb-nav-end">
          <button type="button" class="onb-btn primary" @click="goNext">Lanjut: Profil</button>
        </div>
      </section>

      <!-- STEP 2: PROFIL BASE -->
      <section v-else-if="step === 2" class="onb-pane">
        <h1 class="onb-title">Profil Base</h1>
        <p class="onb-desc">Tampilan publik base yang akan dilihat pengguna.</p>

        <div class="onb-avatar-row">
          <img v-if="form.avatar" :src="form.avatar" alt="Foto profil base" class="onb-avatar" />
          <div v-else class="onb-avatar onb-avatar-initial">{{ initialPreview }}</div>
          <div>
            <label class="onb-upload-btn">
              <span>{{ form.avatar ? 'Ganti Foto' : 'Upload Foto' }}</span>
              <input type="file" accept="image/*" class="sr-only" @change="handleAvatarUpload" />
            </label>
            <p class="onb-hint">Opsional — bisa diubah nanti.</p>
          </div>
        </div>

        <label class="onb-label" for="onb-bio">Deskripsi Singkat (Bio)</label>
        <textarea
          id="onb-bio"
          v-model.trim="form.bio"
          class="onb-textarea"
          rows="3"
          maxlength="300"
          placeholder="Ceritakan base-mu: topik, aturan kirim, dan suasana komunitas…"
        ></textarea>

        <label class="onb-label">Warna Identitas</label>
        <div class="onb-colors">
          <button
            v-for="c in COLORS"
            :key="c"
            type="button"
            class="onb-color"
            :class="{ active: form.color === c }"
            :style="{ background: c }"
            :aria-label="`Warna ${c}`"
            @click="form.color = c"
          ></button>
        </div>

        <label class="onb-label" for="onb-keyword">Kata Kunci Auto-Routing (opsional)</label>
        <input
          id="onb-keyword"
          v-model.trim="form.keyword"
          type="text"
          class="onb-input"
          placeholder="contoh: [code]"
        />
        <p class="onb-hint">Fess yang mengandung kata ini otomatis diarahkan ke base-mu.</p>

        <p v-if="errorMessage" class="onb-error">{{ errorMessage }}</p>

        <div class="onb-nav">
          <button type="button" class="onb-btn ghost" @click="goBack">Kembali</button>
          <button type="button" class="onb-btn primary" @click="goNext">Lanjut: Instagram & Aturan</button>
        </div>
      </section>

      <!-- STEP 3: INSTAGRAM & ATURAN + KONFIRMASI -->
      <section v-else class="onb-pane">
        <h1 class="onb-title">Instagram &amp; Aturan</h1>
        <p class="onb-desc">Langkah terakhir — hubungkan Instagram untuk auto-publish dan tentukan aturan komunitas.</p>

        <!-- Meta Instagram Integration Card -->
        <div class="onb-ig-card" :class="{ 'is-connected': igConnected }">
          <div class="onb-ig-header">
            <div class="onb-ig-badge-icon">
              <Instagram :size="24" />
            </div>
            <div class="onb-ig-meta-info">
              <div class="onb-ig-title-row">
                <span class="onb-ig-app-title">Integrasi Instagram Base</span>
                <span v-if="igConnected" class="onb-badge onb-badge-connected">
                  <CheckCircle2 :size="12" /> Terhubung
                </span>
                <span v-else class="onb-badge onb-badge-idle">Opsional</span>
              </div>
              <p class="onb-ig-app-desc">
                Publikasikan confession yang disetujui secara otomatis ke Instagram Feed &amp; Reels base.
              </p>
            </div>
          </div>

          <!-- Alert jika berhasil konek -->
          <div v-if="igSuccessMessage" class="onb-ig-alert success">
            <CheckCircle2 :size="15" />
            <span>{{ igSuccessMessage }}</span>
          </div>

          <!-- State: SUDAH TERHUBUNG -->
          <div v-if="igConnected" class="onb-ig-connected-view">
            <div class="onb-ig-profile-box">
              <div class="onb-ig-profile-avatar">
                <Instagram :size="18" />
              </div>
              <div class="onb-ig-profile-details">
                <span class="onb-ig-username">{{ normalizedIgAccount }}</span>
                <span class="onb-ig-account-type">Akun Instagram Terhubung untuk Auto-Post</span>
              </div>
            </div>

            <div class="onb-ig-connected-actions">
              <button
                type="button"
                class="onb-ig-action-btn disconnect"
                @click="disconnectIg"
              >
                <Unlink :size="13" />
                <span>Putuskan</span>
              </button>
              <button
                type="button"
                class="onb-ig-action-btn reconnect"
                @click="reconnectIg"
              >
                <RefreshCw :size="13" />
                <span>Ganti Akun</span>
              </button>
            </div>
          </div>

          <!-- State: BELUM TERHUBUNG — hanya OAuth resmi, tanpa input handle manual -->
          <div v-else class="onb-ig-disconnected-view">
            <button
              type="button"
              class="onb-ig-oauth-btn"
              :disabled="isConnectingIg"
              @click="handleInstagramOAuth"
            >
              <Loader2 v-if="isConnectingIg" class="spin" :size="18" />
              <Instagram v-else :size="18" />
              <span>
                {{
                  isConnectingIg
                    ? 'Mengarahkan ke Meta…'
                    : 'Hubungkan Akun Instagram via Meta OAuth'
                }}
              </span>
              <ExternalLink :size="14" class="oauth-ext-icon" />
            </button>

            <p class="onb-ig-oauth-hint">
              Kamu akan memilih akun Instagram profesional base langsung di halaman resmi
              Meta. Tidak perlu mengetik handle — akun yang terhubung akan terisi otomatis.
            </p>

            <div class="onb-ig-perks">
              <div class="onb-ig-hl-item">
                <CheckCircle2 :size="14" class="hl-check" />
                <span>Auto-post fess yang disetujui ke Feed &amp; Reels base.</span>
              </div>
              <div class="onb-ig-hl-item">
                <CheckCircle2 :size="14" class="hl-check" />
                <span>Token disimpan aman di server, bukan di browser.</span>
              </div>
              <div class="onb-ig-hl-item">
                <CheckCircle2 :size="14" class="hl-check" />
                <span>Bisa diputus atau diganti kapan saja lewat dashboard.</span>
              </div>
            </div>
          </div>
        </div>

        <label class="onb-label mt-4" for="onb-rules">Aturan Base</label>
        <textarea
          id="onb-rules"
          v-model="form.rulesText"
          class="onb-textarea"
          rows="3"
          placeholder="Satu aturan per baris, contoh:&#10;Dilarang SARA dan doxxing&#10;No iklan judi online"
        ></textarea>

        <div class="onb-summary">
          <div class="onb-summary-title">Ringkasan Base</div>
          <div class="onb-summary-row"><span>Nama</span><strong>{{ form.name }}</strong></div>
          <div class="onb-summary-row"><span>Handle</span><strong>{{ normalizedHandle }}</strong></div>
          <div class="onb-summary-row"><span>Kategori</span><strong>{{ form.category }}</strong></div>
          <div class="onb-summary-row">
            <span>Instagram</span>
            <strong :class="{ 'text-meta-verified': igConnected }">
              {{ form.igAccount ? form.igAccount + (igConnected ? ' (Meta OAuth ✓)' : '') : '—' }}
            </strong>
          </div>
        </div>

        <p v-if="errorMessage" class="onb-error">{{ errorMessage }}</p>

        <div class="onb-nav">
          <button type="button" class="onb-btn ghost" :disabled="isSubmitting" @click="goBack">
            Kembali
          </button>
          <button type="button" class="onb-btn primary" :disabled="isSubmitting" @click="submitOnboarding">
            {{ isSubmitting ? 'Membuat base…' : 'Buat Base & Masuk Dashboard' }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
/**
 * BaseOnboardingPage — activation wizard for a Base Admin account that does
 * not manage a base yet. Reached via the router guard after login/register
 * (including Google OAuth). Submits POST /bases (see backend base.routes).
 */
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  Instagram,
  CheckCircle2,
  ShieldCheck,
  Unlink,
  RefreshCw,
  ExternalLink,
  Loader2,
  LogOut,
} from 'lucide-vue-next';
import { useAuthStore } from '../stores/authStore';
import { api, instagramAuthUrl } from '../api';
import { useBases } from '../composables/useBases';
import { confirmDialog } from '../composables/useAppDialog';

const STEPS = [
  { step: 1, label: 'Identitas' },
  { step: 2, label: 'Profil' },
  { step: 3, label: 'Instagram & Aturan' },
];
const CATEGORIES = ['Umum', 'Kampus', 'Kota', 'Hobi'];
const COLORS = ['#0055FF', '#7000FF', '#FF0055', '#00B2FF', '#00C853', '#F59E0B'];

const DRAFT_KEY = 'fess_base_onboarding_draft';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { fetchBases } = useBases();

const step = ref(1);
const isSubmitting = ref(false);
const errorMessage = ref('');
const handleTouched = ref(false);

const igConnected = ref(false);
const isConnectingIg = ref(false);
const igSuccessMessage = ref('');

const form = reactive({
  name: '',
  handle: '',
  category: 'Umum',
  color: '#0055FF',
  bio: '',
  keyword: '',
  igAccount: '',
  rulesText: '',
  avatar: '',
});

const accountLabel = computed(() => authStore.user?.email || authStore.user?.handle || '');
const normalizedHandle = computed(() => {
  const h = form.handle.trim();
  if (!h) return '—';
  return h.startsWith('@') ? h : `@${h}`;
});
const normalizedIgAccount = computed(() => {
  const ig = form.igAccount.trim();
  if (!ig) return '—';
  return ig.startsWith('@') ? ig : `@${ig}`;
});
const initialPreview = computed(() => {
  const base = form.name.trim() || 'Base';
  const parts = base.split(/\s+/);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : base.slice(0, 2)).toUpperCase();
});

/** Slugify the base name into a suggested @handle. */
function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 20);
}

function suggestHandle() {
  if (handleTouched.value) return;
  const slug = slugify(form.name);
  form.handle = slug ? `@${slug}` : '';
}

function validateIdentity() {
  if (form.name.trim().length < 3) return 'Nama base minimal 3 karakter.';
  if (!/^@?[a-zA-Z0-9_.]{3,20}$/.test(form.handle.trim())) {
    return 'Handle harus 3–20 karakter (huruf, angka, underscore, atau titik).';
  }
  return '';
}

function goNext() {
  errorMessage.value = '';
  if (step.value === 1) {
    const err = validateIdentity();
    if (err) {
      errorMessage.value = err;
      return;
    }
    step.value = 2;
    return;
  }
  if (step.value === 2) step.value = 3;
}

function goBack() {
  errorMessage.value = '';
  if (step.value > 1) step.value -= 1;
}

async function handleAvatarUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  errorMessage.value = '';
  try {
    const res = await api.uploadAvatar(file);
    if (res?.url) form.avatar = res.url;
  } catch (err) {
    errorMessage.value = err?.message || 'Upload foto gagal. Coba lagi.';
  }
}

function saveDraft() {
  try {
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        step: 3,
        form: { ...form },
      })
    );
  } catch {
    // Session storage not available
  }
}

function restoreDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function handleInstagramOAuth() {
  errorMessage.value = '';

  // Konfirmasi izin sebelum redirect — transparansi scope (syarat Meta App Review).
  const confirmed = await confirmDialog({
    title: 'Hubungkan Instagram ke Fess n Curious?',
    message: 'Kamu akan diarahkan ke Instagram untuk memberi izin resmi (Meta OAuth).',
    detail:
      'Fess n Curious hanya meminta: (1) info dasar akun profesional base — username & ID, ' +
      '(2) izin publikasi konten yang kamu setujui ke Feed/Carousel (gambar) atau Reels (video) ' +
      'akun base. Token disimpan aman di server dan bisa diputus kapan saja lewat tombol "Putuskan".',
    variant: 'info',
    confirmLabel: 'Lanjut ke Instagram',
    cancelLabel: 'Batal',
  });
  if (!confirmed) return;

  isConnectingIg.value = true;
  saveDraft();

  const token = localStorage.getItem('fess_token') || '';
  const base = form.handle ? form.handle.trim() : '';

  // Redirect ke backend Meta OAuth flow
  window.location.href = instagramAuthUrl({
    token,
    base,
    origin: 'onboarding',
  });
}

function reconnectIg() {
  igConnected.value = false;
  igSuccessMessage.value = '';
}

function disconnectIg() {
  igConnected.value = false;
  form.igAccount = '';
  igSuccessMessage.value = '';
  errorMessage.value = '';
}

async function submitOnboarding() {
  const err = validateIdentity();
  if (err) {
    step.value = 1;
    errorMessage.value = err;
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  try {
    const rules = form.rulesText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean)
      .slice(0, 10);

    const cleanIg = form.igAccount.trim()
      ? form.igAccount.trim().startsWith('@')
        ? form.igAccount.trim()
        : `@${form.igAccount.trim()}`
      : undefined;

    await api.createBase({
      name: form.name.trim(),
      handle: normalizedHandle.value,
      category: form.category,
      color: form.color,
      keyword: form.keyword.trim() || undefined,
      bio: form.bio.trim() || undefined,
      avatar: form.avatar || undefined,
      ig_account: cleanIg,
      rules,
    });

    sessionStorage.removeItem(DRAFT_KEY);

    // Refresh the session (managed_bases) + base directory, then enter the portal.
    await authStore.fetchMe();
    fetchBases().catch(() => {});
    router.push('/base-admin');
  } catch (e) {
    errorMessage.value = e?.message || 'Gagal membuat base. Coba lagi.';
  } finally {
    isSubmitting.value = false;
  }
}

async function handleLogout() {
  try {
    sessionStorage.clear();
    authStore.clearSession();
    api.logout().catch(() => {});
  } finally {
    window.location.href = '/login';
  }
}

onMounted(async () => {
  // Already has a base → nothing to onboard (router guard enforces this too).
  if ((authStore.user?.managedBases?.length ?? 0) > 0) {
    router.replace('/base-admin');
    return;
  }

  // Restore draft if returning from OAuth redirect
  const draft = restoreDraft();
  if (draft?.form) {
    Object.assign(form, draft.form);
    if (draft.step) step.value = draft.step;
  }

  // Parse OAuth Callback URL Query Params
  const query = route.query;
  const hadDraft = !!draft?.form;

  if (query.token && typeof query.token === 'string') {
    localStorage.setItem('fess_token', query.token);
    try {
      await authStore.fetchMe();
    } catch {
      // Ignored
    }
  }

  // OAuth bisa datang dari alur registrasi (belum punya draft). Sinkronkan
  // akun IG yang sudah tersimpan di profil agar base baru tetap terhubung.
  const storedIg = authStore.user?.igAccount;
  if (storedIg && !igConnected.value) {
    igConnected.value = true;
    form.igAccount = storedIg;
  }

  if (query.error) {
    errorMessage.value = decodeURIComponent(String(query.error));
    sessionStorage.removeItem(DRAFT_KEY);
  } else if (query.ig_connected === 'true') {
    igConnected.value = true;
    if (query.ig_user) {
      const igUser = decodeURIComponent(String(query.ig_user));
      form.igAccount = igUser.startsWith('@') ? igUser : `@${igUser}`;
    }
    igSuccessMessage.value = `Akun Instagram ${form.igAccount} berhasil terhubung via Meta OAuth!`;
    if (hadDraft) step.value = 3;
    sessionStorage.removeItem(DRAFT_KEY);
  }

  // Clean URL query parameters so refresh won't re-trigger
  if (query.ig_connected || query.error || query.ig_user || query.token) {
    router.replace({ path: route.path, query: {} }).catch(() => {});
  }
});
</script>

<style scoped>
.onb-shell {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--shell-bg);
  color: var(--shell-text);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px 16px 64px;
  overflow-x: clip;
}

.onb-card {
  width: 100%;
  min-width: 0;
  max-width: 520px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 24px;
  padding: 26px 24px 28px;
}

.onb-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.onb-brand {
  font-weight: 900;
  font-size: 15px;
}

.onb-head-right {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 72%;
  min-width: 0;
}

.onb-account {
  font-size: 11.5px;
  color: var(--shell-text-muted);
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.onb-logout-head-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--shell-chip, rgba(255, 255, 255, 0.08));
  border: 1px solid var(--shell-border-strong, var(--shell-border));
  color: var(--shell-text-muted);
  border-radius: 8px;
  padding: 4px 9px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.onb-logout-head-btn:hover {
  background: rgba(248, 113, 113, 0.15);
  border-color: #f87171;
  color: #f87171;
}

.onb-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 22px;
}

.onb-step {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--shell-border);
  border-radius: 12px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.onb-step.active {
  border-color: var(--brand-blue, #0055ff);
  color: var(--shell-text);
}

.onb-step.done {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.4);
}

.onb-step-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--shell-chip, rgba(255, 255, 255, 0.08));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  flex-shrink: 0;
}

.onb-title {
  font-size: 20px;
  font-weight: 900;
  margin: 0 0 6px;
}

.onb-desc {
  font-size: 12.5px;
  color: var(--shell-text-muted);
  margin-bottom: 18px;
}

.onb-label {
  display: block;
  font-size: 12px;
  font-weight: 800;
  margin: 14px 0 6px;
}

.onb-input,
.onb-textarea {
  width: 100%;
  background: var(--shell-bg);
  border: 1px solid var(--shell-border-strong, var(--shell-border));
  border-radius: 12px;
  color: var(--shell-text);
  font-family: inherit;
  font-size: 13.5px;
  padding: 11px 12px;
  outline: none;
  box-sizing: border-box;
}

.onb-input:focus,
.onb-textarea:focus {
  border-color: var(--brand-blue, #0055ff);
}

.onb-textarea {
  resize: vertical;
  min-height: 76px;
}

.onb-hint {
  font-size: 11px;
  color: var(--shell-text-muted);
  margin-top: 5px;
}

.onb-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.onb-chip {
  background: transparent;
  border: 1px solid var(--shell-border-strong, var(--shell-border));
  color: var(--shell-text-muted);
  border-radius: 99px;
  padding: 7px 16px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}

.onb-chip.active {
  background: var(--brand-blue, #0055ff);
  border-color: var(--brand-blue, #0055ff);
  color: #fff;
}

.onb-colors {
  display: flex;
  gap: 10px;
}

.onb-color {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
}

.onb-color.active {
  border-color: #fff;
  box-shadow: 0 0 0 2px var(--brand-blue, #0055ff);
}

.onb-avatar-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 6px;
}

.onb-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.onb-avatar-initial {
  background: var(--shell-chip, rgba(255, 255, 255, 0.08));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 20px;
}

.onb-upload-btn {
  display: inline-flex;
  align-items: center;
  border: 1px dashed var(--shell-border-strong, var(--shell-border));
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.onb-summary {
  margin-top: 18px;
  border: 1px solid var(--shell-border);
  border-radius: 14px;
  padding: 14px;
}

.onb-summary-title {
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 8px;
}

.onb-summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 12.5px;
  padding: 4px 0;
  color: var(--shell-text-muted);
}

.onb-summary-row strong {
  color: var(--shell-text);
  font-weight: 800;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.onb-error {
  margin-top: 14px;
  color: #f87171;
  font-size: 12.5px;
  font-weight: 600;
}

.onb-nav {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 22px;
}

.onb-nav.onb-nav-end {
  justify-content: flex-end;
}

.onb-btn {
  border-radius: 12px;
  border: 1px solid transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  padding: 11px 18px;
  cursor: pointer;
}

.onb-btn.ghost {
  background: transparent;
  border-color: var(--shell-border-strong, var(--shell-border));
  color: var(--shell-text-muted);
}

.onb-btn.primary {
  background: var(--brand-blue, #0055ff);
  color: #fff;
}

.onb-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Instagram Meta OAuth Card Styling */
.onb-ig-card {
  background: var(--shell-card);
  border: 1.5px solid var(--shell-border);
  border-radius: 20px;
  padding: 18px;
  margin-top: 10px;
  margin-bottom: 16px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.onb-ig-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
  opacity: 0.85;
}

.onb-ig-card.is-connected {
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.08);
}

.onb-ig-card.is-connected::before {
  background: #10b981;
}

.onb-ig-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.onb-ig-badge-icon {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(225, 48, 108, 0.35);
}

.onb-ig-meta-info {
  flex: 1;
}

.onb-ig-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.onb-ig-app-title {
  font-size: 14px;
  font-weight: 900;
  color: var(--shell-text);
}

.onb-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 99px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.onb-badge-idle {
  background: var(--shell-chip);
  color: var(--shell-text-muted);
  border: 1px solid var(--shell-border);
}

.onb-badge-connected {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.4);
}

.onb-ig-app-desc {
  font-size: 11.5px;
  color: var(--shell-text-muted);
  margin-top: 3px;
  line-height: 1.45;
}

.onb-ig-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 700;
}

.onb-ig-alert.success {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

/* Connected View */
.onb-ig-connected-view {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--shell-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.onb-ig-profile-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.onb-ig-profile-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f09433, #dc2743, #bc1888);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.onb-ig-profile-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.onb-ig-username {
  font-size: 13.5px;
  font-weight: 900;
  color: var(--shell-text);
  overflow-wrap: anywhere;
}

.onb-ig-account-type {
  font-size: 11px;
  color: #10b981;
  font-weight: 700;
}

.onb-ig-connected-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.onb-ig-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 11px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  border: 1px solid transparent;
  font-family: inherit;
  transition: all 0.15s ease;
}

.onb-ig-action-btn.disconnect {
  background: transparent;
  border-color: var(--shell-border);
  color: var(--shell-text-muted);
}

.onb-ig-action-btn.disconnect:hover {
  border-color: #f87171;
  color: #f87171;
}

.onb-ig-action-btn.reconnect {
  background: var(--shell-chip);
  border-color: var(--shell-border);
  color: var(--shell-text);
}

/* Disconnected View */
.onb-ig-disconnected-view {
  margin-top: 14px;
}

.onb-ig-oauth-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 14px;
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  color: #ffffff;
  border: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(220, 39, 67, 0.35);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.onb-ig-oauth-btn:hover:not(:disabled) {
  transform: translateY(-1.5px);
  box-shadow: 0 6px 22px rgba(220, 39, 67, 0.45);
}

.onb-ig-oauth-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.oauth-ext-icon {
  margin-left: 2px;
  flex-shrink: 0;
}

.onb-ig-perks {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  padding: 10px 12px;
  background: var(--shell-chip);
  border-radius: 12px;
  border: 1px solid var(--shell-border);
}

.onb-ig-hl-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  color: var(--shell-text-muted);
}

.hl-check {
  color: #10b981;
  flex-shrink: 0;
}

.onb-ig-oauth-hint {
  margin: 10px 2px 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--shell-text-muted);
}

.text-meta-verified {
  color: #10b981;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ── Mobile: wizard tetap di dalam frame, tombol mudah dijangkau ───────── */
@media (max-width: 560px) {
  .onb-shell {
    padding: 16px 12px 48px;
  }

  .onb-card {
    padding: 20px 16px 22px;
    border-radius: 18px;
  }

  .onb-head {
    gap: 8px;
    margin-bottom: 14px;
  }

  .onb-head-right {
    max-width: 62%;
    gap: 6px;
  }

  .onb-account {
    max-width: 108px;
    font-size: 10.5px;
  }

  .onb-steps {
    gap: 6px;
    margin-bottom: 18px;
  }

  .onb-step {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 4px;
    padding: 8px 4px;
    font-size: 10px;
    line-height: 1.2;
  }

  .onb-step-dot {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }

  .onb-title {
    font-size: 18px;
  }

  .onb-desc {
    font-size: 12px;
    margin-bottom: 14px;
  }

  .onb-avatar-row {
    align-items: flex-start;
    gap: 12px;
  }

  .onb-colors {
    flex-wrap: wrap;
    gap: 8px;
  }

  .onb-ig-card {
    padding: 14px;
    border-radius: 16px;
  }

  .onb-ig-header {
    gap: 10px;
  }

  .onb-ig-badge-icon {
    width: 40px;
    height: 40px;
    border-radius: 11px;
  }

  .onb-ig-app-title {
    font-size: 13px;
  }

  .onb-ig-title-row {
    align-items: flex-start;
  }

  .onb-ig-connected-view {
    flex-direction: column;
    align-items: stretch;
  }

  .onb-ig-connected-actions {
    width: 100%;
  }

  .onb-ig-action-btn {
    flex: 1;
    justify-content: center;
  }

  .onb-ig-oauth-btn {
    padding: 13px 12px;
    font-size: 12.5px;
    line-height: 1.3;
    text-align: center;
  }

  .onb-ig-oauth-btn span {
    min-width: 0;
  }

  .onb-ig-perks {
    padding: 9px 10px;
  }

  .onb-summary {
    padding: 12px;
  }

  .onb-summary-row {
    flex-wrap: wrap;
    row-gap: 2px;
  }

  .onb-summary-row strong {
    text-align: left;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .onb-nav {
    flex-direction: column;
    margin-top: 18px;
  }

  .onb-btn {
    width: 100%;
  }
}

@media (max-width: 380px) {
  .onb-shell {
    padding-left: 8px;
    padding-right: 8px;
  }

  .onb-card {
    padding: 18px 13px 20px;
  }

  .onb-brand {
    font-size: 13.5px;
  }

  .onb-head-right {
    max-width: 58%;
  }

  .onb-account {
    display: none;
  }

  .onb-step-label {
    font-size: 9.5px;
  }
}
</style>
