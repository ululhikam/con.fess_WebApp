<template>
  <div class="rev-panel">
    <ContentSkeleton
      v-if="loading && !workspace"
      type="list"
      :count="3"
      label="Memuat data pendapatan IDR"
    />

    <AppStateView
      v-else-if="error"
      variant="error"
      title="Gagal memuat pendapatan base"
      :description="error?.message || 'Server tidak dapat mengembalikan data revenue.'"
      action-label="Coba lagi"
      @action="load"
    />

    <template v-else>
      <div v-if="!enabled" class="fin-locked" role="status">
        <span class="fin-locked__icon" aria-hidden="true">
          <LockKeyhole :size="18" />
        </span>
        <div>
          <strong>Payout sedang ditutup</strong>
          <p>
            Saldo tetap tercatat dan bertambah normal. Penarikan akan aktif lagi setelah fitur
            payout dibuka oleh Super Admin.
          </p>
        </div>
      </div>

      <nav class="fin-tabs" aria-label="Navigasi keuangan base">
        <button
          v-for="tab in financeTabs"
          :key="tab.key"
          type="button"
          class="fin-tab"
          :class="{ active: activePanelKey === tab.key }"
          :aria-current="activePanelKey === tab.key ? 'page' : undefined"
          @click="navigateFinance(tab.key)"
        >
          <component :is="tab.icon" :size="15" aria-hidden="true" />
          <span>{{ tab.label }}</span>
        </button>
      </nav>

      <!-- ============================ SALDO ============================ -->
      <template v-if="mode === 'saldo'">
        <section class="fin-hero">
          <div class="fin-hero__top">
            <p class="fin-eyebrow">
              <span class="fin-live-dot" aria-hidden="true"></span>
              Saldo IDR tersedia
            </p>
            <span class="fin-hero-pill" :class="enabled ? 'is-active' : 'is-off'">
              <ShieldCheck v-if="enabled" :size="13" aria-hidden="true" />
              <LockKeyhole v-else :size="13" aria-hidden="true" />
              {{ enabled ? 'Payout aktif' : 'Payout ditutup' }}
            </span>
          </div>

          <div class="fin-balance">
            <span class="fin-balance__currency">Rp</span>
            <strong>{{ formatIdrNumber(wallet.available_idr) }}</strong>
          </div>

          <p class="fin-hero__note">
            Pendapatan base terpisah dari CTF pengguna. CTF tidak dapat dicairkan menjadi uang.
          </p>

          <div class="fin-hero__actions">
            <button
              type="button"
              class="fin-btn fin-btn--accent"
              @click="navigateFinance('keuangan_penarikan')"
            >
              <ArrowDownToLine :size="16" aria-hidden="true" />
              Kelola payout
            </button>
            <button
              type="button"
              class="fin-btn fin-btn--ghost"
              @click="navigateFinance('keuangan_pendapatan')"
            >
              <TrendingUp :size="16" aria-hidden="true" />
              Riwayat pendapatan
            </button>
          </div>

          <div class="fin-hero__trust">
            <span><Clock3 :size="13" aria-hidden="true" /> Hold {{ holdDays }} hari</span>
            <span><Landmark :size="13" aria-hidden="true" /> Min. {{ formatIdr(minPayout) }}</span>
            <span><ShieldCheck :size="13" aria-hidden="true" /> Review Super Admin</span>
          </div>
        </section>

        <div class="fin-stat-grid">
          <article class="fin-stat fin-stat--warning">
            <span class="fin-stat__icon" aria-hidden="true"><Clock3 :size="17" /></span>
            <span class="fin-stat__label">Menunggu hold</span>
            <strong class="fin-stat__value">{{ formatIdr(wallet.pending_idr) }}</strong>
            <small>Otomatis cair setelah {{ holdDays }} hari.</small>
          </article>

          <article class="fin-stat fin-stat--info">
            <span class="fin-stat__icon" aria-hidden="true"><LockKeyhole :size="17" /></span>
            <span class="fin-stat__label">Ditahan payout</span>
            <strong class="fin-stat__value">{{ formatIdr(wallet.reserved_idr) }}</strong>
            <small>Dana untuk payout yang belum selesai.</small>
          </article>

          <article class="fin-stat fin-stat--success">
            <span class="fin-stat__icon" aria-hidden="true"><TrendingUp :size="17" /></span>
            <span class="fin-stat__label">Total pendapatan</span>
            <strong class="fin-stat__value">{{ formatIdr(wallet.lifetime_idr) }}</strong>
            <small>Akumulasi pendapatan bersih yang pernah tercatat.</small>
          </article>

          <article class="fin-stat">
            <span class="fin-stat__icon" aria-hidden="true"><Coins :size="17" /></span>
            <span class="fin-stat__label">Tarif per fess</span>
            <strong class="fin-stat__value">{{ formatIdr(revenuePerFess) }}</strong>
            <small>Hanya fess berbayar, bukan self-post.</small>
          </article>
        </div>

        <section class="fin-card">
          <div class="fin-card__head">
            <div>
              <p class="fin-card__eyebrow">Alokasi dana</p>
              <h2 class="fin-card__title">Komposisi saldo saat ini</h2>
              <p class="fin-card__desc">
                Pembagian dana yang tersedia, sedang ditahan, dan menunggu masa hold.
              </p>
            </div>
            <span class="fin-chip fin-chip--muted">{{ formatIdr(walletCurrentTotal) }}</span>
          </div>

          <div v-if="walletCurrentTotal > 0" class="fin-allocation">
            <div class="fin-allocation__bar" aria-hidden="true">
              <span
                v-for="item in allocationItems"
                :key="item.key"
                class="fin-allocation__segment"
                :class="`is-${item.tone}`"
                :style="{ width: `${item.pct}%` }"
              ></span>
            </div>
            <div class="fin-allocation__legend">
              <div v-for="item in allocationItems" :key="item.key" class="fin-allocation__item">
                <span class="fin-dot" :class="`is-${item.tone}`" aria-hidden="true"></span>
                <span class="fin-allocation__name">{{ item.label }}</span>
                <strong>{{ formatIdr(item.value) }}</strong>
                <small>{{ Math.round(item.pct) }}%</small>
              </div>
            </div>
          </div>
          <div v-else class="fin-empty fin-empty--compact">
            Belum ada saldo tercatat. Pendapatan muncul setelah fess berbayar terbit.
          </div>
        </section>

        <div class="fin-split">
          <section class="fin-card">
            <div class="fin-card__head">
              <div>
                <p class="fin-card__eyebrow">Aturan</p>
                <h2 class="fin-card__title">Pendapatan &amp; pencairan</h2>
              </div>
            </div>
            <ul class="fin-rule-list">
              <li>
                <span class="fin-rule__icon" aria-hidden="true"><Coins :size="16" /></span>
                <div>
                  <strong>{{ formatIdr(revenuePerFess) }} per fess</strong>
                  <small>Hanya fess berbayar yang terbit. Self-post tidak dihitung.</small>
                </div>
              </li>
              <li>
                <span class="fin-rule__icon" aria-hidden="true"><CalendarClock :size="16" /></span>
                <div>
                  <strong>Hold {{ holdDays }} hari</strong>
                  <small>Saldo otomatis berpindah ke tersedia setelah masa hold.</small>
                </div>
              </li>
              <li>
                <span class="fin-rule__icon" aria-hidden="true"><Landmark :size="16" /></span>
                <div>
                  <strong>Minimum {{ formatIdr(minPayout) }}</strong>
                  <small>Penarikan di bawah nominal ini belum dapat diajukan.</small>
                </div>
              </li>
              <li>
                <span class="fin-rule__icon" aria-hidden="true"
                  ><CircleDollarSign :size="16"
                /></span>
                <div>
                  <strong>Biaya transfer {{ formatIdr(payoutFee) }}</strong>
                  <small>Biaya default, dapat disesuaikan Super Admin saat approval.</small>
                </div>
              </li>
            </ul>
          </section>

          <section class="fin-card">
            <div class="fin-card__head">
              <div>
                <p class="fin-card__eyebrow">Akun pencairan</p>
                <h2 class="fin-card__title">Rekening &amp; verifikasi</h2>
              </div>
            </div>

            <div class="fin-account">
              <span
                class="fin-bank-mark"
                :class="{ 'has-logo': activeBankBrand?.logo }"
                :style="bankMarkStyle(activeBankBrand)"
                aria-hidden="true"
              >
                <img v-if="activeBankBrand?.logo" :src="activeBankBrand.logo" alt="" />
                <template v-else>{{ bankInitials }}</template>
              </span>
              <div class="fin-account__copy">
                <span class="fin-account__label">Rekening payout</span>
                <strong>{{ base?.bank_name || 'Belum diatur' }}</strong>
                <small v-if="bankComplete">
                  {{ base?.bank_account_name }} · {{ base?.bank_account_number_masked }}
                </small>
                <small v-else>Tambahkan rekening dari menu Payout &amp; Rekening.</small>
              </div>
            </div>

            <ul class="fin-info-list">
              <li>
                <span>Status base</span>
                <strong>{{ billingShortLabel }}</strong>
              </li>
              <li>
                <span>Status KYC</span>
                <span class="fin-chip" :class="kycClass">{{ kycLabel }}</span>
              </li>
              <li>
                <span>Status payout</span>
                <span class="fin-chip" :class="enabled ? 'fin-chip--success' : 'fin-chip--warning'">
                  {{ enabled ? 'Dibuka' : 'Ditutup' }}
                </span>
              </li>
            </ul>
            <p class="fin-note">{{ billingDetail }}</p>
          </section>
        </div>

        <p class="fin-footnote">
          <Info :size="13" aria-hidden="true" />
          Pendapatan hanya berasal dari fess berbayar yang terbit di base. Fess saat trial,
          freeForever, atau self-post tidak menghasilkan pendapatan.
        </p>
      </template>

      <!-- ========================== PENDAPATAN ========================== -->
      <template v-else-if="mode === 'pendapatan'">
        <section class="fin-hero fin-hero--compact">
          <div class="fin-hero__top">
            <p class="fin-eyebrow">
              <span class="fin-live-dot" aria-hidden="true"></span>
              Total pendapatan base
            </p>
            <span class="fin-hero-pill" :class="enabled ? 'is-active' : 'is-off'">
              <ShieldCheck v-if="enabled" :size="13" aria-hidden="true" />
              <LockKeyhole v-else :size="13" aria-hidden="true" />
              {{ enabled ? 'Payout aktif' : 'Payout ditutup' }}
            </span>
          </div>

          <div class="fin-hero__compact-grid">
            <div>
              <div class="fin-balance fin-balance--compact">
                <span class="fin-balance__currency">Rp</span>
                <strong>{{ formatIdrNumber(wallet.lifetime_idr) }}</strong>
              </div>
              <p class="fin-hero__note">
                {{ formatIdr(revenuePerFess) }} per fess berbayar, ditahan {{ holdDays }} hari
                sebelum bisa ditarik.
              </p>
            </div>
            <div class="fin-hero__mini-list">
              <div>
                <span>Tersedia</span>
                <strong>{{ formatIdr(wallet.available_idr) }}</strong>
              </div>
              <div>
                <span>Menunggu hold</span>
                <strong class="is-warning">{{ formatIdr(wallet.pending_idr) }}</strong>
              </div>
            </div>
          </div>

          <div class="fin-hero__trust">
            <span
              ><TrendingUp :size="13" aria-hidden="true" /> {{ entries.length }} entri terbaru</span
            >
            <span><ShieldCheck :size="13" aria-hidden="true" /> Hanya fess berbayar</span>
          </div>
        </section>

        <section class="fin-card">
          <div class="fin-card__head">
            <div>
              <p class="fin-card__eyebrow">Buku pendapatan</p>
              <h2 class="fin-card__title">Riwayat pendapatan</h2>
              <p class="fin-card__desc">
                50 transaksi terbaru. Entri berstatus Dibalik berarti fess diturunkan setelah
                terbit.
              </p>
            </div>
            <span class="fin-chip fin-chip--muted">{{ filteredEntries.length }} entri</span>
          </div>

          <div class="fin-filter-row" role="group" aria-label="Filter riwayat pendapatan">
            <button
              v-for="filter in entryFilterOptions"
              :key="filter.key"
              type="button"
              class="fin-filter"
              :class="{ active: activeEntryFilter === filter.key }"
              :aria-pressed="activeEntryFilter === filter.key"
              @click="activeEntryFilter = filter.key"
            >
              {{ filter.label }}
              <span>{{ filter.count }}</span>
            </button>
          </div>

          <div v-if="!filteredEntries.length" class="fin-empty">
            <span class="fin-empty__icon" aria-hidden="true"><ReceiptText :size="21" /></span>
            <div>
              <strong
                >Belum ada pendapatan{{
                  activeEntryFilter === 'all' ? '' : ' pada filter ini'
                }}</strong
              >
              <p v-if="activeEntryFilter === 'all'">
                Pendapatan muncul setelah fess berbayar disetujui dan terbit.
              </p>
              <p v-else>Coba pilih filter lain untuk melihat riwayat pendapatan.</p>
            </div>
          </div>

          <div v-else class="fin-month-list">
            <section v-for="group in groupedEntries" :key="group.key" class="fin-month">
              <p class="fin-month__label">{{ group.label }}</p>
              <ul class="fin-entry-list">
                <li
                  v-for="entry in group.entries"
                  :key="entry.id"
                  class="fin-entry"
                  :class="{ 'is-reversed': entry.status === 'reversed' }"
                >
                  <span
                    class="fin-entry__icon"
                    :class="`is-${entryTone(entry.status)}`"
                    aria-hidden="true"
                  >
                    <component :is="entryIcon(entry.status)" :size="16" />
                  </span>

                  <div class="fin-entry__main">
                    <div class="fin-entry__title">
                      <strong
                        >{{ entryAmountPrefix(entry) }}{{ formatIdr(entry.amount_idr) }}</strong
                      >
                      <span class="fin-chip" :class="entryStatusClass(entry.status)">
                        {{ entryStatusLabel(entry.status) }}
                      </span>
                    </div>
                    <small class="fin-entry__line">
                      {{ entryTypeLabel(entry.type) }}
                      <template v-if="entry.fess_id">
                        · Fess #{{ shortId(entry.fess_id) }}</template
                      >
                    </small>
                    <small v-if="entry.reversal_reason" class="fin-entry__reason">
                      {{ entry.reversal_reason }}
                    </small>
                  </div>

                  <div class="fin-entry__side">
                    <span>{{ entryDateHint(entry) }}</span>
                    <small>Masuk {{ formatDate(entry.created_at) }}</small>
                  </div>
                </li>
              </ul>
            </section>
          </div>
        </section>
      </template>

      <!-- =========================== PENARIKAN ========================== -->
      <template v-else-if="mode === 'penarikan'">
        <section class="fin-hero fin-hero--compact">
          <div class="fin-hero__top">
            <p class="fin-eyebrow">
              <span class="fin-live-dot" aria-hidden="true"></span>
              Siap ditarik
            </p>
            <span class="fin-hero-pill" :class="canRequestPayout ? 'is-active' : 'is-off'">
              <ShieldCheck v-if="canRequestPayout" :size="13" aria-hidden="true" />
              <LockKeyhole v-else :size="13" aria-hidden="true" />
              {{ canRequestPayout ? 'Siap diajukan' : 'Belum siap' }}
            </span>
          </div>

          <div class="fin-hero__compact-grid">
            <div>
              <div class="fin-balance fin-balance--compact">
                <span class="fin-balance__currency">Rp</span>
                <strong>{{ formatIdrNumber(wallet.available_idr) }}</strong>
              </div>
              <p class="fin-hero__note">
                Minimum penarikan {{ formatIdr(minPayout) }}. Biaya transfer default
                {{ formatIdr(payoutFee) }}.
              </p>
            </div>
            <div class="fin-hero__mini-list">
              <div>
                <span>Ditahan payout</span>
                <strong>{{ formatIdr(wallet.reserved_idr) }}</strong>
              </div>
              <div>
                <span>Menunggu hold</span>
                <strong class="is-warning">{{ formatIdr(wallet.pending_idr) }}</strong>
              </div>
            </div>
          </div>

          <div class="fin-hero__trust">
            <span><Landmark :size="13" aria-hidden="true" /> Transfer manual</span>
            <span><ShieldCheck :size="13" aria-hidden="true" /> Review Super Admin</span>
          </div>
        </section>

        <section class="fin-card fin-readiness">
          <div class="fin-card__head">
            <div>
              <p class="fin-card__eyebrow">Status pencairan</p>
              <h2 class="fin-card__title">
                {{ readyCount }} dari {{ eligibility.length }} syarat siap
              </h2>
              <p class="fin-card__desc">
                Semua syarat harus terpenuhi sebelum penarikan bisa diajukan.
              </p>
            </div>
            <span class="fin-chip" :class="allReady ? 'fin-chip--success' : 'fin-chip--warning'">
              {{ allReady ? 'Siap diajukan' : 'Belum siap' }}
            </span>
          </div>

          <div
            class="fin-progress"
            :class="{ 'is-complete': allReady }"
            role="progressbar"
            aria-label="Kelengkapan syarat payout"
            :aria-valuenow="readyCount"
            :aria-valuemin="0"
            :aria-valuemax="eligibility.length"
          >
            <span :style="{ width: `${readinessPct}%` }"></span>
          </div>

          <ul class="fin-check-list">
            <li v-for="item in eligibility" :key="item.key" :class="{ 'is-ok': item.ok }">
              <span class="fin-check-list__icon" aria-hidden="true">
                <component :is="item.icon" :size="15" />
              </span>
              <div class="fin-check-list__copy">
                <strong>{{ item.label }}</strong>
                <small>{{ item.hint }}</small>
              </div>
              <CheckCircle2
                v-if="item.ok"
                :size="17"
                class="fin-check-list__state"
                aria-hidden="true"
              />
              <AlertCircle v-else :size="17" class="fin-check-list__state" aria-hidden="true" />
            </li>
          </ul>
        </section>

        <section class="fin-card fin-payout-form">
          <div class="fin-card__head">
            <div>
              <p class="fin-card__eyebrow">Penarikan dana</p>
              <h2 class="fin-card__title">Ajukan penarikan</h2>
              <p class="fin-card__desc">
                Diajukan ke Super Admin untuk approval manual. Dana langsung ditahan dari saldo
                tersedia saat pengajuan berhasil.
              </p>
            </div>
            <span class="fin-step-badge" aria-hidden="true">01</span>
          </div>

          <div v-if="!canRequestPayout" class="fin-alert fin-alert--warning" role="status">
            <AlertCircle :size="18" aria-hidden="true" />
            <div>
              <strong>Penarikan belum bisa diajukan</strong>
              <p>{{ requestBlockReason }}</p>
              <button
                v-if="!bankComplete || !kycVerified"
                type="button"
                class="fin-inline-link"
                @click="scrollToBank"
              >
                {{ !bankComplete ? 'Lengkapi rekening' : 'Lihat status KYC' }}
              </button>
            </div>
          </div>

          <form class="fin-form" @submit.prevent="submitPayout">
            <div class="fin-field">
              <label for="payout-amount">Nominal penarikan</label>
              <span class="fin-input-affix" :class="{ 'has-error': Boolean(payoutAmountError) }">
                <span class="fin-input-affix__prefix">Rp</span>
                <input
                  id="payout-amount"
                  v-model="payoutForm.amount_idr"
                  class="fin-input"
                  type="number"
                  inputmode="numeric"
                  step="1"
                  :min="minPayout"
                  :max="wallet.available_idr"
                  :disabled="!canRequestPayout || submittingPayout"
                  :aria-invalid="Boolean(payoutAmountError)"
                  aria-describedby="payout-amount-help payout-amount-error"
                  placeholder="50000"
                />
              </span>
              <span id="payout-amount-help" class="fin-help">
                Minimal {{ formatIdr(minPayout) }} · Saldo tersedia
                {{ formatIdr(wallet.available_idr) }}
              </span>
              <span v-if="payoutAmountError" id="payout-amount-error" class="fin-field-error">
                {{ payoutAmountError }}
              </span>
            </div>

            <div v-if="quickAmounts.length" class="fin-quick" aria-label="Nominal cepat">
              <button
                v-for="amount in quickAmounts"
                :key="amount"
                type="button"
                class="fin-quick__btn"
                :class="{ active: payoutAmount === amount }"
                :disabled="!canRequestPayout || submittingPayout"
                @click="payoutForm.amount_idr = amount"
              >
                {{ quickAmountLabel(amount) }}
              </button>
            </div>

            <div class="fin-field">
              <label class="fin-field__row" for="payout-notes">
                <span>Catatan <em>(opsional)</em></span>
                <small>{{ payoutForm.notes.length }}/500</small>
              </label>
              <textarea
                id="payout-notes"
                v-model="payoutForm.notes"
                class="fin-input fin-textarea"
                maxlength="500"
                rows="3"
                :disabled="!canRequestPayout || submittingPayout"
                placeholder="Contoh: pencairan pendapatan bulan ini"
              ></textarea>
            </div>

            <div v-if="payoutAmount > 0" class="fin-receipt">
              <div class="fin-receipt__row">
                <span>Nominal diajukan</span>
                <strong>{{ formatIdr(payoutAmount) }}</strong>
              </div>
              <div class="fin-receipt__row">
                <span>Estimasi biaya transfer</span>
                <strong class="is-negative">−{{ formatIdr(payoutFee) }}</strong>
              </div>
              <div class="fin-receipt__divider"></div>
              <div class="fin-receipt__row fin-receipt__row--total">
                <span>Estimasi diterima</span>
                <strong>{{ formatIdr(estimatedNet) }}</strong>
              </div>
              <p class="fin-receipt__note">
                Biaya final ditentukan Super Admin saat approval dan dapat berbeda dari estimasi.
              </p>
            </div>

            <div v-if="payoutError" class="fin-alert fin-alert--error" role="alert">
              <AlertCircle :size="17" aria-hidden="true" />
              <div>{{ payoutError }}</div>
            </div>
            <div
              v-if="payoutMessage"
              class="fin-alert fin-alert--success"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 :size="17" aria-hidden="true" />
              <div>{{ payoutMessage }}</div>
            </div>

            <button
              type="submit"
              class="fin-btn fin-btn--accent fin-btn--block"
              :disabled="!canRequestPayout || submittingPayout"
            >
              <Loader2 v-if="submittingPayout" class="fin-spin" :size="16" aria-hidden="true" />
              <ArrowDownToLine v-else :size="16" aria-hidden="true" />
              {{ submittingPayout ? 'Memproses…' : 'Ajukan penarikan' }}
            </button>

            <p class="fin-form-note">
              <Info :size="13" aria-hidden="true" />
              Dana ditahan dari saldo tersedia selama pengajuan diproses. Jika ditolak, dana
              dikembalikan ke saldo.
            </p>
          </form>
        </section>

        <section ref="bankSection" class="fin-card fin-bank-section">
          <div class="fin-card__head">
            <div>
              <p class="fin-card__eyebrow">Rekening &amp; verifikasi</p>
              <h2 class="fin-card__title">Rekening payout</h2>
              <p class="fin-card__desc">
                Rekening pertama aktif langsung. Perubahan berikutnya dikunci 24 jam untuk keamanan.
              </p>
            </div>
            <span class="fin-chip" :class="kycClass">
              <ShieldCheck v-if="kycVerified" :size="12" aria-hidden="true" />
              <XCircle
                v-else-if="base?.payout_kyc_status === 'rejected'"
                :size="12"
                aria-hidden="true"
              />
              <AlertCircle v-else :size="12" aria-hidden="true" />
              {{ kycLabel }}
            </span>
          </div>

          <div
            v-if="!kycVerified"
            class="fin-alert"
            :class="
              base?.payout_kyc_status === 'rejected' ? 'fin-alert--danger' : 'fin-alert--warning'
            "
          >
            <XCircle v-if="base?.payout_kyc_status === 'rejected'" :size="18" aria-hidden="true" />
            <AlertCircle v-else :size="18" aria-hidden="true" />
            <div>
              <strong>
                {{
                  base?.payout_kyc_status === 'rejected'
                    ? 'KYC perlu diperbaiki'
                    : 'KYC belum diverifikasi'
                }}
              </strong>
              <p>{{ kycDescription }}</p>
            </div>
          </div>

          <div class="fin-bank-card" :class="{ 'is-empty': !bankComplete }">
            <span
              class="fin-bank-mark"
              :class="{ 'has-logo': activeBankBrand?.logo }"
              :style="bankMarkStyle(activeBankBrand)"
              aria-hidden="true"
            >
              <img v-if="activeBankBrand?.logo" :src="activeBankBrand.logo" alt="" />
              <template v-else>{{ bankInitials }}</template>
            </span>
            <div class="fin-bank-card__copy">
              <span class="fin-account__label">Rekening aktif</span>
              <strong>{{ base?.bank_name || 'Belum ada rekening' }}</strong>
              <small v-if="bankComplete">
                {{ base?.bank_account_name }} · {{ base?.bank_account_number_masked }}
              </small>
              <small v-else>Tambahkan rekening untuk menerima dana payout.</small>
            </div>
            <button
              v-if="bankComplete && !showBankForm"
              type="button"
              class="fin-btn fin-btn--secondary fin-btn--small"
              @click="openBankForm"
            >
              <Pencil :size="14" aria-hidden="true" />
              Ubah
            </button>
          </div>

          <div v-if="bankChangePending" class="fin-alert fin-alert--warning">
            <Clock3 :size="17" aria-hidden="true" />
            <div>
              Rekening baru aktif {{ formatDate(base?.bank_change_effective_at) }}. Payout dapat
              diajukan kembali setelah masa tunggu selesai.
            </div>
          </div>

          <div v-if="bankError" class="fin-alert fin-alert--error" role="alert">
            <AlertCircle :size="17" aria-hidden="true" />
            <div>{{ bankError }}</div>
          </div>
          <div
            v-if="bankMessage"
            class="fin-alert fin-alert--success"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 :size="17" aria-hidden="true" />
            <div>{{ bankMessage }}</div>
          </div>

          <form v-if="showBankForm" class="fin-form fin-bank-form" @submit.prevent="saveBank">
            <div class="fin-card__subhead">
              <div>
                <h3>{{ bankComplete ? 'Ganti rekening payout' : 'Tambahkan rekening payout' }}</h3>
                <p>
                  Nomor rekening tidak ditampilkan penuh. Masukkan ulang data rekening untuk
                  konfirmasi.
                </p>
              </div>
              <button
                v-if="bankComplete"
                type="button"
                class="fin-text-btn"
                :disabled="savingBank"
                @click="cancelBankEdit"
              >
                Batal
              </button>
            </div>

            <div class="fin-form-grid">
              <div class="fin-field fin-bank-field">
                <span id="payout-bank-label">Bank tujuan</span>
                <div ref="bankPickerRef" class="fin-bank-picker">
                  <button
                    id="payout-bank-trigger"
                    ref="bankTriggerRef"
                    type="button"
                    class="fin-bank-trigger"
                    :class="{
                      'is-open': bankPickerOpen,
                      'is-placeholder': bankTriggerPlaceholder,
                    }"
                    :disabled="savingBank"
                    aria-haspopup="listbox"
                    :aria-expanded="bankPickerOpen"
                    aria-controls="payout-bank-menu"
                    aria-labelledby="payout-bank-label payout-bank-trigger-title"
                    @click="toggleBankPicker"
                  >
                    <span
                      class="fin-bank-trigger__mark"
                      :class="{
                        'has-logo': selectedBankOption?.logo,
                        'is-placeholder': bankTriggerPlaceholder,
                      }"
                      :style="bankMarkStyle(selectedBankOption)"
                      aria-hidden="true"
                    >
                      <img v-if="selectedBankOption?.logo" :src="selectedBankOption.logo" alt="" />
                      <template v-else-if="bankTriggerMark">{{ bankTriggerMark }}</template>
                      <Landmark v-else :size="17" />
                    </span>
                    <span class="fin-bank-trigger__copy">
                      <strong id="payout-bank-trigger-title">{{ bankTriggerTitle }}</strong>
                      <small>{{ bankTriggerSubtitle }}</small>
                    </span>
                    <ChevronDown :size="16" class="fin-bank-trigger__chevron" aria-hidden="true" />
                  </button>

                  <div
                    v-if="bankPickerOpen"
                    id="payout-bank-menu"
                    class="fin-bank-menu"
                    @keydown.esc.stop.prevent="closeBankPicker(true)"
                  >
                    <div class="fin-bank-menu__head">
                      <strong>Pilih bank tujuan</strong>
                      <span>{{ filteredBanks.length }} bank</span>
                    </div>

                    <div class="fin-bank-search">
                      <Search :size="15" aria-hidden="true" />
                      <input
                        ref="bankSearchRef"
                        v-model="bankSearch"
                        type="search"
                        autocomplete="off"
                        spellcheck="false"
                        aria-label="Cari bank"
                        aria-controls="payout-bank-list"
                        placeholder="Cari bank, mis. BCA atau Mandiri"
                        @keydown.down.prevent="focusFirstBankOption"
                        @keydown.enter.prevent="selectFirstBankOption"
                      />
                    </div>

                    <div
                      id="payout-bank-list"
                      ref="bankListRef"
                      class="fin-bank-options"
                      role="listbox"
                      aria-label="Daftar bank tujuan"
                    >
                      <button
                        v-for="bank in filteredBanks"
                        :key="bank.code"
                        type="button"
                        class="fin-bank-option"
                        role="option"
                        :aria-selected="bankSelection === bank.code"
                        @click="selectBankOption(bank)"
                      >
                        <span
                          class="fin-bank-option__mark"
                          :class="{ 'has-logo': bank.logo }"
                          :style="bankMarkStyle(bank)"
                          aria-hidden="true"
                        >
                          <img v-if="bank.logo" :src="bank.logo" alt="" />
                          <template v-else>{{ bank.initials }}</template>
                        </span>
                        <span class="fin-bank-option__copy">
                          <strong>{{ bank.name }}</strong>
                          <small>{{ bank.label }}</small>
                        </span>
                        <CheckCircle2
                          v-if="bankSelection === bank.code"
                          :size="16"
                          class="fin-bank-option__state"
                          aria-hidden="true"
                        />
                      </button>
                      <p v-if="!filteredBanks.length" class="fin-bank-empty">
                        Bank tidak ditemukan. Gunakan opsi
                        <strong>Bank lainnya</strong> di bawah.
                      </p>
                    </div>

                    <button type="button" class="fin-bank-other" @click="selectOtherBank">
                      <span class="fin-bank-other__mark" aria-hidden="true">
                        <Landmark :size="15" />
                      </span>
                      <span class="fin-bank-other__copy">
                        <strong>Bank lainnya</strong>
                        <small>Isi nama bank secara manual</small>
                      </span>
                      <Pencil :size="15" class="fin-bank-other__chevron" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div v-if="bankSelection === 'other'" class="fin-bank-custom">
                  <label for="payout-bank-name">Nama bank</label>
                  <input
                    id="payout-bank-name"
                    ref="bankOtherInputRef"
                    v-model="bankForm.bank_name"
                    class="fin-input"
                    type="text"
                    maxlength="80"
                    :disabled="savingBank"
                    placeholder="Contoh: Bank Nusantara"
                    required
                  />
                  <span class="fin-help">Tulis nama bank lengkap agar transfer tidak gagal.</span>
                </div>
              </div>

              <div class="fin-field">
                <label for="payout-bank-account-name">Nama pemilik rekening</label>
                <input
                  id="payout-bank-account-name"
                  v-model="bankForm.bank_account_name"
                  class="fin-input"
                  type="text"
                  maxlength="120"
                  :disabled="savingBank"
                  placeholder="Sesuai rekening bank"
                  required
                />
              </div>

              <div class="fin-field">
                <label for="payout-bank-account-number">Nomor rekening</label>
                <input
                  id="payout-bank-account-number"
                  :value="bankForm.bank_account_number"
                  class="fin-input"
                  type="text"
                  inputmode="numeric"
                  maxlength="34"
                  :disabled="savingBank"
                  aria-describedby="payout-bank-account-help"
                  placeholder="Hanya angka, 5–34 digit"
                  required
                  @input="onBankAccountInput"
                />
                <span id="payout-bank-account-help" class="fin-help">
                  Hanya angka, tanpa spasi atau tanda baca.
                </span>
              </div>

              <div class="fin-field">
                <label for="payout-bank-password">Kata sandi konfirmasi</label>
                <span class="fin-input-affix">
                  <input
                    id="payout-bank-password"
                    v-model="bankForm.password"
                    class="fin-input fin-input--password"
                    :type="showBankPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    :disabled="savingBank"
                    placeholder="Wajib untuk menyimpan"
                    required
                  />
                  <button
                    type="button"
                    class="fin-eye-btn"
                    :aria-label="
                      showBankPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
                    "
                    @click="showBankPassword = !showBankPassword"
                  >
                    <EyeOff v-if="showBankPassword" :size="16" aria-hidden="true" />
                    <Eye v-else :size="16" aria-hidden="true" />
                  </button>
                </span>
              </div>
            </div>

            <button
              type="submit"
              class="fin-btn fin-btn--secondary fin-btn--block"
              :disabled="savingBank"
            >
              <Loader2 v-if="savingBank" class="fin-spin" :size="16" aria-hidden="true" />
              <Save v-else :size="16" aria-hidden="true" />
              {{ savingBank ? 'Menyimpan…' : 'Simpan rekening' }}
            </button>
          </form>

          <p class="fin-footnote">
            <ShieldCheck :size="13" aria-hidden="true" />
            KYC diverifikasi Super Admin. Payout membutuhkan KYC verified, rekening lengkap, dan
            masa tunggu rekening yang sudah selesai.
          </p>
          <p v-if="base?.payout_kyc_note" class="fin-note fin-note--kyc">
            Catatan KYC: {{ base.payout_kyc_note }}
          </p>
        </section>

        <section class="fin-card">
          <div class="fin-card__head">
            <div>
              <p class="fin-card__eyebrow">Riwayat</p>
              <h2 class="fin-card__title">Riwayat penarikan</h2>
              <p class="fin-card__desc">25 pengajuan terbaru untuk base ini.</p>
            </div>
            <span class="fin-chip fin-chip--muted">{{ filteredPayouts.length }} pengajuan</span>
          </div>

          <div class="fin-filter-row" role="group" aria-label="Filter riwayat penarikan">
            <button
              v-for="filter in payoutFilterOptions"
              :key="filter.key"
              type="button"
              class="fin-filter"
              :class="{ active: activePayoutFilter === filter.key }"
              :aria-pressed="activePayoutFilter === filter.key"
              @click="activePayoutFilter = filter.key"
            >
              {{ filter.label }}
              <span>{{ filter.count }}</span>
            </button>
          </div>

          <div v-if="!filteredPayouts.length" class="fin-empty">
            <span class="fin-empty__icon" aria-hidden="true"><ReceiptText :size="21" /></span>
            <div>
              <strong
                >Belum ada pengajuan{{
                  activePayoutFilter === 'all' ? '' : ' pada filter ini'
                }}</strong
              >
              <p v-if="activePayoutFilter === 'all'">
                Pengajuan penarikan akan muncul di sini setelah kamu mengirimkannya.
              </p>
              <p v-else>Coba pilih filter lain untuk melihat riwayat penarikan.</p>
            </div>
          </div>

          <ul v-else class="fin-payout-list">
            <li v-for="payout in filteredPayouts" :key="payout.id" class="fin-payout">
              <div class="fin-payout__top">
                <span
                  class="fin-payout__icon"
                  :class="`is-${payoutTone(payout.status)}`"
                  aria-hidden="true"
                >
                  <component :is="payoutIcon(payout.status)" :size="17" />
                </span>

                <div class="fin-payout__main">
                  <div class="fin-payout__title">
                    <strong>{{ formatIdr(payout.amount_idr) }}</strong>
                    <span class="fin-chip" :class="payoutStatusClass(payout.status)">
                      {{ payoutStatusLabel(payout.status) }}
                    </span>
                  </div>
                  <small class="fin-payout__line">
                    Diajukan {{ formatDate(payout.requested_at) }} · bersih
                    {{ formatIdr(payout.net_idr) }}
                  </small>
                  <small v-if="payout.reference" class="fin-ref">Ref {{ payout.reference }}</small>
                  <small class="fin-payout__hint">{{ payoutStatusHint(payout) }}</small>
                  <p v-if="payout.rejection_reason" class="fin-payout__reason">
                    {{ payout.rejection_reason }}
                  </p>
                </div>
              </div>

              <div class="fin-payout__bank">
                <Landmark :size="13" aria-hidden="true" />
                {{ payout.bank_name }} · {{ payout.bank_account_number_masked }}
              </div>
            </li>
          </ul>
        </section>
      </template>
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import {
  AlertCircle,
  ArrowDownToLine,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Coins,
  Eye,
  EyeOff,
  Info,
  Landmark,
  Loader2,
  LockKeyhole,
  Pencil,
  ReceiptText,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  TrendingUp,
  WalletCards,
  XCircle,
} from 'lucide-vue-next';

