<template>
  <div class="base-club-admin">
    <!-- Navbar Header -->
    <nav class="admin-nav">
      <div class="container flex items-center justify-between flex-wrap gap-3">
        <router-link to="/" class="brand-logo">
          <div class="speech-bubble-logo">
            <span class="logo-base">BASE</span>
            <span class="logo-club">CLUB</span>
          </div>
        </router-link>

        <div class="nav-pill-container">
          <router-link to="/feed" class="nav-pill">Feed</router-link>
          <router-link to="/profile" class="nav-pill">Profil Saya</router-link>
          <router-link to="/base-admin" class="nav-pill active-pill">Base Admin</router-link>
          <router-link v-if="authStore.isSuperAdmin" to="/super-admin" class="nav-pill">Super Admin</router-link>
        </div>

        <div class="flex items-center gap-2">
          <!-- Role Selector Dropdown -->
          <div class="role-selector-wrapper flex items-center bg-black/30 border border-white/20 rounded-full px-2 py-1">
            <span class="text-xs text-white/70 mr-1 hidden sm:inline">Peran:</span>
            <select 
              :value="authStore.user?.role || 'User'" 
              @change="e => authStore.switchRole(e.target.value)"
              class="role-select-dropdown"
            >
              <option value="User">User / Anon</option>
              <option value="Base Admin">Base Admin</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>

          <button @click="handleLogout" class="btn-logout-pill text-xs">
            Keluar
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Admin Body -->
    <div class="container py-6 sm:py-8">
      <div class="admin-header-card mb-6">
        <div class="flex justify-between items-center flex-wrap gap-4 mb-4">
          <div>
            <h1 class="admin-page-title">Dasbor Base Admin — @codememfess</h1>
            <p class="text-xs text-muted">Kelola pesan anonim, moderasi otomatis, platform cross-post & keuangan komunitas</p>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button @click="activeTab = 'profil'" class="btn-outline-dark text-xs">
              Lihat Profil Base
            </button>
            <button @click="showNewBaseModal = true" class="btn-lime-pill text-xs">
              + Tambah Base Baru
            </button>
          </div>
        </div>

        <!-- Admin Navigation Bar (8 Navbar Tabs) -->
        <div class="admin-sub-navbar flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t">
          <button 
            v-for="tab in adminTabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['admin-nav-tab', activeTab === tab.id ? 'active-admin-tab' : '']"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- TAB 1: RINGKASAN (Overview & Analytics) -->
      <div v-if="activeTab === 'ringkasan'" class="tab-content flex flex-col gap-6">
        <div class="stats-grid-4">
          <div class="white-card p-5 stat-card">
            <span class="stat-title">Antrean Moderasi</span>
            <span class="stat-number text-blue">{{ pendingCount }}</span>
            <span class="text-xs text-muted mt-1">Perlu tindakan</span>
          </div>
          <div class="white-card p-5 stat-card">
            <span class="stat-title">Fess Disetujui</span>
            <span class="stat-number text-lime">{{ approvedCount }}</span>
            <span class="text-xs text-muted mt-1">Tayang di feed</span>
          </div>
          <div class="white-card p-5 stat-card">
            <span class="stat-title">Anggota Aktif</span>
            <span class="stat-number text-black">18.4K</span>
            <span class="text-xs text-muted mt-1">Pengirim & pembaca</span>
          </div>
          <div class="white-card p-5 stat-card">
            <span class="stat-title">Status Auto-Canvas</span>
            <span class="stat-number text-lime">100% SLA</span>
            <span class="text-xs text-muted mt-1">Meta API Connected</span>
          </div>
        </div>

        <div class="white-card p-6">
          <h3 class="font-bold text-base text-black mb-2">Ringkasan Performa Base</h3>
          <p class="text-xs text-muted mb-4">Grafik dan statistik lalu lintas pesan masuk 24 jam terakhir</p>
          <div class="chart-placeholder p-6 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center">
            <div class="w-full flex items-end justify-between gap-2 h-32 pt-4 px-4 border-b border-gray-300">
              <div class="bg-blue-600 w-full rounded-t" style="height: 40%"></div>
              <div class="bg-blue-600 w-full rounded-t" style="height: 65%"></div>
              <div class="bg-blue-600 w-full rounded-t" style="height: 90%"></div>
              <div class="bg-lime-500 w-full rounded-t" style="height: 100%"></div>
              <div class="bg-blue-600 w-full rounded-t" style="height: 75%"></div>
              <div class="bg-blue-600 w-full rounded-t" style="height: 85%"></div>
            </div>
            <span class="text-xs text-muted mt-3 font-semibold">Trafik Pesan Harian — Rata-rata 1.240 Fess / Hari</span>
          </div>
        </div>
      </div>

      <!-- TAB 2: KONTEN (Content Management) -->
      <div v-if="activeTab === 'konten'" class="tab-content">
        <div class="white-card p-6">
          <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h3 class="font-bold text-base text-black">Daftar Konten Confession Terbit</h3>
            <input v-model="contentSearch" type="text" class="cyber-input-sm" placeholder="Cari konten ID atau teks..." />
          </div>
          <div class="flex flex-col gap-3">
            <div 
              v-for="fess in fessStore.fesses" 
              :key="fess.id"
              class="p-4 rounded-xl border border-gray-200 bg-gray-50 flex justify-between items-center flex-wrap gap-3"
            >
              <div class="flex-1">
                <div class="text-xs font-bold text-blue mb-1">IDPes: #{{ fess.id }} • {{ fess.timestamp }}</div>
                <p class="text-xs text-gray-800 leading-relaxed">{{ fess.content }}</p>
              </div>
              <div class="flex gap-2">
                <button @click="exportCanvas(fess)" class="btn-action export">Canvas Card</button>
                <button @click="fessStore.rejectFess(fess.id)" class="btn-action reject">Sembunyikan</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: MODERASI (Moderation Queue) -->
      <div v-if="activeTab === 'moderasi'" class="tab-content">
        <div class="white-card p-6">
          <div class="card-section-title mb-4 flex justify-between items-center">
            <h3>Antrean Moderasi Fess</h3>
            <span class="text-xs text-muted">Batas Frekuensi: 5 fess / min</span>
          </div>

          <div class="moderation-queue flex flex-col gap-4">
            <div 
              v-for="fess in fessStore.fesses" 
              :key="fess.id"
              class="mod-item-card p-4 rounded-xl border flex justify-between items-center flex-wrap gap-4"
            >
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-bold text-xs text-blue">{{ fess.baseHandle }}</span>
                  <span class="text-xs text-muted">ID Anon: #{{ fess.id }} • {{ fess.timestamp }}</span>
                  <span :class="['status-chip', fess.status]">{{ fess.status.toUpperCase() }}</span>
                </div>
                <p class="text-sm text-black leading-relaxed">{{ fess.content }}</p>
              </div>

              <div class="flex items-center gap-2">
                <button 
                  v-if="fess.status !== 'approved'" 
                  @click="fessStore.approveFess(fess.id)" 
                  class="btn-action approve"
                >
                  Setujui
                </button>
                <button 
                  v-if="fess.status !== 'rejected'" 
                  @click="fessStore.rejectFess(fess.id)" 
                  class="btn-action reject"
                >
                  Tolak
                </button>
                <button @click="exportCanvas(fess)" class="btn-action export">
                  Export Canvas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: KOMUNITAS (Community & Members) -->
      <div v-if="activeTab === 'komunitas'" class="tab-content">
        <div class="white-card p-6">
          <h3 class="font-bold text-base text-black mb-4">Manajemen Komunitas & Moderator</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-4 rounded-xl border border-gray-200 bg-gray-50">
              <span class="text-xs font-bold text-muted block mb-2">MODERATOR AKTIF</span>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">M</div>
                <div>
                  <div class="text-sm font-bold text-black">BaseModerator_Code</div>
                  <div class="text-xs text-muted">Akses: Moderasi & Export</div>
                </div>
              </div>
            </div>
            <div class="p-4 rounded-xl border border-gray-200 bg-gray-50">
              <span class="text-xs font-bold text-muted block mb-2">ANGGOTA TERBLACKLST</span>
              <div class="text-sm font-bold text-gray-700">0 IP Terblokir</div>
              <div class="text-xs text-muted">Sistem AI auto-filter aktif</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 5: KEUANGAN (Financials & Tokenomics) -->
      <div v-if="activeTab === 'keuangan'" class="tab-content">
        <div class="white-card p-6">
          <h3 class="font-bold text-base text-black mb-2">Keuangan & Saldo $CLUB</h3>
          <p class="text-xs text-muted mb-4">Pendapatan komunitas dari kontribusi creator & auto-crossposting</p>
          <div class="p-5 rounded-2xl bg-blue-900 text-white flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
              <span class="text-xs opacity-80 uppercase font-bold">Total Saldo Treasury Base</span>
              <div class="text-3xl font-extrabold text-lime-400 mt-1">24.580 $CLUB</div>
            </div>
            <button class="btn-lime-pill">Penarikan Saldo (Payout)</button>
          </div>
        </div>
      </div>

      <!-- TAB 6: PENGATURAN (Base Settings) -->
      <div v-if="activeTab === 'pengaturan'" class="tab-content">
        <div class="white-card p-6">
          <h3 class="font-bold text-base text-black mb-4">Pengaturan Auto-Base</h3>
          <form @submit.prevent class="flex flex-col gap-4 max-w-xl">
            <div>
              <label class="text-xs font-bold text-black block mb-1">Nama Base</label>
              <input type="text" value="Code & Memes Base" class="cyber-input-sm" />
            </div>
            <div>
              <label class="text-xs font-bold text-black block mb-1">Handle Base</label>
              <input type="text" value="@codememfess" class="cyber-input-sm" />
            </div>
            <div>
              <label class="text-xs font-bold text-black block mb-1">Kata Kunci Auto-Routing</label>
              <input type="text" value="[code], [programming], [dev]" class="cyber-input-sm" />
            </div>
            <button class="btn-blue-pill w-fit mt-2">Simpan Perubahan</button>
          </form>
        </div>
      </div>

      <!-- TAB 7: KONEKSI PLATFORM (Platform Connections) -->
      <div v-if="activeTab === 'koneksi'" class="tab-content">
        <div class="white-card p-6">
          <h3 class="font-bold text-base text-black mb-4">Koneksi API & Platform Cross-Post</h3>
          <div class="flex flex-col gap-3">
            <div class="p-4 rounded-xl border border-gray-200 flex justify-between items-center">
              <div>
                <div class="font-bold text-sm text-black">Bot Twitter / X Auto-Post</div>
                <div class="text-xs text-muted">Status: Terhubung (@codememfess_bot)</div>
              </div>
              <span class="status-chip approved">CONNECTED</span>
            </div>
            <div class="p-4 rounded-xl border border-gray-200 flex justify-between items-center">
              <div>
                <div class="font-bold text-sm text-black">Instagram Graph API (Canvas Story)</div>
                <div class="text-xs text-muted">Status: Terhubung (OAuth2 Ready)</div>
              </div>
              <span class="status-chip approved">CONNECTED</span>
            </div>
            <div class="p-4 rounded-xl border border-gray-200 flex justify-between items-center">
              <div>
                <div class="font-bold text-sm text-black">Telegram Channel Webhook</div>
                <div class="text-xs text-muted">Status: Aktif</div>
              </div>
              <span class="status-chip approved">CONNECTED</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 8: LIHAT PROFIL BASE (View Base Profile Preview) -->
      <div v-if="activeTab === 'profil'" class="tab-content">
        <div class="white-card p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-base text-black">Pratinjau Profil Publik Base</h3>
            <span class="text-xs text-blue font-bold">Public View Preview</span>
          </div>
          <div class="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
            <div class="flex items-center gap-4 mb-3">
              <div class="w-14 h-14 rounded-2xl bg-lime-400 text-black flex items-center justify-center font-extrabold text-2xl">
                C
              </div>
              <div>
                <h2 class="text-xl font-bold text-white">Code & Memes Base</h2>
                <span class="text-xs text-lime-300 font-mono">@codememfess • 18.4K Anggota</span>
              </div>
            </div>
            <p class="text-xs text-gray-200 leading-relaxed mb-4">
              Base resmi komunitas developer, programmer, dan pengembang software. Kirim confession anonim dengan kata kunci [code]!
            </p>
            <button @click="router.push('/feed')" class="btn-lime-pill text-xs">
              Kunjungi Feed Base →
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFessStore } from '../stores/fessStore'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const fessStore = useFessStore()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

