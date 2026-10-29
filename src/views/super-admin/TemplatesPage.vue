<template>
  <div>
    <ConsolePageHeader
      eyebrow="Card system"
      title="Template Kartu"
      subtitle="Import SVG, atur pemilik base, dan kendalikan katalog kartu yang dipakai user. Thumbnail dirender otomatis dari SVG yang sama."
      :health="healthLabel"
      health-tone="blue"
    >
      <template #actions>
        <button type="button" class="pc-btn pc-btn--ghost" :disabled="loading" @click="refreshPage">
          <RefreshCw :size="14" :class="{ 'pc-spin': loading }" />
          {{ loading ? 'Memuat...' : 'Muat ulang' }}
        </button>
        <button type="button" class="pc-btn pc-btn--primary" @click="openCreate">
          <Upload :size="14" />
          Import SVG
        </button>
      </template>
    </ConsolePageHeader>

    <div class="pc-stats">
      <div class="pc-stat pc-stat--blue">
        <p class="pc-stat__label">Total template</p>
        <p class="pc-stat__value">{{ formatNumber(stats.total) }}</p>
        <p class="pc-stat__hint">Seluruh baris di tabel Template</p>
      </div>
      <div class="pc-stat pc-stat--lime">
        <p class="pc-stat__label">Aktif</p>
        <p class="pc-stat__value">{{ formatNumber(stats.active) }}</p>
        <p class="pc-stat__hint">Tampil di pemilih template user</p>
      </div>
      <div class="pc-stat pc-stat--amber">
        <p class="pc-stat__label">Draft</p>
        <p class="pc-stat__value">{{ formatNumber(stats.draft) }}</p>
        <p class="pc-stat__hint">Belum dirilis ke user</p>
      </div>
      <div class="pc-stat pc-stat--pink">
        <p class="pc-stat__label">Khusus base</p>
        <p class="pc-stat__value">{{ formatNumber(stats.owned) }}</p>
        <p class="pc-stat__hint">Eksklusif milik satu base</p>
      </div>
    </div>

    <section class="pc-card">
      <div class="pc-card__head">
        <div>
          <h2 class="pc-card__title">Katalog template</h2>
          <p class="pc-card__desc">
            Template tanpa pemilik menjadi katalog bersama. Setelah pemilik dipilih, hanya base itu
            yang melihat template tersebut.
          </p>
        </div>
        <span class="pc-badge pc-badge--neutral">
          {{ formatNumber(filteredTemplates.length) }} dari {{ formatNumber(templates.length) }}
        </span>
      </div>

      <div class="pc-filters">
        <div class="pc-field pc-field--grow">
          <label class="pc-label" for="template-search">Cari template</label>
          <div class="template-input-icon">
            <Search :size="13" />
            <input
              id="template-search"
              v-model="search"
              class="pc-input"
              type="search"
              placeholder="Label, key, kategori, atau pemilik"
            />
          </div>
        </div>
        <div class="pc-field">
          <label class="pc-label" for="template-status-filter">Status</label>
          <select id="template-status-filter" v-model="statusFilter" class="pc-select">
            <option value="">Semua status</option>
            <option value="active">Aktif</option>
            <option value="draft">Draft</option>
            <option value="archived">Arsip</option>
          </select>
        </div>
        <div class="pc-field">
          <label class="pc-label" for="template-owner-filter">Pemilik</label>
          <select id="template-owner-filter" v-model="ownerFilter" class="pc-select">
            <option value="">Semua pemilik</option>
            <option value="__shared__">Katalog bersama</option>
            <option v-for="base in ownerOptions" :key="base.handle" :value="base.handle">
              {{ base.name }} ({{ base.handle }})
            </option>
          </select>
        </div>
        <div class="pc-field">
          <label class="pc-label" for="template-category-filter">Kategori</label>
          <select id="template-category-filter" v-model="categoryFilter" class="pc-select">
            <option value="">Semua kategori</option>
            <option v-for="category in categoryOptions" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="error" class="pc-card__body">
        <div class="pc-error">
          <AlertTriangle :size="16" />
          <div>
            <strong>Katalog template gagal dimuat.</strong>
            <p>{{ error }}</p>
          </div>
        </div>
        <button type="button" class="pc-btn pc-btn--ghost" @click="refreshPage">
          <RefreshCw :size="13" />
          Coba lagi
        </button>
      </div>

      <div v-else-if="loading && !templates.length" class="pc-card__body pc-stack">
        <div v-for="index in 5" :key="index" class="pc-skeleton pc-skeleton--line" />
      </div>

      <div v-else-if="!filteredTemplates.length" class="pc-empty">
        <span class="pc-empty__icon"><LayoutTemplate :size="18" /></span>
        <template v-if="templates.length">
          Tidak ada template yang cocok dengan filter ini.
        </template>
        <template v-else> Belum ada template. Import SVG pertama untuk memulai katalog. </template>
      </div>

      <div v-else class="pc-table-wrap">
        <table class="pc-table template-table">
          <thead>
            <tr>
              <th>Template</th>
              <th>Pemilik</th>
              <th>Status</th>
              <th>Versi</th>
              <th>Geometri</th>
              <th>Diperbarui</th>
              <th class="pc-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="template in filteredTemplates" :key="template.key">
              <td>
                <div class="template-cell">
                  <button
                    type="button"
                    class="template-thumb"
                    :aria-label="`Pratinjau ${template.label}`"
                    @click="openPreview(template)"
                  >
                    <img
                      v-if="template.thumbnail_url"
                      :src="template.thumbnail_url"
                      :alt="`Pratinjau ${template.label}`"
                      loading="lazy"
                    />
                    <span v-else class="template-thumb__empty"><ImageOff :size="15" /></span>
                  </button>
                  <span class="template-cell__meta">
                    <span class="pc-table__primary">{{ template.label }}</span>
                    <span class="pc-table__sub pc-mono">{{ template.key }}</span>
                    <span class="pc-table__sub">{{ template.category }}</span>
                  </span>
                </div>
              </td>
              <td>
                <span v-if="!template.base_id" class="pc-badge pc-badge--neutral">Bersama</span>
                <span v-else class="template-owner">
                  <span
                    class="template-owner__dot"
                    :style="{ background: template.base_color || 'currentColor' }"
                  />
                  <span>
                    <span class="template-owner__handle">{{ template.base_handle }}</span>
                    <span class="pc-table__sub">{{ template.base_name }}</span>
                  </span>
                </span>
              </td>
              <td>
                <ConsoleStatusBadge
                  :status="template.status"
                  :label="templateStatusLabel(template.status)"
                  :tone="templateStatusTone(template.status)"
                />
              </td>
              <td>
                <span class="pc-mono">v{{ template.version }}</span>
                <span class="pc-table__sub">
                  {{ template.slots_summary.max_lines }} baris/halaman
                </span>
              </td>
              <td>
                <div class="template-slots">
                  <span v-if="template.slots_summary.has_quote" class="pc-badge pc-badge--blue">
                    Kutipan
                  </span>
                  <span
                    v-if="template.slots_summary.warnings.length"
                    class="pc-badge pc-badge--warning"
                    :title="template.slots_summary.warnings.join(', ')"
                  >
                    {{ template.slots_summary.warnings.length }} peringatan
                  </span>
                  <span v-if="!template.slots_summary.has_quote" class="pc-small pc-muted">
                    Tanpa kutipan
                  </span>
                </div>
              </td>
              <td>
                {{ formatDate(template.updated_at) }}
                <span class="pc-table__sub">{{ template.width }} × {{ template.height }} px</span>
              </td>
              <td>
                <div class="pc-table__actions template-actions">
                  <button
                    type="button"
                    class="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon"
                    title="Pratinjau template"
                    @click="openPreview(template)"
                  >
                    <Eye :size="13" />
                  </button>
                  <button
                    type="button"
                    class="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon"
                    title="Edit metadata & pemilik"
                    @click="openEdit(template)"
                  >
                    <Pencil :size="13" />
                  </button>
                  <button
                    type="button"
                    class="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon"
                    title="Ganti SVG sumber"
                    @click="openReplace(template)"
                  >
                    <FileUp :size="13" />
                  </button>
                  <button
                    type="button"
                    class="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon"
                    title="Render ulang thumbnail"
                    :disabled="busyKey === template.key"
                    @click="regenerateThumbnail(template)"
                  >
                    <RefreshCw :size="13" :class="{ 'pc-spin': busyKey === template.key }" />
                  </button>
                  <button
                    type="button"
                    class="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon"
                    :title="
                      template.status === 'active'
                        ? 'Jadikan draft (sembunyikan dari user)'
                        : 'Aktifkan template'
                    "
                    :disabled="busyKey === template.key"
                    @click="toggleStatus(template)"
                  >
                    <Power :size="13" />
                  </button>
                  <button
                    type="button"
                    class="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon template-action--danger"
                    title="Arsipkan template"
                    :disabled="busyKey === template.key || template.status === 'archived'"
                    @click="archiveTemplate(template)"
                  >
                    <Archive :size="13" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <ConsoleDrawer
      v-model="previewOpen"
      eyebrow="Template detail"
      :title="previewTemplate?.label || 'Template'"
      :subtitle="previewTemplate?.key || ''"
    >
      <div v-if="previewTemplate" class="pc-stack">
        <div class="template-preview">
          <img
            v-if="previewTemplate.thumbnail_url"
            :src="previewTemplate.thumbnail_url"
            :alt="`Pratinjau ${previewTemplate.label}`"
          />
          <div v-else class="template-preview__empty">
            <ImageOff :size="20" />
            Thumbnail belum tersedia
          </div>
        </div>

        <div class="pc-inline">
          <ConsoleStatusBadge
            :status="previewTemplate.status"
            :label="templateStatusLabel(previewTemplate.status)"
            :tone="templateStatusTone(previewTemplate.status)"
          />
          <span class="pc-badge pc-badge--neutral">
            {{ previewTemplate.base_handle || 'Katalog bersama' }}
          </span>
          <span class="pc-badge pc-badge--blue">v{{ previewTemplate.version }}</span>
        </div>

        <dl class="pc-kv">
          <dt>Kategori</dt>
          <dd>{{ previewTemplate.category }}</dd>
          <dt>Dimensi</dt>
          <dd>{{ previewTemplate.width }} × {{ previewTemplate.height }} px (4:5)</dd>
          <dt>Kapasitas pesan</dt>
          <dd>{{ previewTemplate.slots_summary.max_lines }} baris per halaman</dd>
          <dt>Slot terpasang</dt>
          <dd class="template-slots">
            <span class="pc-badge pc-badge--success">Pesan</span>
            <span class="pc-badge pc-badge--neutral">User</span>
            <span class="pc-badge pc-badge--neutral">Waktu</span>
            <span class="pc-badge pc-badge--neutral">Footer</span>
            <span v-if="previewTemplate.slots_summary.has_quote" class="pc-badge pc-badge--blue">
              Kutipan
            </span>
          </dd>
          <dt>Peringatan</dt>
          <dd>
            <template v-if="previewTemplate.slots_summary.warnings.length">
              {{ previewTemplate.slots_summary.warnings.join(', ') }}
            </template>
            <span v-else class="pc-muted">Tidak ada</span>
          </dd>
          <dt>Checksum</dt>
          <dd class="pc-mono template-checksum">{{ previewTemplate.checksum || '—' }}</dd>
          <dt>Diperbarui</dt>
          <dd>{{ formatDateTime(previewTemplate.updated_at) }}</dd>
        </dl>

        <div class="pc-callout">
          <LayoutTemplate :size="15" />
          <div>
            Thumbnail dibuat dari SVG yang tersimpan. Mengganti SVG akan menaikkan versi hanya bila
            isinya berubah.
          </div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="pc-btn pc-btn--ghost" @click="previewOpen = false">
          Tutup
        </button>
        <button
          v-if="previewTemplate"
          type="button"
          class="pc-btn pc-btn--ghost"
          @click="openReplace(previewTemplate)"
        >
          <FileUp :size="14" />
          Ganti SVG
        </button>
        <button
          v-if="previewTemplate"
          type="button"
          class="pc-btn pc-btn--primary"
          @click="openEdit(previewTemplate)"
        >
          <Pencil :size="14" />
          Edit template
        </button>
      </template>
    </ConsoleDrawer>

    <ConsoleDialog
      v-model="formDialog.open"
      :title="formDialog.mode === 'create' ? 'Import template SVG' : 'Edit template'"
      :subtitle="
        formDialog.mode === 'create'
          ? 'SVG diukur otomatis, lalu thumbnail dirender dari file yang sama.'
          : `${formDialog.editingKey} — ubah metadata, status, atau pemilik base.`
      "
      eyebrow="Katalog kartu"
      :confirm-label="formDialog.mode === 'create' ? 'Import template' : 'Simpan perubahan'"
      :loading="formDialog.loading"
      :confirm-disabled="!formCanSubmit"
      :error="formDialog.error"
      @confirm="submitForm"
    >
      <div class="pc-dialog-grid">
        <div v-if="formDialog.mode === 'create'" class="pc-field pc-field--full">
          <label class="pc-label">File SVG</label>
          <div
            class="template-drop"
            :class="{ 'is-filled': formDialog.fileName }"
            role="button"
            tabindex="0"
            @click="triggerSvgInput"
            @keydown.enter.prevent="triggerSvgInput"
            @keydown.space.prevent="triggerSvgInput"
            @dragover.prevent
            @drop.prevent="onSvgDrop"
          >
            <input
              ref="svgInput"
              type="file"
              accept=".svg,image/svg+xml"
              class="template-file-input"
              @change="onSvgPicked"
            />
            <Upload :size="18" />
            <span v-if="!formDialog.fileName">
              Klik atau tarik file <strong>.svg</strong> ke sini
            </span>
            <span v-else>
              <strong>{{ formDialog.fileName }}</strong>
              · {{ formatFileSize(formDialog.fileSize) }}
            </span>
          </div>
          <p class="pc-help">
            Maksimal 2MB. Rasio wajib 4:5 dan SVG harus punya id
            <span class="pc-mono">#editable-message</span>,
            <span class="pc-mono">#editable-footer</span>, serta
            <span class="pc-mono">#editable-user</span> +
            <span class="pc-mono">#editable-time</span> (atau grup
            <span class="pc-mono">#editable-meta</span>).
          </p>
        </div>

        <div v-if="formDialog.mode === 'create'" class="pc-field pc-field--full">
          <div class="template-ai">
            <div class="template-ai__head">
              <div>
                <p class="template-ai__title">
                  <Sparkles :size="14" />
                  Isi otomatis dengan AI
                </p>
                <p class="pc-help">
                  Usulan label, deskripsi, dan kategori dari teks di dalam SVG. Hasilnya hanya
                  usulan — tinjau per field sebelum menyimpan.
                </p>
              </div>
              <button
                type="button"
                class="pc-btn pc-btn--ghost"
                :disabled="formDialog.aiLoading || !formDialog.svg"
                @click="suggestMetadataWithAi"
              >
                <RefreshCw v-if="formDialog.aiLoading" :size="14" class="pc-spin" />
                <Sparkles v-else :size="14" />
                {{ formDialog.aiLoading ? 'Menyusun…' : 'Isi otomatis (AI)' }}
              </button>
            </div>

            <p v-if="formDialog.aiError" class="template-ai__error">{{ formDialog.aiError }}</p>

            <div v-if="formDialog.aiSuggestion" class="template-ai__panel">
              <div class="template-ai__meta">
                <span class="template-ai__badge">Keyakinan {{ aiConfidence }}%</span>
                <span v-if="formDialog.aiSuggestion.cached">Dari cache</span>
                <span v-else>
                  {{ formDialog.aiSuggestion.provider }} · {{ formDialog.aiSuggestion.model }}
                </span>
                <span>{{ formDialog.aiSuggestion.texts_used }} baris teks dianalisis</span>
              </div>

              <div v-for="field in aiFields" :key="field.key" class="template-ai__row">
                <div class="template-ai__copy">
                  <p class="template-ai__label">{{ field.label }}</p>
                  <p class="template-ai__value">{{ field.value }}</p>
                </div>
                <button
                  type="button"
                  class="pc-btn pc-btn--ghost pc-btn--sm"
                  @click="applyAiField(field.key)"
                >
                  Terapkan
                </button>
              </div>

              <div class="template-ai__foot">
                <p v-if="formDialog.aiSuggestion.rationale" class="pc-help">
                  {{ formDialog.aiSuggestion.rationale }}
                </p>
                <button type="button" class="pc-btn pc-btn--primary pc-btn--sm" @click="applyAiAll">
                  Terapkan semua
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="pc-field">
          <label class="pc-label" for="template-key">Key</label>
          <input
            id="template-key"
            v-model="formDialog.key"
            class="pc-input pc-mono"
            type="text"
            maxlength="64"
            placeholder="13-papan-kampus"
            :readonly="formDialog.mode === 'edit'"
          />
          <p class="pc-help">
            Huruf kecil, angka, tanda hubung. Key tidak dapat diubah setelah import.
          </p>
        </div>

        <div class="pc-field">
          <label class="pc-label" for="template-label">Label</label>
          <input
            id="template-label"
            v-model="formDialog.label"
            class="pc-input"
            type="text"
            maxlength="80"
            placeholder="Papan Kampus"
          />
          <p class="pc-help">Kosongkan untuk menurunkan label otomatis dari key.</p>
        </div>

        <div class="pc-field pc-field--full">
          <label class="pc-label" for="template-description">Deskripsi</label>
          <textarea
            id="template-description"
            v-model="formDialog.description"
            class="pc-textarea"
            rows="2"
            maxlength="240"
            placeholder="Tampil sebagai keterangan di pemilih template user."
          />
        </div>

        <div class="pc-field">
          <label class="pc-label" for="template-category">Kategori</label>
          <input
            id="template-category"
            v-model="formDialog.category"
            class="pc-input"
            type="text"
            list="template-category-options"
            maxlength="40"
            placeholder="campus"
          />
          <datalist id="template-category-options">
            <option value="campus"></option>
            <option value="classic"></option>
            <option value="playful"></option>
            <option value="editorial"></option>
          </datalist>
        </div>

        <div class="pc-field">
          <label class="pc-label" for="template-status">Status</label>
          <select id="template-status" v-model="formDialog.status" class="pc-select">
            <option value="draft">Draft — belum tampil</option>
            <option value="active">Aktif — tampil ke user</option>
            <option v-if="formDialog.mode === 'edit'" value="archived">
              Arsip — disembunyikan
            </option>
          </select>
        </div>

        <div class="pc-field">
          <label class="pc-label" for="template-owner">Pemilik</label>
          <select id="template-owner" v-model="formDialog.base_handle" class="pc-select">
            <option value="">Katalog bersama (semua base)</option>
            <option v-for="base in ownerOptions" :key="base.handle" :value="base.handle">
              {{ base.name }} ({{ base.handle }})
            </option>
          </select>
          <p class="pc-help">Base lain tidak akan melihat template ini.</p>
        </div>

        <div class="pc-field">
          <label class="pc-label" for="template-sort">Urutan tampil</label>
          <input
            id="template-sort"
            v-model="formDialog.sort_order"
            class="pc-input"
            type="number"
            min="0"
            max="99999"
            step="1"
            placeholder="Otomatis"
          />
          <p class="pc-help">Angka kecil tampil lebih dulu di katalog.</p>
        </div>
      </div>

      <div class="pc-callout" style="margin-top: 12px">
        <Sparkles :size="15" />
        <div>
          Thumbnail PNG 540px dirender otomatis dari SVG ini dan disimpan ke Supabase Storage. Tidak
          ada script manual yang perlu dijalankan.
        </div>
      </div>
    </ConsoleDialog>

    <ConsoleDialog
      v-model="replaceDialog.open"
      title="Ganti SVG sumber"
      :subtitle="
        replaceDialog.template
          ? `${replaceDialog.template.label} — versi ${replaceDialog.template.version}`
          : ''
      "
      eyebrow="Desain template"
      confirm-label="Ganti SVG"
      tone="blue"
      :loading="replaceDialog.loading"
      :confirm-disabled="replaceDialog.loading || !replaceSvgReady"
      :error="replaceDialog.error"
      @confirm="submitReplace"
    >
      <div v-if="replaceDialog.template" class="pc-summary">
        <div class="pc-summary__row">
          <span class="pc-summary__label">Template</span>
          <span class="pc-summary__value">{{ replaceDialog.template.label }}</span>
        </div>
        <div class="pc-summary__row">
          <span class="pc-summary__label">Versi saat ini</span>
          <span class="pc-summary__value">v{{ replaceDialog.template.version }}</span>
        </div>
      </div>

      <div
        class="template-drop"
        :class="{ 'is-filled': replaceDialog.fileName }"
        role="button"
        tabindex="0"
        @click="triggerReplaceInput"
        @keydown.enter.prevent="triggerReplaceInput"
        @keydown.space.prevent="triggerReplaceInput"
        @dragover.prevent
        @drop.prevent="onReplaceDrop"
      >
        <input
          ref="replaceInput"
          type="file"
          accept=".svg,image/svg+xml"
          class="template-file-input"
          @change="onReplacePicked"
        />
        <FileUp :size="18" />
        <span v-if="!replaceDialog.fileName">
          Klik atau tarik file <strong>.svg</strong> pengganti
        </span>
        <span v-else>
          <strong>{{ replaceDialog.fileName }}</strong>
          · {{ formatFileSize(replaceDialog.fileSize) }}
        </span>
      </div>

      <div class="pc-callout pc-callout--warning" style="margin-top: 12px">
        <AlertTriangle :size="15" />
        <div>
          Versi naik hanya bila checksum SVG berubah. Thumbnail dirender ulang otomatis dan fess
          lama tetap memakai desain yang tersimpan saat dibuat.
        </div>
      </div>
    </ConsoleDialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import {
  AlertTriangle,
  Archive,
  Eye,
  FileUp,
  ImageOff,
  LayoutTemplate,
  Pencil,
  Power,
  RefreshCw,
  Search,
  Sparkles,
  Upload,
} from 'lucide-vue-next';
import { api } from '../../api';
import { confirmDialog } from '../../composables/useAppDialog';
import { toast } from '../../composables/useToast';
import ConsoleDialog from '../../components/super-admin/ConsoleDialog.vue';
import ConsoleDrawer from '../../components/super-admin/ConsoleDrawer.vue';
import ConsolePageHeader from '../../components/super-admin/ConsolePageHeader.vue';
import ConsoleStatusBadge from '../../components/super-admin/ConsoleStatusBadge.vue';
import { formatDate, formatDateTime, formatNumber } from '../../utils/console';

