<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div
        class="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-modal-title"
      >
        <header class="modal-header">
          <h2 id="schedule-modal-title" class="modal-title">Jadwalkan Posting</h2>
          <button type="button" class="modal-close" @click="close" aria-label="Tutup">
            <X :size="20" />
          </button>
        </header>

        <div class="modal-body">
          <div class="schedule-option">
            <label class="schedule-radio">
              <input type="radio" name="schedule" value="now" v-model="scheduleType" />
              <span class="schedule-radio__dot"></span>
              <span class="schedule-radio__label">Posting Sekarang</span>
            </label>

            <label class="schedule-radio">
              <input type="radio" name="schedule" value="later" v-model="scheduleType" />
              <span class="schedule-radio__dot"></span>
              <span class="schedule-radio__label">Jadwalkan Nanti</span>
            </label>
          </div>

          <div v-if="scheduleType === 'later'" class="schedule-datetime">
            <div class="datetime-field">
              <label for="schedule-date" class="datetime-label">Tanggal</label>
              <input
                type="date"
                id="schedule-date"
                v-model="dateValue"
                class="datetime-input"
                :min="today"
              />
            </div>
            <div class="datetime-field">
              <label for="schedule-time" class="datetime-label">Waktu</label>
              <input type="time" id="schedule-time" v-model="timeValue" class="datetime-input" />
            </div>

            <div class="schedule-preview">
              <span class="schedule-preview__label">Akan diposting:</span>
              <span class="schedule-preview__value">{{ formattedSchedule }}</span>
            </div>
          </div>

          <div class="schedule-quick" v-if="scheduleType === 'later'">
            <span class="schedule-quick__label">Cepat:</span>
            <div class="schedule-quick__buttons">
              <button
                type="button"
                v-for="opt in quickOptions"
                :key="opt.minutes"
                class="quick-btn"
                :class="{ active: isQuickActive(opt) }"
                @click="applyQuick(opt)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-secondary" @click="clearSchedule">Hapus Jadwal</button>
          <div style="flex: 1" />
          <button type="button" class="btn-secondary" @click="close">Batal</button>
          <button type="button" class="btn-primary" @click="confirm">Simpan</button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { X, Calendar, Clock, Check } from 'lucide-vue-next';

defineProps({
  show: { type: Boolean, default: false },
  date: { type: [String, null], default: null },
});

defineEmits(['update:show', 'update:date']);

const scheduleType = ref('now');
const dateValue = ref('');
const timeValue = ref('');

const today = computed(() => new Date().toISOString().split('T')[0]);

const quickOptions = [
  { minutes: 30, label: '30 menit' },
  { minutes: 60, label: '1 jam' },
  { minutes: 180, label: '3 jam' },
  { minutes: 1440, label: 'Besok' },
];

const formattedSchedule = computed(() => {
  if (!dateValue.value || !timeValue.value) return '—';
  const d = new Date(`${dateValue.value}T${timeValue.value}`);
  return d.toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

function isQuickActive(opt) {
  if (!dateValue.value || !timeValue.value) return false;
  const target = new Date(Date.now() + opt.minutes * 60000);
  return (
    target.toISOString().split('T')[0] === dateValue.value &&
    target.getHours() === parseInt(timeValue.value.split(':')[0]) &&
    target.getMinutes() === parseInt(timeValue.value.split(':')[1])
  );
}

function applyQuick(opt) {
  const target = new Date(Date.now() + opt.minutes * 60000);
  dateValue.value = target.toISOString().split('T')[0];
  timeValue.value = target.toTimeString().slice(0, 5);
  scheduleType.value = 'later';
}

function confirm() {
  if (scheduleType.value === 'later' && dateValue.value && timeValue.value) {
    const iso = `${dateValue.value}T${timeValue.value}:00`;
    emit('update:date', iso);
  } else {
    emit('update:date', null);
  }
  emit('update:show', false);
}

function clearSchedule() {
  emit('update:date', null);
  scheduleType.value = 'now';
  dateValue.value = '';
  timeValue.value = '';
}

function close() {
  emit('update:show', false);
}

watch(
  () => props.date,
  (val) => {
    if (val) {
      const d = new Date(val);
      dateValue.value = d.toISOString().split('T')[0];
      timeValue.value = d.toTimeString().slice(0, 5);
      scheduleType.value = 'later';
    } else {
      scheduleType.value = 'now';
      dateValue.value = '';
      timeValue.value = '';
    }
  },
  { immediate: true },
);

watch(
  () => props.show,
  (val) => {
    if (!val) {
      // Reset when closed without confirming
    }
  },
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-scrim);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
}

.modal-container {
  width: 100%;
  max-width: 380px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 48px var(--shadow-color);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.modal-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--bg-surface-2);
  color: var(--text-main);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.schedule-option {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.schedule-radio {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.schedule-radio:hover {
  border-color: var(--border-strong);
}

.schedule-radio input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.schedule-radio__dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.schedule-radio input:checked + .schedule-radio__dot {
  border-color: var(--brand-blue);
  background: var(--brand-blue);
}

.schedule-radio input:checked + .schedule-radio__dot::after {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--brand-blue-ink);
}

.schedule-radio__label {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-main);
}

.schedule-datetime {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.datetime-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.datetime-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.datetime-input {
  padding: 12px 14px;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  font-size: 14px;
  color: var(--text-main);
  outline: none;
}

.datetime-input:focus {
  border-color: var(--brand-blue);
}

.schedule-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--shell-chip);
  border-radius: 10px;
  font-size: 13px;
}

.schedule-preview__label {
  color: var(--text-muted);
}

.schedule-preview__value {
  font-weight: 700;
  color: var(--shell-text);
}

.schedule-quick {
  margin-top: 8px;
}

.schedule-quick__label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.schedule-quick__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-inset);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-btn:hover {
  border-color: var(--border-strong);
  color: var(--text-main);
}

.quick-btn.active {
  background: var(--brand-blue);
  border-color: var(--brand-blue);
  color: var(--brand-blue-ink);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-surface-2);
}
</style>
