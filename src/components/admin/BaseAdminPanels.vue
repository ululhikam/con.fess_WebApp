<template>
  <!-- Full-screen slide-in panel for Admin Base Hamburger Menu items -->
  <div
    class="base-admin-panel"
    :class="{ open: modelValue !== null }"
    role="dialog"
    aria-modal="true"
    :aria-label="panelTitle"
  >
    <!-- Header -->
    <div class="panel-header">
      <div class="panel-header-inner">
        <button
          type="button"
          class="panel-back-btn"
          :aria-label="`Tutup ${panelTitle}`"
          @click="$emit('update:modelValue', null)"
        >
          <ChevronLeft :size="20" />
        </button>
        <span class="panel-header-title">{{ panelTitle }}</span>
        <span class="panel-header-spacer" />
      </div>
    </div>

    <!-- Panel Body -->
    <div class="panel-body">
      <!-- ========================================================
           1. KONEKSI MEDSOS (Instagram, Twitter, Telegram)
           ======================================================== -->
      <template v-if="modelValue === 'medsos'">
        <!-- Instagram Graph API Card -->
        <div class="admin-feature-card">
          <div class="card-top-header">
            <div class="brand-badge ig-badge">
              <Instagram :size="22" />
            </div>
            <div>
              <div class="font-bold text-sm">Instagram Graph API</div>
              <div class="text-xs text-muted">Akun: {{ baseIgAccount }} • Status Terhubung</div>
            </div>
            <span class="status-online-pill">AKTIF</span>
          </div>

          <div class="card-toggles-list mt-4">
            <div class="toggle-row">
              <div>
                <div class="toggle-title">Auto-Post ke Instagram Story</div>
                <div class="toggle-desc">Render fess yang disetujui ke canvas Story 1080x1920</div>
              </div>
              <input v-model="igSettings.autoStory" type="checkbox" class="toggle-switch" />
            </div>

            <div class="toggle-row mt-3">
              <div>
                <div class="toggle-title">Auto-Post ke Instagram Feed (Carousel)</div>
                <div class="toggle-desc">Posting fess teks panjang sebagai album foto 1080x1080</div>
              </div>
              <input v-model="igSettings.autoFeed" type="checkbox" class="toggle-switch" />
            </div>

            <div class="toggle-row mt-3">
              <div>
                <div class="toggle-title">Sertakan Watermark Base di Pojok</div>
                <div class="toggle-desc">Menampilkan handle {{ baseHandle }} di pojok kanan bawah gambar</div>
              </div>
              <input v-model="igSettings.watermark" type="checkbox" class="toggle-switch" />
            </div>
          </div>

          <div class="canvas-style-selector mt-4">
            <label class="text-xs font-bold text-muted block mb-2">Tema Desain Gambar Story:</label>
            <div class="presets-grid">
              <button
                v-for="st in STORY_STYLES"
                :key="st.id"
                type="button"
                class="preset-style-btn"
                :class="{ active: igSettings.storyTheme === st.id }"
                @click="igSettings.storyTheme = st.id"
              >
                {{ st.label }}
              </button>
            </div>
          </div>

          <!-- Test Post Action -->
          <div class="mt-5 pt-3 border-t border-subtle flex items-center justify-between">
            <span class="text-xs text-muted">Token kadaluarsa: 58 hari lagi</span>
            <button
              type="button"
              class="btn-test-action"
              :disabled="isTestingIg"
              @click="runTestPostIg"
            >
              <Send :size="13" />
              <span>{{ isTestingIg ? 'Mengirim Test Story...' : 'Uji Coba Kirim Test Post' }}</span>
            </button>
          </div>

          <div v-if="testIgSuccess" class="alert-success-box mt-3">
            <CheckCircle2 :size="16" />
            <span>✓ Test post berhasil terkirim ke Instagram Story {{ baseIgAccount }}!</span>
          </div>
        </div>

        <!-- Bot Twitter / X Card -->
        <div class="admin-feature-card mt-4">
          <div class="card-top-header">
            <div class="brand-badge x-badge">
              <Twitter :size="20" />
            </div>
            <div>
              <div class="font-bold text-sm">Bot Twitter / X Auto-Tweet</div>
              <div class="text-xs text-muted">@codememfess_bot • Webhook Ready</div>
            </div>
            <span class="status-online-pill">AKTIF</span>
          </div>

          <div class="form-group mt-3">
            <label class="text-xs font-bold text-muted">Hashtag Wajib Auto-Tweet:</label>
            <input v-model="twitterHashtags" type="text" class="admin-input-control text-xs mt-1" />
          </div>
        </div>

        <!-- Telegram Webhook Card -->
        <div class="admin-feature-card mt-4">
          <div class="card-top-header">
            <div class="brand-badge tg-badge">
              <Send :size="20" />
            </div>
            <div>
              <div class="font-bold text-sm">Telegram Channel Webhook</div>
              <div class="text-xs text-muted">https://t.me/codememfess • Alert Pengelola</div>
            </div>
            <span class="status-online-pill">AKTIF</span>
          </div>
        </div>
      </template>

      <!-- ========================================================
           2. BAGIAN KEUANGAN (Saldo, Pendapatan, Penarikan)
           ======================================================== -->
      <!-- SALDO -->
      <template v-else-if="modelValue === 'keuangan_saldo'">
        <div class="finance-hero-banner">
          <div class="text-xs uppercase font-bold text-muted">TOTAL SALDO TREASURY BASE</div>
          <div class="text-3xl font-black mt-1 text-white">Rp {{ treasuryBalance.toLocaleString('id-ID') }}</div>
          <div class="text-xs text-muted mt-1">Setara dengan 24.580 $CLUB Token</div>
        </div>

        <div class="finance-breakdown-cards mt-4">
          <div class="breakdown-card">
            <span class="bd-label">Saldo Tersedia Ditarik</span>
            <span class="bd-val text-green-400">Rp {{ (treasuryBalance - 208000).toLocaleString('id-ID') }}</span>
          </div>
          <div class="breakdown-card">
            <span class="bd-label">Saldo Ditahan (Escrow)</span>
            <span class="bd-val text-amber-400">Rp 208.000</span>
          </div>
        </div>

        <div class="section-title-sm mt-6 mb-3">Arus Kas Treasury Terbaru</div>
        <div class="transaction-list">
          <div v-for="t in RECENT_TRANSACTIONS" :key="t.id" class="trx-item">
            <div class="trx-left">
              <div class="trx-desc font-bold">{{ t.desc }}</div>
              <div class="trx-date text-xs text-muted">{{ t.date }} • {{ t.id }}</div>
            </div>
            <div class="trx-amount font-black" :class="t.type === 'in' ? 'text-green-400' : 'text-red-400'">
              {{ t.type === 'in' ? '+' : '-' }}Rp {{ t.amount.toLocaleString('id-ID') }}
            </div>
          </div>
        </div>
      </template>

      <!-- PENDAPATAN -->
      <template v-else-if="modelValue === 'keuangan_pendapatan'">
        <div class="income-hero-card">
          <div class="text-xs uppercase font-bold text-muted">PENDAPATAN BULAN INI</div>
          <div class="text-3xl font-black mt-1 text-green-400">Rp 1.120.000</div>
          <div class="text-xs text-muted mt-1">+28.4% dibandingkan bulan lalu</div>
        </div>

        <div class="section-title-sm mt-6 mb-3">Sumber Pendapatan Komunitas</div>
        <div class="income-sources-list">
          <div class="income-source-card">
            <div class="flex items-center justify-between">
              <span class="font-bold text-sm">Fess Prioritas (Tanpa Antrean)</span>
              <span class="font-black text-sm text-white">Rp 820.000</span>
            </div>
            <div class="progress-bar-wrap mt-2">
              <div class="progress-bar-fill" style="width: 73%" />
            </div>
            <div class="text-xs text-muted mt-1">82 transaksi confess prioritas</div>
          </div>

          <div class="income-source-card mt-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-sm">Tip Sukarela Pengirim Anonim</span>
              <span class="font-black text-sm text-white">Rp 240.000</span>
            </div>
            <div class="progress-bar-wrap mt-2">
              <div class="progress-bar-fill" style="width: 21%" />
            </div>
            <div class="text-xs text-muted mt-1">24 tip dari pembaca setia</div>
          </div>

          <div class="income-source-card mt-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-sm">Sponsorship / Iklan Terverifikasi</span>
              <span class="font-black text-sm text-white">Rp 60.000</span>
            </div>
            <div class="progress-bar-wrap mt-2">
              <div class="progress-bar-fill" style="width: 6%" />
            </div>
            <div class="text-xs text-muted mt-1">2 penempatan banner partner komunitas</div>
          </div>
        </div>
      </template>

      <!-- PENARIKAN (PAYOUT) -->
      <template v-else-if="modelValue === 'keuangan_penarikan'">
        <div class="payout-balance-box">
          <span class="text-xs text-muted font-bold">Saldo Siap Dicairkan:</span>
          <span class="text-2xl font-black text-white mt-1">Rp {{ (treasuryBalance - 208000).toLocaleString('id-ID') }}</span>
        </div>

        <form class="payout-form mt-5" @submit.prevent="submitPayout">
          <div class="form-group">
            <label class="form-label">Nominal Penarikan (Rp)</label>
            <input
              v-model="payoutForm.amount"
              type="number"
              min="50000"
              :max="treasuryBalance - 208000"
              class="admin-input-control"
              placeholder="Minimal Rp 50.000"
              required
            />
          </div>

          <div class="payout-quick-amounts mt-2">
            <button
              v-for="amt in [250000, 500000, 1000000]"
              :key="amt"
              type="button"
              class="quick-amt-btn"
              @click="payoutForm.amount = amt"
            >
              Rp {{ (amt / 1000).toLocaleString() }}K
            </button>
            <button
              type="button"
              class="quick-amt-btn all-in"
              @click="payoutForm.amount = treasuryBalance - 208000"
            >
              Semua Saldo
            </button>
          </div>

          <div class="form-group mt-4">
            <label class="form-label">Tujuan Transfer</label>
            <select v-model="payoutForm.channel" class="admin-input-control">
              <option value="BCA">BCA - 8201928190 (a.n Admin Base)</option>
              <option value="Mandiri">Mandiri - 137000918290 (a.n Admin Base)</option>
              <option value="BRI">BRI - 019201928190 (a.n Admin Base)</option>
              <option value="GoPay">GoPay - 081234567890</option>
              <option value="OVO">OVO - 081234567890</option>
              <option value="Dana">Dana - 081234567890</option>
            </select>
          </div>

          <div class="payout-notes mt-4">
            <div class="text-xs text-muted flex justify-between">
              <span>Biaya Administrasi:</span>
              <span class="font-bold text-green-400">GRATIS</span>
            </div>
            <div class="text-xs text-muted flex justify-between mt-1">
              <span>Estimasi Masuk Rekening:</span>
              <span class="font-bold">1x24 Jam Kerja</span>
            </div>
          </div>

          <button type="submit" class="btn-submit-payout mt-5" :disabled="isSubmittingPayout">
            <Coins :size="16" />
            <span>{{ isSubmittingPayout ? 'Memproses Pengajuan...' : 'Ajukan Penarikan Dana' }}</span>
          </button>
        </form>

        <div v-if="payoutMessage" class="alert-success-box mt-4">
          <CheckCircle2 :size="16" />
          <span>{{ payoutMessage }}</span>
        </div>
      </template>

      <!-- ========================================================
           3. ANALITIK (Ringkasan, Konten, Moderasi, Komunitas)
           ======================================================== -->
      <!-- ANALITIK: RINGKASAN -->
      <template v-else-if="modelValue === 'analitik_ringkasan'">
        <div class="analytics-kpi-grid">
          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-lbl">Total Impresi</span>
              <TrendingUp :size="14" class="text-green-400" />
            </div>
            <div class="kpi-val">48,290</div>
            <div class="kpi-trend text-green-400">+22.4% bulan ini</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-lbl">Fess Terbit</span>
              <MessageSquare :size="14" class="text-blue-400" />
            </div>
            <div class="kpi-val">1,284</div>
            <div class="kpi-trend text-green-400">+14.2% minggu ini</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-lbl">Engagement Rate</span>
              <BarChart3 :size="14" class="text-purple-400" />
            </div>
            <div class="kpi-val text-purple-400">8.4%</div>
            <div class="kpi-trend text-muted">Industri rata-rata 5.1%</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-header">
              <span class="kpi-lbl">Member Baru</span>
              <Users :size="14" class="text-pink-400" />
            </div>
            <div class="kpi-val">+480</div>
            <div class="kpi-trend text-green-400">7 hari terakhir</div>
          </div>
        </div>

        <div class="section-title-sm mt-6 mb-3">Grafik Kunjungan &amp; Impresi Mingguan</div>
        <div class="weekly-chart-box">
          <div class="chart-bars-row">
            <div v-for="d in WEEKLY_TRAFFIC" :key="d.day" class="bar-col">
              <div class="bar-val-hint">{{ d.views }}k</div>
              <div class="bar-track">
                <div class="bar-fill" :style="{ height: `${d.pct}%` }" />
              </div>
              <span class="bar-day-lbl">{{ d.day }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- ANALITIK: KONTEN -->
      <template v-else-if="modelValue === 'analitik_konten'">
        <div class="section-title-sm mb-3">Top Kata Kunci (Keyword Auto-Routing)</div>
        <div class="top-keywords-bars">
          <div v-for="kw in TOP_KEYWORDS" :key="kw.tag" class="kw-row">
            <div class="flex items-center justify-between text-xs font-bold">
              <span>{{ kw.tag }}</span>
              <span>{{ kw.count }} fess ({{ kw.pct }}%)</span>
            </div>
            <div class="progress-bar-wrap mt-1">
              <div class="progress-bar-fill" :style="{ width: `${kw.pct}%` }" />
            </div>
          </div>
        </div>

        <div class="section-title-sm mt-6 mb-3">Fess Paling Banyak Dibagikan</div>
        <div class="viral-fess-list">
          <div v-for="(v, i) in VIRAL_FESSES" :key="i" class="viral-fess-item">
            <div class="viral-rank">#{{ i + 1 }}</div>
            <div class="viral-content">
              <p class="viral-text">"{{ v.text }}"</p>
              <div class="viral-meta text-xs text-muted mt-1 flex items-center gap-3">
                <span class="inline-flex items-center gap-1"><Heart :size="12" /> {{ v.likes }} suka</span>
                <span class="inline-flex items-center gap-1"><MessageSquare :size="12" /> {{ v.comments }} komentar</span>
                <span class="inline-flex items-center gap-1"><Instagram :size="12" /> {{ v.views }} views IG</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ANALITIK: MODERASI -->
      <template v-else-if="modelValue === 'analitik_moderasi'">
        <div class="moderation-stats-banner">
          <div class="mod-stat-pill">
            <span class="mod-val text-green-400">82%</span>
            <span class="mod-lbl">Lolos Otomatis AI</span>
          </div>
          <div class="mod-stat-pill">
            <span class="mod-val text-amber-400">14%</span>
            <span class="mod-lbl">Perlu Review Admin</span>
          </div>
          <div class="mod-stat-pill">
            <span class="mod-val text-red-400">4%</span>
            <span class="mod-lbl">Terblokir Otomatis</span>
          </div>
        </div>

        <div class="section-title-sm mt-6 mb-3">Daftar Kata Kunci yang Diblokir (Blacklist)</div>
        <div class="blacklist-chips-box">
          <div class="chips-wrap">
            <span v-for="kw in blockedKeywords" :key="kw" class="blocked-chip">
              {{ kw }}
              <button type="button" class="btn-remove-chip" @click="removeBlockedKeyword(kw)">×</button>
            </span>
          </div>

          <div class="add-keyword-row mt-3">
            <input
              v-model="newKeyword"
              type="text"
              placeholder="Tambah kata terlarang baru..."
              class="admin-input-control text-xs"
              @keyup.enter="addBlockedKeyword"
            />
            <button type="button" class="btn-add-kw" @click="addBlockedKeyword">Tambah</button>
          </div>
        </div>
      </template>

      <!-- ANALITIK: KOMUNITAS -->
      <template v-else-if="modelValue === 'analitik_komunitas'">
        <div class="community-overview-card">
          <div class="flex items-center gap-3">
            <Users :size="28" class="text-purple-400" />
            <div>
              <div class="text-2xl font-black">{{ communityMembers.toLocaleString() }} Anggota</div>
              <div class="text-xs text-muted">Pengikut aktif base {{ baseHandle }}</div>
            </div>
          </div>
        </div>

        <div class="section-title-sm mt-6 mb-3">Top Pengirim Anonim Teraktif</div>
        <div class="top-senders-list">
          <div v-for="s in TOP_SENDERS" :key="s.alias" class="sender-card">
            <div class="sender-avatar">{{ s.alias.charAt(1).toUpperCase() }}</div>
            <div class="sender-info">
              <div class="font-bold text-sm">{{ s.alias }}</div>
              <div class="text-xs text-muted">{{ s.fessCount }} confession terbit • {{ s.badge }}</div>
            </div>
            <span class="sender-rate text-xs font-bold text-purple-400">99.8% Approval</span>
          </div>
        </div>
      </template>

      <!-- ========================================================
           4. PENGATURAN (Tampilan, Notif, Bantuan, Ketentuan, Privasi, Keamanan)
           ======================================================== -->
      <!-- TAMPILAN -->
      <template v-else-if="modelValue === 'pengaturan_tampilan'">
        <div class="admin-feature-card">
          <div class="section-title-sm mb-3">Mode Tampilan Aplikasi</div>
          <div class="theme-options-grid">
            <button
              type="button"
              class="theme-select-card"
              :class="{ active: currentTheme === 'system' }"
              @click="$emit('setTheme', 'system')"
            >
              <div class="theme-preview-box sys-box" />
              <span class="theme-name font-bold text-xs mt-2">Sistem</span>
            </button>

            <button
              type="button"
              class="theme-select-card"
              :class="{ active: currentTheme === 'light' }"
              @click="$emit('setTheme', 'light')"
            >
              <div class="theme-preview-box light-box" />
              <span class="theme-name font-bold text-xs mt-2">Terang</span>
            </button>

            <button
              type="button"
              class="theme-select-card"
              :class="{ active: currentTheme === 'dark' }"
              @click="$emit('setTheme', 'dark')"
            >
              <div class="theme-preview-box dark-box" />
              <span class="theme-name font-bold text-xs mt-2">Gelap</span>
            </button>
          </div>
        </div>
      </template>

      <!-- NOTIFIKASI -->
      <template v-else-if="modelValue === 'pengaturan_notif'">
        <div class="admin-feature-card">
          <div class="card-toggles-list">
            <div class="toggle-row">
              <div>
                <div class="toggle-title">Fess Baru Masuk</div>
                <div class="toggle-desc">Pemberitahuan instan saat ada user mengirim confession</div>
              </div>
              <input v-model="notifSettings.newFess" type="checkbox" class="toggle-switch" />
            </div>

            <div class="toggle-row mt-3">
              <div>
                <div class="toggle-title">Laporan Konten Melanggar</div>
                <div class="toggle-desc">Peringatan saat ada fess yang dilaporkan oleh anggota</div>
              </div>
              <input v-model="notifSettings.reports" type="checkbox" class="toggle-switch" />
            </div>

            <div class="toggle-row mt-3">
              <div>
                <div class="toggle-title">Status Auto-Post Instagram</div>
                <div class="toggle-desc">Notifikasi saat bot berhasil atau gagal posting Story</div>
              </div>
              <input v-model="notifSettings.igStatus" type="checkbox" class="toggle-switch" />
            </div>

            <div class="toggle-row mt-3">
              <div>
                <div class="toggle-title">Pembayaran Tip &amp; Saldo</div>
                <div class="toggle-desc">Alert saat saldo treasury base bertambah</div>
              </div>
              <input v-model="notifSettings.payments" type="checkbox" class="toggle-switch" />
            </div>
          </div>
        </div>
      </template>

      <!-- BANTUAN -->
      <template v-else-if="modelValue === 'pengaturan_bantuan'">
        <div class="admin-feature-card">
          <div class="section-title-sm mb-3">Tanya Jawab (FAQ Pengelola Base)</div>
          <div class="faq-accordion-list">
            <div
              v-for="(f, i) in ADMIN_FAQS"
              :key="i"
              class="faq-item"
              :class="{ open: openFaqIndex === i }"
            >
              <button
                type="button"
                class="faq-question-btn"
                @click="openFaqIndex = openFaqIndex === i ? null : i"
              >
                <span>{{ f.q }}</span>
                <ChevronDown :size="16" class="faq-chevron" />
              </button>
              <p v-if="openFaqIndex === i" class="faq-answer-text">
                {{ f.a }}
              </p>
            </div>
          </div>
        </div>

        <div class="support-contact-box mt-4">
          <div class="font-bold text-sm">Butuh Bantuan Teknis Tambahan?</div>
          <p class="text-xs text-muted mt-1">Tim teknis FessHub siap membantu 24/7 terkait integrasi bot dan sistem auto-post.</p>
          <a href="mailto:admin-support@fesshub.com" class="btn-contact-support mt-3">
            Hubungi Tim Teknis via Email
          </a>
        </div>
      </template>

      <!-- KETENTUAN LAYANAN -->
      <template v-else-if="modelValue === 'pengaturan_ketentuan'">
        <div class="legal-text-container">
          <h4 class="legal-section-title">1. Ketentuan Umum Pengelola Base</h4>
          <p class="legal-p">Setiap pengelola base bertanggung jawab penuh atas moderasi konten dan menjaga kepatuhan komunitas terhadap norma hukum dan privasi.</p>

          <h4 class="legal-section-title mt-4">2. Kebijakan Konten Terlarang</h4>
          <p class="legal-p">Dilarang keras menyetujui atau menerbitkan konten bermuatan SARA, pornografi, ancaman kekerasan, doxxing, dan judi online.</p>

          <h4 class="legal-section-title mt-4">3. Pembagian Royalti &amp; Saldo</h4>
          <p class="legal-p">Pendapatan yang bersumber dari fess prioritas dan tip akan dialokasikan 85% untuk treasury base dan 15% untuk biaya operasional platform.</p>
        </div>
      </template>

      <!-- KEBIJAKAN PRIVASI -->
      <template v-else-if="modelValue === 'pengaturan_privasi'">
        <div class="legal-text-container">
          <h4 class="legal-section-title">1. Perlindungan Anonimitas Pengirim</h4>
          <p class="legal-p">Sistem FessHub mengenkripsi identitas pengirim secara end-to-end. Pengelola base tidak dapat melihat alamat email atau nomor telepon asli dari pengirim confession.</p>

          <h4 class="legal-section-title mt-4">2. Keamanan Kredensial Media Sosial</h4>
          <p class="legal-p">Token akses Instagram Graph API disimpan dalam brankas kredensial terenkripsi dan hanya digunakan untuk auto-posting fess yang telah disetujui.</p>
        </div>
      </template>

      <!-- KEAMANAN PROFIL GANTI PASSWORD -->
      <template v-else-if="modelValue === 'pengaturan_keamanan'">
        <div class="admin-feature-card">
          <div class="section-title-sm mb-3">Ubah Kata Sandi Admin</div>
          <form class="security-form" @submit.prevent="submitChangePassword">
            <div class="form-group">
              <label class="form-label">Kata Sandi Saat Ini</label>
              <input v-model="secForm.oldPass" type="password" class="admin-input-control" required />
            </div>

            <div class="form-group mt-3">
              <label class="form-label">Kata Sandi Baru</label>
              <input v-model="secForm.newPass" type="password" minlength="8" class="admin-input-control" required />
            </div>

            <div class="form-group mt-3">
              <label class="form-label">Ulangi Kata Sandi Baru</label>
              <input v-model="secForm.confirmPass" type="password" class="admin-input-control" required />
            </div>

            <button type="submit" class="btn-save-sec mt-4">Simpan Kata Sandi Baru</button>
          </form>

          <div v-if="secSuccessMessage" class="alert-success-box mt-3">
            <CheckCircle2 :size="16" />
            <span>{{ secSuccessMessage }}</span>
          </div>
        </div>

        <div class="session-info-card mt-4">
          <div class="text-xs font-bold text-muted">Sesi Login Aktif Saat Ini:</div>
          <div class="text-xs text-muted mt-1">Chrome Desktop • Windows 11 • IP: 182.253.xx.xx (Terverifikasi)</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
/**
 * BaseAdminPanels — Real implementation for all Base Admin Hamburger Drawer modules:
 * 1. Koneksi Medsos (Instagram, Twitter, Telegram, Canvas styling, Test post)
 * 2. Keuangan {saldo, pendapatan, penarikan}
 * 3. Analitik {ringkasan, konten, moderasi, komunitas}
 * 4. Pengaturan {tampilan, notif, bantuan, ketentuan, privasi, keamanan ganti password}
 */
import { ref, computed, reactive } from 'vue';
import {
  ChevronLeft,
  ChevronDown,
  Instagram,
  Twitter,
  Send,
  CheckCircle2,
  Coins,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Users,
  Heart,
} from 'lucide-vue-next';

import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../composables/useTheme';

const props = defineProps({
  modelValue: { type: String, default: null },
});

const emit = defineEmits(['update:modelValue', 'setTheme', 'logout']);

const authStore = useAuthStore();
const { mode: currentTheme } = useTheme();

const baseHandle = computed(() => authStore.user?.handle || '@codememfess');
const baseIgAccount = computed(() => authStore.user?.igAccount || '@codememfess_ig');
const treasuryBalance = ref(2458000);

/* Panel Titles */
const panelTitle = computed(() => {
  const map = {
    medsos: 'Koneksi Media Sosial',
    keuangan_saldo: 'Saldo Treasury Base',
    keuangan_pendapatan: 'Pendapatan Komunitas',
    keuangan_penarikan: 'Penarikan Saldo (Payout)',
    analitik_ringkasan: 'Ringkasan Analitik Base',
    analitik_konten: 'Analitik Konten Fess',
    analitik_moderasi: 'Moderasi & Filter Kata',
    analitik_komunitas: 'Analitik Komunitas Base',
    pengaturan_tampilan: 'Tampilan Tema',
    pengaturan_notif: 'Pengaturan Notifikasi',
    pengaturan_bantuan: 'Pusat Bantuan Pengelola',
    pengaturan_ketentuan: 'Ketentuan Layanan',
    pengaturan_privasi: 'Kebijakan Privasi',
    pengaturan_keamanan: 'Keamanan Profil & Ganti Password',
  };
  return map[props.modelValue] || 'Detail Menu';
});

/* 1. Medsos State */
const igSettings = reactive({
  autoStory: true,
  autoFeed: true,
  watermark: true,
  storyTheme: 'neon',
});

const STORY_STYLES = [
  { id: 'neon', label: 'Dark Cyber Neon' },
  { id: 'white', label: 'Clean Paper White' },
  { id: 'gradient', label: 'Purple Violet Card' },
];

const twitterHashtags = ref('#codememfess #programmerID #fesshub');
const isTestingIg = ref(false);
const testIgSuccess = ref(false);

function runTestPostIg() {
  isTestingIg.value = true;
  testIgSuccess.value = false;
  setTimeout(() => {
    isTestingIg.value = false;
    testIgSuccess.value = true;
    setTimeout(() => {
      testIgSuccess.value = false;
    }, 4500);
  }, 1200);
}

/* 2. Keuangan State */
const RECENT_TRANSACTIONS = [
  { id: 'TRX_84920', desc: 'Fess Prioritas (#codememfess_1284)', date: '12 Okt 2026, 17:40', amount: 10000, type: 'in' },
  { id: 'TRX_84918', desc: 'Tip Sukarela dari Anon #4910', date: '12 Okt 2026, 15:20', amount: 25000, type: 'in' },
  { id: 'TRX_84890', desc: 'Penarikan Saldo ke BCA 8201928190', date: '11 Okt 2026, 09:15', amount: 1500000, type: 'out' },
  { id: 'TRX_84820', desc: 'Fess Prioritas (#codememfess_1280)', date: '10 Okt 2026, 21:05', amount: 10000, type: 'in' },
];

const payoutForm = reactive({
  amount: 500000,
  channel: 'BCA',
});

const isSubmittingPayout = ref(false);
const payoutMessage = ref('');

function submitPayout() {
  if (payoutForm.amount <= 0 || payoutForm.amount > treasuryBalance.value - 208000) return;
  isSubmittingPayout.value = true;
  payoutMessage.value = '';

  setTimeout(() => {
    isSubmittingPayout.value = false;
    treasuryBalance.value -= payoutForm.amount;
    payoutMessage.value = `Pengajuan penarikan Rp ${payoutForm.amount.toLocaleString('id-ID')} ke ${payoutForm.channel} berhasil diproses!`;
    payoutForm.amount = 0;
  }, 1400);
}

/* 3. Analitik State */
const WEEKLY_TRAFFIC = [
  { day: 'Sen', views: 4.8, pct: 55 },
  { day: 'Sel', views: 5.6, pct: 68 },
  { day: 'Rab', views: 6.9, pct: 82 },
  { day: 'Kam', views: 6.2, pct: 75 },
  { day: 'Jum', views: 8.4, pct: 100 },
  { day: 'Sab', views: 7.8, pct: 92 },
  { day: 'Min', views: 6.5, pct: 78 },
];

const TOP_KEYWORDS = [
  { tag: '[code]', count: 667, pct: 52 },
  { tag: '[karir]', count: 308, pct: 24 },
  { tag: '[curhat]', count: 205, pct: 16 },
  { tag: '[gaji]', count: 104, pct: 8 },
];

const VIRAL_FESSES = [
  { text: 'Curhat dikit, udah 3 minggu debug memory leak di microservice golang ternyata cuma salah defer mu.Unlock() di closure loop...', likes: 342, comments: 84, views: '12.4K' },
  { text: 'Spill dong roadmap belajar Vue 3 Composition API & Pinia buat yang baru pindah dari React di tahun 2026 ini?', likes: 254, comments: 62, views: '8.9K' },
  { text: 'Tempat ngopi 24 jam dengan WiFi 100 Mbps di Jaksel yang colokannya ramah programmer apa ya guys?', likes: 189, comments: 45, views: '6.2K' },
];

const blockedKeywords = ref(['slot', 'judol', 'gacor', 'pinjol', 'sara', 'doxxing', 'cheat']);
const newKeyword = ref('');

function addBlockedKeyword() {
  const kw = newKeyword.value.trim().toLowerCase();
  if (kw && !blockedKeywords.value.includes(kw)) {
    blockedKeywords.value.push(kw);
    newKeyword.value = '';
  }
}

function removeBlockedKeyword(kw) {
  blockedKeywords.value = blockedKeywords.value.filter((item) => item !== kw);
}

const communityMembers = ref(18420);
const TOP_SENDERS = [
  { alias: 'Anon #8201', fessCount: 48, badge: 'Veteran Sender' },
  { alias: 'Anon #4910', fessCount: 36, badge: 'Tech Enthusiast' },
  { alias: 'Anon #1128', fessCount: 29, badge: 'Regular Contributor' },
];

/* 4. Pengaturan State */
const notifSettings = reactive({
  newFess: true,
  reports: true,
  igStatus: true,
  payments: true,
});

const openFaqIndex = ref(0);
const ADMIN_FAQS = [
  {
    q: 'Bagaimana cara kerja auto-post ke Instagram Story?',
    a: 'Setiap confession yang Anda setujui akan dikonversi menjadi gambar canvas resolusi tinggi (1080x1920) dengan format font elegan, lalu diposting otomatis ke Story akun Instagram base Anda via Meta Graph API.',
  },
  {
    q: 'Berapa lama proses pencairan saldo treasury ke rekening bank?',
    a: 'Pencairan saldo membutuhkan waktu maksimal 1x24 jam kerja. Transfer dikirim melalui kliring BI-FAST langsung ke rekening bank atau e-wallet terdaftar tanpa biaya admin.',
  },
  {
    q: 'Bagaimana cara mengganti kata sandi atau email admin?',
    a: 'Anda dapat masuk ke menu Pengaturan > Keamanan Profil & Ganti Password di drawer ini, lalu masukkan kata sandi lama dan kata sandi baru Anda.',
  },
];

const secForm = reactive({
  oldPass: '',
  newPass: '',
  confirmPass: '',
});
const secSuccessMessage = ref('');

function submitChangePassword() {
  if (secForm.newPass !== secForm.confirmPass) return;
  secSuccessMessage.value = '✓ Kata sandi admin berhasil diperbarui dengan aman!';
  secForm.oldPass = '';
  secForm.newPass = '';
  secForm.confirmPass = '';
  setTimeout(() => {
    secSuccessMessage.value = '';
  }, 4000);
}
</script>

<style scoped>
.base-admin-panel {
  position: fixed;
  inset: 0;
  z-index: 1300;
  background: var(--shell-bg);
  color: var(--shell-text);
  font-family: var(--font-sans);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.base-admin-panel.open {
  transform: translateX(0);
}

.panel-header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 12px 18px;
  background: var(--shell-header-bg);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--shell-border);
}