const MAX_SVG_BYTES = 2 * 1024 * 1024;
const KEY_PATTERN = /^[a-z0-9][a-z0-9-]{1,63}$/;

const templates = ref([]);
const bases = ref([]);
const loading = ref(false);
const error = ref('');
const search = ref('');
const statusFilter = ref('');
const ownerFilter = ref('');
const categoryFilter = ref('');
const busyKey = ref('');

const svgInput = ref(null);
const replaceInput = ref(null);

const previewOpen = ref(false);
const previewTemplate = ref(null);

const formDialog = reactive({
  open: false,
  mode: 'create',
  editingKey: '',
  loading: false,
  error: '',
  key: '',
  label: '',
  description: '',
  category: 'campus',
  status: 'draft',
  base_handle: '',
  sort_order: '',
  svg: '',
  fileName: '',
  fileSize: 0,
  // Usulan AI punya state sendiri supaya proses simpan & proses usul tidak saling mengunci.
  aiLoading: false,
  aiError: '',
  aiSuggestion: null,
});

const replaceDialog = reactive({
  open: false,
  template: null,
  loading: false,
  error: '',
  svg: '',
  fileName: '',
  fileSize: 0,
});

const stats = computed(() => {
  const rows = templates.value;
  return {
    total: rows.length,
    active: rows.filter((row) => row.status === 'active').length,
    draft: rows.filter((row) => row.status === 'draft').length,
    owned: rows.filter((row) => Boolean(row.base_id)).length,
  };
});