import { api } from '../../api';
import { toast } from '../../composables/useToast';
import { confirmDialog } from '../../composables/useAppDialog';
import { createIdempotencyKey } from '../../utils/idempotency';
import ContentSkeleton from '../ui/ContentSkeleton.vue';
import AppStateView from '../ui/AppStateView.vue';
import bcaLogo from '../../assets/payments/bca.svg';
import bniLogo from '../../assets/payments/bni.svg';
import briLogo from '../../assets/payments/bri.svg';
import mandiriLogo from '../../assets/payments/mandiri.svg';
import permataLogo from '../../assets/payments/permata.svg';

const props = defineProps({
  mode: { type: String, default: 'saldo' },
  baseHandle: { type: String, default: '' },
});

const emit = defineEmits(['navigate']);

const financeTabs = [
  { key: 'keuangan_saldo', label: 'Saldo', icon: WalletCards },
  { key: 'keuangan_pendapatan', label: 'Pendapatan', icon: TrendingUp },
  { key: 'keuangan_penarikan', label: 'Payout', icon: ArrowDownToLine },
];

const BANK_OPTIONS = [
  {
    code: 'BCA',
    name: 'BCA',
    label: 'Bank Central Asia',
    initials: 'BCA',
    logo: bcaLogo,
    aliases: ['bank bca', 'bank central asia bca'],
  },
  {
    code: 'BNI',
    name: 'BNI',
    label: 'Bank Negara Indonesia',
    initials: 'BNI',
    logo: bniLogo,
    aliases: ['bank bni', 'bank negara indonesia bni'],
  },
  {
    code: 'BRI',
    name: 'BRI',
    label: 'Bank Rakyat Indonesia',
    initials: 'BRI',
    logo: briLogo,
    aliases: ['bank bri', 'bank rakyat indonesia bri'],
  },
  {
    code: 'MANDIRI',
    name: 'Mandiri',
    label: 'Bank Mandiri',
    initials: 'MDR',
    logo: mandiriLogo,
    aliases: ['bank mandiri'],
  },
  {
    code: 'PERMATA',
    name: 'Permata',
    label: 'Bank Permata',
    initials: 'PMT',
    logo: permataLogo,
    aliases: ['bank permata'],
  },
  {
    code: 'BSI',
    name: 'BSI',
    label: 'Bank Syariah Indonesia',
    initials: 'BSI',
    tone: '#0b9b84',
    aliases: ['bank bsi', 'bank syariah indonesia'],
  },
  {
    code: 'CIMB',
    name: 'CIMB Niaga',
    label: 'Bank CIMB Niaga',
    initials: 'CIMB',
    tone: '#a6192e',
    aliases: ['bank cimb', 'bank cimb niaga'],
  },
  {
    code: 'DANAMON',
    name: 'Danamon',
    label: 'Bank Danamon',
    initials: 'DMN',
    tone: '#e8a000',
    ink: '#151515',
    aliases: ['bank danamon'],
  },
  {
    code: 'BTN',
    name: 'BTN',
    label: 'Bank Tabungan Negara',
    initials: 'BTN',
    tone: '#00549f',
    aliases: ['bank btn', 'bank tabungan negara'],
  },
  {
    code: 'MEGA',
    name: 'Mega',
    label: 'Bank Mega',
    initials: 'MGA',
    tone: '#d71920',
    aliases: ['bank mega'],
  },
  {
    code: 'BJB',
    name: 'BJB',
    label: 'Bank BJB',
    initials: 'BJB',
    tone: '#0072bc',
    aliases: ['bank bjb', 'bank jawa barat'],
  },
  {
    code: 'DKI',
    name: 'DKI',
    label: 'Bank DKI',
    initials: 'DKI',
    tone: '#d21f2b',
    aliases: ['bank dki'],
  },
  {
    code: 'JAGO',
    name: 'Jago',
    label: 'Bank Jago',
    initials: 'JGO',
    tone: '#f5b700',
    ink: '#1b1b1b',
    aliases: ['bank jago'],
  },
  {
    code: 'SEABANK',
    name: 'SeaBank',
    label: 'SeaBank Indonesia',
    initials: 'SEA',
    tone: '#ff5c00',
    aliases: ['bank seabank', 'seabank indonesia'],
  },
  {
    code: 'NEO',
    name: 'Neo Commerce',
    label: 'Bank Neo Commerce',
    initials: 'NEO',
    tone: '#6f2dbd',
    aliases: ['bank neo', 'bank neo commerce'],
  },
  {
    code: 'OCBC',
    name: 'OCBC',
    label: 'OCBC Indonesia',
    initials: 'OCBC',
    tone: '#c8102e',
    aliases: ['bank ocbc', 'ocbc indonesia'],
  },
  {
    code: 'UOB',
    name: 'UOB',
    label: 'UOB Indonesia',
    initials: 'UOB',
    tone: '#1e3a8a',
    aliases: ['bank uob', 'uob indonesia'],
  },
  {
    code: 'PANIN',
    name: 'Panin',
    label: 'Panin Bank',
    initials: 'PNN',
    tone: '#0a5aa8',
    aliases: ['bank panin'],
  },
  {
    code: 'SINARMAS',
    name: 'Sinarmas',
    label: 'Bank Sinarmas',
    initials: 'SMS',
    tone: '#d71920',
    aliases: ['bank sinarmas'],
  },
  {
    code: 'BUKOPIN',
    name: 'Bukopin',
    label: 'KB Bukopin',
    initials: 'BKP',
    tone: '#0a5aa8',
    aliases: ['bank bukopin', 'kb bukopin'],
  },
  {
    code: 'MUAMALAT',
    name: 'Muamalat',
    label: 'Bank Muamalat',
    initials: 'MUA',
    tone: '#5c2d91',
    aliases: ['bank muamalat'],
  },
  {
    code: 'MAYBANK',
    name: 'Maybank',
    label: 'Maybank Indonesia',
    initials: 'MYB',
    tone: '#f7c600',
    ink: '#1b1b1b',
    aliases: ['bank maybank', 'maybank indonesia'],
  },
];

