<template>
  <AdminCard title="Pengaturan Auto-Base">
    <form class="settings-form flex flex-col gap-4" @submit.prevent="save">
      <AdminTextField
        v-for="field in fields"
        :key="field.key"
        v-model="form[field.key]"
        :label="field.label"
        type="text"
      />

      <p v-if="status.message" class="settings-status" :class="status.error ? 'is-error' : 'is-ok'">
        {{ status.message }}
      </p>

      <AdminButton variant="blue" class="settings-save mt-2" :disabled="saving">
        {{ saving ? 'Menyimpan…' : 'Simpan Perubahan' }}
      </AdminButton>
    </form>
  </AdminCard>
</template>

<script setup>
/**
 * AutoBaseSettingsCard — editable base settings form.
 * Persists through PATCH /bases/:handle/settings when a handle is provided;
 * without one the form stays local (preview mode).
 */
import { reactive, ref } from 'vue';
import AdminCard from './AdminCard.vue';
import AdminButton from './AdminButton.vue';
import AdminTextField from './AdminTextField.vue';
import { useBaseSettings, BASE_SETTINGS_FIELDS } from '../../composables/useAdminDashboard';
import { api } from '../../api';

const props = defineProps({
  fields: { type: Array, default: () => BASE_SETTINGS_FIELDS },
  /** Base handle to persist to; omit for a local-only preview. */
  handle: { type: String, default: '' },
  /** Initial values from the real base object. */
  initial: { type: Object, default: () => ({}) },
});

const { form } = useBaseSettings(props.fields, props.initial);
const saving = ref(false);
const status = reactive({ message: '', error: false });

async function save() {
  if (!props.handle) {
    status.message = 'Base tujuan belum ditentukan.';
    status.error = true;
    return;
  }

  saving.value = true;
  status.message = '';
  try {
    await api.updateBaseSettings(props.handle.replace(/^@/, ''), {
      name: form.name || undefined,
      handle: form.handle || undefined,
      keywords: form.keywords || null,
    });
    status.message = 'Pengaturan base tersimpan.';
    status.error = false;
  } catch (e) {
    status.message = e?.message || 'Gagal menyimpan pengaturan base.';
    status.error = true;
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.settings-form {
  max-width: 576px;
}

.settings-save {
  align-self: flex-start;
}

.settings-status {
  font-size: 12px;
  font-weight: 700;
}

.settings-status.is-ok {
  color: #10b981;
}

.settings-status.is-error {
  color: #ef4444;
}
</style>