const healthLabel = computed(() => {
  if (!templates.value.length) return 'Katalog kosong';
  return `${formatNumber(stats.value.active)} aktif · ${formatNumber(templates.value.length)} total`;
});

const ownerOptions = computed(() => {
  const map = new Map();
  bases.value.forEach((base) => {
    if (base?.handle) {
      map.set(base.handle, { handle: base.handle, name: base.name || base.handle });
    }
  });
  templates.value.forEach((template) => {
    if (template.base_handle && !map.has(template.base_handle)) {
      map.set(template.base_handle, {
        handle: template.base_handle,
        name: template.base_name || template.base_handle,
      });
    }
  });
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
});

const categoryOptions = computed(() => {
  const set = new Set(templates.value.map((row) => String(row.category || '').trim()));
  set.delete('');
  return [...set].sort();
});

const filteredTemplates = computed(() => {
  const term = search.value.trim().toLowerCase();
  return templates.value.filter((template) => {
    if (statusFilter.value && template.status !== statusFilter.value) return false;
    if (categoryFilter.value && template.category !== categoryFilter.value) return false;
    if (ownerFilter.value === '__shared__' && template.base_id) return false;
    if (
      ownerFilter.value &&
      ownerFilter.value !== '__shared__' &&
      template.base_handle !== ownerFilter.value
    ) {
      return false;
    }
    if (!term) return true;
    return [
      template.key,
      template.label,
      template.description,
      template.category,
      template.base_handle,
      template.base_name,
    ].some((value) =>
      String(value || '')
        .toLowerCase()
        .includes(term),
    );
  });
});