function normalizeBankText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function findBankBrand(value) {
  const needle = normalizeBankText(value);
  if (!needle) return null;
  return (
    BANK_OPTIONS.find((option) =>
      [option.code, option.name, option.label, ...(option.aliases || [])].some(
        (candidate) => normalizeBankText(candidate) === needle,
      ),
    ) || null
  );
}

function initialsForBank(value) {
  return (
    String(value || '')
      .replace(/^bank\s+/i, '')
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 3)
      .toUpperCase() || '—'
  );
}

const workspace = ref(null);
const loading = ref(false);
const error = ref(null);

const payoutForm = reactive({ amount_idr: '', notes: '' });
const bankForm = reactive({
  bank_name: '',
  bank_account_name: '',
  bank_account_number: '',
  password: '',
});

const bankSelection = ref('');
const bankPickerOpen = ref(false);
const bankSearch = ref('');
const bankPickerRef = ref(null);
const bankTriggerRef = ref(null);
const bankSearchRef = ref(null);
const bankListRef = ref(null);
const bankOtherInputRef = ref(null);
const submittingPayout = ref(false);
const savingBank = ref(false);
const payoutMessage = ref('');
const payoutError = ref('');
const bankMessage = ref('');
const bankError = ref('');
const activeEntryFilter = ref('all');
const activePayoutFilter = ref('all');
const showBankForm = ref(true);
const showBankPassword = ref(false);
const bankSection = ref(null);
let payoutRequestKey = null;
let didInitialLoad = false;