const activeTab = ref('ringkasan')
const contentSearch = ref('')
const showNewBaseModal = ref(false)

const adminTabs = [
  { id: 'ringkasan', label: 'Ringkasan' },
  { id: 'konten', label: 'Konten' },
  { id: 'moderasi', label: 'Moderasi' },
  { id: 'komunitas', label: 'Komunitas' },
  { id: 'keuangan', label: 'Keuangan' },
  { id: 'pengaturan', label: 'Pengaturan' },
  { id: 'koneksi', label: 'Koneksi Platform' },
  { id: 'profil', label: 'Lihat Profil Base' }
]

const pendingCount = computed(() => fessStore.fesses.filter(f => f.status === 'pending').length)
const approvedCount = computed(() => fessStore.fesses.filter(f => f.status === 'approved').length)

function exportCanvas(fess) {
  alert(`Kartu Canvas PNG untuk Confession #${fess.id} telah diexport ke Meta Auto-Poster!`)
}
</script>

<style scoped>
.base-club-admin {
  min-height: 100vh;
  background-color: #F4F5F8;
  color: #111827;
  font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
  padding-bottom: 60px;
}

.admin-nav {
  background-color: #0038FF;
  padding: 14px 0;
  box-shadow: 0 4px 20px rgba(0, 56, 255, 0.2);
}

