<template>
  <div>
    <ConsolePageHeader
      eyebrow="Finance & billing"
      title="Keuangan Platform"
      subtitle="Review payout manual, verifikasi KYC, kelola freeForever, dan pantau pendapatan serta pembayaran base. Semua aksi berisiko meminta kata sandi ulang."
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
      <button type="button" class="pc-btn pc-btn--ghost" @click="loadWorkspace">
        Coba lagi
      </button>
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
          Antrean payout tetap bisa dibaca, tetapi approve, reject, dan transfer tidak
          dapat diproses sampai flag diaktifkan lewat deploy. KYC dan freeForever tetap
          tersedia sebagai kontrol platform.
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
              Setujui, tolak, atau tandai transfer. Setiap aksi membutuhkan kata sandi
              ulang dan tercatat di audit.
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
            Verifikasi hanya untuk base dengan rekening lengkap dan saldo memenuhi minimum.
            Alasan perubahan harus jelas karena masuk ke audit permanen.
          </div>
        </div>

        <section class="pc-card">
          <div class="pc-card__head">
            <div>
              <h2 class="pc-card__title">Antrean KYC</h2>
              <p class="pc-card__desc">
                {{ kycQueue.length }} base memiliki rekening lengkap tetapi belum
                terverifikasi.
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
              <h2 class="pc-card__title">Billing base</h2>
              <p class="pc-card__desc">
                Status trial, freeForever, KYC, dan saldo seluruh base. Klik base untuk
                membuka panel dukungan read-only.
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
                  <th>Plan</th>
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
                      v-if="base.free_forever"
                      status="free"
                      label="freeForever"
                      tone="lime"
                    />
                    <span v-else class="pc-small pc-muted">
                      {{ base.trial_source === 'grace' ? 'Grace' : 'Trial' }}
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
                        @click="openFreeForever(base)"
                      >
                        <Sparkles :size="12" />
                        freeForever
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
                      <button type="button" class="pc-entity-link" @click="openSupport(base.handle)">
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
                1 CTF = 1 fess menghasilkan pendapatan IDR untuk base. Saldo base tidak
                dapat diubah langsung dari konsol ini.
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
            Monitoring pembayaran bersifat read-only. Refund dan chargeback belum tersedia
            di v1. Reconcile manual tetap memakai runbook terpisah.
            <template v-if="systemSettings">
              <strong>
                PAYMENTS_ENABLED={{ systemSettings.environment.payments_enabled ? 'true' : 'false' }}
              </strong>
              · Midtrans
              {{ systemSettings.integrations.midtrans.mode }}.
            </template>
          </div>
        </div>

        <section class="pc-card">
          <div class="pc-card__head">
            <div>
              <h2 class="pc-card__title">Order pembayaran</h2>
              <p class="pc-card__desc">
                {{ paymentOrders.total }} order tercatat. Klik order untuk melihat event
                webhook.
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

          <div v-else-if="paymentsLoading && !paymentOrders.data.length" class="pc-card__body pc-stack">
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
                    <button type="button" class="pc-entity-link pc-mono" @click="openPayment(order)">
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

          <div v-else-if="eventsLoading && !paymentEvents.data.length" class="pc-card__body pc-stack">
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
            {{ payoutDialog.payout.bank_name }} · {{ payoutDialog.payout.bank_account_number_masked }}
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
      :subtitle="kycDialog.base ? `${kycDialog.base.handle} · ${formatIdr(kycDialog.base.available_idr)} available` : ''"
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
          Verifikasi KYC membuka kemampuan payout base. Pastikan nama rekening dan
          kepemilikan base sudah sesuai.
        </div>
      </div>
    </ConsoleDialog>

    <ConsoleDialog
      v-model="freeDialog.open"
      :title="freeDialog.value ? 'Aktifkan freeForever' : 'Cabut freeForever'"
      :subtitle="freeDialog.base ? `${freeDialog.base.handle} · ${freeDialog.base.name}` : ''"
      eyebrow="Billing platform · re-auth"
      :confirm-label="freeDialog.value ? 'Aktifkan freeForever' : 'Cabut freeForever'"
      :tone="freeDialog.value ? 'primary' : 'danger'"
      :loading="freeDialog.loading"
      :confirm-disabled="!freeCanSubmit"
      :error="freeDialog.error"
      @confirm="submitFreeForever"
    >
      <div class="pc-summary">
        <div class="pc-summary__row">
          <span class="pc-summary__label">Status saat ini</span>
          <span class="pc-summary__value">
            {{ freeDialog.base?.free_forever ? 'freeForever aktif' : 'Tidak aktif' }}
          </span>
        </div>
        <div class="pc-summary__row">
          <span class="pc-summary__label">Trial berakhir</span>
          <span class="pc-summary__value">
            {{ formatDateTime(freeDialog.base?.trial_ends_at) }}
          </span>
        </div>
      </div>

      <div class="pc-dialog-grid">
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="free-reason">Alasan perubahan</label>
          <textarea
            id="free-reason"
            v-model="freeDialog.reason"
            class="pc-textarea"
            maxlength="500"
            placeholder="Contoh: kompensasi migrasi, partner konten, atau koreksi billing."
          />
          <p class="pc-help">Minimal 5 karakter. Alasan tersimpan di audit.</p>
        </div>
        <div class="pc-field pc-field--full">
          <label class="pc-label" for="free-password">Kata sandi Super Admin</label>
          <input
            id="free-password"
            v-model="freeDialog.password"
            class="pc-input"
            type="password"
            autocomplete="current-password"
            placeholder="Konfirmasi kata sandi"
          />
        </div>
      </div>

      <div class="pc-callout" :class="freeDialog.value ? 'pc-callout--lime' : 'pc-callout--warning'">
        <Sparkles :size="15" />
        <div>
          {{ freeDialog.value
            ? 'freeForever membebaskan base dari billing langganan. Pendapatan fess tetap mengikuti aturan platform.'
            : 'Mencabut freeForever akan mengembalikan base ke siklus billing normal.' }}
        </div>
      </div>
    </ConsoleDialog>

    <ConsoleDrawer
      v-model="paymentDetailOpen"
      eyebrow="Payment monitoring · read-only"
      :title="paymentDetail?.order_id || 'Detail pembayaran'"
      :subtitle="paymentDetail ? `${paymentDetail.package_name} · ${paymentDetail.user?.handle || 'Pengguna'}` : 'Memuat detail order…'"
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
            Monitoring ini tidak mengubah status pembayaran. Refund/chargeback belum
            termasuk dalam v1.
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
  ReceiptText,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
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