const activePanelKey = computed(() => `keuangan_${props.mode}`);

const base = computed(() => workspace.value?.base || null);
const wallet = computed(
  () =>
    workspace.value?.wallet || {
      pending_idr: 0,
      available_idr: 0,
      reserved_idr: 0,
      lifetime_idr: 0,
    },
);
const entries = computed(() => workspace.value?.entries || []);
const payouts = computed(() => workspace.value?.payouts || []);
const enabled = computed(() => workspace.value?.enabled === true);
const minPayout = computed(() => Number(workspace.value?.min_payout_idr ?? 50000));
const payoutFee = computed(() => Number(workspace.value?.payout_fee_idr ?? 6500));
const revenuePerFess = computed(() => Number(workspace.value?.revenue_per_fess_idr ?? 80));
const holdDays = computed(() => Number(workspace.value?.hold_days ?? 7));

const payoutAmount = computed(() => {
  const amount = Number(payoutForm.amount_idr);
  return Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 0;
});

const payoutAmountError = computed(() => {
  if (String(payoutForm.amount_idr ?? '').trim() === '') return '';
  const amount = Number(payoutForm.amount_idr);
  if (!Number.isFinite(amount) || amount <= 0) return 'Masukkan nominal penarikan yang valid.';
  if (amount < minPayout.value) return `Minimal penarikan ${formatIdr(minPayout.value)}.`;
  if (amount > Number(wallet.value.available_idr)) {
    return 'Nominal melebihi saldo yang tersedia.';
  }
  return '';
});

const estimatedNet = computed(() => Math.max(payoutAmount.value - payoutFee.value, 0));

const trialActive = computed(() => {
  const end = base.value?.trial_ends_at ? new Date(base.value.trial_ends_at).getTime() : 0;
  return end > Date.now();
});

const billingShortLabel = computed(() => {
  if (base.value?.free_forever) return 'Free forever';
  if (trialActive.value) return 'Masa trial';
  return 'Base berbayar';
});

const billingDetail = computed(() => {
  if (base.value?.free_forever) {
    return 'Base ini dibebaskan dari biaya posting. Pendapatan dari fess berbayar tetap berlaku.';
  }
  if (trialActive.value) {
    return `Masa trial aktif sampai ${formatDate(base.value?.trial_ends_at)}. Setelah itu base menjadi berbayar.`;
  }
  return 'Pengguna membayar 1 CTF per fess. Pendapatan base dihitung terpisah dalam IDR.';
});

const kycVerified = computed(() => base.value?.payout_kyc_status === 'verified');
const kycLabel = computed(() => {
  const status = base.value?.payout_kyc_status || 'unverified';
  if (status === 'verified') return 'KYC terverifikasi';
  if (status === 'rejected') return 'KYC ditolak';
  return 'KYC belum diverifikasi';
});
const kycClass = computed(() => {
  if (kycVerified.value) return 'fin-chip--success';
  if (base.value?.payout_kyc_status === 'rejected') return 'fin-chip--danger';
  return 'fin-chip--warning';
});
const kycDescription = computed(() => {
  if (kycVerified.value) {
    return `Terverifikasi ${formatDate(base.value?.payout_kyc_verified_at)} oleh Super Admin.`;
  }
  if (base.value?.payout_kyc_status === 'rejected') {
    return (
      base.value?.payout_kyc_note ||
      'Data KYC ditolak. Hubungi Super Admin untuk memperbaiki data dan mengajukan verifikasi ulang.'
    );
  }
  return 'Hubungi Super Admin untuk memverifikasi data KYC base sebelum mengajukan payout.';
});

const bankComplete = computed(() =>
  Boolean(
    base.value?.bank_name &&
    base.value?.bank_account_name &&
    base.value?.bank_account_number_masked,
  ),
);
const bankChangePending = computed(() => base.value?.bank_change_pending === true);

const activeBankBrand = computed(() => findBankBrand(base.value?.bank_name));
const bankInitials = computed(
  () => activeBankBrand.value?.initials || initialsForBank(base.value?.bank_name),
);
const selectedBankOption = computed(
  () => BANK_OPTIONS.find((option) => option.code === bankSelection.value) || null,
);
const filteredBanks = computed(() => {
  const query = normalizeBankText(bankSearch.value);
  if (!query) return BANK_OPTIONS;
  return BANK_OPTIONS.filter((option) =>
    [option.code, option.name, option.label, ...(option.aliases || [])].some((candidate) =>
      normalizeBankText(candidate).includes(query),
    ),
  );
});
const bankTriggerMark = computed(
  () =>
    selectedBankOption.value?.initials ||
    (bankSelection.value === 'other' ? initialsForBank(bankForm.bank_name) : ''),
);
const bankTriggerTitle = computed(() => {
  if (selectedBankOption.value) return selectedBankOption.value.name;
  if (bankSelection.value === 'other') return bankForm.bank_name.trim() || 'Bank lainnya';
  return 'Pilih bank penerima';
});
const bankTriggerSubtitle = computed(() => {
  if (selectedBankOption.value) return selectedBankOption.value.label;
  if (bankSelection.value === 'other') return 'Nama bank diisi manual';
  return 'Cari dan pilih dari daftar';
});
const bankTriggerPlaceholder = computed(
  () =>
    !selectedBankOption.value && !(bankSelection.value === 'other' && bankForm.bank_name.trim()),
);

function bankMarkStyle(option) {
  if (!option || option.logo) return undefined;
  return {
    background: option.tone || 'var(--fin-inset)',
    color: option.ink || '#ffffff',
  };
}

const canRequestPayout = computed(
  () =>
    enabled.value &&
    kycVerified.value &&
    bankComplete.value &&
    !bankChangePending.value &&
    Number(wallet.value.available_idr) >= minPayout.value,
);

const requestBlockReason = computed(() => {
  if (!enabled.value) return 'Fitur payout base sedang dinonaktifkan oleh Super Admin.';
  if (!kycVerified.value) return 'KYC base harus diverifikasi Super Admin terlebih dahulu.';
  if (!bankComplete.value) return 'Lengkapi rekening bank terlebih dahulu.';
  if (bankChangePending.value) {
    return `Perubahan rekening masih dikunci sampai ${formatDate(base.value?.bank_change_effective_at)}.`;
  }
  if (Number(wallet.value.available_idr) < minPayout.value) {
    return `Saldo tersedia minimal ${formatIdr(minPayout.value)} untuk mengajukan payout.`;
  }
  return '';
});

const eligibility = computed(() => [
  {
    key: 'enabled',
    label: 'Payout dibuka',
    ok: enabled.value,
    icon: LockKeyhole,
    hint: enabled.value ? 'Fitur penarikan sedang aktif.' : 'Dibuka kembali oleh Super Admin.',
  },
  {
    key: 'kyc',
    label: 'KYC terverifikasi',
    ok: kycVerified.value,
    icon: ShieldCheck,
    hint: kycVerified.value
      ? `Terverifikasi ${formatDate(base.value?.payout_kyc_verified_at)}.`
      : 'Menunggu verifikasi Super Admin.',
  },
  {
    key: 'bank',
    label: 'Rekening lengkap',
    ok: bankComplete.value,
    icon: Landmark,
    hint: bankComplete.value
      ? `${base.value?.bank_name} · ${base.value?.bank_account_number_masked}`
      : 'Nama bank, pemilik, dan nomor rekening wajib diisi.',
  },
  {
    key: 'hold',
    label: 'Rekening tidak dalam masa tunggu',
    ok: !bankChangePending.value,
    icon: Clock3,
    hint: bankChangePending.value
      ? `Rekening baru aktif ${formatDate(base.value?.bank_change_effective_at)}.`
      : 'Tidak ada perubahan rekening yang tertunda.',
  },
  {
    key: 'balance',
    label: `Saldo minimal ${formatIdr(minPayout.value)}`,
    ok: Number(wallet.value.available_idr) >= minPayout.value,
    icon: WalletCards,
    hint:
      Number(wallet.value.available_idr) >= minPayout.value
        ? `${formatIdr(wallet.value.available_idr)} siap ditarik.`
        : `Kurang ${formatIdr(Math.max(minPayout.value - Number(wallet.value.available_idr), 0))} dari minimum.`,
  },
]);