.brand-logo { text-decoration: none; }

.speech-bubble-logo {
  background: #ffffff;
  color: #000000;
  padding: 5px 12px;
  border-radius: 14px 14px 14px 2px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 900;
  font-size: 14px;
}

.logo-club {
  background: #9EFF00;
  color: #000;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 12px;
}

.nav-pill-container {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 999px;
  padding: 4px 6px;
  display: flex;
  gap: 4px;
}

.nav-pill {
  color: #ffffff;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 999px;
  transition: all 0.2s;
  opacity: 0.85;
}

.nav-pill.active-pill, .nav-pill:hover {
  background: rgba(255, 255, 255, 0.25);
  opacity: 1;
}

.role-select-dropdown {
  background: transparent;
  color: #9EFF00;
  border: none;
  font-size: 11px;
  font-weight: 800;
  outline: none;
  cursor: pointer;
}

.role-select-dropdown option {
  background: #0B0D14;
  color: #ffffff;
}

.btn-logout-pill {
  background: rgba(255, 0, 122, 0.2);
  border: 1px solid #FF007A;
  color: #FF77BC;
  padding: 6px 14px;
  border-radius: 99px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout-pill:hover {
  background: #FF007A;
  color: #ffffff;
}

.badge-lime-pill {
  background: #9EFF00;
  color: #000;
  font-size: 10px;
  font-weight: 900;
  padding: 4px 12px;
  border-radius: 99px;
}

.admin-header-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
}