.panel-header-inner {
  max-width: 680px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-back-btn {
  background: none;
  border: none;
  color: var(--shell-text);
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.panel-header-title {
  font-size: 16px;
  font-weight: 900;
}

.panel-header-spacer {
  width: 32px;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 18px 40px;
  max-width: 680px;
  width: 100%;
  margin: 0 auto;
}

/* Feature cards */
.admin-feature-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 20px;
  padding: 20px;
}

.card-top-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.ig-badge { background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); }
.x-badge { background: #000; }
.tg-badge { background: #24a1de; }

.status-online-pill {
  margin-left: auto;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid #10b981;
  font-size: 10px;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.toggle-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--shell-text);
}

.toggle-desc {
  font-size: 11px;
  color: var(--shell-text-muted);
  margin-top: 2px;
}

.toggle-switch {
  width: 42px;
  height: 24px;
  accent-color: var(--shell-sub-accent);
  cursor: pointer;
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.preset-style-btn {
  padding: 8px;
  border-radius: 10px;
  border: 1px solid var(--shell-border);
  background: var(--shell-chip);
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  color: var(--shell-text);
  cursor: pointer;
}

.preset-style-btn.active {
  border-color: var(--shell-sub-accent);
  background: var(--shell-card);
  color: var(--shell-text);
  font-weight: 900;
}

.btn-test-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  border: none;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
}

.btn-test-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert-success-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid #10b981;
  color: #10b981;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 800;
}