const readyCount = computed(() => eligibility.value.filter((item) => item.ok).length);
const allReady = computed(() => readyCount.value === eligibility.value.length);
const readinessPct = computed(() =>
  eligibility.value.length ? (readyCount.value / eligibility.value.length) * 100 : 0,
);

const quickAmounts = computed(() => {
  const available = Math.floor(Number(wallet.value.available_idr) || 0);
  const values = [minPayout.value, 100000, 250000, 500000, available].filter(
    (amount) => amount >= minPayout.value && amount <= available,
  );
  return [...new Set(values)].sort((a, b) => a - b);
});

const walletCurrentTotal = computed(
  () =>
    Math.max(Number(wallet.value.available_idr) || 0, 0) +
    Math.max(Number(wallet.value.pending_idr) || 0, 0) +
    Math.max(Number(wallet.value.reserved_idr) || 0, 0),
);

const allocationItems = computed(() => {
  const total = walletCurrentTotal.value;
  const items = [
    {
      key: 'available',
      label: 'Tersedia',
      value: Number(wallet.value.available_idr) || 0,
      tone: 'success',
    },
    {
      key: 'pending',
      label: 'Menunggu hold',
      value: Number(wallet.value.pending_idr) || 0,
      tone: 'warning',
    },
    {
      key: 'reserved',
      label: 'Ditahan payout',
      value: Number(wallet.value.reserved_idr) || 0,
      tone: 'info',
    },
  ];
  return items.map((item) => ({
    ...item,
    pct: total > 0 ? (Math.max(item.value, 0) / total) * 100 : 0,
  }));
});

const entryFilterOptions = computed(() => {
  const definitions = [
    { key: 'all', label: 'Semua' },
    { key: 'available', label: 'Tersedia' },
    { key: 'pending', label: 'Menunggu hold' },
    { key: 'reversed', label: 'Dibalik' },
    { key: 'paid', label: 'Dibayar' },
  ];
  return definitions
    .map((definition) => ({
      ...definition,
      count:
        definition.key === 'all'
          ? entries.value.length
          : entries.value.filter((entry) => entry.status === definition.key).length,
    }))
    .filter((definition) => definition.key === 'all' || definition.count > 0);
});

const filteredEntries = computed(() => {
  if (activeEntryFilter.value === 'all') return entries.value;
  return entries.value.filter((entry) => entry.status === activeEntryFilter.value);
});

const groupedEntries = computed(() => {
  const groups = [];
  const index = new Map();
  for (const entry of filteredEntries.value) {
    const date = new Date(entry.created_at);
    const valid = Number.isFinite(date.getTime());
    const key = valid ? `${date.getFullYear()}-${date.getMonth()}` : 'unknown';
    if (!index.has(key)) {
      const group = {
        key,
        label: valid
          ? date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
          : 'Tanpa tanggal',
        entries: [],
      };
      index.set(key, group);
      groups.push(group);
    }
    index.get(key).entries.push(entry);
  }
  return groups;
});

const payoutFilterOptions = computed(() => {
  const isActive = (status) => ['requested', 'approved'].includes(status);
  const isClosed = (status) => ['rejected', 'failed', 'cancelled'].includes(status);
  return [
    { key: 'all', label: 'Semua', count: payouts.value.length },
    {
      key: 'active',
      label: 'Diproses',
      count: payouts.value.filter((payout) => isActive(payout.status)).length,
    },
    {
      key: 'paid',
      label: 'Selesai',
      count: payouts.value.filter((payout) => payout.status === 'paid').length,
    },
    {
      key: 'closed',
      label: 'Gagal/Ditolak',
      count: payouts.value.filter((payout) => isClosed(payout.status)).length,
    },
  ];
});

const filteredPayouts = computed(() => {
  const filter = activePayoutFilter.value;
  if (filter === 'all') return payouts.value;
  if (filter === 'active') {
    return payouts.value.filter((payout) => ['requested', 'approved'].includes(payout.status));
  }
  if (filter === 'paid') return payouts.value.filter((payout) => payout.status === 'paid');
  return payouts.value.filter((payout) =>
    ['rejected', 'failed', 'cancelled'].includes(payout.status),
  );
});

function formatIdrNumber(value) {
  return Math.round(Number(value) || 0).toLocaleString('id-ID');
}

function formatIdr(value) {
  return `Rp${formatIdrNumber(value)}`;
}

function formatShortIdr(value) {
  const amount = Number(value) || 0;
  if (amount >= 1_000_000) {
    return `Rp${(amount / 1_000_000).toFixed(amount % 1_000_000 ? 1 : 0)}jt`;
  }
  if (amount >= 1_000) return `Rp${Math.round(amount / 1_000)}rb`;
  return formatIdr(amount);
}

function quickAmountLabel(amount) {
  const available = Math.floor(Number(wallet.value.available_idr) || 0);
  if (amount === available) return `Semua · ${formatShortIdr(amount)}`;
  return formatShortIdr(amount);
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '—';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function shortId(value) {
  return String(value || '')
    .replace(/^fess_/, '')
    .slice(0, 8);
}

function entryStatusLabel(status) {
  return (
    {
      pending: 'Menunggu hold',
      available: 'Tersedia',
      reversed: 'Dibalik',
      paid: 'Sudah dibayar',
    }[status] || status
  );
}

function entryStatusClass(status) {
  return (
    {
      pending: 'fin-chip--warning',
      available: 'fin-chip--success',
      reversed: 'fin-chip--danger',
      paid: 'fin-chip--info',
    }[status] || 'fin-chip--muted'
  );
}

function entryTone(status) {
  return (
    {
      pending: 'warning',
      available: 'success',
      reversed: 'danger',
      paid: 'info',
    }[status] || 'muted'
  );
}

function entryIcon(status) {
  return (
    {
      pending: Clock3,
      available: CheckCircle2,
      reversed: RotateCcw,
      paid: BadgeCheck,
    }[status] || Coins
  );
}

function entryTypeLabel(type) {
  return (
    {
      earning: 'Pendapatan fess',
      reversal: 'Pembalikan pendapatan',
      payout: 'Payout',
    }[type] || type
  );
}

function entryDateHint(entry) {
  if (entry.status === 'pending' && entry.available_at) {
    return `Cair ${formatDate(entry.available_at)}`;
  }
  if (entry.reversed_at) return `Dibalik ${formatDate(entry.reversed_at)}`;
  if (entry.status === 'available' && entry.available_at) {
    return `Tersedia ${formatDate(entry.available_at)}`;
  }
  if (entry.status === 'paid') return 'Selesai';
  return `Masuk ${formatDate(entry.created_at)}`;
}

function entryAmountPrefix(entry) {
  return entry.status === 'reversed' ? '−' : '+';
}

function payoutStatusLabel(status) {
  return (
    {
      requested: 'Menunggu review',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      paid: 'Sudah ditransfer',
      failed: 'Transfer gagal',
      cancelled: 'Dibatalkan',
    }[status] || status
  );
}

function payoutStatusClass(status) {
  return (
    {
      requested: 'fin-chip--warning',
      approved: 'fin-chip--info',
      rejected: 'fin-chip--danger',
      paid: 'fin-chip--success',
      failed: 'fin-chip--danger',
      cancelled: 'fin-chip--muted',
    }[status] || 'fin-chip--muted'
  );
}

function payoutTone(status) {
  return (
    {
      requested: 'warning',
      approved: 'info',
      rejected: 'danger',
      paid: 'success',
      failed: 'danger',
      cancelled: 'muted',
    }[status] || 'muted'
  );
}

function payoutIcon(status) {
  return (
    {
      requested: Clock3,
      approved: ShieldCheck,
      rejected: XCircle,
      paid: CheckCircle2,
      failed: AlertCircle,
      cancelled: AlertCircle,
    }[status] || ReceiptText
  );
}

function payoutStatusHint(payout) {
  return (
    {
      requested: 'Menunggu review manual Super Admin.',
      approved: 'Disetujui, menunggu proses transfer.',
      rejected: 'Pengajuan ditolak dan dana dikembalikan ke saldo.',
      paid: 'Transfer sudah diselesaikan.',
      failed: 'Transfer gagal. Hubungi Super Admin untuk tindak lanjut.',
      cancelled: 'Pengajuan dibatalkan.',
    }[payout.status] || 'Status pengajuan belum dikenali.'
  );
}

function navigateFinance(key) {
  if (key !== activePanelKey.value) emit('navigate', key);
}

function scrollToBank() {
  if (!bankComplete.value) showBankForm.value = true;
  bankSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleBankPicker() {
  if (bankPickerOpen.value) {
    closeBankPicker();
  } else {
    openBankPicker();
  }
}

function openBankPicker() {
  if (savingBank.value) return;
  bankPickerOpen.value = true;
  bankSearch.value = '';
  nextTick(() => bankSearchRef.value?.focus());
}

function closeBankPicker(restoreFocus = false) {
  bankPickerOpen.value = false;
  bankSearch.value = '';
  if (restoreFocus) nextTick(() => bankTriggerRef.value?.focus());
}

function selectBankOption(bank) {
  bankForm.bank_name = bank.name;
  bankSelection.value = bank.code;
  bankError.value = '';
  closeBankPicker(true);
}

function selectOtherBank() {
  bankSelection.value = 'other';
  bankForm.bank_name = '';
  bankError.value = '';
  closeBankPicker();
  nextTick(() => bankOtherInputRef.value?.focus());
}

function focusFirstBankOption() {
  bankListRef.value?.querySelector('.fin-bank-option')?.focus();
}

function selectFirstBankOption() {
  const firstBank = filteredBanks.value[0];
  if (firstBank) selectBankOption(firstBank);
}

function handleBankPickerOutside(event) {
  if (!bankPickerOpen.value) return;
  if (bankPickerRef.value?.contains(event.target)) return;
  closeBankPicker();
}

function openBankForm() {
  bankError.value = '';
  prefillBank(base.value);
  showBankForm.value = true;
}

function cancelBankEdit() {
  bankError.value = '';
  bankMessage.value = '';
  bankForm.password = '';
  closeBankPicker();
  prefillBank(base.value);
  showBankForm.value = false;
}

function onBankAccountInput(event) {
  bankForm.bank_account_number = String(event.target.value || '')
    .replace(/\D/g, '')
    .slice(0, 34);
}

function prefillBank(source) {
  if (!source) return;
  const sourceBankName = source.bank_name || '';
  const knownBank = findBankBrand(sourceBankName);
  bankForm.bank_name = knownBank?.name || sourceBankName;
  bankForm.bank_account_name = source.bank_account_name || '';
  bankForm.bank_account_number = '';
  bankSelection.value = knownBank?.code || (sourceBankName ? 'other' : '');
  closeBankPicker();
}

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const params = props.baseHandle ? { base_handle: props.baseHandle } : undefined;
    workspace.value = await api.getBaseRevenue(params);
    prefillBank(workspace.value?.base);
    if (!didInitialLoad) {
      showBankForm.value = !workspace.value?.base?.bank_account_number_masked;
      didInitialLoad = true;
    } else if (!workspace.value?.base?.bank_account_number_masked) {
      showBankForm.value = true;
    }
  } catch (e) {
    error.value = e;
  } finally {
    loading.value = false;
  }
}

async function submitPayout() {
  payoutError.value = '';
  payoutMessage.value = '';
  const amount = payoutAmount.value;

  if (!canRequestPayout.value) {
    payoutError.value = requestBlockReason.value || 'Penarikan belum bisa diajukan.';
    return;
  }
  if (payoutAmountError.value) {
    payoutError.value = payoutAmountError.value;
    return;
  }
  if (!Number.isInteger(amount) || amount < minPayout.value) {
    payoutError.value = `Minimal penarikan ${formatIdr(minPayout.value)}.`;
    return;
  }
  if (amount > Number(wallet.value.available_idr)) {
    payoutError.value = 'Nominal melebihi saldo yang tersedia.';
    return;
  }

  const confirmed = await confirmDialog({
    title: 'Ajukan penarikan dana?',
    message: `${formatIdr(amount)} akan ditahan dari saldo available dan diajukan ke Super Admin.`,
    detail:
      `Biaya transfer default ${formatIdr(payoutFee.value)} dipotong saat approval. ` +
      'Payout diproses manual dan membutuhkan KYC yang sudah diverifikasi.',
    variant: 'info',
    confirmLabel: 'Ajukan payout',
  });
  if (!confirmed) return;

  if (!payoutRequestKey) payoutRequestKey = createIdempotencyKey('payout');
  submittingPayout.value = true;
  try {
    const res = await api.requestBasePayout(
      {
        amount_idr: amount,
        ...(base.value?.handle ? { base_handle: base.value.handle } : {}),
        notes: payoutForm.notes.trim() || null,
      },
      payoutRequestKey,
    );
    payoutRequestKey = null;
    payoutMessage.value = res?.idempotent
      ? 'Payout ini sudah pernah diajukan.'
      : 'Payout berhasil diajukan dan menunggu review Super Admin.';
    toast.success(payoutMessage.value);
    payoutForm.amount_idr = '';
    payoutForm.notes = '';
    await load();
  } catch (e) {
    payoutError.value = e?.message || 'Gagal mengajukan payout.';
    toast.error(payoutError.value);
  } finally {
    submittingPayout.value = false;
  }
}

