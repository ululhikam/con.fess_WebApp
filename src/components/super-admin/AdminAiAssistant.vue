<template>
  <div class="ai-assist">
    <button
      v-if="!open"
      type="button"
      class="ai-assist__fab"
      aria-label="Buka asisten AI konsol"
      @click="toggle"
    >
      <Sparkles :size="18" />
    </button>

    <section v-else class="ai-assist__panel" aria-label="Asisten AI konsol">
      <header class="ai-assist__head">
        <div>
          <p class="ai-assist__eyebrow">Asisten konsol</p>
          <h2 class="ai-assist__title">Tanya AI</h2>
        </div>
        <button
          type="button"
          class="pc-btn pc-btn--ghost pc-btn--icon pc-btn--sm"
          aria-label="Tutup asisten AI"
          @click="toggle"
        >
          <X :size="15" />
        </button>
      </header>

      <div class="ai-assist__body">
        <div class="pc-callout">
          <Info :size="14" />
          <div>
            AI hanya memberi saran. Tidak ada yang tersimpan sampai kamu menekan
            <strong>Terapkan</strong> lalu menyimpan formulirnya sendiri.
          </div>
        </div>

        <div v-if="fields.length" class="ai-assist__context">
          <Wand2 :size="13" />
          <span>{{ fields.length }} field terdeteksi di formulir yang terbuka.</span>
        </div>
        <div v-else class="ai-assist__context ai-assist__context--muted">
          <Wand2 :size="13" />
          <span>Buka formulir mana pun untuk mendapatkan usulan isi field.</span>
        </div>

        <div v-if="messages.length" class="ai-assist__messages">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="ai-assist__msg"
            :class="`ai-assist__msg--${message.role}`"
          >
            <p class="ai-assist__msg-text">{{ message.text }}</p>
          </div>
        </div>

        <div v-if="suggestions.length" class="ai-assist__suggestions">
          <p class="ai-assist__section">Usulan isi field</p>
          <article v-for="item in suggestions" :key="item.field" class="ai-assist__suggestion">
            <p class="ai-assist__suggestion-label">{{ item.label }}</p>
            <p class="ai-assist__suggestion-value">{{ item.value }}</p>
            <p v-if="item.reason" class="ai-assist__suggestion-reason">{{ item.reason }}</p>
            <button
              type="button"
              class="pc-btn pc-btn--ghost pc-btn--sm"
              :disabled="!canApply(item)"
              @click="applySuggestion(item)"
            >
              <Check :size="12" />
              {{ canApply(item) ? 'Terapkan' : 'Field tidak ditemukan' }}
            </button>
          </article>
        </div>

        <p v-if="error" class="pc-error-text" role="alert">{{ error }}</p>
      </div>

      <form class="ai-assist__form" @submit.prevent="ask">
        <textarea
          v-model="question"
          class="pc-textarea ai-assist__input"
          rows="2"
          maxlength="1000"
          placeholder="Tanya soal konsol, atau minta isi formulir yang terbuka…"
          :disabled="loading"
        />
        <button
          type="submit"
          class="pc-btn pc-btn--primary pc-btn--sm"
          :disabled="loading || !canAsk"
        >
          <Loader2 v-if="loading" :size="13" class="pc-spin" />
          <Send v-else :size="13" />
          {{ loading ? 'Memproses…' : 'Kirim' }}
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Check, Info, Loader2, Send, Sparkles, Wand2, X } from 'lucide-vue-next';
import { api } from '../../api';

/**
 * Asisten AI untuk konsol Super Admin.
 *
 * Dua hal yang bisa dilakukan:
 * 1. Menjawab pertanyaan tentang konsol (mode tanya-jawab).
 * 2. Mengusulkan isi field dari dialog formulir yang sedang terbuka.
 *
 * Usulan **tidak pernah** otomatis tersimpan: tombol Terapkan hanya mengisi
 * elemen input di DOM, lalu admin tetap harus menekan tombol simpan pada
 * formulir aslinya (lengkap dengan re-auth + alasan).
 *
 * Field dideteksi dari dialog `.pc-modal` yang terbuka. Penanda field memakai
 * atribut `id` karena Vue tidak mengekspos `v-model` ke DOM. Elemen bertipe
 * password dan file selalu dilewati supaya kredensial tidak pernah dikirim ke
 * provider AI.
 */

