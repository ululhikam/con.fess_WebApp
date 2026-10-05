<template>
  <AdminCard title="Pengaturan Auto-Base">
    <form class="settings-form flex flex-col gap-4" @submit.prevent>
      <AdminTextField
        v-for="field in fields"
        :key="field.key"
        v-model="form[field.key]"
        :label="field.label"
        type="text"
      />

      <AdminButton variant="blue" class="settings-save mt-2">Simpan Perubahan</AdminButton>
    </form>
  </AdminCard>
</template>

<script setup>
/**
 * AutoBaseSettingsCard — editable base settings form.
 * The form model lives in useBaseSettings(); submit is inert until an API
 * endpoint exists (matches the previous behaviour).
 */
import AdminCard from './AdminCard.vue';
import AdminButton from './AdminButton.vue';
import AdminTextField from './AdminTextField.vue';
import { useBaseSettings } from '../../composables/useAdminDashboard';
import { BASE_SETTINGS_FIELDS } from '../../data/adminData';

defineProps({
  fields: { type: Array, default: () => BASE_SETTINGS_FIELDS },
});

const { form } = useBaseSettings();
</script>

<style scoped>
.settings-form {
  max-width: 576px;
}

.settings-save {
  align-self: flex-start;
}
</style>