async function saveBank() {
  bankError.value = '';
  bankMessage.value = '';
  bankPickerOpen.value = false;
  if (!bankSelection.value) {
    bankError.value = 'Pilih bank tujuan terlebih dahulu.';
    return;
  }
  if (!bankForm.bank_name.trim()) {
    bankError.value =
      bankSelection.value === 'other'
        ? 'Tulis nama bank terlebih dahulu.'
        : 'Pilih bank tujuan terlebih dahulu.';
    return;
  }
  if (!bankForm.bank_account_name.trim()) {
    bankError.value = 'Nama pemilik rekening wajib diisi.';
    return;
  }
  if (!bankForm.password) {
    bankError.value = 'Masukkan kata sandi untuk mengonfirmasi perubahan rekening.';
    return;
  }
  if (!/^\d{5,34}$/.test(String(bankForm.bank_account_number || '').replace(/\s+/g, ''))) {
    bankError.value = 'Nomor rekening hanya boleh berisi 5–34 angka.';
    return;
  }

  const changing = Boolean(base.value?.bank_account_number_masked);
  const confirmed = await confirmDialog({
    title: changing ? 'Ubah rekening payout?' : 'Simpan rekening payout?',
    message: changing
      ? 'Rekening baru akan aktif setelah masa tunggu 24 jam.'
      : 'Rekening pertama langsung aktif untuk payout.',
    detail:
      'Perubahan rekening membutuhkan konfirmasi kata sandi. Payout tidak bisa diajukan ' +
      'selama masa tunggu perubahan rekening.',
    variant: 'warning',
    confirmLabel: changing ? 'Ubah rekening' : 'Simpan rekening',
  });
  if (!confirmed) return;

  savingBank.value = true;
  try {
    const payload = {
      ...(base.value?.handle ? { base_handle: base.value.handle } : {}),
      bank_name: bankForm.bank_name.trim(),
      bank_account_name: bankForm.bank_account_name.trim(),
      bank_account_number: bankForm.bank_account_number.replace(/\s+/g, ''),
      password: bankForm.password,
    };
    const saved = await api.updateBaseBank(payload);
    bankForm.password = '';
    bankMessage.value = saved?.bank_change_pending
      ? `Rekening disimpan. Aktif ${formatDate(saved.bank_change_effective_at)}.`
      : 'Rekening payout berhasil disimpan.';
    toast.success(bankMessage.value);
    prefillBank(saved);
    showBankForm.value = false;
    await load();
  } catch (e) {
    bankError.value = e?.message || 'Gagal menyimpan rekening.';
    toast.error(bankError.value);
  } finally {
    savingBank.value = false;
  }
}

onMounted(() => {
  load();
  document.addEventListener('pointerdown', handleBankPickerOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleBankPickerOutside);
});
</script>

<style scoped>
.rev-panel {
  --fin-card: var(--shell-card);
  --fin-border: var(--shell-border);
  --fin-border-strong: var(--shell-border-strong);
  --fin-ink: var(--shell-text);
  --fin-muted: var(--shell-text-muted);
  --fin-inset: var(--shell-chip);
  --fin-radius: 20px;
  --fin-shadow: 0 18px 42px -36px rgba(2, 8, 30, 0.55);
  --fin-info: #1d4ed8;
  --fin-info-bg: rgba(37, 99, 235, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  color: var(--fin-ink);
  font-family: var(--font-sans);
}

:global([data-theme='dark']) .rev-panel {
  --fin-info: #60a5fa;
  --fin-info-bg: rgba(96, 165, 250, 0.13);
}

/* ============================== Locked banner ============================= */

.fin-locked {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border: 1px solid color-mix(in srgb, var(--warning-text) 38%, var(--fin-border));
  border-radius: 16px;
  background: color-mix(in srgb, var(--warning-text) 9%, var(--fin-card));
  padding: 14px 15px;
}

.fin-locked__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--warning-text) 13%, transparent);
  color: var(--warning-text);
  flex-shrink: 0;
}

.fin-locked strong {
  display: block;
  color: var(--fin-ink);
  font-size: 12.5px;
  font-weight: 800;
}

.fin-locked p {
  margin: 3px 0 0;
  color: var(--fin-muted);
  font-size: 11px;
  line-height: 1.55;
}

/* ================================ Tabs =================================== */

.fin-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
  border: 1px solid var(--fin-border);
  border-radius: 14px;
  background: var(--fin-card);
  padding: 4px;
  box-shadow: var(--fin-shadow);
}

.fin-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  min-height: 38px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--fin-muted);
  padding: 7px 8px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease;
}

.fin-tab:hover {
  background: var(--fin-inset);
  color: var(--fin-ink);
}

.fin-tab.active {
  border-color: color-mix(in srgb, var(--shell-accent) 55%, transparent);
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
}

/* ================================ Hero =================================== */

.fin-hero {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 22px;
  background:
    radial-gradient(circle at 94% 4%, rgba(205, 242, 43, 0.24), transparent 30%),
    radial-gradient(circle at 0% 100%, rgba(0, 69, 255, 0.58), transparent 48%),
    linear-gradient(134deg, #06142d 0%, #091d52 52%, #0c2c8f 100%);
  color: #fff;
  padding: 24px;
  box-shadow: 0 24px 48px -32px rgba(2, 8, 30, 0.7);
}

.fin-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
  background-size: 30px 30px;
  -webkit-mask-image: linear-gradient(102deg, #000 0%, transparent 68%);
  mask-image: linear-gradient(102deg, #000 0%, transparent 68%);
}

.fin-hero::after {
  content: '';
  position: absolute;
  top: -132px;
  right: -96px;
  width: 282px;
  height: 282px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  box-shadow:
    0 0 0 34px rgba(255, 255, 255, 0.035),
    0 0 0 70px rgba(255, 255, 255, 0.02);
  pointer-events: none;
}

.fin-hero > * {
  position: relative;
  z-index: 1;
}

.fin-hero__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.fin-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.05px;
  text-transform: uppercase;
}

.fin-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--shell-accent);
  box-shadow: 0 0 0 4px rgba(205, 242, 43, 0.14);
  flex-shrink: 0;
}

.fin-hero-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.09);
  padding: 5px 9px;
  font-size: 9.5px;
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
}

.fin-hero-pill.is-active {
  border-color: rgba(205, 242, 43, 0.36);
  background: rgba(205, 242, 43, 0.13);
  color: #dcff88;
}

.fin-hero-pill.is-off {
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.14);
  color: #fcd34d;
}

.fin-balance {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-top: 11px;
  font-variant-numeric: tabular-nums;
}

.fin-balance__currency {
  color: rgba(255, 255, 255, 0.62);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.fin-balance strong {
  color: #fff;
  font-size: clamp(36px, 7vw, 46px);
  font-weight: 800;
  letter-spacing: -1.7px;
  line-height: 1.02;
}

.fin-balance--compact strong {
  font-size: clamp(30px, 6vw, 38px);
}

.fin-hero__note {
  max-width: 520px;
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 11.5px;
  line-height: 1.6;
}

.fin-hero__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.fin-hero__trust {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.13);
  padding-top: 13px;
  color: rgba(255, 255, 255, 0.64);
  font-size: 10px;
  font-weight: 600;
}

.fin-hero__trust span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.fin-hero__trust span + span::before {
  content: '';
  width: 3px;
  height: 3px;
  margin-right: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.32);
}

.fin-hero--compact .fin-hero__note {
  max-width: 460px;
}

.fin-hero__compact-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 208px;
  align-items: center;
  gap: 24px;
}

.fin-hero__mini-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.14);
  padding-left: 20px;
}

.fin-hero__mini-list div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.fin-hero__mini-list span {
  color: rgba(255, 255, 255, 0.58);
  font-size: 9.5px;
  font-weight: 600;
}

.fin-hero__mini-list strong {
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.fin-hero__mini-list strong.is-warning {
  color: #fcd34d;
}

/* ================================ Buttons ================================ */

.fin-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 42px;
  border: 1px solid var(--fin-border-strong);
  border-radius: 11px;
  background: var(--fin-card);
  color: var(--fin-ink);
  padding: 9px 15px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 800;
  line-height: 1.3;
  cursor: pointer;
  text-decoration: none;
  transition:
    transform 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease,
    opacity 0.15s ease;
}

.fin-btn:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--shell-accent) 52%, var(--fin-border-strong));
  transform: translateY(-1px);
}

.fin-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.fin-btn--accent {
  border-color: var(--shell-accent);
  background: var(--shell-accent);
  color: var(--shell-accent-ink);
}

.fin-btn--accent:hover:not(:disabled) {
  border-color: var(--shell-accent);
  background: color-mix(in srgb, var(--shell-accent) 90%, #fff);
}

.fin-btn--ghost {
  border-color: rgba(255, 255, 255, 0.23);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.fin-btn--ghost:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.42);
  background: rgba(255, 255, 255, 0.14);
}

.fin-btn--secondary {
  border-color: var(--fin-border-strong);
  background: var(--fin-inset);
  color: var(--fin-ink);
}

.fin-btn--small {
  min-height: 34px;
  border-radius: 9px;
  padding: 6px 10px;
  font-size: 10.5px;
}

.fin-btn--block {
  width: 100%;
}

/* ============================== Stat cards =============================== */

.fin-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.fin-stat {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  border: 1px solid var(--fin-border);
  border-radius: 16px;
  background: var(--fin-card);
  padding: 16px;
  box-shadow: var(--fin-shadow);
}

.fin-stat__icon {
  position: absolute;
  top: 14px;
  right: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 31px;
  height: 31px;
  border-radius: 9px;
  background: var(--fin-inset);
  color: var(--fin-muted);
}

.fin-stat__label {
  padding-right: 38px;
  color: var(--fin-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.fin-stat__value {
  color: var(--fin-ink);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.25;
  font-variant-numeric: tabular-nums;
}

.fin-stat small {
  color: var(--fin-muted);
  font-size: 10px;
  line-height: 1.5;
}

.fin-stat--warning .fin-stat__icon {
  background: rgba(245, 158, 11, 0.11);
  color: var(--warning-text);
}

.fin-stat--warning .fin-stat__value {
  color: var(--warning-text);
}

.fin-stat--info .fin-stat__icon {
  background: var(--fin-info-bg);
  color: var(--fin-info);
}

.fin-stat--success .fin-stat__icon {
  background: rgba(34, 197, 94, 0.11);
  color: var(--success-text);
}

.fin-stat--success .fin-stat__value {
  color: var(--success-text);
}

/* ================================= Card ================================== */

.fin-card {
  border: 1px solid var(--fin-border);
  border-radius: var(--fin-radius);
  background: var(--fin-card);
  padding: 20px;
  box-shadow: var(--fin-shadow);
}

.fin-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.fin-card__eyebrow {
  margin: 0 0 4px;
  color: var(--lime-text);
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1.05px;
  text-transform: uppercase;
}

.fin-card__title {
  margin: 0;
  color: var(--fin-ink);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.25px;
  line-height: 1.3;
}

.fin-card__desc {
  max-width: 520px;
  margin: 4px 0 0;
  color: var(--fin-muted);
  font-size: 11px;
  line-height: 1.55;
}

.fin-card__subhead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  border-top: 1px solid var(--fin-border);
  padding-top: 16px;
}

.fin-card__subhead h3 {
  margin: 0;
  color: var(--fin-ink);
  font-size: 13px;
  font-weight: 800;
}

.fin-card__subhead p {
  max-width: 440px;
  margin: 3px 0 0;
  color: var(--fin-muted);
  font-size: 10.5px;
  line-height: 1.55;
}

.fin-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  border: 1px solid transparent;
  border-radius: 999px;
  background: var(--fin-inset);
  color: var(--fin-muted);
  padding: 4px 8px;
  font-size: 9.5px;
  font-weight: 800;
  line-height: 1.25;
  white-space: nowrap;
}

.fin-chip--success {
  border-color: rgba(34, 197, 94, 0.24);
  background: rgba(34, 197, 94, 0.11);
  color: var(--success-text);
}

.fin-chip--warning {
  border-color: rgba(245, 158, 11, 0.25);
  background: rgba(245, 158, 11, 0.11);
  color: var(--warning-text);
}

.fin-chip--danger {
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-text);
}

.fin-chip--info {
  border-color: color-mix(in srgb, var(--fin-info) 24%, transparent);
  background: var(--fin-info-bg);
  color: var(--fin-info);
}

.fin-chip--muted {
  border-color: var(--fin-border);
  background: var(--fin-inset);
  color: var(--fin-muted);
}