const formCanSubmit = computed(() => {
  if (formDialog.loading) return false;
  if (formDialog.mode === 'edit') return true;
  if (!formDialog.svg) return false;
  return KEY_PATTERN.test(formDialog.key) && !formDialog.key.endsWith('-');
});

const replaceSvgReady = computed(() => Boolean(replaceDialog.svg));

/** Persentase keyakinan usulan AI (dibulatkan untuk badge). */
const aiConfidence = computed(() =>
  Math.round((Number(formDialog.aiSuggestion?.confidence) || 0) * 100),
);

/** Field yang bisa diterapkan satu per satu dari panel usulan. */
const aiFields = computed(() => {
  const suggestion = formDialog.aiSuggestion;
  if (!suggestion) return [];
  return [
    { key: 'label', label: 'Label', value: suggestion.label },
    { key: 'description', label: 'Deskripsi', value: suggestion.description },
    { key: 'category', label: 'Kategori', value: suggestion.category },
  ];
});

function apiError(err) {
  const fields = err?.data?.errors;
  if (fields && typeof fields === 'object') {
    const first = Object.values(fields).find(Boolean);
    if (first && first !== err?.message) return `${err.message} ${first}`;
  }
  return err?.message || 'Terjadi kesalahan. Coba lagi.';
}

