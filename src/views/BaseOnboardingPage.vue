<template>
  <div class="onb-shell">
    <div class="onb-card">
      <header class="onb-head">
        <div class="onb-brand">Fess n Curious</div>
        <span v-if="accountLabel" class="onb-account">{{ accountLabel }}</span>
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

        <div class="onb-nav">
          <button type="button" class="onb-btn ghost" @click="handleLogout">Keluar</button>
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
        <p class="onb-desc">Langkah terakhir — semua opsional dan bisa diatur ulang nanti.</p>

        <label class="onb-label" for="onb-ig">Akun Instagram Base</label>
        <input
          id="onb-ig"
          v-model.trim="form.igAccount"
          type="text"
          class="onb-input"
          placeholder="@namabase_ig"
        />

        <label class="onb-label" for="onb-rules">Aturan Base</label>
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
          <div class="onb-summary-row"><span>Instagram</span><strong>{{ form.igAccount || '—' }}</strong></div>
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { api } from '../api';
import { useBases } from '../composables/useBases';

const STEPS = [
  { step: 1, label: 'Identitas' },
  { step: 2, label: 'Profil' },
  { step: 3, label: 'Instagram & Aturan' },
];
const CATEGORIES = ['Umum', 'Kampus', 'Kota', 'Hobi'];
const COLORS = ['#0055FF', '#7000FF', '#FF0055', '#00B2FF', '#00C853', '#F59E0B'];

const router = useRouter();
const authStore = useAuthStore();
const { fetchBases } = useBases();

const step = ref(1);
const isSubmitting = ref(false);
const errorMessage = ref('');
const handleTouched = ref(false);

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

    await api.createBase({
      name: form.name.trim(),
      handle: normalizedHandle.value,
      category: form.category,
      color: form.color,
      keyword: form.keyword.trim() || undefined,
      bio: form.bio.trim() || undefined,
      avatar: form.avatar || undefined,
      ig_account: form.igAccount.trim() || undefined,
      rules,
    });

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
  await authStore.logout();
  router.push('/login');
}

onMounted(() => {
  // Already has a base → nothing to onboard (router guard enforces this too).
  if ((authStore.user?.managedBases?.length ?? 0) > 0) {
    router.replace('/base-admin');
  }
});
</script>

<style scoped>
.onb-shell {
  min-height: 100vh;
  background: var(--shell-bg);
  color: var(--shell-text);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px 16px 64px;
}

.onb-card {
  width: 100%;
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

.onb-account {
  font-size: 11.5px;
  color: var(--shell-text-muted);
  max-width: 55%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
</style>
