<template>
  <div>
    <ConsolePageHeader
      eyebrow="Finance & billing"
      title="Keuangan Platform"
      subtitle="Review payout manual, verifikasi KYC, atur harga fess per base (termasuk gratis untuk mitra), dan pantau pendapatan serta pembayaran base. Semua aksi berisiko meminta kata sandi ulang."
      :health="payoutHealthLabel"
      :health-tone="workspace ? (workspace.enabled ? 'success' : 'danger') : 'neutral'"
    >
      <template #actions>
        <ConsoleStatusBadge
          v-if="workspace"
          status="idr"
          :label="`${workspace.currency} · hold ${workspace.hold_days} hari`"
          tone="neutral"
        />
        <button
          type="button"
          class="pc-btn pc-btn--ghost"
          :disabled="refreshing"
          @click="refreshPage"
        >
          <RefreshCw :size="14" :class="{ 'pc-spin': refreshing }" />
          {{ refreshing ? 'Memuat…' : 'Muat ulang' }}
        </button>
      </template>
    </ConsolePageHeader>

    <div class="pc-inline" style="justify-content: space-between; margin-bottom: 16px">
      <div class="pc-tabs" role="tablist" aria-label="Bagian keuangan platform">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="pc-tab"
          :class="{ active: activeTab === tab.id }"
          role="tab"
          :aria-selected="activeTab === tab.id"
          @click="setTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>

      <span v-if="workspace" class="pc-badge pc-badge--neutral">
        Min. payout {{ formatIdr(workspace.min_payout_idr) }} · fee
        {{ formatIdr(workspace.payout_fee_idr) }}
      </span>
    </div>

    <div v-if="workspaceLoading && !workspace" class="pc-stack">
      <div class="pc-stats">
        <div v-for="index in 4" :key="index" class="pc-skeleton pc-skeleton--stat" />
      </div>
      <div class="pc-skeleton" style="height: 320px" />
    </div>

    <div v-else-if="workspaceError && !workspace" class="pc-stack">
      <div class="pc-error">
        <AlertTriangle :size="17" />
        <div>
          <strong>Data keuangan gagal dimuat.</strong>
          <p>{{ workspaceError }}</p>
        </div>
      </div>
      <button type="button" class="pc-btn pc-btn--ghost" @click="loadWorkspace">Coba lagi</button>
    </div>

    <template v-else-if="workspace">
      <div
        v-if="!workspace.enabled"
        class="pc-callout pc-callout--warning"
        style="margin-bottom: 16px"
      >
        <LockKeyhole :size="16" />
        <div>
          <strong>BASE_PAYOUTS_ENABLED=false.</strong>
          Antrean payout tetap bisa dibaca, tetapi approve, reject, dan transfer tidak dapat
          diproses sampai flag diaktifkan lewat deploy. KYC dan pengaturan harga fess tetap tersedia
          sebagai kontrol platform.
        </div>
      </div>

      <div class="pc-stats">
        <div class="pc-stat pc-stat--lime">
          <p class="pc-stat__label">Available</p>
          <p class="pc-stat__value pc-stat__value--small">{{ formatIdr(totals.available_idr) }}</p>
          <p class="pc-stat__hint">Saldo siap ditarik base</p>
        </div>
        <div class="pc-stat">
          <p class="pc-stat__label">Pending</p>
          <p class="pc-stat__value pc-stat__value--small">{{ formatIdr(totals.pending_idr) }}</p>
          <p class="pc-stat__hint">Belum lewat masa tahan {{ workspace.hold_days }} hari</p>
        </div>
        <div class="pc-stat pc-stat--amber">
          <p class="pc-stat__label">Reserved</p>
          <p class="pc-stat__value pc-stat__value--small">{{ formatIdr(totals.reserved_idr) }}</p>
          <p class="pc-stat__hint">Payout disetujui, menunggu transfer</p>
        </div>
        <div class="pc-stat pc-stat--blue">
          <p class="pc-stat__label">Lifetime</p>
          <p class="pc-stat__value pc-stat__value--small">{{ formatIdr(totals.lifetime_idr) }}</p>
          <p class="pc-stat__hint">{{ formatIdr(workspace.revenue_per_fess_idr) }} per fess</p>
        </div>
      </div>

      <!-- PAYOUTS -->
      <section v-if="activeTab === 'payouts'" class="pc-card">
        <div class="pc-card__head">
          <div>
            <h2 class="pc-card__title">Review payout manual</h2>
            <p class="pc-card__desc">
              Setujui, tolak, atau tandai transfer. Setiap aksi membutuhkan kata sandi ulang dan
              tercatat di audit.
            </p>
          </div>
          <ConsoleStatusBadge
            :status="workspace.enabled ? 'active' : 'disabled'"
            :label="workspace.enabled ? 'Payout aktif' : 'Payout dimatikan'"
          />
        </div>

        <div class="pc-filters">
          <div class="pc-field pc-field--grow">
            <label class="pc-label" for="payout-search">Cari base / referensi</label>
            <div class="pc-input-icon">
              <Search :size="13" />
              <input
                id="payout-search"
                v-model="payoutQuery"
                class="pc-input"
                type="search"
                placeholder="Handle base, nama, atau referensi transfer"
              />
            </div>
          </div>
          <div class="pc-field">
            <label class="pc-label" for="payout-status">Status</label>
            <select id="payout-status" v-model="payoutStatus" class="pc-select">
              <option value="">Semua status</option>
              <option value="requested">Menunggu review</option>
              <option value="approved">Disetujui</option>
              <option value="paid">Sudah dibayar</option>
              <option value="rejected">Ditolak</option>
              <option value="failed">Gagal</option>
            </select>
          </div>
        </div>

        <div v-if="payoutsError" class="pc-card__body">
          <div class="pc-error">
            <AlertTriangle :size="16" />
            <div>
              <strong>Payout gagal dimuat.</strong>
              <p>{{ payoutsError }}</p>
            </div>
          </div>
        </div>

        <div v-else-if="payoutsLoading && !payouts.data.length" class="pc-card__body pc-stack">
          <div v-for="index in 4" :key="index" class="pc-skeleton pc-skeleton--line" />
        </div>

        <div v-else-if="!payouts.data.length" class="pc-empty">
          <span class="pc-empty__icon"><Wallet :size="18" /></span>
          Tidak ada payout pada filter ini.
        </div>

        <div v-else class="pc-table-wrap">
          <table class="pc-table">
            <thead>
              <tr>
                <th>Base</th>
                <th>Nominal</th>
                <th>Rekening</th>
                <th>Status</th>
                <th>Diajukan</th>
                <th class="pc-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payout in payouts.data" :key="payout.id">
                <td>
                  <button
                    type="button"
                    class="pc-entity-link"
                    @click="openSupport(payout.base_handle)"
                  >
                    {{ payout.base_handle || '—' }}
                  </button>
                  <span class="pc-table__sub">{{ payout.base_name || 'Base' }}</span>
                </td>
                <td>
                  <span class="pc-table__number">{{ formatIdr(payout.amount_idr) }}</span>
                  <span class="pc-table__sub">
                    Fee {{ formatIdr(payout.fee_idr) }} · net {{ formatIdr(payout.net_idr) }}
                  </span>
                </td>
                <td>
                  <span class="pc-table__primary">{{ payout.bank_name || '—' }}</span>
                  <span class="pc-table__sub">
                    {{ payout.bank_account_name || '—' }} ·
                    <span class="pc-mono">{{ payout.bank_account_number_masked || '—' }}</span>
                  </span>
                </td>
                <td>
                  <ConsoleStatusBadge :status="payout.status" />
                  <span v-if="payout.rejection_reason" class="pc-table__sub">
                    {{ payout.rejection_reason }}
                  </span>
                  <span v-else-if="payout.reference" class="pc-table__sub">
                    Ref {{ payout.reference }}
                  </span>
                  <span v-else-if="payout.notes" class="pc-table__sub">{{ payout.notes }}</span>
                </td>
                <td>
                  <span>{{ formatDateTime(payout.requested_at) }}</span>
                  <span class="pc-table__sub">
                    oleh {{ payout.requested_by || 'Base Admin' }}
                  </span>
                </td>
                <td>
                  <div class="pc-table__actions">
                    <template v-if="payout.status === 'requested'">
                      <button
                        type="button"
                        class="pc-btn pc-btn--primary pc-btn--sm"
                        :disabled="!workspace.enabled"
                        :title="workspace.enabled ? 'Setujui payout' : 'Payout dimatikan oleh ENV'"
                        @click="openPayoutReview(payout, 'approve')"
                      >
                        <CheckCircle2 :size="12" />
                        Setujui
                      </button>
                      <button
                        type="button"
                        class="pc-btn pc-btn--danger pc-btn--sm"
                        :disabled="!workspace.enabled"
                        @click="openPayoutReview(payout, 'reject')"
                      >
                        <XCircle :size="12" />
                        Tolak
                      </button>
                    </template>
                    <template v-else-if="payout.status === 'approved'">
                      <button
                        type="button"
                        class="pc-btn pc-btn--blue pc-btn--sm"
                        :disabled="!workspace.enabled"
                        @click="openPayoutReview(payout, 'mark_paid')"
                      >
                        <Banknote :size="12" />
                        Sudah dibayar
                      </button>
                      <button
                        type="button"
                        class="pc-btn pc-btn--danger pc-btn--sm"
                        :disabled="!workspace.enabled"
                        @click="openPayoutReview(payout, 'mark_failed')"
                      >
                        <AlertTriangle :size="12" />
                        Gagal
                      </button>
                    </template>
                    <span v-else class="pc-small pc-muted">
                      {{ payout.paid_at ? formatDateTime(payout.paid_at) : 'Selesai' }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="payouts.total_pages > 1" class="pc-pagination">
          <span>
            {{ payouts.total }} payout · halaman {{ payouts.page }} dari
            {{ payouts.total_pages }}
          </span>
          <div class="pc-pagination__buttons">
            <button
              type="button"
              class="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon"
              :disabled="payouts.page <= 1 || payoutsLoading"
              aria-label="Halaman sebelumnya"
              @click="goPayoutPage(payouts.page - 1)"
            >
              <ChevronLeft :size="14" />
            </button>
            <button
              type="button"
              class="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon"
              :disabled="payouts.page >= payouts.total_pages || payoutsLoading"
              aria-label="Halaman berikutnya"
              @click="goPayoutPage(payouts.page + 1)"
            >
              <ChevronRight :size="14" />
            </button>
          </div>
        </div>
      </section>

      <!-- KYC & BILLING -->
      <template v-else-if="activeTab === 'kyc'">
        <div class="pc-callout pc-callout--lime" style="margin-bottom: 16px">
          <ShieldCheck :size="16" />
          <div>
            <strong>Kontrol KYC platform.</strong>
            Verifikasi hanya untuk base dengan rekening lengkap dan saldo memenuhi minimum. Alasan
            perubahan harus jelas karena masuk ke audit permanen.
          </div>
        </div>

        <section class="pc-card">
          <div class="pc-card__head">
            <div>
              <h2 class="pc-card__title">Antrean KYC</h2>
              <p class="pc-card__desc">
                {{ kycQueue.length }} base memiliki rekening lengkap tetapi belum terverifikasi.
              </p>
            </div>
            <ConsoleStatusBadge
              :status="kycQueue.length ? 'pending' : 'ok'"
              :label="kycQueue.length ? `${kycQueue.length} menunggu` : 'Bersih'"
            />
          </div>

          <div v-if="!kycQueue.length" class="pc-empty">
            <span class="pc-empty__icon"><BadgeCheck :size="18" /></span>
            Tidak ada base yang menunggu KYC.
          </div>

          <div v-else class="pc-table-wrap">
            <table class="pc-table">
              <thead>
                <tr>
                  <th>Base</th>
                  <th>Rekening</th>
                  <th>Available</th>
                  <th>Status</th>
                  <th class="pc-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="base in kycQueue" :key="base.id">
                  <td>
                    <button type="button" class="pc-entity-link" @click="openSupport(base.handle)">
                      {{ base.handle }}
                    </button>
                    <span class="pc-table__sub">{{ base.name }}</span>
                  </td>
                  <td>
                    <span class="pc-table__primary">{{ base.bank_name }}</span>
                    <span class="pc-table__sub">
                      {{ base.bank_account_name }} · {{ base.bank_account_number_masked }}
                    </span>
                  </td>
                  <td class="pc-table__number">{{ formatIdr(base.available_idr) }}</td>
                  <td>
                    <ConsoleStatusBadge
                      :status="base.payout_kyc_status"
                      :label="statusLabel(base.payout_kyc_status)"
                    />
                    <span v-if="base.payout_kyc_note" class="pc-table__sub">
                      {{ base.payout_kyc_note }}
                    </span>
                  </td>
                  <td>
                    <div class="pc-table__actions">
                      <button
                        type="button"
                        class="pc-btn pc-btn--primary pc-btn--sm"
                        @click="openKycDialog(base, 'verified')"
                      >
                        <CheckCircle2 :size="12" />
                        Verifikasi
                      </button>
                      <button
                        type="button"
                        class="pc-btn pc-btn--danger pc-btn--sm"
                        @click="openKycDialog(base, 'rejected')"
                      >
                        <XCircle :size="12" />
                        Tolak
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="pc-card">
          <div class="pc-card__head">
            <div>
              <h2 class="pc-card__title">Harga fess & billing base</h2>
              <p class="pc-card__desc">
                Harga fess yang berlaku, status trial, KYC, dan saldo seluruh base. Base mitra FnC
                bisa digratiskan tanpa memotong CTF pengirim.
              </p>
            </div>
            <div class="pc-field" style="width: 220px; max-width: 100%">
              <label class="pc-label" for="billing-search">Cari base</label>
              <input
                id="billing-search"
                v-model="billingQuery"
                class="pc-input"
                type="search"
                placeholder="Handle atau nama"
              />
            </div>
          </div>

          <div v-if="!filteredBillingBases.length" class="pc-empty">
            <span class="pc-empty__icon"><Landmark :size="18" /></span>
            Tidak ada base yang cocok dengan pencarian.
          </div>

          <div v-else class="pc-table-wrap">
            <table class="pc-table">
              <thead>
                <tr>
                  <th>Base</th>
                  <th>KYC</th>
                  <th>Harga fess</th>
                  <th>Trial berakhir</th>
                  <th>Available</th>
                  <th class="pc-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="base in visibleBillingBases" :key="base.id">
                  <td>
                    <button type="button" class="pc-entity-link" @click="openSupport(base.handle)">
                      {{ base.handle }}
                    </button>
                    <span class="pc-table__sub">{{ base.name }}</span>
                  </td>
                  <td>
                    <ConsoleStatusBadge
                      :status="base.payout_kyc_status"
                      :label="statusLabel(base.payout_kyc_status)"
                    />
                  </td>
                  <td>
                    <ConsoleStatusBadge
                      v-if="base.fess_price_ctf === 0"
                      status="free"
                      label="Gratis"
                      tone="lime"
                    />
                    <span v-else class="pc-table__primary">
                      {{ base.fess_price_ctf }} CTF / fess
                    </span>
                    <span v-if="base.free_forever_reason" class="pc-table__sub">
                      {{ base.free_forever_reason }}
                    </span>
                  </td>
                  <td>
                    {{ formatDateTime(base.trial_ends_at) }}
                    <span class="pc-table__sub">
                      {{ base.bank_change_pending ? 'Rekening masih dikunci' : 'Rekening siap' }}
                    </span>
                  </td>
                  <td class="pc-table__number">{{ formatIdr(base.available_idr) }}</td>
                  <td>
                    <div class="pc-table__actions">
                      <button
                        type="button"
                        class="pc-btn pc-btn--ghost pc-btn--sm"
                        @click="openKycDialog(base, base.payout_kyc_status || 'unverified')"
                      >
                        <BadgeCheck :size="12" />
                        KYC
                      </button>
                      <button
                        type="button"
                        class="pc-btn pc-btn--ghost pc-btn--sm"
                        @click="openFessPrice(base)"
                      >
                        <Sparkles :size="12" />
                        Harga fess
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="filteredBillingBases.length > visibleBillingBases.length"
            class="pc-pagination"
          >
            <span>
              Menampilkan {{ visibleBillingBases.length }} dari
              {{ filteredBillingBases.length }} base
            </span>
            <button
              type="button"
              class="pc-btn pc-btn--ghost pc-btn--sm"
              @click="billingLimit += 25"
            >
              Muat 25 lagi
            </button>
          </div>
        </section>
      </template>

      <!-- REVENUE -->
      <template v-else-if="activeTab === 'revenue'">
        <div class="pc-grid pc-grid--sidebar">
          <section class="pc-card">
            <div class="pc-card__head">
              <div>
                <h2 class="pc-card__title">Pendapatan per base</h2>
                <p class="pc-card__desc">
                  Saldo IDR base dari pendapatan fess. Tidak ada aksi tulis di sini.
                </p>
              </div>
              <div class="pc-field" style="width: 220px; max-width: 100%">
                <label class="pc-label" for="revenue-search">Cari base</label>
                <input
                  id="revenue-search"
                  v-model="billingQuery"
                  class="pc-input"
                  type="search"
                  placeholder="Handle atau nama"
                />
              </div>
            </div>

            <div v-if="!filteredBillingBases.length" class="pc-empty">
              <span class="pc-empty__icon"><CircleDollarSign :size="18" /></span>
              Tidak ada data pendapatan pada pencarian ini.
            </div>

            <div v-else class="pc-table-wrap">
              <table class="pc-table">
                <thead>
                  <tr>
                    <th>Base</th>
                    <th>Pending</th>
                    <th>Available</th>
                    <th>Reserved</th>
                    <th>Lifetime</th>
                    <th>Payout</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="base in visibleBillingBases" :key="base.id">
                    <td>
                      <button
                        type="button"
                        class="pc-entity-link"
                        @click="openSupport(base.handle)"
                      >
                        {{ base.handle }}
                      </button>
                      <span class="pc-table__sub">{{ base.name }}</span>
                    </td>
                    <td>{{ formatIdr(base.pending_idr) }}</td>
                    <td class="pc-table__number">{{ formatIdr(base.available_idr) }}</td>
                    <td>{{ formatIdr(base.reserved_idr) }}</td>
                    <td>{{ formatIdr(base.lifetime_idr) }}</td>
                    <td>
                      <ConsoleStatusBadge
                        :status="base.payout_ready ? 'ready' : 'pending'"
                        :label="base.payout_ready ? 'Siap' : 'Belum siap'"
                        :tone="base.payout_ready ? 'success' : 'warning'"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <aside class="pc-stack">
            <section class="pc-card">
              <div class="pc-card__head">
                <div>
                  <h2 class="pc-card__title">Aturan pendapatan</h2>
                  <p class="pc-card__desc">Dibaca dari konfigurasi platform.</p>
                </div>
                <LockKeyhole :size="15" class="pc-muted" />
              </div>
              <div class="pc-card__body">
                <dl class="pc-kv">
                  <dt>Mata uang</dt>
                  <dd>{{ workspace.currency }}</dd>
                  <dt>Per fess</dt>
                  <dd>{{ formatIdr(workspace.revenue_per_fess_idr) }}</dd>
                  <dt>Masa tahan</dt>
                  <dd>{{ workspace.hold_days }} hari</dd>
                  <dt>Minimum payout</dt>
                  <dd>{{ formatIdr(workspace.min_payout_idr) }}</dd>
                  <dt>Biaya payout</dt>
                  <dd>{{ formatIdr(workspace.payout_fee_idr) }}</dd>
                  <dt>Review payout</dt>
                  <dd>Manual oleh Super Admin</dd>
                </dl>
              </div>
            </section>

            <div class="pc-callout pc-callout--lime">
              <CircleDollarSign :size="16" />
              <div>
                1 CTF = 1 fess menghasilkan pendapatan IDR untuk base. Saldo base tidak dapat diubah
                langsung dari konsol ini.
              </div>
            </div>
          </aside>
        </div>
      </template>

      <!-- PAYMENTS -->
      <template v-else-if="activeTab === 'payments'">
        <div class="pc-callout" style="margin-bottom: 16px">
          <ReceiptText :size="16" />
          <div>
            Monitoring order pembayaran bersifat read-only. Paket top-up bisa diubah di kartu "Paket
            top-up CTF" di atas. Refund dan chargeback belum tersedia di v1. Reconcile manual tetap
            memakai runbook terpisah.
            <template v-if="systemSettings">
              <strong>
                PAYMENTS_ENABLED={{
                  systemSettings.environment.payments_enabled ? 'true' : 'false'
                }}
              </strong>
              · Midtrans
              {{ systemSettings.integrations.midtrans.mode }}.
            </template>
          </div>
        </div>

        <section class="pc-card">
          <div class="pc-card__head">
            <div>
              <h2 class="pc-card__title">Paket top-up CTF</h2>
              <p class="pc-card__desc">
                Nominal dan jumlah CTF bisa diubah tanpa deploy. Order yang sudah dibuat memakai
                snapshot harga saat dibeli, jadi perubahan hanya berlaku untuk pembelian baru.
              </p>
            </div>
            <div class="pc-card__actions">
              <button
                type="button"
                class="pc-btn pc-btn--ghost pc-btn--sm"
                :disabled="packagesLoading"
                @click="loadPackages"
              >
                <RefreshCw :size="12" :class="{ 'pc-spin': packagesLoading }" />
                Refresh
              </button>
              <button
                type="button"
                class="pc-btn pc-btn--primary pc-btn--sm"
                :disabled="packageSource === 'fallback'"
                @click="openPackageDialog()"
              >
                <Plus :size="12" />
                Tambah paket
              </button>
            </div>
          </div>

          <div v-if="packageSource === 'fallback'" class="pc-card__body">
            <div class="pc-callout pc-callout--warning">
              <AlertTriangle :size="16" />
              <div>
                Tabel <code>PaymentPackage</code> belum ada di database, jadi daftar ini masih
                dibaca dari konstanta kode dan belum bisa diubah. Jalankan
                <code>prisma migrate deploy</code> lebih dulu.
              </div>
            </div>
          </div>

          <div v-if="packagesError" class="pc-card__body">
            <div class="pc-error">
              <AlertTriangle :size="16" />
              <div>
                <strong>Paket top-up gagal dimuat.</strong>
                <p>{{ packagesError }}</p>
              </div>
            </div>
          </div>

          <div v-else-if="packagesLoading && !packages.length" class="pc-card__body pc-stack">
            <div v-for="index in 3" :key="index" class="pc-skeleton pc-skeleton--line" />
          </div>

          <div v-else-if="!packages.length" class="pc-empty">
            <span class="pc-empty__icon"><Wallet :size="18" /></span>
            Belum ada paket top-up. Tambahkan minimal satu paket aktif agar pengguna bisa top-up.
          </div>

          <div v-else class="pc-table-wrap">
            <table class="pc-table">
              <thead>
                <tr>
                  <th>Paket</th>
                  <th>Harga</th>
                  <th>CTF</th>
                  <th>Efektif / CTF</th>
                  <th>Status</th>
                  <th class="pc-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pkg in packages" :key="pkg.code">
                  <td>
                    <span class="pc-table__primary">{{ pkg.name }}</span>
                    <span class="pc-table__sub pc-mono">{{ pkg.code }}</span>
                    <span v-if="pkg.description" class="pc-table__sub">
                      {{ pkg.description }}
                    </span>
                  </td>
                  <td class="pc-table__number">{{ formatIdr(pkg.amount_idr) }}</td>
                  <td class="pc-table__number">{{ formatNumber(pkg.ctf_amount) }}</td>
                  <td class="pc-table__number">{{ effectiveCtfPrice(pkg) }}</td>
                  <td>
                    <ConsoleStatusBadge
                      :status="pkg.is_active ? 'active' : 'inactive'"
                      :label="pkg.is_active ? 'Aktif' : 'Nonaktif'"
                      :tone="pkg.is_active ? 'lime' : 'neutral'"
                    />
                  </td>
                  <td>
                    <div class="pc-table__actions">
                      <button
                        type="button"
                        class="pc-btn pc-btn--ghost pc-btn--sm"
                        :disabled="packageSource === 'fallback'"
                        @click="openPackageDialog(pkg)"
                      >
                        <Pencil :size="12" />
                        Ubah
                      </button>
                      <button
                        type="button"
                        class="pc-btn pc-btn--ghost pc-btn--sm"
                        :disabled="packageSource === 'fallback'"
                        @click="openPackageStatus(pkg)"
                      >
                        {{ pkg.is_active ? 'Nonaktifkan' : 'Aktifkan' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="pc-card">
          <div class="pc-card__head">
            <div>
              <h2 class="pc-card__title">Kupon promo</h2>
              <p class="pc-card__desc">
                Diskon mengurangi harga bayar, bukan jumlah CTF. Setiap kupon dibatasi satu kali per
                akun dan kuota totalnya bisa diatur. Order yang sudah dibuat tidak terpengaruh.
              </p>
            </div>
            <div class="pc-card__actions">
              <button
                type="button"
                class="pc-btn pc-btn--ghost pc-btn--sm"
                :disabled="couponsLoading"
                @click="loadCoupons"
              >
                <RefreshCw :size="12" :class="{ 'pc-spin': couponsLoading }" />
                Refresh
              </button>
              <button
                type="button"
                class="pc-btn pc-btn--primary pc-btn--sm"
                :disabled="couponSource === 'fallback'"
                @click="openCouponDialog()"
              >
                <Plus :size="12" />
                Tambah kupon
              </button>
            </div>
          </div>

          <div v-if="couponSource === 'fallback'" class="pc-card__body">
            <div class="pc-callout pc-callout--warning">
              <AlertTriangle :size="16" />
              <div>
                Tabel <code>Coupon</code> belum ada di database, jadi kupon belum bisa dibuat.
                Jalankan <code>prisma migrate deploy</code> lebih dulu.
              </div>
            </div>
          </div>

          <div v-if="couponsError" class="pc-card__body">
            <div class="pc-error">
              <AlertTriangle :size="16" />
              <div>
                <strong>Kupon gagal dimuat.</strong>
                <p>{{ couponsError }}</p>
              </div>
            </div>
          </div>

          <div v-else-if="couponsLoading && !coupons.length" class="pc-card__body pc-stack">
            <div v-for="index in 2" :key="index" class="pc-skeleton pc-skeleton--line" />
          </div>

          <div v-else-if="!coupons.length" class="pc-empty">
            <span class="pc-empty__icon"><Ticket :size="18" /></span>
            Belum ada kupon. Tambahkan kode promo untuk memberi potongan harga top-up.
          </div>

          <div v-else class="pc-table-wrap">
            <table class="pc-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Diskon</th>
                  <th>Terpakai</th>
                  <th>Masa berlaku</th>
                  <th>Status</th>
                  <th class="pc-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="coupon in coupons" :key="coupon.code">
                  <td>
                    <span class="pc-table__primary pc-mono">{{ coupon.code }}</span>
                    <span v-if="coupon.label" class="pc-table__sub">{{ coupon.label }}</span>
                  </td>
                  <td>{{ couponDiscountLabel(coupon) }}</td>
                  <td class="pc-table__number">
                    {{ coupon.redemption_count }}
                    <span class="pc-table__sub">
                      / {{ coupon.max_redemptions === null ? '∞' : coupon.max_redemptions }}
                    </span>
                  </td>
                  <td>{{ couponValidityLabel(coupon) }}</td>
                  <td>
                    <ConsoleStatusBadge
                      :status="coupon.is_active ? 'active' : 'inactive'"
                      :label="coupon.is_active ? 'Aktif' : 'Nonaktif'"
                      :tone="coupon.is_active ? 'lime' : 'neutral'"
                    />
                  </td>
                  <td>
                    <div class="pc-table__actions">
                      <button
                        type="button"
                        class="pc-btn pc-btn--ghost pc-btn--sm"
                        :disabled="couponSource === 'fallback'"
                        @click="openCouponDialog(coupon)"
                      >
                        <Pencil :size="12" />
                        Ubah
                      </button>
                      <button
                        type="button"
                        class="pc-btn pc-btn--ghost pc-btn--sm"
                        :disabled="couponSource === 'fallback'"
                        @click="openCouponStatus(coupon)"
                      >
                        {{ coupon.is_active ? 'Nonaktifkan' : 'Aktifkan' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="pc-card">
          <div class="pc-card__head">
            <div>
              <h2 class="pc-card__title">Order pembayaran</h2>
              <p class="pc-card__desc">
                {{ paymentOrders.total }} order tercatat. Klik order untuk melihat event webhook.
              </p>
            </div>
            <button
              type="button"
              class="pc-btn pc-btn--ghost pc-btn--sm"
              :disabled="paymentsLoading"
              @click="loadPaymentOrders"
            >
              <RefreshCw :size="12" :class="{ 'pc-spin': paymentsLoading }" />
              Refresh
            </button>
          </div>

          <div class="pc-filters">
            <div class="pc-field pc-field--grow">
              <label class="pc-label" for="payment-search">Cari order / user</label>
              <div class="pc-input-icon">
                <Search :size="13" />
                <input
                  id="payment-search"
                  v-model="paymentQuery"
                  class="pc-input"
                  type="search"
                  placeholder="Order ID, transaksi Midtrans, handle, atau email"
                />
              </div>
            </div>
            <div class="pc-field">
              <label class="pc-label" for="payment-status">Status</label>
              <select id="payment-status" v-model="paymentStatus" class="pc-select">
                <option value="">Semua status</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="EXPIRED">Expired</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
                <option value="PARTIAL_REFUND">Partial refund</option>
                <option value="CHARGEBACK">Chargeback</option>
              </select>
            </div>
          </div>

          <div v-if="paymentsError" class="pc-card__body">
            <div class="pc-error">
              <AlertTriangle :size="16" />
              <div>
                <strong>Order pembayaran gagal dimuat.</strong>
                <p>{{ paymentsError }}</p>
              </div>
            </div>
          </div>

          <div
            v-else-if="paymentsLoading && !paymentOrders.data.length"
            class="pc-card__body pc-stack"
          >
            <div v-for="index in 4" :key="index" class="pc-skeleton pc-skeleton--line" />
          </div>

          <div v-else-if="!paymentOrders.data.length" class="pc-empty">
            <span class="pc-empty__icon"><ReceiptText :size="18" /></span>
            Tidak ada order pembayaran pada filter ini.
          </div>

          <div v-else class="pc-table-wrap">
            <table class="pc-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Pengguna</th>
                  <th>Paket</th>
                  <th>Nominal</th>
                  <th>Status</th>
                  <th>Dibuat</th>
                  <th class="pc-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in paymentOrders.data" :key="order.id">
                  <td>
                    <button
                      type="button"
                      class="pc-entity-link pc-mono"
                      @click="openPayment(order)"
                    >
                      {{ order.order_id }}
                    </button>
                    <span class="pc-table__sub">
                      {{ order.payment_channel || order.payment_method || 'Midtrans' }}
                    </span>
                  </td>
                  <td>
                    <span class="pc-table__primary">{{ order.user?.handle || '—' }}</span>
                    <span class="pc-table__sub">{{ order.user?.email || '—' }}</span>
                  </td>
                  <td>
                    {{ order.package_name }}
                    <span class="pc-table__sub">{{ formatNumber(order.ctf_amount) }} CTF</span>
                  </td>
                  <td class="pc-table__number">{{ formatIdr(order.amount_idr) }}</td>
                  <td>
                    <ConsoleStatusBadge :status="order.status" />
                    <span v-if="order.midtrans_status" class="pc-table__sub">
                      Midtrans {{ order.midtrans_status }}
                    </span>
                  </td>
                  <td>
                    {{ formatDateTime(order.created_at) }}
                    <span class="pc-table__sub">
                      {{ order.paid_at ? `Paid ${formatDateTime(order.paid_at)}` : '' }}
                    </span>
                  </td>
                  <td>
                    <div class="pc-table__actions">
                      <button
                        type="button"
                        class="pc-btn pc-btn--ghost pc-btn--sm"
                        @click="openPayment(order)"
                      >
                        <Eye :size="12" />
                        Detail
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="paymentOrders.total_pages > 1" class="pc-pagination">
            <span>
              {{ paymentOrders.total }} order · halaman {{ paymentOrders.page }} dari
              {{ paymentOrders.total_pages }}
            </span>
            <div class="pc-pagination__buttons">
              <button
                type="button"
                class="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon"
                :disabled="paymentOrders.page <= 1 || paymentsLoading"
                aria-label="Halaman sebelumnya"
                @click="goPaymentPage(paymentOrders.page - 1)"
              >
                <ChevronLeft :size="14" />
              </button>
              <button
                type="button"
                class="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon"
                :disabled="paymentOrders.page >= paymentOrders.total_pages || paymentsLoading"
                aria-label="Halaman berikutnya"
                @click="goPaymentPage(paymentOrders.page + 1)"
              >
                <ChevronRight :size="14" />
              </button>
            </div>
          </div>
        </section>

        <section class="pc-card">
          <div class="pc-card__head">
            <div>
              <h2 class="pc-card__title">Event webhook</h2>
              <p class="pc-card__desc">
                Signature, status pemrosesan, dan error terakhir dari Midtrans.
              </p>
            </div>
            <div class="pc-field" style="width: 180px">
              <label class="pc-label" for="event-status">Status event</label>
              <select id="event-status" v-model="eventStatus" class="pc-select">
                <option value="">Semua</option>
                <option value="RECEIVED">Diterima</option>
                <option value="PROCESSED">Diproses</option>
                <option value="IGNORED">Diabaikan</option>
                <option value="INVALID_SIGNATURE">Signature invalid</option>
                <option value="FAILED">Gagal</option>
              </select>
            </div>
          </div>

          <div v-if="eventsError" class="pc-card__body">
            <div class="pc-error">
              <AlertTriangle :size="16" />
              <div>
                <strong>Event pembayaran gagal dimuat.</strong>
                <p>{{ eventsError }}</p>
              </div>
            </div>
          </div>

          <div
            v-else-if="eventsLoading && !paymentEvents.data.length"
            class="pc-card__body pc-stack"
          >
            <div v-for="index in 3" :key="index" class="pc-skeleton pc-skeleton--line" />
          </div>

          <div v-else-if="!paymentEvents.data.length" class="pc-empty">
            <span class="pc-empty__icon"><ShieldCheck :size="18" /></span>
            Belum ada event webhook pada filter ini.
          </div>

          <div v-else class="pc-table-wrap">
            <table class="pc-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Event</th>
                  <th>Status</th>
                  <th>Signature</th>
                  <th>Diproses</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="event in paymentEvents.data" :key="event.id">
                  <td class="pc-mono">{{ event.order_id }}</td>
                  <td>{{ event.event_type }}</td>
                  <td><ConsoleStatusBadge :status="event.status" /></td>
                  <td>
                    <ConsoleStatusBadge
                      :status="event.signature_valid ? 'valid' : 'invalid'"
                      :label="event.signature_valid ? 'Valid' : 'Invalid'"
                      :tone="event.signature_valid ? 'success' : 'danger'"
                    />
                  </td>
                  <td>{{ formatDateTime(event.processed_at || event.created_at) }}</td>
                  <td>{{ event.error_message || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="paymentEvents.total_pages > 1" class="pc-pagination">
            <span>
              {{ paymentEvents.total }} event · halaman {{ paymentEvents.page }} dari
              {{ paymentEvents.total_pages }}
            </span>
            <div class="pc-pagination__buttons">
              <button
                type="button"
                class="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon"
                :disabled="paymentEvents.page <= 1 || eventsLoading"
                aria-label="Halaman sebelumnya"
                @click="goEventPage(paymentEvents.page - 1)"
              >
                <ChevronLeft :size="14" />
              </button>
              <button
                type="button"
                class="pc-btn pc-btn--ghost pc-btn--sm pc-btn--icon"
                :disabled="paymentEvents.page >= paymentEvents.total_pages || eventsLoading"
                aria-label="Halaman berikutnya"
                @click="goEventPage(paymentEvents.page + 1)"
              >
                <ChevronRight :size="14" />
              </button>
            </div>
          </div>
        </section>
      </template>
    </template>

    <BaseSupportDrawer v-model="supportOpen" :handle="supportHandle" />

    <ConsoleDialog
      v-model="payoutDialog.open"
      :title="payoutDialogTitle"
      :subtitle="payoutDialogSubtitle"
      eyebrow="Review payout · re-auth"
      :confirm-label="payoutDialogConfirmLabel"
      :tone="payoutDialogTone"
      :loading="payoutDialog.loading"
      :confirm-disabled="!payoutCanSubmit"
      :error="payoutDialog.error"
      @confirm="submitPayoutReview"
    >
      <div v-if="payoutDialog.payout" class="pc-summary">
        <div class="pc-summary__row">
          <span class="pc-summary__label">Base</span>
          <span class="pc-summary__value">{{ payoutDialog.payout.base_handle }}</span>
        </div>
        <div class="pc-summary__row">
          <span class="pc-summary__label">Nominal</span>
          <span class="pc-summary__value">{{ formatIdr(payoutDialog.payout.amount_idr) }}</span>
        </div>
        <div class="pc-summary__row">
          <span class="pc-summary__label">Rekening</span>
          <span class="pc-summary__value">
            {{ payoutDialog.payout.bank_name }} ·
            {{ payoutDialog.payout.bank_account_number_masked }}
          </span>
        </div>
        <div class="pc-summary__row">
          <span class="pc-summary__label">Status saat ini</span>
          <span class="pc-summary__value">{{ statusLabel(payoutDialog.payout.status) }}</span>
        </div>
      </div>

      <div class="pc-dialog-grid">
        <div v-if="payoutDialogNeedsFee" class="pc-field pc-field--full">
          <label class="pc-label" for="payout-fee">Biaya transfer (IDR)</label>
          <input
            id="payout-fee"
            v-model="payoutDialog.fee"
            class="pc-input"
            type="number"
            min="0"
            step="100"
            inputmode="numeric"
          />
          <p class="pc-help">
            Net yang akan dicatat:
            <strong>{{ formatIdr(payoutNetPreview) }}</strong>
          </p>
        </div>

        <div v-if="payoutDialogNeedsReference" class="pc-field pc-field--full">
          <label class="pc-label" for="payout-reference">Referensi transfer</label>
          <input
            id="payout-reference"
            v-model="payoutDialog.reference"
            class="pc-input"
            type="text"
            maxlength="160"
            placeholder="Nomor referensi / ID transaksi bank"
          />
        </div>

        <div v-if="payoutDialogNeedsReason" class="pc-field pc-field--full">
          <label class="pc-label" for="payout-reason">
            {{ payoutDialog.action === 'reject' ? 'Alasan penolakan' : 'Alasan kegagalan' }}
          </label>
          <textarea
            id="payout-reason"
            v-model="payoutDialog.reason"
            class="pc-textarea"
            maxlength="500"
            placeholder="Jelaskan alasan agar base dapat memperbaiki data."
          />
        </div>

        <div class="pc-field pc-field--full">
          <label class="pc-label" for="payout-password">Kata sandi Super Admin</label>
          <input
            id="payout-password"
            v-model="payoutDialog.password"
            class="pc-input"
            type="password"
            autocomplete="current-password"
            placeholder="Konfirmasi kata sandi untuk aksi ini"
          />
          <p class="pc-help">
            Re-auth wajib untuk semua review payout. Aksi dicatat dengan IP dan user agent.
          </p>
        </div>
      </div>

      <div class="pc-callout" style="margin-top: 12px">
        <KeyRound :size="15" />
        <div>{{ payoutImpactNote }}</div>
      </div>
    </ConsoleDialog>

    <ConsoleDialog
      v-model="kycDialog.open"
      title="Kelola KYC base"
      :subtitle="
        kycDialog.base
          ? `${kycDialog.base.handle} · ${formatIdr(kycDialog.base.available_idr)} available`
          : ''
      "
      eyebrow="KYC payout · re-auth"
      confirm-label="Simpan status KYC"
      tone="primary"
      :loading="kycDialog.loading"
      :confirm-disabled="!kycCanSubmit"
      :error="kycDialog.error"
      @confirm="submitKyc"
    >
      <div class="pc-dialog-grid">
        <div class="pc-field">
          <label class="pc-label" for="kyc-status">Status</label>
          <select id="kyc-status" v-model="kycDialog.status" class="pc-select">
            <option value="verified">Terverifikasi</option>
            <option value="rejected">Ditolak</option>
            <option value="unverified">Belum verifikasi</option>
          </select>
        </div>
        <div class="pc-field">
          <label class="pc-label" for="kyc-password">Kata sandi</label>
          <input
            id="kyc-password"
            v-model="kycDialog.password"
            class="pc-input"
            type="password"
            autocomplete="current-password"
            placeholder="Konfirmasi kata sandi"
          />
        </div>
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="kyc-note">Catatan audit</label>
          <textarea
            id="kyc-note"
            v-model="kycDialog.note"
            class="pc-textarea"
            maxlength="500"
            placeholder="Alasan verifikasi atau penolakan (disarankan untuk penolakan)."
          />
        </div>
      </div>

      <div class="pc-callout" style="margin-top: 12px">
        <ShieldCheck :size="15" />
        <div>
          Verifikasi KYC membuka kemampuan payout base. Pastikan nama rekening dan kepemilikan base
          sudah sesuai.
        </div>
      </div>
    </ConsoleDialog>

    <ConsoleDialog
      v-model="priceDialog.open"
      title="Atur harga fess"
      :subtitle="priceDialog.base ? `${priceDialog.base.handle} · ${priceDialog.base.name}` : ''"
      eyebrow="Harga fess · re-auth"
      confirm-label="Simpan harga fess"
      tone="primary"
      :loading="priceDialog.loading"
      :confirm-disabled="!priceCanSubmit"
      :error="priceDialog.error"
      @confirm="submitFessPrice"
    >
      <div class="pc-summary">
        <div class="pc-summary__row">
          <span class="pc-summary__label">Harga saat ini</span>
          <span class="pc-summary__value">{{ fessPriceLabel(priceDialog.base) }}</span>
        </div>
        <div class="pc-summary__row">
          <span class="pc-summary__label">Trial berakhir</span>
          <span class="pc-summary__value">
            {{ formatDateTime(priceDialog.base?.trial_ends_at) }}
          </span>
        </div>
      </div>

      <div class="pc-dialog-grid">
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="fess-price">Harga fess</label>
          <select id="fess-price" v-model="priceDialog.freeForever" class="pc-select">
            <option :value="false">Normal — {{ platformFessPrice }} CTF per fess</option>
            <option :value="true">Gratis permanen — 0 CTF (base mitra)</option>
          </select>
          <p class="pc-help">
            Harga normal mengikuti konstanta platform CTF_PER_PAID_FESS ({{ platformFessPrice }}
            CTF). Hanya status gratis yang bisa diubah per base.
          </p>
        </div>
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="price-reason">Alasan perubahan</label>
          <textarea
            id="price-reason"
            v-model="priceDialog.reason"
            class="pc-textarea"
            maxlength="500"
            placeholder="Contoh: base mitra FnC, kompensasi migrasi, atau koreksi billing."
          />
          <p class="pc-help">Minimal 5 karakter. Alasan tersimpan di audit.</p>
        </div>
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="price-password">Kata sandi Super Admin</label>
          <input
            id="price-password"
            v-model="priceDialog.password"
            class="pc-input"
            type="password"
            autocomplete="current-password"
            placeholder="Konfirmasi kata sandi"
          />
        </div>
      </div>

      <div
        class="pc-callout"
        :class="priceDialog.freeForever ? 'pc-callout--lime' : 'pc-callout--warning'"
      >
        <Sparkles :size="15" />
        <div>
          {{
            priceDialog.freeForever
              ? 'Base mitra: pengirim tidak dipotong CTF. Base ini juga tidak menerima pendapatan fess dari platform.'
              : `Base kembali berbayar: setiap fess memotong ${platformFessPrice} CTF dari saldo pengirim dan base menerima pendapatan platform.`
          }}
        </div>
      </div>
    </ConsoleDialog>

    <ConsoleDialog
      v-model="packageDialog.open"
      :title="packageDialog.mode === 'create' ? 'Tambah paket top-up' : 'Ubah paket top-up'"
      :subtitle="
        packageDialog.mode === 'create'
          ? 'Paket baru langsung tampil di halaman top-up'
          : `${packageDialog.code} · berlaku untuk pembelian berikutnya`
      "
      eyebrow="Paket top-up · re-auth"
      :confirm-label="packageDialog.mode === 'create' ? 'Simpan paket' : 'Simpan perubahan'"
      tone="primary"
      :loading="packageDialog.loading"
      :confirm-disabled="!packageCanSubmit"
      :error="packageDialog.error"
      @confirm="submitPackage"
    >
      <div class="pc-dialog-grid">
        <div class="pc-field">
          <label class="pc-label" for="package-code">Kode paket</label>
          <input
            id="package-code"
            v-model="packageDialog.code"
            class="pc-input pc-mono"
            maxlength="32"
            placeholder="mis. hemat_2"
            :disabled="packageDialog.mode === 'edit'"
          />
          <p class="pc-help">
            Huruf kecil, angka, garis bawah. Kode tidak bisa diubah setelah dibuat.
          </p>
        </div>
        <div class="pc-field">
          <label class="pc-label" for="package-name">Nama paket</label>
          <input
            id="package-name"
            v-model="packageDialog.name"
            class="pc-input"
            maxlength="40"
            placeholder="mis. Hemat"
          />
        </div>
        <div class="pc-field">
          <label class="pc-label" for="package-amount">Harga (Rp)</label>
          <input
            id="package-amount"
            v-model="packageDialog.amount"
            class="pc-input"
            inputmode="numeric"
            placeholder="10000"
          />
        </div>
        <div class="pc-field">
          <label class="pc-label" for="package-ctf">CTF diterima</label>
          <input
            id="package-ctf"
            v-model="packageDialog.ctf"
            class="pc-input"
            inputmode="numeric"
            placeholder="55"
          />
        </div>
        <div class="pc-field">
          <label class="pc-label" for="package-sort">Urutan tampil</label>
          <input
            id="package-sort"
            v-model="packageDialog.sortOrder"
            class="pc-input"
            inputmode="numeric"
            placeholder="20"
          />
        </div>
        <div class="pc-field">
          <label class="pc-label" for="package-active">Status</label>
          <select id="package-active" v-model="packageDialog.isActive" class="pc-select">
            <option :value="true">Aktif</option>
            <option :value="false">Nonaktif</option>
          </select>
        </div>
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="package-desc">Deskripsi</label>
          <input
            id="package-desc"
            v-model="packageDialog.description"
            class="pc-input"
            maxlength="160"
            placeholder="Tampil di kartu paket halaman top-up"
          />
        </div>
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="package-reason">Alasan perubahan</label>
          <textarea
            id="package-reason"
            v-model="packageDialog.reason"
            class="pc-textarea"
            maxlength="500"
            placeholder="Contoh: penyesuaian harga kuartal IV."
          />
          <p class="pc-help">Minimal 5 karakter. Alasan tersimpan di audit.</p>
        </div>
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="package-password">Kata sandi Super Admin</label>
          <input
            id="package-password"
            v-model="packageDialog.password"
            class="pc-input"
            type="password"
            autocomplete="current-password"
            placeholder="Konfirmasi kata sandi"
          />
        </div>
      </div>

      <div
        class="pc-callout"
        :class="packageRatioIsWorse ? 'pc-callout--warning' : 'pc-callout--lime'"
      >
        <Sparkles :size="15" />
        <div>{{ packagePreview }}</div>
      </div>
    </ConsoleDialog>

    <ConsoleDialog
      v-model="packageStatusDialog.open"
      :title="packageStatusDialog.nextActive ? 'Aktifkan paket' : 'Nonaktifkan paket'"
      :subtitle="
        packageStatusDialog.pkg
          ? `${packageStatusDialog.pkg.name} · ${packageStatusDialog.pkg.code}`
          : ''
      "
      eyebrow="Status paket · re-auth"
      :confirm-label="packageStatusDialog.nextActive ? 'Aktifkan paket' : 'Nonaktifkan paket'"
      :tone="packageStatusDialog.nextActive ? 'primary' : 'danger'"
      :loading="packageStatusDialog.loading"
      :confirm-disabled="!packageStatusCanSubmit"
      :error="packageStatusDialog.error"
      @confirm="submitPackageStatus"
    >
      <div class="pc-dialog-grid">
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="package-status-reason">Alasan perubahan</label>
          <textarea
            id="package-status-reason"
            v-model="packageStatusDialog.reason"
            class="pc-textarea"
            maxlength="500"
            placeholder="Contoh: paket digabung ke Bundling."
          />
          <p class="pc-help">Minimal 5 karakter. Alasan tersimpan di audit.</p>
        </div>
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="package-status-password">Kata sandi Super Admin</label>
          <input
            id="package-status-password"
            v-model="packageStatusDialog.password"
            class="pc-input"
            type="password"
            autocomplete="current-password"
            placeholder="Konfirmasi kata sandi"
          />
        </div>
      </div>

      <div
        class="pc-callout"
        :class="packageStatusDialog.nextActive ? 'pc-callout--lime' : 'pc-callout--warning'"
      >
        <Info :size="15" />
        <div>
          {{
            packageStatusDialog.nextActive
              ? 'Paket akan tampil lagi di halaman top-up dan bisa dibeli.'
              : 'Paket disembunyikan dari halaman top-up dan tidak bisa dibeli lagi. Order lama tetap menyimpan nominal saat dibeli.'
          }}
        </div>
      </div>
    </ConsoleDialog>

    <ConsoleDialog
      v-model="couponDialog.open"
      :title="couponDialog.mode === 'create' ? 'Tambah kupon promo' : 'Ubah kupon promo'"
      :subtitle="
        couponDialog.mode === 'create'
          ? 'Kupon langsung bisa dipakai setelah disimpan'
          : `${couponDialog.code} · hanya berlaku untuk pembelian berikutnya`
      "
      eyebrow="Kupon promo · re-auth"
      :confirm-label="couponDialog.mode === 'create' ? 'Simpan kupon' : 'Simpan perubahan'"
      tone="primary"
      :loading="couponDialog.loading"
      :confirm-disabled="!couponCanSubmit"
      :error="couponDialog.error"
      @confirm="submitCoupon"
    >
      <div class="pc-dialog-grid">
        <div class="pc-field">
          <label class="pc-label" for="coupon-code">Kode kupon</label>
          <input
            id="coupon-code"
            v-model="couponDialog.code"
            class="pc-input pc-mono"
            maxlength="32"
            placeholder="mis. HEMAT2026"
            :disabled="couponDialog.mode === 'edit'"
          />
          <p class="pc-help">
            Huruf, angka, garis bawah, atau strip. Kode tidak bisa diubah setelah dibuat.
          </p>
        </div>
        <div class="pc-field">
          <label class="pc-label" for="coupon-label">Label</label>
          <input
            id="coupon-label"
            v-model="couponDialog.label"
            class="pc-input"
            maxlength="60"
            placeholder="mis. Promo akhir tahun"
          />
        </div>
        <div class="pc-field">
          <label class="pc-label" for="coupon-type">Tipe diskon</label>
          <select id="coupon-type" v-model="couponDialog.discountType" class="pc-select">
            <option value="FIXED">Nominal rupiah</option>
            <option value="PERCENT">Persen</option>
          </select>
        </div>
        <div class="pc-field">
          <label class="pc-label" for="coupon-value">
            {{ couponDialog.discountType === 'PERCENT' ? 'Diskon (%)' : 'Diskon (Rp)' }}
          </label>
          <input
            id="coupon-value"
            v-model="couponDialog.discountValue"
            class="pc-input"
            inputmode="numeric"
            :placeholder="couponDialog.discountType === 'PERCENT' ? '20' : '2000'"
          />
        </div>
        <div v-if="couponDialog.discountType === 'PERCENT'" class="pc-field">
          <label class="pc-label" for="coupon-max">Maks potongan (Rp)</label>
          <input
            id="coupon-max"
            v-model="couponDialog.maxDiscount"
            class="pc-input"
            inputmode="numeric"
            placeholder="Kosongkan bila tanpa batas"
          />
        </div>
        <div class="pc-field">
          <label class="pc-label" for="coupon-min">Minimum pembelian (Rp)</label>
          <input
            id="coupon-min"
            v-model="couponDialog.minAmount"
            class="pc-input"
            inputmode="numeric"
            placeholder="0"
          />
        </div>
        <div class="pc-field">
          <label class="pc-label" for="coupon-quota">Kuota total</label>
          <input
            id="coupon-quota"
            v-model="couponDialog.maxRedemptions"
            class="pc-input"
            inputmode="numeric"
            placeholder="Kosongkan bila tanpa batas"
          />
        </div>
        <div class="pc-field">
          <label class="pc-label" for="coupon-active">Status</label>
          <select id="coupon-active" v-model="couponDialog.isActive" class="pc-select">
            <option :value="true">Aktif</option>
            <option :value="false">Nonaktif</option>
          </select>
        </div>
        <div class="pc-field">
          <label class="pc-label" for="coupon-start">Mulai berlaku</label>
          <input
            id="coupon-start"
            v-model="couponDialog.startsAt"
            class="pc-input"
            type="datetime-local"
          />
          <p class="pc-help">Kosongkan agar langsung berlaku.</p>
        </div>
        <div class="pc-field">
          <label class="pc-label" for="coupon-end">Berakhir</label>
          <input
            id="coupon-end"
            v-model="couponDialog.endsAt"
            class="pc-input"
            type="datetime-local"
          />
          <p class="pc-help">Kosongkan agar tanpa batas waktu.</p>
        </div>
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="coupon-reason">Alasan perubahan</label>
          <textarea
            id="coupon-reason"
            v-model="couponDialog.reason"
            class="pc-textarea"
            maxlength="500"
            placeholder="Contoh: promo akhir tahun untuk pengguna baru."
          />
          <p class="pc-help">Minimal 5 karakter. Alasan tersimpan di audit.</p>
        </div>
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="coupon-password">Kata sandi Super Admin</label>
          <input
            id="coupon-password"
            v-model="couponDialog.password"
            class="pc-input"
            type="password"
            autocomplete="current-password"
            placeholder="Konfirmasi kata sandi"
          />
        </div>
      </div>

      <div class="pc-callout" :class="couponPreviewTone">
        <Sparkles :size="15" />
        <div>{{ couponPreview }}</div>
      </div>
    </ConsoleDialog>

    <ConsoleDialog
      v-model="couponStatusDialog.open"
      :title="couponStatusDialog.nextActive ? 'Aktifkan kupon' : 'Nonaktifkan kupon'"
      :subtitle="couponStatusDialog.coupon ? couponStatusDialog.coupon.code : ''"
      eyebrow="Status kupon · re-auth"
      :confirm-label="couponStatusDialog.nextActive ? 'Aktifkan kupon' : 'Nonaktifkan kupon'"
      :tone="couponStatusDialog.nextActive ? 'primary' : 'danger'"
      :loading="couponStatusDialog.loading"
      :confirm-disabled="!couponStatusCanSubmit"
      :error="couponStatusDialog.error"
      @confirm="submitCouponStatus"
    >
      <div class="pc-dialog-grid">
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="coupon-status-reason">Alasan perubahan</label>
          <textarea
            id="coupon-status-reason"
            v-model="couponStatusDialog.reason"
            class="pc-textarea"
            maxlength="500"
            placeholder="Contoh: promo sudah berakhir."
          />
          <p class="pc-help">Minimal 5 karakter. Alasan tersimpan di audit.</p>
        </div>
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="coupon-status-password">Kata sandi Super Admin</label>
          <input
            id="coupon-status-password"
            v-model="couponStatusDialog.password"
            class="pc-input"
            type="password"
            autocomplete="current-password"
            placeholder="Konfirmasi kata sandi"
          />
        </div>
      </div>

      <div
        class="pc-callout"
        :class="couponStatusDialog.nextActive ? 'pc-callout--lime' : 'pc-callout--warning'"
      >
        <Info :size="15" />
        <div>
          {{
            couponStatusDialog.nextActive
              ? 'Kupon bisa dipakai lagi oleh pengguna selama kuota dan masa berlakunya masih ada.'
              : 'Kupon tidak bisa dipakai lagi. Order yang sudah memakai kupon ini tetap berlaku.'
          }}
        </div>
      </div>
    </ConsoleDialog>

    <ConsoleDrawer
      v-model="paymentDetailOpen"
      eyebrow="Payment monitoring · read-only"
      :title="paymentDetail?.order_id || 'Detail pembayaran'"
      :subtitle="
        paymentDetail
          ? `${paymentDetail.package_name} · ${paymentDetail.user?.handle || 'Pengguna'}`
          : 'Memuat detail order…'
      "
    >
      <div v-if="paymentDetailLoading" class="pc-stack">
        <div class="pc-skeleton pc-skeleton--stat" />
        <div class="pc-skeleton pc-skeleton--line" />
        <div class="pc-skeleton pc-skeleton--line" />
      </div>

      <div v-else-if="paymentDetailError" class="pc-stack">
        <div class="pc-error">
          <AlertTriangle :size="16" />
          <div>
            <strong>Detail order gagal dimuat.</strong>
            <p>{{ paymentDetailError }}</p>
          </div>
        </div>
        <button type="button" class="pc-btn pc-btn--ghost" @click="reloadPaymentDetail">
          Coba lagi
        </button>
      </div>

      <div v-else-if="paymentDetail" class="pc-stack">
        <div class="pc-inline">
          <ConsoleStatusBadge :status="paymentDetail.status" />
          <span class="pc-badge pc-badge--neutral">
            {{ paymentDetail.payment_channel || paymentDetail.payment_method || 'Midtrans' }}
          </span>
          <span class="pc-badge pc-badge--neutral">{{ paymentDetail.currency }}</span>
        </div>

        <div class="pc-stats pc-stats--2">
          <div class="pc-stat pc-stat--lime">
            <p class="pc-stat__label">Nominal</p>
            <p class="pc-stat__value pc-stat__value--small">
              {{ formatIdr(paymentDetail.amount_idr) }}
            </p>
            <p class="pc-stat__hint">{{ formatNumber(paymentDetail.ctf_amount) }} CTF</p>
          </div>
          <div class="pc-stat">
            <p class="pc-stat__label">Paket</p>
            <p class="pc-stat__value pc-stat__value--small">{{ paymentDetail.package_code }}</p>
            <p class="pc-stat__hint">{{ paymentDetail.package_name }}</p>
          </div>
        </div>

        <section class="pc-card">
          <div class="pc-card__head">
            <h3 class="pc-card__title">Ringkasan order</h3>
          </div>
          <div class="pc-card__body">
            <dl class="pc-kv">
              <dt>Order ID</dt>
              <dd class="pc-mono">{{ paymentDetail.order_id }}</dd>
              <dt>Pengguna</dt>
              <dd>
                {{ paymentDetail.user?.handle || '—' }}
                <span class="pc-muted">· {{ paymentDetail.user?.email || '—' }}</span>
              </dd>
              <dt>Midtrans transaction</dt>
              <dd class="pc-mono">{{ paymentDetail.midtrans_transaction_id || '—' }}</dd>
              <dt>Midtrans status</dt>
              <dd>{{ paymentDetail.midtrans_status || '—' }}</dd>
              <dt>Dibuat</dt>
              <dd>{{ formatDateTime(paymentDetail.created_at) }}</dd>
              <dt>Kedaluwarsa</dt>
              <dd>{{ formatDateTime(paymentDetail.expires_at) }}</dd>
              <dt>Dibayar</dt>
              <dd>{{ formatDateTime(paymentDetail.paid_at) }}</dd>
              <dt>Sinkron terakhir</dt>
              <dd>{{ formatDateTime(paymentDetail.last_synced_at) }}</dd>
              <dt v-if="paymentDetail.refunded_at">Refund</dt>
              <dd v-if="paymentDetail.refunded_at">
                {{ formatIdr(paymentDetail.refunded_amount_idr) }} ·
                {{ paymentDetail.refund_reason || 'Tanpa alasan' }}
              </dd>
            </dl>
          </div>
        </section>

        <section class="pc-card">
          <div class="pc-card__head">
            <div>
              <h3 class="pc-card__title">Event webhook</h3>
              <p class="pc-card__desc">{{ paymentDetail.events.length }} event terakhir.</p>
            </div>
          </div>
          <div v-if="paymentDetail.events.length" class="pc-table-wrap">
            <table class="pc-table pc-table--compact">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Status</th>
                  <th>Signature</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="event in paymentDetail.events" :key="event.id">
                  <td>
                    {{ event.event_type }}
                    <span v-if="event.error_message" class="pc-table__sub">
                      {{ event.error_message }}
                    </span>
                  </td>
                  <td><ConsoleStatusBadge :status="event.status" /></td>
                  <td>
                    <ConsoleStatusBadge
                      :status="event.signature_valid ? 'valid' : 'invalid'"
                      :label="event.signature_valid ? 'Valid' : 'Invalid'"
                      :tone="event.signature_valid ? 'success' : 'danger'"
                    />
                  </td>
                  <td>{{ formatDateTime(event.processed_at || event.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="pc-empty">Belum ada event webhook.</div>
        </section>

        <div class="pc-callout">
          <Info :size="15" />
          <div>
            Monitoring ini tidak mengubah status pembayaran. Refund/chargeback belum termasuk dalam
            v1.
          </div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="pc-btn pc-btn--ghost" @click="paymentDetailOpen = false">
          Tutup
        </button>
      </template>
    </ConsoleDrawer>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  AlertTriangle,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Eye,
  Info,
  KeyRound,
  Landmark,
  LockKeyhole,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  Wallet,
  XCircle,
} from 'lucide-vue-next';
import { api } from '../../api';
import { toast } from '../../composables/useToast';
import BaseSupportDrawer from '../../components/super-admin/BaseSupportDrawer.vue';
import ConsoleDialog from '../../components/super-admin/ConsoleDialog.vue';
import ConsoleDrawer from '../../components/super-admin/ConsoleDrawer.vue';
import ConsolePageHeader from '../../components/super-admin/ConsolePageHeader.vue';
import ConsoleStatusBadge from '../../components/super-admin/ConsoleStatusBadge.vue';
import {
  formatDateTime,
  formatIdr,
  formatNumber,
  payoutActionLabel,
  statusLabel,
} from '../../utils/console';

const route = useRoute();
const router = useRouter();

const tabs = [
  { id: 'payouts', label: 'Payout' },
  { id: 'kyc', label: 'KYC & Billing' },
  { id: 'revenue', label: 'Pendapatan' },
  { id: 'payments', label: 'Pembayaran' },
];
const allowedTabs = tabs.map((tab) => tab.id);

function queryTab() {
  const value = Array.isArray(route.query.tab) ? route.query.tab[0] : route.query.tab;
  return allowedTabs.includes(value) ? value : 'payouts';
}

const activeTab = ref(queryTab());

const workspace = ref(null);
const workspaceLoading = ref(false);
const workspaceError = ref('');

const payouts = ref({ data: [], total: 0, page: 1, total_pages: 1 });
const payoutsLoading = ref(false);
const payoutsError = ref('');
const payoutStatus = ref('');
const payoutQuery = ref('');
const payoutPage = ref(1);

const billingQuery = ref('');
const billingLimit = ref(25);
const paymentStatus = ref('');
const paymentQuery = ref('');
const paymentPage = ref(1);
const paymentOrders = ref({ data: [], total: 0, page: 1, total_pages: 1 });
const paymentsLoading = ref(false);
const paymentsError = ref('');

const eventStatus = ref('');
const eventPage = ref(1);
const paymentEvents = ref({ data: [], total: 0, page: 1, total_pages: 1 });
const eventsLoading = ref(false);
const eventsError = ref('');

const systemSettings = ref(null);
const tabLoaded = reactive({ payments: false });

const supportOpen = ref(false);
const supportHandle = ref('');

const paymentDetailOpen = ref(false);
const paymentDetailLoading = ref(false);
const paymentDetailError = ref('');
const paymentDetail = ref(null);
const paymentDetailIdentifier = ref('');

const payoutDialog = reactive({
  open: false,
  payout: null,
  action: 'approve',
  password: '',
  reason: '',
  fee: '',
  reference: '',
  loading: false,
  error: '',
});

const kycDialog = reactive({
  open: false,
  base: null,
  status: 'verified',
  note: '',
  password: '',
  loading: false,
  error: '',
});

const packages = ref([]);
const packageSource = ref('database');
const packagesLoading = ref(false);
const packagesError = ref('');

const packageDialog = reactive({
  open: false,
  mode: 'create',
  code: '',
  name: '',
  amount: '',
  ctf: '',
  description: '',
  sortOrder: '',
  isActive: true,
  reason: '',
  password: '',
  loading: false,
  error: '',
  original: null,
});

const packageStatusDialog = reactive({
  open: false,
  pkg: null,
  nextActive: true,
  reason: '',
  password: '',
  loading: false,
  error: '',
});

const coupons = ref([]);
const couponSource = ref('database');
const couponsLoading = ref(false);
const couponsError = ref('');

const couponDialog = reactive({
  open: false,
  mode: 'create',
  code: '',
  label: '',
  discountType: 'FIXED',
  discountValue: '',
  maxDiscount: '',
  minAmount: '',
  maxRedemptions: '',
  startsAt: '',
  endsAt: '',
  isActive: true,
  reason: '',
  password: '',
  loading: false,
  error: '',
});

const couponStatusDialog = reactive({
  open: false,
  coupon: null,
  nextActive: true,
  reason: '',
  password: '',
  loading: false,
  error: '',
});

const priceDialog = reactive({
  open: false,
  base: null,
  freeForever: false,
  reason: '',
  password: '',
  loading: false,
  error: '',
});

/** Harga fess normal dari backend (CTF_PER_PAID_FESS), bukan hardcode di UI. */
const platformFessPrice = computed(() => {
  const price = Number(workspace.value?.fess_price_ctf ?? 1);
  return Number.isFinite(price) && price > 0 ? price : 1;
});

function fessPriceLabel(base) {
  if (!base) return '-';
  return Number(base.fess_price_ctf) === 0
    ? 'Gratis permanen (0 CTF)'
    : `${base.fess_price_ctf} CTF per fess`;
}

const totals = computed(
  () =>
    workspace.value?.totals || {
      pending_idr: 0,
      available_idr: 0,
      reserved_idr: 0,
      lifetime_idr: 0,
    },
);

const payoutHealthLabel = computed(() => {
  if (!workspace.value) return 'Memuat status';
  return workspace.value.enabled ? 'Payout base aktif' : 'Payout base nonaktif';
});

const bases = computed(() => workspace.value?.bases || []);

const kycQueue = computed(() =>
  bases.value
    .filter(
      (base) =>
        base.bank_name &&
        base.bank_account_name &&
        base.bank_account_number_masked &&
        base.payout_kyc_status !== 'verified',
    )
    .sort((a, b) => (b.available_idr || 0) - (a.available_idr || 0)),
);

const filteredBillingBases = computed(() => {
  const query = billingQuery.value.trim().toLowerCase();
  if (!query) return bases.value;
  return bases.value.filter(
    (base) =>
      String(base.handle || '')
        .toLowerCase()
        .includes(query) ||
      String(base.name || '')
        .toLowerCase()
        .includes(query),
  );
});

const visibleBillingBases = computed(() => filteredBillingBases.value.slice(0, billingLimit.value));

const refreshing = computed(
  () =>
    workspaceLoading.value || payoutsLoading.value || paymentsLoading.value || eventsLoading.value,
);

const payoutDialogNeedsFee = computed(() => payoutDialog.action === 'approve');
const payoutDialogNeedsReference = computed(() => payoutDialog.action === 'mark_paid');
const payoutDialogNeedsReason = computed(() =>
  ['reject', 'mark_failed'].includes(payoutDialog.action),
);

const payoutDialogTitle = computed(() => payoutActionLabel(payoutDialog.action));
const payoutDialogConfirmLabel = computed(() => {
  if (payoutDialog.action === 'mark_paid') return 'Tandai sudah dibayar';
  if (payoutDialog.action === 'mark_failed') return 'Tandai transfer gagal';
  return payoutDialogTitle.value;
});
const payoutDialogTone = computed(() => {
  if (['reject', 'mark_failed'].includes(payoutDialog.action)) return 'danger';
  if (payoutDialog.action === 'mark_paid') return 'blue';
  return 'primary';
});
const payoutDialogSubtitle = computed(() => {
  const payout = payoutDialog.payout;
  if (!payout) return '';
  return `${payout.base_handle || 'Base'} · ${formatIdr(payout.amount_idr)} · ${payout.bank_name || 'rekening belum ada'}`;
});
const payoutNetPreview = computed(() => {
  const amount = Number(payoutDialog.payout?.amount_idr || 0);
  const fee = Number(payoutDialog.fee || 0);
  return Math.max(0, amount - (Number.isFinite(fee) ? fee : 0));
});
const payoutCanSubmit = computed(() => {
  if (!payoutDialog.payout || !payoutDialog.password.trim()) return false;
  if (payoutDialogNeedsFee.value) {
    const fee = Number(payoutDialog.fee);
    if (
      String(payoutDialog.fee).trim() === '' ||
      !Number.isSafeInteger(fee) ||
      fee < 0 ||
      fee >= Number(payoutDialog.payout.amount_idr)
    ) {
      return false;
    }
  }
  if (payoutDialogNeedsReference.value && !payoutDialog.reference.trim()) return false;
  if (payoutDialogNeedsReason.value && !payoutDialog.reason.trim()) return false;
  return true;
});
const payoutImpactNote = computed(() => {
  if (payoutDialog.action === 'approve') {
    return 'Payout akan masuk status APPROVED dan saldo reserved tetap ditahan sampai transfer ditandai selesai.';
  }
  if (payoutDialog.action === 'mark_paid') {
    return 'Saldo reserved base akan dikurangi dan payout selesai. Pastikan transfer bank sudah benar-benar dilakukan.';
  }
  if (payoutDialog.action === 'reject') {
    return 'Payout ditolak dan nominal dikembalikan ke saldo available base. Alasan akan terlihat oleh Base Admin.';
  }
  return 'Transfer ditandai gagal dan nominal dikembalikan ke saldo available base.';
});

const kycCanSubmit = computed(() => Boolean(kycDialog.base && kycDialog.password.trim()));
const priceCanSubmit = computed(
  () =>
    Boolean(priceDialog.base) &&
    Boolean(priceDialog.password.trim()) &&
    priceDialog.reason.trim().length >= 5,
);

/* -------------------------------------------------------------------------
 * Paket top-up CTF (bisa diubah tanpa deploy; order lama pakai snapshot)
 * ---------------------------------------------------------------------- */
const packageDraft = computed(() => {
  const amount = Number(String(packageDialog.amount).replace(/[^\d]/g, ''));
  const ctf = Number(String(packageDialog.ctf).replace(/[^\d]/g, ''));
  const valid = amount >= 1000 && ctf >= 1;
  return { amount, ctf, perCtf: valid ? amount / ctf : null };
});

const packageCanSubmit = computed(() => {
  if (packageDialog.mode === 'create') {
    const code = String(packageDialog.code).trim().toLowerCase();
    if (!/^[a-z0-9_]{3,32}$/.test(code)) return false;
  }
  if (packageDialog.name.trim().length < 2) return false;
  const { amount, ctf, perCtf } = packageDraft.value;
  if (!perCtf) return false;
  if (amount > 10_000_000 || ctf > 1_000_000) return false;
  if (packageDialog.reason.trim().length < 5) return false;
  return Boolean(packageDialog.password.trim());
});

const packagePreview = computed(() => {
  const { amount, ctf, perCtf } = packageDraft.value;
  if (!perCtf) return 'Isi harga dan jumlah CTF untuk melihat harga efektif per CTF.';
  const base = `Rp${formatNumber(amount)} → ${formatNumber(ctf)} CTF · efektif Rp${formatNumber(
    Math.round(perCtf),
  )} per CTF.`;
  const original = packageDialog.original;
  if (!original || !original.ctf_amount) return base;
  const previous = original.amount_idr / original.ctf_amount;
  return `${base} Sebelumnya Rp${formatNumber(Math.round(previous))} per CTF.`;
});

const packageRatioIsWorse = computed(() => {
  const original = packageDialog.original;
  const { perCtf } = packageDraft.value;
  if (!original || !perCtf || !original.ctf_amount) return false;
  return perCtf > original.amount_idr / original.ctf_amount;
});

const packageStatusCanSubmit = computed(
  () =>
    Boolean(packageStatusDialog.pkg) &&
    Boolean(packageStatusDialog.password.trim()) &&
    packageStatusDialog.reason.trim().length >= 5,
);

/* -------------------------------------------------------------------------
 * Kupon promo (diskon mengurangi harga bayar, bukan jumlah CTF)
 * ---------------------------------------------------------------------- */
/** Ambil digit saja: field rupiah boleh diketik "2.000" atau "Rp2.000". */
function digits(value) {
  const clean = String(value ?? '').replace(/[^\d]/g, '');
  return clean ? Number(clean) : 0;
}

const cheapestPackage = computed(() => {
  const active = packages.value.filter((pkg) => pkg.is_active !== false);
  return active.reduce(
    (best, pkg) => (!best || pkg.amount_idr < best.amount_idr ? pkg : best),
    null,
  );
});

const couponPreviewState = computed(() => {
  const pkg = cheapestPackage.value;
  const value = digits(couponDialog.discountValue);
  if (!pkg) {
    return {
      tone: '',
      message: 'Belum ada paket top-up aktif, contoh potongan belum bisa dihitung.',
    };
  }
  if (!value) {
    return {
      tone: '',
      message: 'Isi nilai diskon untuk melihat contoh potongan pada paket termurah.',
    };
  }

  let discount =
    couponDialog.discountType === 'PERCENT'
      ? Math.floor((pkg.amount_idr * Math.min(value, 100)) / 100)
      : value;
  const cap = digits(couponDialog.maxDiscount);
  if (couponDialog.discountType === 'PERCENT' && cap > 0) discount = Math.min(discount, cap);
  discount = Math.min(discount, pkg.amount_idr);
  const final = pkg.amount_idr - discount;

  if (discount <= 0) {
    return { tone: 'pc-callout--warning', message: 'Nilai diskon belum menghasilkan potongan.' };
  }
  if (final < 1000) {
    return {
      tone: 'pc-callout--warning',
      message: `Pada ${pkg.name} (${formatIdr(pkg.amount_idr)}), potongan ${formatIdr(
        discount,
      )} menyisakan ${formatIdr(final)} — di bawah batas tagih Rp1.000.`,
    };
  }
  return {
    tone: 'pc-callout--lime',
    message: `Pada ${pkg.name} (${formatIdr(pkg.amount_idr)}): potongan ${formatIdr(
      discount,
    )}, pengguna membayar ${formatIdr(final)} dan tetap menerima ${formatNumber(
      pkg.ctf_amount,
    )} CTF.`,
  };
});

const couponPreview = computed(() => couponPreviewState.value.message);
const couponPreviewTone = computed(() => couponPreviewState.value.tone);

const couponCanSubmit = computed(() => {
  if (couponDialog.mode === 'create') {
    const code = String(couponDialog.code).trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,32}$/.test(code)) return false;
  }
  const value = digits(couponDialog.discountValue);
  if (value < 1) return false;
  if (couponDialog.discountType === 'PERCENT' && value > 100) return false;
  const start = couponDialog.startsAt ? new Date(couponDialog.startsAt).getTime() : null;
  const end = couponDialog.endsAt ? new Date(couponDialog.endsAt).getTime() : null;
  if (start && end && end <= start) return false;
  if (couponDialog.reason.trim().length < 5) return false;
  return Boolean(couponDialog.password.trim());
});

const couponStatusCanSubmit = computed(
  () =>
    Boolean(couponStatusDialog.coupon) &&
    Boolean(couponStatusDialog.password.trim()) &&
    couponStatusDialog.reason.trim().length >= 5,
);

let payoutSearchTimer = null;
let paymentSearchTimer = null;

function setTab(tab) {
  if (!allowedTabs.includes(tab)) return;
  activeTab.value = tab;
  router.replace({ query: { ...route.query, tab } });
  ensureTab(tab);
}

function ensureTab(tab) {
  if (tab !== 'payments' || tabLoaded.payments) return;
  tabLoaded.payments = true;
  loadSystemSettings();
  loadPackages();
  loadCoupons();
  loadPaymentOrders();
  loadPaymentEvents();
}

async function loadWorkspace() {
  workspaceLoading.value = true;
  workspaceError.value = '';
  try {
    workspace.value = await api.getBaseRevenue();
  } catch (err) {
    workspaceError.value = err?.message || 'Gagal memuat data keuangan.';
  } finally {
    workspaceLoading.value = false;
  }
}

async function loadPayouts() {
  payoutsLoading.value = true;
  payoutsError.value = '';
  try {
    const params = { page: payoutPage.value, limit: 20 };
    if (payoutStatus.value) params.status = payoutStatus.value;
    if (payoutQuery.value.trim()) params.q = payoutQuery.value.trim();
    payouts.value = await api.getBasePayouts(params);
  } catch (err) {
    payoutsError.value = err?.message || 'Gagal memuat payout.';
  } finally {
    payoutsLoading.value = false;
  }
}

async function loadPaymentOrders() {
  paymentsLoading.value = true;
  paymentsError.value = '';
  try {
    const params = { page: paymentPage.value, limit: 20 };
    if (paymentStatus.value) params.status = paymentStatus.value;
    if (paymentQuery.value.trim()) params.q = paymentQuery.value.trim();
    paymentOrders.value = await api.getAdminPaymentOrders(params);
  } catch (err) {
    paymentsError.value = err?.message || 'Gagal memuat order pembayaran.';
  } finally {
    paymentsLoading.value = false;
  }
}

async function loadPaymentEvents() {
  eventsLoading.value = true;
  eventsError.value = '';
  try {
    const params = { page: eventPage.value, limit: 25 };
    if (eventStatus.value) params.status = eventStatus.value;
    paymentEvents.value = await api.getAdminPaymentEvents(params);
  } catch (err) {
    eventsError.value = err?.message || 'Gagal memuat event pembayaran.';
  } finally {
    eventsLoading.value = false;
  }
}

async function loadSystemSettings() {
  try {
    systemSettings.value = await api.getAdminSystemSettings();
  } catch {
    systemSettings.value = null;
  }
}

async function refreshPage() {
  if (activeTab.value === 'payments') {
    await Promise.all([
      loadWorkspace(),
      loadPackages(),
      loadCoupons(),
      loadPaymentOrders(),
      loadPaymentEvents(),
    ]);
    return;
  }
  if (activeTab.value === 'payouts') {
    await Promise.all([loadWorkspace(), loadPayouts()]);
    return;
  }
  await loadWorkspace();
}

function goPayoutPage(page) {
  payoutPage.value = page;
  loadPayouts();
}

function goPaymentPage(page) {
  paymentPage.value = page;
  loadPaymentOrders();
}

function goEventPage(page) {
  eventPage.value = page;
  loadPaymentEvents();
}

function openSupport(handle) {
  if (!handle) return;
  supportHandle.value = handle;
  supportOpen.value = true;
}

function openPayoutReview(payout, action) {
  payoutDialog.payout = payout;
  payoutDialog.action = action;
  payoutDialog.password = '';
  payoutDialog.reason = '';
  payoutDialog.reference = '';
  payoutDialog.fee = String(workspace.value?.payout_fee_idr ?? 6500);
  payoutDialog.error = '';
  payoutDialog.loading = false;
  payoutDialog.open = true;
}

async function submitPayoutReview() {
  if (!payoutCanSubmit.value || !payoutDialog.payout) return;
  payoutDialog.loading = true;
  payoutDialog.error = '';

  const payload = {
    action: payoutDialog.action,
    password: payoutDialog.password,
  };
  if (payoutDialogNeedsFee.value) payload.fee_idr = Number(payoutDialog.fee);
  if (payoutDialogNeedsReference.value) payload.reference = payoutDialog.reference.trim();
  if (payoutDialogNeedsReason.value) payload.reason = payoutDialog.reason.trim();

  try {
    await api.reviewBasePayout(payoutDialog.payout.id, payload);
    toast.success(`Payout ${payoutDialog.payout.base_handle} berhasil diperbarui.`);
    payoutDialog.open = false;
    await Promise.all([loadPayouts(), loadWorkspace()]);
  } catch (err) {
    payoutDialog.error = err?.message || 'Aksi payout gagal diproses.';
  } finally {
    payoutDialog.loading = false;
  }
}

function openKycDialog(base, status = 'verified') {
  kycDialog.base = base;
  kycDialog.status = ['verified', 'rejected', 'unverified'].includes(status) ? status : 'verified';
  kycDialog.note = base.payout_kyc_note || '';
  kycDialog.password = '';
  kycDialog.error = '';
  kycDialog.loading = false;
  kycDialog.open = true;
}

async function submitKyc() {
  if (!kycCanSubmit.value || !kycDialog.base) return;
  kycDialog.loading = true;
  kycDialog.error = '';
  try {
    await api.setBaseKyc({
      base_handle: kycDialog.base.handle,
      status: kycDialog.status,
      note: kycDialog.note.trim() || null,
      password: kycDialog.password,
    });
    toast.success(`KYC ${kycDialog.base.handle} diperbarui.`);
    kycDialog.open = false;
    await loadWorkspace();
  } catch (err) {
    kycDialog.error = err?.message || 'Status KYC gagal disimpan.';
  } finally {
    kycDialog.loading = false;
  }
}

function openFessPrice(base) {
  priceDialog.base = base;
  priceDialog.freeForever = Number(base.fess_price_ctf) === 0;
  priceDialog.reason = '';
  priceDialog.password = '';
  priceDialog.error = '';
  priceDialog.loading = false;
  priceDialog.open = true;
}

async function submitFessPrice() {
  if (!priceCanSubmit.value || !priceDialog.base) return;
  priceDialog.loading = true;
  priceDialog.error = '';
  try {
    await api.setBaseFreeForever({
      base_handle: priceDialog.base.handle,
      free_forever: priceDialog.freeForever,
      reason: priceDialog.reason.trim(),
      password: priceDialog.password,
    });
    toast.success(
      `Harga fess ${priceDialog.base.handle} disimpan: ${
        priceDialog.freeForever ? 'gratis permanen' : `${platformFessPrice.value} CTF per fess`
      }.`,
    );
    priceDialog.open = false;
    await loadWorkspace();
  } catch (err) {
    priceDialog.error = err?.message || 'Perubahan harga fess gagal disimpan.';
  } finally {
    priceDialog.loading = false;
  }
}

function effectiveCtfPrice(pkg) {
  const amount = Number(pkg?.amount_idr) || 0;
  const ctf = Number(pkg?.ctf_amount) || 0;
  if (!ctf) return '—';
  return `Rp${formatNumber(Math.round(amount / ctf))}`;
}

async function loadPackages() {
  packagesLoading.value = true;
  packagesError.value = '';
  try {
    const result = await api.getAdminPaymentPackages();
    packages.value = Array.isArray(result?.packages) ? result.packages : [];
    packageSource.value = result?.source === 'fallback' ? 'fallback' : 'database';
  } catch (err) {
    packagesError.value = err?.message || 'Gagal memuat paket top-up.';
  } finally {
    packagesLoading.value = false;
  }
}

function openPackageDialog(pkg = null) {
  packageDialog.mode = pkg ? 'edit' : 'create';
  packageDialog.code = pkg?.code || '';
  packageDialog.name = pkg?.name || '';
  packageDialog.amount = pkg ? String(pkg.amount_idr) : '';
  packageDialog.ctf = pkg ? String(pkg.ctf_amount) : '';
  packageDialog.description = pkg?.description || '';
  packageDialog.sortOrder = pkg ? String(pkg.sort_order) : '';
  packageDialog.isActive = pkg ? Boolean(pkg.is_active) : true;
  packageDialog.reason = '';
  packageDialog.password = '';
  packageDialog.error = '';
  packageDialog.loading = false;
  packageDialog.original = pkg ? { ...pkg } : null;
  packageDialog.open = true;
}

async function submitPackage() {
  if (!packageCanSubmit.value) return;
  packageDialog.loading = true;
  packageDialog.error = '';
  const { amount, ctf } = packageDraft.value;
  const sortOrder = Number(String(packageDialog.sortOrder).replace(/[^\d]/g, ''));
  const payload = {
    name: packageDialog.name.trim(),
    amount_idr: amount,
    ctf_amount: ctf,
    description: packageDialog.description.trim(),
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    is_active: packageDialog.isActive,
    reason: packageDialog.reason.trim(),
    password: packageDialog.password,
  };

  try {
    if (packageDialog.mode === 'create') {
      await api.createAdminPaymentPackage({
        code: packageDialog.code.trim().toLowerCase(),
        ...payload,
      });
      toast.success(`Paket ${payload.name} ditambahkan dan langsung tampil di top-up.`);
    } else {
      await api.updateAdminPaymentPackage(packageDialog.code, payload);
      toast.success(`Paket ${payload.name} diperbarui.`);
    }
    packageDialog.open = false;
    await loadPackages();
  } catch (err) {
    packageDialog.error = err?.message || 'Perubahan paket gagal disimpan.';
  } finally {
    packageDialog.loading = false;
  }
}

function openPackageStatus(pkg) {
  packageStatusDialog.pkg = pkg;
  packageStatusDialog.nextActive = !pkg?.is_active;
  packageStatusDialog.reason = '';
  packageStatusDialog.password = '';
  packageStatusDialog.error = '';
  packageStatusDialog.loading = false;
  packageStatusDialog.open = true;
}

async function submitPackageStatus() {
  if (!packageStatusCanSubmit.value || !packageStatusDialog.pkg) return;
  packageStatusDialog.loading = true;
  packageStatusDialog.error = '';
  const pkg = packageStatusDialog.pkg;
  try {
    await api.setAdminPaymentPackageStatus(pkg.code, {
      is_active: packageStatusDialog.nextActive,
      reason: packageStatusDialog.reason.trim(),
      password: packageStatusDialog.password,
    });
    toast.success(
      packageStatusDialog.nextActive
        ? `Paket ${pkg.name} diaktifkan kembali.`
        : `Paket ${pkg.name} dinonaktifkan.`,
    );
    packageStatusDialog.open = false;
    await loadPackages();
  } catch (err) {
    packageStatusDialog.error = err?.message || 'Status paket gagal disimpan.';
  } finally {
    packageStatusDialog.loading = false;
  }
}

async function loadCoupons() {
  couponsLoading.value = true;
  couponsError.value = '';
  try {
    const result = await api.getAdminCoupons();
    coupons.value = Array.isArray(result?.coupons) ? result.coupons : [];
    couponSource.value = result?.source === 'fallback' ? 'fallback' : 'database';
  } catch (err) {
    couponsError.value = err?.message || 'Gagal memuat kupon promo.';
  } finally {
    couponsLoading.value = false;
  }
}

/** ISO dari server → nilai input `datetime-local` (waktu lokal browser). */
function isoToLocalInput(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value) => String(value).padStart(2, '0');
  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ].join('T');
}

/** Nilai `datetime-local` → ISO UTC; kosong berarti tanpa batas. */
function localToIso(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function couponDiscountLabel(coupon) {
  if (!coupon) return '—';
  if (coupon.discount_type === 'PERCENT') {
    const base = `${formatNumber(coupon.discount_value)}%`;
    return coupon.max_discount_idr ? `${base} · maks ${formatIdr(coupon.max_discount_idr)}` : base;
  }
  return formatIdr(coupon.discount_value);
}

function couponValidityLabel(coupon) {
  const start = coupon?.starts_at;
  const end = coupon?.ends_at;
  if (!start && !end) return 'Selalu berlaku';
  if (start && !end) return `Mulai ${formatDateTime(start)}`;
  if (!start && end) return `Sampai ${formatDateTime(end)}`;
  return `${formatDateTime(start)} – ${formatDateTime(end)}`;
}

function openCouponDialog(coupon = null) {
  couponDialog.mode = coupon ? 'edit' : 'create';
  couponDialog.code = coupon?.code || '';
  couponDialog.label = coupon?.label || '';
  couponDialog.discountType = coupon?.discount_type === 'PERCENT' ? 'PERCENT' : 'FIXED';
  couponDialog.discountValue = coupon ? String(coupon.discount_value) : '';
  couponDialog.maxDiscount = coupon?.max_discount_idr ? String(coupon.max_discount_idr) : '';
  couponDialog.minAmount = coupon?.min_amount_idr ? String(coupon.min_amount_idr) : '';
  couponDialog.maxRedemptions =
    coupon?.max_redemptions === null || coupon?.max_redemptions === undefined
      ? ''
      : String(coupon.max_redemptions);
  couponDialog.startsAt = isoToLocalInput(coupon?.starts_at);
  couponDialog.endsAt = isoToLocalInput(coupon?.ends_at);
  couponDialog.isActive = coupon ? Boolean(coupon.is_active) : true;
  couponDialog.reason = '';
  couponDialog.password = '';
  couponDialog.error = '';
  couponDialog.loading = false;
  couponDialog.open = true;
}

async function submitCoupon() {
  if (!couponCanSubmit.value) return;
  couponDialog.loading = true;
  couponDialog.error = '';
  const maxDiscount = digits(couponDialog.maxDiscount);
  const maxRedemptions = digits(couponDialog.maxRedemptions);
  const payload = {
    label: couponDialog.label.trim(),
    discount_type: couponDialog.discountType,
    discount_value: digits(couponDialog.discountValue),
    max_discount_idr:
      couponDialog.discountType === 'PERCENT' && maxDiscount > 0 ? maxDiscount : null,
    min_amount_idr: digits(couponDialog.minAmount),
    starts_at: localToIso(couponDialog.startsAt),
    ends_at: localToIso(couponDialog.endsAt),
    max_redemptions: maxRedemptions > 0 ? maxRedemptions : null,
    is_active: couponDialog.isActive,
    reason: couponDialog.reason.trim(),
    password: couponDialog.password,
  };

  try {
    if (couponDialog.mode === 'create') {
      const code = couponDialog.code.trim().toUpperCase();
      await api.createAdminCoupon({ code, ...payload });
      toast.success(`Kupon ${code} dibuat dan langsung bisa dipakai.`);
    } else {
      await api.updateAdminCoupon(couponDialog.code, payload);
      toast.success(`Kupon ${couponDialog.code} diperbarui.`);
    }
    couponDialog.open = false;
    await loadCoupons();
  } catch (err) {
    couponDialog.error = err?.message || 'Perubahan kupon gagal disimpan.';
  } finally {
    couponDialog.loading = false;
  }
}

function openCouponStatus(coupon) {
  couponStatusDialog.coupon = coupon;
  couponStatusDialog.nextActive = !coupon?.is_active;
  couponStatusDialog.reason = '';
  couponStatusDialog.password = '';
  couponStatusDialog.error = '';
  couponStatusDialog.loading = false;
  couponStatusDialog.open = true;
}

async function submitCouponStatus() {
  if (!couponStatusCanSubmit.value || !couponStatusDialog.coupon) return;
  couponStatusDialog.loading = true;
  couponStatusDialog.error = '';
  const coupon = couponStatusDialog.coupon;
  try {
    await api.setAdminCouponStatus(coupon.code, {
      is_active: couponStatusDialog.nextActive,
      reason: couponStatusDialog.reason.trim(),
      password: couponStatusDialog.password,
    });
    toast.success(
      couponStatusDialog.nextActive
        ? `Kupon ${coupon.code} diaktifkan kembali.`
        : `Kupon ${coupon.code} dinonaktifkan.`,
    );
    couponStatusDialog.open = false;
    await loadCoupons();
  } catch (err) {
    couponStatusDialog.error = err?.message || 'Status kupon gagal disimpan.';
  } finally {
    couponStatusDialog.loading = false;
  }
}

async function openPayment(order) {
  if (!order?.id) return;
  paymentDetailIdentifier.value = order.id;
  paymentDetailOpen.value = true;
  paymentDetail.value = null;
  paymentDetailError.value = '';
  paymentDetailLoading.value = true;
  try {
    paymentDetail.value = await api.getAdminPaymentOrder(order.id);
  } catch (err) {
    paymentDetailError.value = err?.message || 'Gagal memuat detail order.';
  } finally {
    paymentDetailLoading.value = false;
  }
}

async function reloadPaymentDetail() {
  if (!paymentDetailIdentifier.value) return;
  paymentDetailLoading.value = true;
  paymentDetailError.value = '';
  try {
    paymentDetail.value = await api.getAdminPaymentOrder(paymentDetailIdentifier.value);
  } catch (err) {
    paymentDetailError.value = err?.message || 'Gagal memuat detail order.';
  } finally {
    paymentDetailLoading.value = false;
  }
}

watch(payoutQuery, () => {
  window.clearTimeout(payoutSearchTimer);
  payoutSearchTimer = window.setTimeout(() => {
    payoutPage.value = 1;
    loadPayouts();
  }, 350);
});

watch(payoutStatus, () => {
  payoutPage.value = 1;
  loadPayouts();
});

watch(paymentQuery, () => {
  window.clearTimeout(paymentSearchTimer);
  paymentSearchTimer = window.setTimeout(() => {
    paymentPage.value = 1;
    loadPaymentOrders();
  }, 350);
});

watch(paymentStatus, () => {
  paymentPage.value = 1;
  loadPaymentOrders();
});

watch(eventStatus, () => {
  eventPage.value = 1;
  loadPaymentEvents();
});

watch(
  () => route.query.tab,
  () => {
    const tab = queryTab();
    if (tab === activeTab.value) return;
    activeTab.value = tab;
    ensureTab(tab);
  },
);

watch(billingQuery, () => {
  billingLimit.value = 25;
});

onMounted(() => {
  loadWorkspace();
  loadPayouts();
  ensureTab(activeTab.value);
});

onBeforeUnmount(() => {
  window.clearTimeout(payoutSearchTimer);
  window.clearTimeout(paymentSearchTimer);
});
</script>

<style scoped>
.pc-input-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.pc-input-icon > svg {
  position: absolute;
  left: 10px;
  color: var(--text-muted);
  pointer-events: none;
}

.pc-input-icon .pc-input {
  padding-left: 30px;
}

.pc-entity-link {
  display: inline;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text-main);
  font: inherit;
  font-size: 11px;
  font-weight: 900;
  text-align: left;
  cursor: pointer;
}

.pc-entity-link:hover {
  color: var(--lime-text);
  text-decoration: underline;
}

@media (max-width: 680px) {
  .pc-card__head {
    flex-direction: column;
  }

  .pc-filters {
    align-items: stretch;
  }
}
</style>