/* ============================== Allocation =============================== */

.fin-allocation__bar {
  display: flex;
  overflow: hidden;
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: var(--fin-inset);
}

.fin-allocation__segment {
  height: 100%;
  min-width: 0;
}

.fin-allocation__segment + .fin-allocation__segment {
  border-left: 2px solid var(--fin-card);
}

.fin-allocation__segment.is-success {
  background: var(--success-text);
}

.fin-allocation__segment.is-warning {
  background: var(--warning-text);
}

.fin-allocation__segment.is-info {
  background: var(--fin-info);
}

.fin-allocation__legend {
  display: grid;
  gap: 8px;
  margin-top: 15px;
}

.fin-allocation__item {
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr) auto 42px;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.fin-allocation__name {
  color: var(--fin-muted);
}

.fin-allocation__item strong {
  color: var(--fin-ink);
  font-size: 11.5px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.fin-allocation__item small {
  color: var(--fin-muted);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.fin-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--fin-muted);
}

.fin-dot.is-success {
  background: var(--success-text);
}

.fin-dot.is-warning {
  background: var(--warning-text);
}

.fin-dot.is-info {
  background: var(--fin-info);
}

/* ============================== Rule / info ============================== */

.fin-split {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  align-items: stretch;
}

.fin-split > .fin-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.fin-split > .fin-card .fin-note {
  margin-top: auto;
  padding-top: 10px;
}

.fin-rule-list,
.fin-info-list {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.fin-rule-list li {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 11px 0;
  border-bottom: 1px solid var(--fin-border);
}

.fin-rule-list li:first-child {
  padding-top: 0;
}

.fin-rule-list li:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.fin-rule__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 33px;
  height: 33px;
  border-radius: 10px;
  background: var(--fin-inset);
  color: var(--fin-muted);
  flex-shrink: 0;
}

.fin-rule-list strong {
  display: block;
  color: var(--fin-ink);
  font-size: 12px;
  font-weight: 800;
}

.fin-rule-list small {
  display: block;
  margin-top: 2px;
  color: var(--fin-muted);
  font-size: 10px;
  line-height: 1.5;
}

.fin-account {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--fin-border);
  border-radius: 14px;
  background: var(--fin-inset);
  padding: 12px;
}

.fin-bank-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 13px;
  background: linear-gradient(135deg, #1231a7 0%, #0038ff 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.4px;
  flex-shrink: 0;
}

.fin-bank-mark.has-logo {
  border: 1px solid var(--fin-border);
  background: #ffffff;
}

.fin-bank-mark img {
  display: block;
  width: 30px;
  height: 21px;
  object-fit: contain;
}

.fin-account__copy {
  min-width: 0;
}

.fin-account__label {
  display: block;
  color: var(--fin-muted);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.fin-account__copy strong,
.fin-bank-card__copy strong {
  display: block;
  margin-top: 2px;
  color: var(--fin-ink);
  font-size: 13px;
  font-weight: 800;
}

.fin-account__copy small,
.fin-bank-card__copy small {
  display: block;
  margin-top: 2px;
  color: var(--fin-muted);
  font-size: 10.5px;
  line-height: 1.45;
}

.fin-info-list {
  margin-top: 12px;
}

.fin-info-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--fin-border);
  padding: 10px 0;
  font-size: 11px;
}

.fin-info-list li:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.fin-info-list li > span:first-child {
  color: var(--fin-muted);
}

.fin-info-list li > strong {
  color: var(--fin-ink);
  font-weight: 800;
  text-align: right;
}

.fin-note {
  margin: 10px 0 0;
  color: var(--fin-muted);
  font-size: 10px;
  line-height: 1.55;
}

.fin-footnote {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin: 0;
  color: var(--fin-muted);
  font-size: 10px;
  line-height: 1.55;
}

.fin-footnote svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.fin-note--kyc {
  border: 1px solid color-mix(in srgb, var(--warning-text) 28%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--warning-text) 8%, transparent);
  color: var(--warning-text);
  padding: 9px 10px;
}

/* ============================== Empty state ============================== */

.fin-empty {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border: 1px dashed var(--fin-border-strong);
  border-radius: 14px;
  background: var(--fin-inset);
  padding: 17px;
  color: var(--fin-muted);
  font-size: 11px;
  line-height: 1.55;
}

.fin-empty__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: var(--fin-card);
  color: var(--fin-muted);
  flex-shrink: 0;
}

.fin-empty strong {
  display: block;
  color: var(--fin-ink);
  font-size: 12px;
  font-weight: 800;
}

.fin-empty p {
  margin: 2px 0 0;
  color: var(--fin-muted);
  font-size: 10.5px;
}

.fin-empty--compact {
  padding: 14px;
}

/* ============================== Readiness ================================ */

.fin-progress {
  overflow: hidden;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: var(--fin-inset);
}

.fin-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--warning-text);
  transition: width 0.25s ease;
}

.fin-progress.is-complete span {
  background: var(--success-text);
}

.fin-check-list {
  display: flex;
  flex-direction: column;
  margin: 15px 0 0;
  padding: 0;
  list-style: none;
}

.fin-check-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border-bottom: 1px solid var(--fin-border);
  padding: 10px 0;
}

.fin-check-list li:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.fin-check-list__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-text);
  flex-shrink: 0;
}

.fin-check-list li.is-ok .fin-check-list__icon {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success-text);
}

.fin-check-list__copy {
  flex: 1;
  min-width: 0;
}

.fin-check-list__copy strong {
  display: block;
  color: var(--fin-ink);
  font-size: 11.5px;
  font-weight: 800;
  line-height: 1.4;
}

.fin-check-list__copy small {
  display: block;
  margin-top: 1px;
  color: var(--fin-muted);
  font-size: 10px;
  line-height: 1.5;
}

.fin-check-list__state {
  flex-shrink: 0;
  margin-top: 6px;
  color: var(--warning-text);
}

.fin-check-list li.is-ok .fin-check-list__state {
  color: var(--success-text);
}

.fin-step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid color-mix(in srgb, var(--shell-accent) 25%, transparent);
  border-radius: 11px;
  background: color-mix(in srgb, var(--shell-accent) 10%, transparent);
  color: var(--lime-text);
  font-size: 12px;
  font-weight: 900;
  flex-shrink: 0;
}

/* ================================ Forms ================================== */

.fin-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.fin-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.fin-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  color: var(--fin-ink);
  font-size: 10.5px;
  font-weight: 800;
}

.fin-field > span:first-child,
.fin-field > label:first-child,
.fin-field__row > span:first-child {
  color: var(--fin-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.fin-field__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.fin-field__row small {
  color: var(--fin-muted);
  font-size: 9.5px;
  font-weight: 600;
}

.fin-field em {
  font-style: normal;
  font-weight: 600;
  text-transform: none;
}

.fin-input {
  width: 100%;
  min-height: 43px;
  border: 1px solid var(--fin-border-strong);
  border-radius: 11px;
  background: var(--fin-inset);
  color: var(--fin-ink);
  padding: 10px 12px;
  font-family: inherit;
  font-size: 13px;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.fin-input::placeholder {
  color: color-mix(in srgb, var(--fin-muted) 72%, transparent);
}

.fin-input:focus {
  border-color: var(--shell-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--shell-accent) 17%, transparent);
}

.fin-input:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.fin-textarea {
  min-height: 88px;
  resize: vertical;
  line-height: 1.55;
}

.fin-input-affix {
  display: flex;
  align-items: center;
  min-height: 46px;
  border: 1px solid var(--fin-border-strong);
  border-radius: 11px;
  background: var(--fin-inset);
  padding-left: 12px;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.fin-input-affix:focus-within {
  border-color: var(--shell-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--shell-accent) 17%, transparent);
}

.fin-input-affix.has-error {
  border-color: color-mix(in srgb, var(--danger-text) 55%, var(--fin-border-strong));
}

.fin-input-affix__prefix {
  color: var(--fin-muted);
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
}

.fin-input-affix .fin-input {
  min-height: 44px;
  border: 0;
  background: transparent;
  box-shadow: none;
  padding-left: 7px;
  font-size: 17px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.fin-input-affix .fin-input:focus {
  box-shadow: none;
}

.fin-input--password {
  font-size: 13px !important;
  font-weight: 500 !important;
}

.fin-eye-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  border: 0;
  border-left: 1px solid var(--fin-border);
  background: transparent;
  color: var(--fin-muted);
  padding: 0 12px;
  cursor: pointer;
}

.fin-input[type='number']::-webkit-outer-spin-button,
.fin-input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.fin-input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.fin-help {
  color: var(--fin-muted);
  font-size: 9.5px;
  font-weight: 500;
  line-height: 1.45;
}

.fin-field-error {
  color: var(--danger-text);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.45;
}

.fin-quick {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: -4px;
}

.fin-quick__btn {
  border: 1px solid var(--fin-border-strong);
  border-radius: 999px;
  background: var(--fin-inset);
  color: var(--fin-muted);
  padding: 6px 10px;
  font-family: inherit;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    color 0.15s ease,
    background 0.15s ease;
}

.fin-quick__btn:hover:not(:disabled),
.fin-quick__btn.active {
  border-color: color-mix(in srgb, var(--shell-accent) 55%, var(--fin-border-strong));
  background: color-mix(in srgb, var(--shell-accent) 10%, var(--fin-inset));
  color: var(--fin-ink);
}

.fin-quick__btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.fin-receipt {
  border: 1px solid var(--fin-border);
  border-radius: 14px;
  background: var(--fin-inset);
  padding: 13px 14px;
}

.fin-receipt__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 4px 0;
  color: var(--fin-muted);
  font-size: 11px;
}

.fin-receipt__row strong {
  color: var(--fin-ink);
  font-size: 11.5px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.fin-receipt__row strong.is-negative {
  color: var(--warning-text);
}

.fin-receipt__divider {
  height: 1px;
  margin: 8px 0;
  background: var(--fin-border);
}

.fin-receipt__row--total {
  padding-top: 0;
  color: var(--fin-ink);
  font-weight: 800;
}

.fin-receipt__row--total strong {
  color: var(--success-text);
  font-size: 16px;
}

.fin-receipt__note {
  margin: 8px 0 0;
  border-top: 1px dashed var(--fin-border);
  padding-top: 8px;
  color: var(--fin-muted);
  font-size: 9.5px;
  line-height: 1.5;
}

.fin-alert {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  border: 1px solid var(--fin-border);
  border-radius: 11px;
  background: var(--fin-inset);
  color: var(--fin-muted);
  padding: 10px 12px;
  font-size: 11px;
  line-height: 1.55;
}

.fin-alert svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.fin-alert strong {
  display: block;
  color: var(--fin-ink);
  font-size: 11.5px;
  font-weight: 800;
}

.fin-alert p {
  margin: 2px 0 0;
  color: inherit;
  font-size: 10.5px;
}

.fin-alert--warning {
  border-color: color-mix(in srgb, var(--warning-text) 33%, transparent);
  background: color-mix(in srgb, var(--warning-text) 8%, var(--fin-card));
  color: var(--warning-text);
}

.fin-alert--warning strong {
  color: var(--warning-text);
}

.fin-alert--error,
.fin-alert--danger {
  border-color: color-mix(in srgb, var(--danger-text) 33%, transparent);
  background: color-mix(in srgb, var(--danger-text) 8%, var(--fin-card));
  color: var(--danger-text);
}

.fin-alert--error strong,
.fin-alert--danger strong {
  color: var(--danger-text);
}

.fin-alert--success {
  border-color: color-mix(in srgb, var(--success-text) 33%, transparent);
  background: color-mix(in srgb, var(--success-text) 8%, var(--fin-card));
  color: var(--success-text);
}

.fin-alert--success strong {
  color: var(--success-text);
}

.fin-alert--info {
  border-color: color-mix(in srgb, var(--fin-info) 28%, transparent);
  background: var(--fin-info-bg);
  color: var(--fin-info);
}

.fin-inline-link {
  margin-top: 5px;
  border: 0;
  background: transparent;
  color: inherit;
  padding: 0;
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.fin-form-note {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 0;
  color: var(--fin-muted);
  font-size: 9.5px;
  line-height: 1.5;
}

.fin-form-note svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.fin-text-btn {
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: var(--fin-muted);
  padding: 2px 0;
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.fin-text-btn:hover:not(:disabled) {
  color: var(--fin-ink);
}

.fin-text-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* =============================== Bank card =============================== */

.fin-bank-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--fin-border);
  border-radius: 14px;
  background: var(--fin-inset);
  padding: 13px;
}

.fin-bank-card.is-empty {
  border-style: dashed;
}

.fin-bank-card__copy {
  flex: 1;
  min-width: 0;
}

.fin-bank-form {
  margin-top: 14px;
}

/* ============================== Bank picker ============================== */

.fin-bank-picker {
  position: relative;
  min-width: 0;
}

.fin-bank-trigger {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--fin-border-strong);
  border-radius: 11px;
  background: var(--fin-inset);
  color: var(--fin-ink);
  padding: 5px 10px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.fin-bank-trigger:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--shell-accent) 45%, var(--fin-border-strong));
  background: color-mix(in srgb, var(--fin-inset) 78%, var(--fin-card));
}