const freeDialog = reactive({
  open: false,
  base: null,
  value: false,
  reason: '',
  password: '',
  loading: false,
  error: '',
});

const totals = computed(
  () =>
    workspace.value?.totals || {
      pending_idr: 0,
      available_idr: 0,
      reserved_idr: 0,
      lifetime_idr: 0,
    }
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
        base.payout_kyc_status !== 'verified'
    )
    .sort((a, b) => (b.available_idr || 0) - (a.available_idr || 0))
);

const filteredBillingBases = computed(() => {
  const query = billingQuery.value.trim().toLowerCase();
  if (!query) return bases.value;
  return bases.value.filter(
    (base) =>
      String(base.handle || '').toLowerCase().includes(query) ||
      String(base.name || '').toLowerCase().includes(query)
  );
});

const visibleBillingBases = computed(() =>
  filteredBillingBases.value.slice(0, billingLimit.value)
);

const refreshing = computed(
  () =>
    workspaceLoading.value ||
    payoutsLoading.value ||
    paymentsLoading.value ||
    eventsLoading.value
);

const payoutDialogNeedsFee = computed(() => payoutDialog.action === 'approve');
const payoutDialogNeedsReference = computed(() => payoutDialog.action === 'mark_paid');
const payoutDialogNeedsReason = computed(() =>
  ['reject', 'mark_failed'].includes(payoutDialog.action)
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
const freeCanSubmit = computed(
  () =>
    Boolean(freeDialog.base) &&
    Boolean(freeDialog.password.trim()) &&
    freeDialog.reason.trim().length >= 5
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
    await Promise.all([loadWorkspace(), loadPaymentOrders(), loadPaymentEvents()]);
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
  kycDialog.status = ['verified', 'rejected', 'unverified'].includes(status)
    ? status
    : 'verified';
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

function openFreeForever(base) {
  freeDialog.base = base;
  freeDialog.value = !base.free_forever;
  freeDialog.reason = '';
  freeDialog.password = '';
  freeDialog.error = '';
  freeDialog.loading = false;
  freeDialog.open = true;
}

async function submitFreeForever() {
  if (!freeCanSubmit.value || !freeDialog.base) return;
  freeDialog.loading = true;
  freeDialog.error = '';
  try {
    await api.setBaseFreeForever({
      base_handle: freeDialog.base.handle,
      free_forever: freeDialog.value,
      reason: freeDialog.reason.trim(),
      password: freeDialog.password,
    });
    toast.success(
      `freeForever ${freeDialog.base.handle} ${freeDialog.value ? 'diaktifkan' : 'dicabut'}.`
    );
    freeDialog.open = false;
    await loadWorkspace();
  } catch (err) {
    freeDialog.error = err?.message || 'Perubahan freeForever gagal disimpan.';
  } finally {
    freeDialog.loading = false;
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
  }
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