function templateStatusLabel(status) {
  if (status === 'active') return 'Aktif';
  if (status === 'draft') return 'Draft';
  if (status === 'archived') return 'Arsip';
  return status || '—';
}

function templateStatusTone(status) {
  if (status === 'active') return 'success';
  if (status === 'draft') return 'warning';
  if (status === 'archived') return 'neutral';
  return 'neutral';
}

function formatFileSize(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(2)} MB`;
}

function slugifyKey(name) {
  return String(name || '')
    .replace(/\.svg$/i, '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
    .replace(/-+$/g, '');
}

function labelFromKey(key) {
  return String(key || '')
    .replace(/^\d+-/, '')
    .split('-')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

async function readSvg(file) {
  if (!file) return null;
  const isSvg =
    /\.svg$/i.test(file.name || '') || String(file.type || '').includes('image/svg+xml');
  if (!isSvg) {
    throw new Error('Pilih file berekstensi .svg.');
  }
  if (file.size > MAX_SVG_BYTES) {
    throw new Error('Ukuran SVG melebihi 2MB.');
  }
  const text = await file.text();
  if (!/<svg[\s>]/i.test(text)) {
    throw new Error('File tidak mengandung elemen <svg>.');
  }
  return { text, name: file.name || 'template.svg', size: file.size };
}

async function loadTemplates() {
  loading.value = true;
  error.value = '';
  try {
    const res = await api.getAdminTemplates();
    templates.value = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  } catch (err) {
    error.value = err?.message || 'Gagal memuat katalog template.';
  } finally {
    loading.value = false;
  }
}

async function loadBases() {
  try {
    const res = await api.getBases({ page: 1, limit: 100 });
    bases.value = Array.isArray(res?.data) ? res.data : [];
  } catch {
    bases.value = [];
  }
}

async function refreshPage() {
  await Promise.all([loadTemplates(), loadBases()]);
}

function resetFormDialog() {
  formDialog.mode = 'create';
  formDialog.editingKey = '';
  formDialog.error = '';
  formDialog.loading = false;
  formDialog.key = '';
  formDialog.label = '';
  formDialog.description = '';
  formDialog.category = 'campus';
  formDialog.status = 'draft';
  formDialog.base_handle = '';
  formDialog.sort_order = '';
  formDialog.svg = '';
  formDialog.fileName = '';
  formDialog.fileSize = 0;
  formDialog.aiLoading = false;
  formDialog.aiError = '';
  formDialog.aiSuggestion = null;
  if (svgInput.value) svgInput.value.value = '';
}

function openCreate() {
  resetFormDialog();
  formDialog.open = true;
}

function openEdit(template) {
  if (!template) return;
  formDialog.mode = 'edit';
  formDialog.editingKey = template.key;
  formDialog.key = template.key;
  formDialog.label = template.label || '';
  formDialog.description = template.description || '';
  formDialog.category = template.category || 'campus';
  formDialog.status =
    template.status === 'archived' ? 'archived' : template.status === 'active' ? 'active' : 'draft';
  formDialog.base_handle = template.base_handle || '';
  formDialog.sort_order =
    typeof template.sort_order === 'number' ? String(template.sort_order) : '';
  formDialog.svg = '';
  formDialog.fileName = '';
  formDialog.fileSize = 0;
  formDialog.aiLoading = false;
  formDialog.aiError = '';
  formDialog.aiSuggestion = null;
  formDialog.error = '';
  formDialog.loading = false;
  previewOpen.value = false;
  formDialog.open = true;
}

function triggerSvgInput() {
  svgInput.value?.click();
}

function triggerReplaceInput() {
  replaceInput.value?.click();
}

async function applySvgFile(file, target) {
  const parsed = await readSvg(file);
  if (!parsed) return;

  target.svg = parsed.text;
  target.fileName = parsed.name;
  target.fileSize = parsed.size;

  if (target === formDialog) {
    // Usulan lama milik SVG sebelumnya — jangan tampilkan untuk file baru.
    formDialog.aiSuggestion = null;
    formDialog.aiError = '';
    if (!formDialog.key.trim()) {
      const key = slugifyKey(parsed.name);
      formDialog.key = key;
      if (!formDialog.label.trim()) formDialog.label = labelFromKey(key);
    } else if (!formDialog.label.trim()) {
      formDialog.label = labelFromKey(formDialog.key);
    }
  }
}

async function onSvgPicked(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  formDialog.error = '';
  try {
    await applySvgFile(file, formDialog);
  } catch (err) {
    formDialog.error = err?.message || 'File SVG tidak valid.';
  }
}

async function onSvgDrop(event) {
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  formDialog.error = '';
  try {
    await applySvgFile(file, formDialog);
  } catch (err) {
    formDialog.error = err?.message || 'File SVG tidak valid.';
  }
}

/**
 * Minta usulan metadata dari backend. Hanya mengirim SVG yang sedang diimpor —
 * tidak menyimpan apa pun, jadi admin tetap meninjau tiap field.
 */
async function suggestMetadataWithAi() {
  if (formDialog.aiLoading || !formDialog.svg) return;
  formDialog.aiError = '';
  formDialog.aiLoading = true;
  try {
    const response = await api.suggestAdminTemplateMetadata({
      svg: formDialog.svg,
      key: formDialog.key.trim() || undefined,
      filename: formDialog.fileName || undefined,
    });
    const suggestion = response?.data;
    if (!suggestion) throw new Error('Usulan AI kosong. Coba lagi.');
    formDialog.aiSuggestion = suggestion;
  } catch (err) {
    formDialog.aiSuggestion = null;
    formDialog.aiError = apiError(err);
  } finally {
    formDialog.aiLoading = false;
  }
}

/** Salin satu field usulan ke form (tidak menyimpan ke server). */
function applyAiField(field) {
  const suggestion = formDialog.aiSuggestion;
  if (!suggestion) return;
  if (field === 'label') formDialog.label = suggestion.label || '';
  else if (field === 'description') formDialog.description = suggestion.description || '';
  else if (field === 'category') formDialog.category = suggestion.category || 'campus';
}

function applyAiAll() {
  aiFields.value.forEach((field) => applyAiField(field.key));
}

async function submitForm() {
  if (!formCanSubmit.value) return;
  formDialog.error = '';
  formDialog.loading = true;

  const payload = {
    label: formDialog.label.trim() || undefined,
    description: formDialog.description.trim() || null,
    category: formDialog.category.trim() || 'campus',
    status: formDialog.status,
    base_handle: formDialog.base_handle || null,
    sort_order:
      formDialog.sort_order === '' || formDialog.sort_order === null
        ? undefined
        : Number(formDialog.sort_order),
  };

  try {
    if (formDialog.mode === 'create') {
      await api.createAdminTemplate({
        key: formDialog.key.trim(),
        svg: formDialog.svg,
        ...payload,
      });
      toast.success(`Template ${formDialog.key} berhasil diimpor.`);
    } else {
      await api.updateAdminTemplate(formDialog.editingKey, payload);
      toast.success(`Template ${formDialog.editingKey} diperbarui.`);
    }
    formDialog.open = false;
    await loadTemplates();
  } catch (err) {
    formDialog.error = apiError(err);
  } finally {
    formDialog.loading = false;
  }
}

function openReplace(template) {
  if (!template) return;
  previewOpen.value = false;
  replaceDialog.template = template;
  replaceDialog.svg = '';
  replaceDialog.fileName = '';
  replaceDialog.fileSize = 0;
  replaceDialog.error = '';
  replaceDialog.loading = false;
  replaceDialog.open = true;
  if (replaceInput.value) replaceInput.value.value = '';
}

async function applyReplaceFile(file) {
  const parsed = await readSvg(file);
  if (!parsed) return;
  replaceDialog.svg = parsed.text;
  replaceDialog.fileName = parsed.name;
  replaceDialog.fileSize = parsed.size;
}

async function onReplacePicked(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  replaceDialog.error = '';
  try {
    await applyReplaceFile(file);
  } catch (err) {
    replaceDialog.error = err?.message || 'File SVG tidak valid.';
  }
}

async function onReplaceDrop(event) {
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  replaceDialog.error = '';
  try {
    await applyReplaceFile(file);
  } catch (err) {
    replaceDialog.error = err?.message || 'File SVG tidak valid.';
  }
}

async function submitReplace() {
  if (!replaceDialog.template || !replaceSvgReady.value) return;
  replaceDialog.loading = true;
  replaceDialog.error = '';
  try {
    const updated = await api.replaceAdminTemplateSvg(replaceDialog.template.key, {
      svg: replaceDialog.svg,
    });
    const result = updated?.data || updated;
    toast.success(
      result?.version
        ? `SVG diganti. Template sekarang versi ${result.version}.`
        : 'SVG template berhasil diganti.',
    );
    replaceDialog.open = false;
    await loadTemplates();
  } catch (err) {
    replaceDialog.error = apiError(err);
  } finally {
    replaceDialog.loading = false;
  }
}

async function regenerateThumbnail(template) {
  if (!template || busyKey.value) return;
  busyKey.value = template.key;
  try {
    await api.regenerateAdminTemplateThumbnail(template.key);
    toast.success(`Thumbnail ${template.key} dirender ulang.`);
    await loadTemplates();
  } catch (err) {
    toast.error(apiError(err));
  } finally {
    busyKey.value = '';
  }
}

async function toggleStatus(template) {
  if (!template || busyKey.value) return;
  const nextStatus = template.status === 'active' ? 'draft' : 'active';
  busyKey.value = template.key;
  try {
    await api.updateAdminTemplate(template.key, { status: nextStatus });
    toast.success(
      nextStatus === 'active'
        ? `${template.label} diaktifkan.`
        : `${template.label} disembunyikan sebagai draft.`,
    );
    await loadTemplates();
  } catch (err) {
    toast.error(apiError(err));
  } finally {
    busyKey.value = '';
  }
}

async function archiveTemplate(template) {
  if (!template || template.status === 'archived' || busyKey.value) return;
  const confirmed = await confirmDialog({
    title: 'Arsipkan template',
    message: `Template "${template.label}" akan hilang dari pemilih user.`,
    detail:
      'Template tidak dihapus permanen. Fess lama tetap dapat dirender, dan template bisa dipulihkan lewat Edit → status.',
    variant: 'warning',
    confirmLabel: 'Arsipkan',
  });
  if (!confirmed) return;

  busyKey.value = template.key;
  try {
    await api.archiveAdminTemplate(template.key);
    toast.success(`${template.label} diarsipkan.`);
    previewOpen.value = false;
    await loadTemplates();
  } catch (err) {
    toast.error(apiError(err));
  } finally {
    busyKey.value = '';
  }
}

function openPreview(template) {
  if (!template) return;
  previewTemplate.value = template;
  previewOpen.value = true;
}

onMounted(() => {
  refreshPage();
});
</script>

<style scoped>
.template-input-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.template-input-icon > svg {
  position: absolute;
  left: 10px;
  color: var(--text-muted);
  pointer-events: none;
}

.template-input-icon .pc-input {
  padding-left: 30px;
}

.template-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 210px;
}

.template-thumb {
  width: 42px;
  height: 52px;
  flex: 0 0 auto;
  overflow: hidden;
  padding: 0;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  background: var(--bg-inset);
  cursor: pointer;
}

.template-thumb:hover {
  border-color: var(--lime-primary);
}

.template-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-thumb__empty {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  color: var(--text-muted);
}

.template-cell__meta {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.template-cell__meta .pc-table__primary,
.template-cell__meta .pc-table__sub {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-owner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.template-owner__dot {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border: 1px solid var(--border-strong);
  border-radius: 50%;
}

.template-owner__handle {
  display: block;
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 800;
}

.template-slots {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.template-actions {
  flex-wrap: nowrap;
  gap: 2px;
  justify-content: flex-end;
}

.template-actions .pc-btn--icon {
  width: 26px;
  height: 26px;
}

.template-action--danger {
  color: var(--danger-text);
}

.template-action--danger:hover:not(:disabled) {
  border-color: var(--danger);
  color: var(--danger-text);
}

.template-drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 18px 14px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-md);
  background: var(--bg-inset);
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.5;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    color 0.15s ease;
}

.template-drop:hover,
.template-drop.is-filled {
  border-color: var(--lime-primary);
  color: var(--text-secondary);
}

.template-drop strong {
  color: var(--text-main);
  font-size: 11px;
}

.template-drop:focus-visible {
  outline: 2px solid var(--lime-primary);
  outline-offset: 2px;
}

.template-file-input {
  display: none;
}

.template-ai {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--bg-inset);
}

.template-ai__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.template-ai__title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 2px;
  color: var(--text-main);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.template-ai__title svg {
  color: var(--lime-primary);
}

.template-ai__error {
  margin: 0;
  color: var(--danger-text);
  font-size: 11px;
  line-height: 1.5;
}

.template-ai__panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px dashed var(--border-subtle);
}

.template-ai__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  color: var(--text-muted);
  font-size: 10px;
}

.template-ai__badge {
  padding: 2px 8px;
  border: 1px solid var(--lime-primary);
  border-radius: 999px;
  color: var(--text-main);
  font-weight: 800;
}

.template-ai__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  background: var(--bg-surface-2);
}

.template-ai__copy {
  min-width: 0;
}

.template-ai__label {
  margin: 0 0 2px;
  color: var(--text-muted);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.template-ai__value {
  margin: 0;
  color: var(--text-main);
  font-size: 12px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.template-ai__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.template-ai__foot .pc-help {
  flex: 1 1 200px;
  margin: 0;
}

.template-preview {
  overflow: hidden;
  aspect-ratio: 4 / 5;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--bg-inset);
}

.template-preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-preview__empty {
  display: grid;
  height: 100%;
  place-items: center;
  gap: 6px;
  color: var(--text-muted);
  font-size: 11px;
}

.template-checksum {
  word-break: break-all;
  font-size: 9px;
}

@media (max-width: 760px) {
  .template-actions {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .template-cell {
    min-width: 160px;
  }

  .template-cell__meta .pc-table__primary,
  .template-cell__meta .pc-table__sub {
    max-width: 150px;
  }
}
</style>