.admin-page-title {
  font-size: 22px;
  font-weight: 900;
  color: #000;
  margin-bottom: 2px;
}

.admin-nav-tab {
  background: transparent;
  border: none;
  color: #6B7280;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 99px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.admin-nav-tab.active-admin-tab, .admin-nav-tab:hover {
  background: #0038FF;
  color: #ffffff;
}

.white-card {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
}

.stats-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
}

.stat-title { font-size: 12px; color: #6B7280; font-weight: 600; }
.stat-number { font-size: 26px; font-weight: 900; }
.text-blue { color: #0038FF; }
.text-lime { color: #80D400; }

.mod-item-card {
  background: #F9FAFB;
  border-color: #E5E7EB;
}

.status-chip {
  font-size: 9px;
  font-weight: 900;
  padding: 2px 6px;
  border-radius: 4px;
}

.status-chip.approved { background: #DCFCE7; color: #166534; }
.status-chip.pending { background: #FEF3C7; color: #92400E; }
.status-chip.rejected { background: #FEE2E2; color: #991B1B; }

.btn-action {
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.btn-action.approve { background: #9EFF00; color: #000; }
.btn-action.reject { background: #FEE2E2; color: #991B1B; }
.btn-action.export { background: #0038FF; color: #fff; }

.btn-lime-pill {
  background: #9EFF00;
  color: #000000;
  border: none;
  padding: 10px 20px;
  border-radius: 99px;
  font-weight: 900;
  font-size: 12px;
  cursor: pointer;
}

.btn-blue-pill {
  background: #0038FF;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 99px;
  font-weight: 800;
  font-size: 12px;
  cursor: pointer;
}

.btn-outline-dark {
  background: transparent;
  border: 1px solid #D1D5DB;
  color: #374151;
  padding: 8px 16px;
  border-radius: 99px;
  font-weight: 700;
  cursor: pointer;
}

.cyber-input-sm {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .stats-grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