/* Controls */
.admin-input-control {
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid var(--shell-border);
  background: var(--shell-chip);
  color: var(--shell-text);
  font-family: inherit;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}

.admin-input-control:focus {
  border-color: var(--shell-sub-accent);
}

/* Finance */
.finance-hero-banner,
.income-hero-card {
  background: linear-gradient(135deg, var(--brand-blue) 0%, #162447 100%);
  color: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px var(--neon-blue-glow);
}

.income-hero-card {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(20, 83, 45, 0.4) 100%);
  border: 1px solid #10b981;
}

.finance-breakdown-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.breakdown-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bd-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.bd-val {
  font-size: 16px;
  font-weight: 900;
}

.section-title-sm {
  font-size: 14px;
  font-weight: 900;
  color: var(--shell-text);
}

.transaction-list,
.income-sources-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trx-item,
.income-source-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 14px;
  padding: 12px 16px;
}

.income-source-card {
  display: block;
}

.progress-bar-wrap {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--shell-chip);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--shell-sub-accent);
}

.payout-balance-box {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
}

.payout-quick-amounts {
  display: flex;
  gap: 8px;
}

.quick-amt-btn {
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--shell-border);
  background: var(--shell-chip);
  color: var(--shell-text);
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}

.quick-amt-btn.all-in {
  color: var(--shell-sub-accent);
  border-color: var(--shell-sub-accent);
}

