/**
 * src/composables/useValidatedForm.js
 * ---------------------------------------------------------------------------
 * Framework-agnostic form state: values, per-field errors, touched tracking
 * and an async submit pipeline. Keeping this out of the views means the
 * markup stays declarative and validation is testable in isolation.
 *
 * Usage:
 *   const form = useValidatedForm({
 *     email: { initial: '', rules: [required(), email()] },
 *     password: { initial: '', rules: [required(), minLength(8)] },
 *   })
 *
 *   <form @submit.prevent="form.submit(send)">
 *     <FormField :error="form.errors.email" ... />
 *   </form>
 *
 *   async function send(values) { await api.login(values) }
 */

import { reactive, ref, computed } from 'vue';

/* -------------------------------------------------------------------------- */
/* Rules                                                                       */
/* -------------------------------------------------------------------------- */

/** Each rule returns '' when valid, or a message when invalid. */
export const rules = {
  required:
    (message = 'Wajib diisi') =>
    (value) =>
      String(value ?? '').trim() ? '' : message,

  email:
    (message = 'Format email tidak valid') =>
    (value) =>
      !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : message,

  minLength: (min, message) => (value) =>
    String(value ?? '').length >= min ? '' : message || `Minimal ${min} karakter`,

  matches:
    (other, message = 'Tidak sama') =>
    (value, values) =>
      value === values[other] ? '' : message,
};

/* -------------------------------------------------------------------------- */
/* Form                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * @param {Record<string, { initial?: any, rules?: Array<(v: any, all: any) => string> }>} schema
 * @param {{ clearOnSuccess?: boolean }} options
 */
export function useValidatedForm(schema, options = {}) {
  const { clearOnSuccess = false } = options;

  const values = reactive(
    Object.fromEntries(Object.entries(schema).map(([key, def]) => [key, def.initial ?? ''])),
  );
  const errors = reactive({});
  const touched = reactive({});
  const submitting = ref(false);
  const submitError = ref(null);

  const fieldNames = Object.keys(schema);

  /** Pure check — never mutates state, safe to call from `computed`. */
  function errorFor(name) {
    for (const rule of schema[name].rules ?? []) {
      const message = rule(values[name], values);
      if (message) return message;
    }
    return '';
  }

  /** Validate one field and publish its error. */
  function validateField(name) {
    const message = errorFor(name);
    if (message) errors[name] = message;
    else delete errors[name];
    return !message;
  }

  /** Validate every field. Returns true when the form is submittable. */
  function validateAll() {
    let valid = true;
    fieldNames.forEach((name) => {
      if (!validateField(name)) valid = false;
    });
    return valid;
  }

  function touchAll() {
    fieldNames.forEach((name) => {
      touched[name] = true;
    });
  }

  const isValid = computed(() => fieldNames.every((name) => !errorFor(name)));

  /**
   * @param {(values: object) => Promise<any>|any} handler
   * @returns {Promise<boolean>} whether the submit succeeded
   */
  async function submit(handler) {
    submitError.value = null;
    touchAll();

    if (!validateAll()) return false;

    submitting.value = true;
    try {
      await handler({ ...values });
      if (clearOnSuccess) reset();
      return true;
    } catch (err) {
      submitError.value = err?.message || 'Terjadi kesalahan. Coba lagi.';
      return false;
    } finally {
      submitting.value = false;
    }
  }

  function reset() {
    fieldNames.forEach((name) => {
      values[name] = schema[name].initial ?? '';
      delete errors[name];
      touched[name] = false;
    });
    submitError.value = null;
  }

  return {
    values,
    errors,
    touched,
    submitting,
    submitError,
    isValid,
    validateField,
    validateAll,
    submit,
    reset,
  };
}