const route = useRoute();

const open = ref(false);
const loading = ref(false);
const error = ref('');
const question = ref('');
const messages = ref([]);
const suggestions = ref([]);
const fields = ref([]);
const lastContext = ref('');

/** Label layar yang sedang dibuka, dipakai sebagai konteks ke AI. */
const pageContext = computed(() => {
  const label = route.meta?.title || route.name || 'Konsol Super Admin';
  return `Super Admin · ${label}`;
});

const canAsk = computed(() => question.value.trim().length > 0 || fields.value.length > 0);

const EXCLUDED_TYPES = new Set(['password', 'file', 'hidden']);

/**
 * Kumpulkan field dari dialog formulir yang terbuka.
 *
 * Hanya elemen di dalam `.pc-modal` terakhir yang dibaca: kalau ada beberapa
 * dialog bertumpuk, yang paling atas adalah yang sedang dikerjakan admin.
 */
function collectFields() {
  if (typeof document === 'undefined') return [];

  const modals = document.querySelectorAll('.pc-modal');
  const modal = modals[modals.length - 1];
  if (!modal) return [];

  const nodes = modal.querySelectorAll('input, textarea, select');
  const collected = [];

  for (const node of nodes) {
    const type = (node.getAttribute('type') || node.tagName).toLowerCase();
    if (EXCLUDED_TYPES.has(type)) continue;

    const name = node.getAttribute('id') || node.getAttribute('name');
    if (!name) continue;

    const label = findLabel(node) || name;
    const fieldType =
      node.tagName === 'SELECT'
        ? 'select'
        : node.tagName === 'TEXTAREA'
          ? 'textarea'
          : type === 'number' || node.getAttribute('inputmode') === 'numeric'
            ? 'number'
            : 'text';

    collected.push({
      name,
      label,
      type: fieldType,
      currentValue: String(node.value ?? ''),
      options:
        node.tagName === 'SELECT'
          ? Array.from(node.options)
              .map((option) => option.textContent.trim())
              .filter(Boolean)
              .slice(0, 30)
          : [],
    });

    if (collected.length >= 12) break;
  }

  return collected;
}

/** Cari label yang benar-benar terkait elemen (for=id), lalu teks terdekat. */
function findLabel(node) {
  const id = node.getAttribute('id');
  if (id) {
    const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
    if (label?.textContent) return label.textContent.trim();
  }
  const wrapper = node.closest('.pc-field');
  const inline = wrapper?.querySelector('.pc-label');
  return inline?.textContent?.trim() || '';
}

/** Elemen DOM untuk sebuah field usulan, atau null bila dialog sudah ditutup. */
function findTarget(fieldName) {
  if (typeof document === 'undefined') return null;
  return document.getElementById(fieldName);
}

function canApply(item) {
  const target = findTarget(item.field);
  if (!target) return false;
  const type = (target.getAttribute('type') || '').toLowerCase();
  return !EXCLUDED_TYPES.has(type);
}

/**
 * Isi nilai ke elemen lalu kirim event yang sama seperti ketikan pengguna,
 * supaya `v-model` Vue ikut memperbarui state komponen.
 */
function applySuggestion(item) {
  const target = findTarget(item.field);
  if (!target) return;

  target.focus();

  if (target.tagName === 'SELECT') {
    // AI mengembalikan teks opsi, sedangkan `value` opsi bisa berbeda (mis.
    // boolean `true`/`false`). Cocokkan lewat teks dulu, lalu nilai mentah.
    const options = Array.from(target.options);
    const wanted = item.value.trim().toLowerCase();
    const match =
      options.find((option) => option.textContent.trim().toLowerCase() === wanted) ||
      options.find((option) => String(option.value).toLowerCase() === wanted);
    if (!match) {
      messages.value.push({
        role: 'assistant',
        text: `Nilai "${item.value}" tidak ada di pilihan "${item.label}".`,
      });
      return;
    }
    target.value = match.value;
  } else {
    target.value = item.value;
  }

  target.dispatchEvent(new Event('input', { bubbles: true }));
  target.dispatchEvent(new Event('change', { bubbles: true }));
  target.blur();

  messages.value.push({
    role: 'assistant',
    text: `Nilai "${item.label}" diisi. Periksa lagi sebelum menyimpan formulir.`,
  });
  suggestions.value = suggestions.value.filter((entry) => entry.field !== item.field);
}