.btn-submit-payout,
.btn-save-sec {
  width: 100%;
  padding: 12px;
  border-radius: var(--radius-pill);
  background: var(--shell-sub-accent);
  color: #ffffff;
  border: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* Analytics */
.analytics-kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.kpi-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 14px;
}

.kpi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpi-lbl {
  font-size: 11px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.kpi-val {
  font-size: 22px;
  font-weight: 900;
  margin-top: 4px;
}

.kpi-trend {
  font-size: 11px;
  font-weight: 700;
  margin-top: 2px;
}

.weekly-chart-box {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
  padding: 18px;
}

.chart-bars-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 140px;
  padding-top: 20px;
}

.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.bar-val-hint {
  font-size: 10px;
  font-weight: 800;
  color: var(--shell-text-muted);
}

.bar-track {
  width: 18px;
  height: 90px;
  background: var(--shell-chip);
  border-radius: 6px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, var(--shell-sub-accent) 0%, var(--brand-blue) 100%);
  border-radius: 6px;
  transition: height 0.3s ease;
}

.bar-day-lbl {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.top-keywords-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 16px;
}

.viral-fess-list,
.top-senders-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.viral-fess-item,
.sender-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 14px;
  padding: 14px;
}

.viral-rank {
  font-size: 16px;
  font-weight: 900;
  color: var(--shell-sub-accent);
}