.fin-bank-trigger:focus-visible,
.fin-bank-trigger.is-open {
  outline: none;
  border-color: var(--shell-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--shell-accent) 17%, transparent);
}

.fin-bank-trigger:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.fin-bank-trigger__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: linear-gradient(135deg, #1231a7 0%, #0038ff 100%);
  color: #ffffff;
  font-size: 8.5px;
  font-weight: 900;
  letter-spacing: 0.2px;
  flex-shrink: 0;
  overflow: hidden;
}

.fin-bank-trigger__mark.has-logo {
  border: 1px solid var(--fin-border);
  background: #ffffff;
}

.fin-bank-trigger__mark.is-placeholder {
  border: 1px dashed var(--fin-border-strong);
  background: var(--fin-card);
  color: var(--fin-muted);
}

.fin-bank-trigger__mark img {
  display: block;
  width: 24px;
  height: 17px;
  object-fit: contain;
}

.fin-bank-trigger__copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.fin-bank-trigger__copy strong {
  overflow: hidden;
  color: var(--fin-ink);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fin-bank-trigger__copy small {
  overflow: hidden;
  margin-top: 1px;
  color: var(--fin-muted);
  font-size: 9px;
  font-weight: 600;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fin-bank-trigger.is-placeholder .fin-bank-trigger__copy strong {
  color: var(--fin-muted);
  font-weight: 700;
}

.fin-bank-trigger__chevron {
  flex-shrink: 0;
  color: var(--fin-muted);
  transition: transform 0.18s ease;
}

.fin-bank-trigger.is-open .fin-bank-trigger__chevron {
  transform: rotate(180deg);
}

.fin-bank-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 50;
  overflow: hidden;
  width: 100%;
  border: 1px solid var(--fin-border-strong);
  border-radius: 14px;
  background: var(--fin-card);
  box-shadow:
    0 22px 50px -20px rgba(2, 8, 27, 0.62),
    0 3px 12px rgba(2, 8, 27, 0.12);
}

.fin-bank-menu__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px 8px;
}

.fin-bank-menu__head strong {
  color: var(--fin-ink);
  font-size: 9.5px;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.fin-bank-menu__head span {
  color: var(--fin-muted);
  font-size: 9px;
  font-weight: 700;
}

.fin-bank-search {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  margin: 0 6px 5px;
  border: 1px solid var(--fin-border);
  border-radius: 9px;
  background: var(--fin-inset);
  padding: 0 8px;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.fin-bank-search:focus-within {
  border-color: var(--shell-accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--shell-accent) 13%, transparent);
}

.fin-bank-search svg {
  flex-shrink: 0;
  color: var(--fin-muted);
}

.fin-bank-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--fin-ink);
  padding: 8px 0;
  font-family: inherit;
  font-size: 11px;
  outline: none;
}

.fin-bank-search input::placeholder {
  color: color-mix(in srgb, var(--fin-muted) 72%, transparent);
}

.fin-bank-options {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  max-height: 278px;
  padding: 0 6px 6px;
  overscroll-behavior: contain;
  scrollbar-color: color-mix(in srgb, var(--fin-muted) 52%, transparent) transparent;
  scrollbar-width: thin;
}

.fin-bank-options::-webkit-scrollbar {
  width: 7px;
}

.fin-bank-options::-webkit-scrollbar-track {
  background: transparent;
}

.fin-bank-options::-webkit-scrollbar-thumb {
  border: 2px solid var(--fin-card);
  border-radius: 999px;
  background: color-mix(in srgb, var(--fin-muted) 52%, transparent);
}

.fin-bank-option {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--fin-ink);
  padding: 6px 7px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.fin-bank-option:hover {
  background: var(--fin-inset);
}

.fin-bank-option:focus-visible {
  outline: 2px solid var(--shell-accent);
  outline-offset: -2px;
  background: var(--fin-inset);
}

.fin-bank-option[aria-selected='true'] {
  background: color-mix(in srgb, var(--shell-accent) 11%, transparent);
}

.fin-bank-option__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--fin-inset);
  color: #ffffff;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.2px;
  flex-shrink: 0;
  overflow: hidden;
}

.fin-bank-option__mark.has-logo {
  border: 1px solid var(--fin-border);
  background: #ffffff;
}

.fin-bank-option__mark img {
  display: block;
  width: 23px;
  height: 16px;
  object-fit: contain;
}

.fin-bank-option__copy {
  flex: 1;
  min-width: 0;
}

.fin-bank-option__copy strong {
  display: block;
  color: var(--fin-ink);
  font-size: 11px;
  font-weight: 800;
  line-height: 1.35;
}

.fin-bank-option__copy small {
  display: block;
  overflow: hidden;
  color: var(--fin-muted);
  font-size: 9px;
  font-weight: 600;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fin-bank-option__state {
  flex-shrink: 0;
  color: var(--success-text);
}

.fin-bank-empty {
  margin: 0;
  padding: 16px 10px;
  color: var(--fin-muted);
  font-size: 10px;
  line-height: 1.55;
  text-align: center;
}

.fin-bank-empty strong {
  color: var(--fin-ink);
}

.fin-bank-other {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  border: 0;
  border-top: 1px solid var(--fin-border);
  background: transparent;
  color: var(--fin-ink);
  padding: 9px 12px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.fin-bank-other:hover {
  background: var(--fin-inset);
}

.fin-bank-other:focus-visible {
  outline: 2px solid var(--shell-accent);
  outline-offset: -2px;
}

.fin-bank-other__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px dashed var(--fin-border-strong);
  border-radius: 8px;
  background: var(--fin-inset);
  color: var(--fin-muted);
  flex-shrink: 0;
}

.fin-bank-other__copy {
  flex: 1;
  min-width: 0;
}

.fin-bank-other__copy strong {
  display: block;
  color: var(--fin-ink);
  font-size: 10.5px;
  font-weight: 800;
  line-height: 1.35;
}

.fin-bank-other__copy small {
  display: block;
  color: var(--fin-muted);
  font-size: 9px;
  font-weight: 600;
  line-height: 1.35;
}

.fin-bank-other__chevron {
  flex-shrink: 0;
  color: var(--fin-muted);
}

.fin-bank-custom {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 2px;
}

.fin-bank-custom > label {
  color: var(--fin-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* ================================ History ================================ */

.fin-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.fin-filter {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--fin-border);
  border-radius: 999px;
  background: transparent;
  color: var(--fin-muted);
  padding: 5px 9px;
  font-family: inherit;
  font-size: 9.5px;
  font-weight: 800;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease,
    color 0.15s ease;
}

.fin-filter span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--fin-inset);
  padding: 0 4px;
  color: var(--fin-muted);
  font-size: 8.5px;
  font-variant-numeric: tabular-nums;
}

.fin-filter:hover {
  border-color: var(--fin-border-strong);
  color: var(--fin-ink);
}

.fin-filter.active {
  border-color: color-mix(in srgb, var(--shell-accent) 50%, transparent);
  background: color-mix(in srgb, var(--shell-accent) 12%, transparent);
  color: var(--fin-ink);
}

.fin-filter.active span {
  background: color-mix(in srgb, var(--shell-accent) 20%, transparent);
  color: var(--fin-ink);
}

.fin-month-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.fin-month__label {
  margin: 0 0 2px;
  color: var(--fin-muted);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.fin-entry-list,
.fin-payout-list {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.fin-entry {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  border-bottom: 1px solid var(--fin-border);
  padding: 12px 0;
}

.fin-entry:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.fin-entry__icon,
.fin-payout__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--fin-inset);
  color: var(--fin-muted);
  flex-shrink: 0;
}

.fin-entry__icon.is-success,
.fin-payout__icon.is-success {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success-text);
}

.fin-entry__icon.is-warning,
.fin-payout__icon.is-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-text);
}

.fin-entry__icon.is-danger,
.fin-payout__icon.is-danger {
  background: rgba(239, 68, 68, 0.09);
  color: var(--danger-text);
}

.fin-entry__icon.is-info,
.fin-payout__icon.is-info {
  background: var(--fin-info-bg);
  color: var(--fin-info);
}

.fin-entry__main,
.fin-payout__main {
  flex: 1;
  min-width: 0;
}

.fin-entry__title,
.fin-payout__title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}

.fin-entry__title strong,
.fin-payout__title strong {
  color: var(--fin-ink);
  font-size: 13px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.fin-entry.is-reversed .fin-entry__title strong {
  color: var(--fin-muted);
}

.fin-entry__line,
.fin-payout__line {
  display: block;
  margin-top: 2px;
  color: var(--fin-muted);
  font-size: 10px;
  line-height: 1.5;
}

.fin-entry__reason {
  display: block;
  margin-top: 4px;
  color: var(--danger-text);
  font-size: 9.5px;
  line-height: 1.45;
}

.fin-entry__side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
  min-width: 120px;
  color: var(--fin-muted);
  font-size: 9.5px;
  text-align: right;
}

.fin-entry__side span {
  color: var(--fin-ink);
  font-size: 10px;
  font-weight: 700;
}

.fin-entry__side small {
  color: var(--fin-muted);
  font-size: 9px;
}

.fin-payout {
  border-bottom: 1px solid var(--fin-border);
  padding: 13px 0;
}

.fin-payout:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.fin-payout__top {
  display: flex;
  align-items: flex-start;
  gap: 11px;
}

.fin-payout__icon {
  width: 36px;
  height: 36px;
}

.fin-payout__title strong {
  font-size: 14.5px;
}

.fin-payout__hint {
  display: block;
  margin-top: 3px;
  color: var(--fin-muted);
  font-size: 9.5px;
  line-height: 1.45;
}

.fin-ref {
  display: inline-block;
  margin-top: 3px;
  color: var(--fin-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 9px;
  letter-spacing: 0.2px;
}

.fin-payout__reason {
  margin: 6px 0 0;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.08);
  color: var(--danger-text);
  padding: 6px 8px;
  font-size: 9.5px;
  line-height: 1.45;
}

.fin-payout__bank {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  width: fit-content;
  max-width: 100%;
  margin: 8px 0 0 47px;
  border-radius: 7px;
  background: var(--fin-inset);
  color: var(--fin-muted);
  padding: 4px 7px;
  font-size: 9px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.fin-payout__bank svg {
  flex-shrink: 0;
}

/* =============================== Utilities =============================== */

.fin-spin {
  animation: fin-spin 0.9s linear infinite;
}

@keyframes fin-spin {
  to {
    transform: rotate(360deg);
  }
}

.fin-tab:focus-visible,
.fin-btn:focus-visible,
.fin-filter:focus-visible,
.fin-quick__btn:focus-visible,
.fin-text-btn:focus-visible,
.fin-eye-btn:focus-visible,
.fin-inline-link:focus-visible {
  outline: 2px solid var(--shell-accent);
  outline-offset: 2px;
}

/* =============================== Responsive ============================== */

@media (max-width: 640px) {
  .rev-panel {
    gap: 14px;
  }

  .fin-hero {
    border-radius: 18px;
    padding: 20px;
  }

  .fin-hero__compact-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }

  .fin-hero__mini-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.14);
    border-left: 0;
    padding-top: 12px;
    padding-left: 0;
  }

  .fin-hero__mini-list div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .fin-hero__mini-list strong {
    text-align: left;
  }

  .fin-split {
    grid-template-columns: minmax(0, 1fr);
  }

  .fin-card {
    border-radius: 18px;
    padding: 17px;
  }

  .fin-form-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 520px) {
  .fin-card__head {
    flex-wrap: wrap;
    gap: 10px;
  }

  .fin-step-badge {
    display: none;
  }

  .fin-hero__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .fin-hero__actions .fin-btn {
    width: 100%;
  }

  .fin-hero__trust {
    gap: 7px;
    font-size: 9.5px;
  }

  .fin-hero__trust span + span::before {
    display: none;
  }

  .fin-entry {
    flex-wrap: wrap;
  }

  .fin-entry__side {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: calc(100% - 45px);
    min-width: 0;
    margin-left: 45px;
    text-align: left;
  }

  .fin-payout__bank {
    margin-left: 47px;
  }

  .fin-allocation__item {
    grid-template-columns: 8px minmax(0, 1fr) auto;
  }

  .fin-allocation__item small {
    display: none;
  }

  .fin-stat {
    padding: 14px;
  }

  .fin-stat__value {
    font-size: 18px;
  }

  .fin-card__subhead {
    flex-wrap: nowrap;
  }

  .fin-card__subhead > div {
    min-width: 0;
  }

  .fin-card__subhead .fin-text-btn {
    flex-shrink: 0;
  }
}

@media (max-width: 380px) {
  .fin-tab {
    gap: 4px;
    padding-right: 5px;
    padding-left: 5px;
    font-size: 10.5px;
  }

  .fin-hero {
    padding: 17px;
  }

  .fin-balance strong {
    font-size: 32px;
  }

  .fin-stat-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .fin-tab,
  .fin-btn,
  .fin-filter,
  .fin-quick__btn,
  .fin-input,
  .fin-input-affix,
  .fin-progress span {
    transition: none;
  }

  .fin-spin {
    animation-duration: 1.8s;
  }
}
</style>