async function ask() {
  if (!canAsk.value || loading.value) return;

  loading.value = true;
  error.value = '';
  fields.value = collectFields();
  lastContext.value = pageContext.value;

  const asked = question.value.trim();
  if (asked) messages.value.push({ role: 'user', text: asked });
  question.value = '';

  try {
    const result = await api.assistAdminAi({
      context: lastContext.value,
      message: asked,
      fields: fields.value.map((field) => ({
        name: field.name,
        label: field.label,
        type: field.type,
        current_value: field.currentValue,
        options: field.options,
      })),
    });

    if (result?.reply) {
      messages.value.push({ role: 'assistant', text: result.reply });
    }
    suggestions.value = Array.isArray(result?.suggestions) ? result.suggestions : [];
    if (!result?.reply && !suggestions.value.length) {
      messages.value.push({
        role: 'assistant',
        text: 'Belum ada saran yang bisa dipakai. Coba tulis pertanyaan yang lebih spesifik.',
      });
    }
  } catch (err) {
    error.value = err?.message || 'Asisten AI tidak bisa dihubungi saat ini.';
  } finally {
    loading.value = false;
    await nextTick();
  }
}

function toggle() {
  open.value = !open.value;
  if (open.value) {
    fields.value = collectFields();
  } else {
    suggestions.value = [];
    error.value = '';
  }
}

/** Dialog bisa dibuka/ditutup tanpa memicu permintaan; cukup segarkan daftar. */
function refreshFields() {
  if (!open.value) return;
  fields.value = collectFields();
}

let observer = null;

onMounted(() => {
  // Perubahan DOM (dialog dibuka/ditutup) tidak punya event Vue yang bisa
  // ditangkap dari layout induk, jadi dipantau lewat MutationObserver ringan.
  if (typeof MutationObserver === 'undefined') return;
  observer = new MutationObserver(() => refreshFields());
  observer.observe(document.body, { childList: true, subtree: true });
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});

watch(open, (value) => {
  if (value) fields.value = collectFields();
});
</script>

<style scoped>
.ai-assist {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 60;
}

.ai-assist__fab {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 1px solid var(--lime-primary);
  border-radius: var(--radius-pill);
  background: var(--lime-primary);
  color: var(--text-dark);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
  cursor: pointer;
}

.ai-assist__panel {
  display: flex;
  flex-direction: column;
  width: min(390px, calc(100vw - 32px));
  max-height: min(70vh, 620px);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.36);
  overflow: hidden;
}

.ai-assist__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 14px 10px;
  border-bottom: 1px solid var(--border-subtle);
}

.ai-assist__eyebrow {
  margin: 0 0 2px;
  color: var(--text-muted);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.ai-assist__title {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
}

.ai-assist__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  overflow-y: auto;
}

.ai-assist__context {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--text-secondary);
  font-size: 10px;
}

.ai-assist__context--muted {
  color: var(--text-muted);
}

.ai-assist__messages {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-assist__msg {
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--bg-inset);
  font-size: 11px;
  line-height: 1.55;
}

.ai-assist__msg--user {
  background: var(--bg-raised);
  border: 1px solid var(--border-subtle);
}

.ai-assist__msg-text {
  margin: 0;
  white-space: pre-wrap;
}

.ai-assist__section {
  margin: 0 0 6px;
  color: var(--text-muted);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.ai-assist__suggestions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-assist__suggestion {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--bg-inset);
}

.ai-assist__suggestion-label {
  margin: 0;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 700;
}

.ai-assist__suggestion-value {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.ai-assist__suggestion-reason {
  margin: 0;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.5;
}

.ai-assist__form {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 14px 14px;
  border-top: 1px solid var(--border-subtle);
}

.ai-assist__input {
  min-height: 44px;
  flex: 1;
}
</style>