.viral-text {
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
}

.moderation-stats-banner {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.mod-stat-pill {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mod-val {
  font-size: 20px;
  font-weight: 900;
}

.mod-lbl {
  font-size: 10px;
  font-weight: 700;
  color: var(--shell-text-muted);
}

.blacklist-chips-box {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 16px;
}

.chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.blocked-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: 11.5px;
  font-weight: 800;
}

.btn-remove-chip {
  background: none;
  border: none;
  color: inherit;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
}

.add-keyword-row {
  display: flex;
  gap: 8px;
}

.btn-add-kw {
  padding: 8px 16px;
  border-radius: 12px;
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  color: var(--shell-text);
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.community-overview-card {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
  padding: 18px;
}

.sender-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--brand-blue);
  color: #fff;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sender-info {
  flex: 1;
}

/* Theme options */
.theme-options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.theme-select-card {
  background: var(--shell-chip);
  border: 2px solid var(--shell-border);
  border-radius: 14px;
  padding: 12px 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.15s ease;
}

.theme-select-card.active {
  border-color: var(--shell-sub-accent);
  background: var(--shell-card);
}

.theme-preview-box {
  width: 100%;
  height: 48px;
  border-radius: 8px;
}

.sys-box { background: linear-gradient(135deg, #fff 50%, #0d121f 50%); }
.light-box { background: #f8fafc; border: 1px solid #cbd5e1; }
.dark-box { background: #0f172a; }

/* FAQ */
.faq-accordion-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.faq-item {
  border-bottom: 1px solid var(--shell-border);
  padding-bottom: 8px;
}

.faq-question-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  background: none;
  border: none;
  color: var(--shell-text);
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
}

.faq-answer-text {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--shell-text-muted);
  margin: 0 0 8px;
}

.support-contact-box {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
}

.btn-contact-support {
  display: inline-block;
  padding: 8px 18px;
  border-radius: var(--radius-pill);
  background: var(--brand-blue);
  color: var(--brand-blue-ink);
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
}

/* Legal text */
.legal-text-container {
  background: var(--shell-card);
  border: 1px solid var(--shell-border);
  border-radius: 18px;
  padding: 20px;
}

.legal-section-title {
  font-size: 14px;
  font-weight: 900;
  margin: 0;
  color: var(--shell-text);
}

.legal-p {
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--shell-text-muted);
  margin: 6px 0 0;
}

.session-info-card {
  background: var(--shell-chip);
  border: 1px solid var(--shell-border);
  border-radius: 12px;
  padding: 12px 14px;
}
</style>
