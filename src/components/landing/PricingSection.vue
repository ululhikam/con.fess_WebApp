<template>
  <section id="harga" class="lp-pricing" aria-labelledby="harga-title">
    <LandingSectionHead
      class="pricing-head"
      badge="HARGA &amp; PAKET TOP UP"
      title="Harga Transparan, Tanpa Biaya Tersembunyi"
      subtitle="Semua paket di bawah bisa dibeli langsung dari dalam aplikasi. Harga sudah termasuk pajak dan tidak ada biaya tambahan di akhir."
      title-id="harga-title"
    />

    <!-- Paket: data asli dari GET /payments/packages, fallback statis bila API gagal -->
    <div v-if="packages.length" class="pricing-grid">
      <article
        v-for="pkg in packages"
        :key="pkg.code"
        class="price-card"
        :class="{ 'price-card--featured': pkg.code === bestValueCode }"
      >
        <span v-if="pkg.code === bestValueCode" class="price-badge">Paling hemat</span>

        <h3 class="price-name">{{ pkg.name }}</h3>

        <p class="price-amount">
          <span class="price-currency">Rp</span>{{ formatNumber(pkg.amountIdr) }}
        </p>

        <p class="price-ctf">
          <Coins :size="15" aria-hidden="true" />
          <strong>{{ formatNumber(pkg.ctfAmount) }} CTF</strong>
        </p>

        <p class="price-desc">{{ pkg.description }}</p>

        <p class="price-rate">≈ Rp{{ formatNumber(ratePerCtf(pkg)) }} / CTF</p>

        <router-link to="/login?redirect=/wallet" class="price-cta"> Pilih paket </router-link>
      </article>
    </div>

    <p v-if="usingFallback" class="pricing-note pricing-note--warn">
      Daftar paket sedang ditampilkan dari katalog bawaan. Harga final tetap sama dengan yang muncul
      di halaman Dompet setelah kamu masuk.
    </p>

    <p v-else-if="!packages.length" class="pricing-note pricing-note--warn">
      Paket top up sedang tidak tersedia. Silakan cek kembali nanti atau
      <router-link to="/contact">hubungi kami</router-link>.
    </p>

    <!-- Penjelasan CTF -->
    <div class="pricing-facts">
      <h3 class="pricing-facts-title">Cara kerja CTF</h3>
      <ul class="pricing-facts-list">
        <li>
          <strong>1 CTF = 1 fess terbit</strong> di base berbayar. Saldo dipotong hanya saat fess
          benar-benar diterbitkan.
        </li>
        <li>
          <strong>Base baru dapat trial 7 hari gratis</strong> (satu kali per kreator). Selama
          trial, tidak ada potongan CTF.
        </li>
        <li><strong>Base dengan status gratis permanen</strong> tidak memotong CTF sama sekali.</li>
        <li>
          <strong>CTF tidak dapat dicairkan</strong> menjadi uang tunai dan hanya berlaku di dalam
          ekosistem Fess n Curious.
        </li>
      </ul>
    </div>

    <!-- Metode pembayaran -->
    <div class="pricing-methods">
      <h3 class="pricing-methods-title">Metode pembayaran</h3>
      <p class="pricing-methods-sub">
        Transaksi diproses oleh Midtrans. Kami tidak menyimpan data kartu atau kredensial pembayaran
        kamu.
      </p>

      <div class="method-groups">
        <div v-for="group in methodGroups" :key="group.label" class="method-group">
          <span class="method-group-label">{{ group.label }}</span>
          <div class="method-chips">
            <span v-for="method in group.methods" :key="method.code" class="method-chip">
              {{ method.label }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="pricing-foot">
      <router-link to="/login?redirect=/wallet" class="pricing-cta">
        Top Up CTF Sekarang
        <ArrowRight :size="16" />
      </router-link>
      <p class="pricing-foot-note">
        Butuh bantuan sebelum membeli?
        <router-link to="/contact">Hubungi kami</router-link>.
      </p>
    </div>
  </section>
</template>

<script setup>
/**
 * PricingSection — `#harga` di landing page publik.
 *
 * Ini bagian yang dibutuhkan verifikasi payment gateway: harga harus terbaca
 * TANPA login. Datanya diambil dari `GET /payments/packages` yang memang
 * endpoint publik (lihat backend/src/routes/payment.routes.ts), jadi kalau
 * Super Admin mengubah atau menonaktifkan paket, landing ikut berubah.
 *
 * Kalau API gagal, komponen jatuh ke `FALLBACK_PACKAGES` — halaman harga tidak
 * boleh kosong saat reviewer membukanya.
 */
import { computed, onMounted, ref } from 'vue';
import { ArrowRight, Coins } from 'lucide-vue-next';
import LandingSectionHead from './LandingSectionHead.vue';
import { api } from '../../api';
import { formatNumber } from '../../utils/format';

/**
 * Cermin dari backend/src/constants/payments.ts (PAYMENT_PACKAGES).
 * Dipakai hanya sebagai jaring pengaman saat API tidak dapat dihubungi.
 */
const FALLBACK_PACKAGES = [
  {
    code: 'coba_dulu',
    name: 'Coba Dulu',
    amountIdr: 5_000,
    ctfAmount: 25,
    description: 'Paket kecil untuk mencoba top-up dan publish.',
  },
  {
    code: 'hemat',
    name: 'Hemat',
    amountIdr: 10_000,
    ctfAmount: 55,
    description: 'Bonus 5 CTF dibanding paket Coba Dulu.',
  },
  {
    code: 'mahasiswa',
    name: 'Mahasiswa',
    amountIdr: 25_000,
    ctfAmount: 145,
    description: 'Paling pas untuk pemakaian harian.',
  },
  {
    code: 'kampus',
    name: 'Kampus',
    amountIdr: 50_000,
    ctfAmount: 300,
    description: 'Untuk base dan komunitas yang aktif.',
  },
  {
    code: 'bundling',
    name: 'Bundling',
    amountIdr: 100_000,
    ctfAmount: 625,
    description: 'Paket terbesar dengan CTF per rupiah paling efisien.',
  },
];

/** Cermin dari PAYMENT_METHODS, dikelompokkan untuk tampilan publik. */
const FALLBACK_METHOD_GROUPS = [
  { label: 'QRIS', methods: [{ code: 'qris', label: 'QRIS' }] },
  {
    label: 'Virtual Account',
    methods: [
      { code: 'bca_va', label: 'BCA' },
      { code: 'bni_va', label: 'BNI' },
      { code: 'bri_va', label: 'BRI' },
      { code: 'permata_va', label: 'Permata' },
      { code: 'mandiri_bill', label: 'Mandiri' },
    ],
  },
  {
    label: 'E-Wallet',
    methods: [
      { code: 'gopay', label: 'GoPay' },
      { code: 'shopeepay', label: 'ShopeePay' },
    ],
  },
];

const METHOD_GROUP_LABELS = {
  qris: 'QRIS',
  va: 'Virtual Account',
  ewallet: 'E-Wallet',
};

/** Label pendek per kode metode supaya chip tidak melebar. */
const METHOD_SHORT_LABELS = {
  qris: 'QRIS',
  bca_va: 'BCA',
  bni_va: 'BNI',
  bri_va: 'BRI',
  permata_va: 'Permata',
  mandiri_bill: 'Mandiri',
  gopay: 'GoPay',
  shopeepay: 'ShopeePay',
};

const packages = ref(FALLBACK_PACKAGES);
const methods = ref([]);
const usingFallback = ref(false);

/**
 * Paket dengan rasio CTF per rupiah terbaik mendapat badge "Paling hemat".
 * Dihitung, bukan ditulis manual, supaya tetap benar setelah harga diubah.
 */
const bestValueCode = computed(() => {
  let best = null;
  let bestRate = -1;
  for (const pkg of packages.value) {
    const amount = Number(pkg.amountIdr);
    if (!amount) continue;
    const rate = Number(pkg.ctfAmount) / amount;
    if (rate > bestRate) {
      bestRate = rate;
      best = pkg.code;
    }
  }
  return best;
});

/** Harga efektif per 1 CTF, dibulatkan ke rupiah terdekat. */
function ratePerCtf(pkg) {
  const ctf = Number(pkg.ctfAmount);
  if (!ctf) return 0;
  return Math.round(Number(pkg.amountIdr) / ctf);
}

/** Kelompokkan metode dari API; jatuh ke daftar statis bila kosong. */
const methodGroups = computed(() => {
  if (!methods.value.length) return FALLBACK_METHOD_GROUPS;

  const grouped = new Map();
  for (const method of methods.value) {
    const label = METHOD_GROUP_LABELS[method.group] || 'Lainnya';
    if (!grouped.has(label)) grouped.set(label, []);
    grouped.get(label).push({
      code: method.code,
      label: METHOD_SHORT_LABELS[method.code] || method.label,
    });
  }

  // Urutan tampil: QRIS → Virtual Account → E-Wallet.
  const order = ['QRIS', 'Virtual Account', 'E-Wallet', 'Lainnya'];
  return [...grouped.entries()]
    .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
    .map(([label, list]) => ({ label, methods: list }));
});

onMounted(async () => {
  try {
    const response = await api.getPaymentPackages();
    const list = response?.packages || [];
    if (list.length) {
      packages.value = list;
      usingFallback.value = false;
    } else {
      // Tabel kosong = Super Admin menonaktifkan semua paket. Hormati keputusan
      // itu alih-alih menampilkan harga yang sudah tidak berlaku.
      packages.value = [];
    }
    if (response?.methods?.length) methods.value = response.methods;
  } catch {
    // API tidak tersedia — tampilkan katalog bawaan agar halaman tetap lengkap.
    usingFallback.value = true;
  }
});
</script>

<style scoped>
.lp-pricing {
  margin-bottom: 90px;
}

.pricing-head {
  margin-bottom: 32px;
}

/* ---- GRID PAKET ---- */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 16px;
}

.price-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  padding: 24px 20px 20px;
}

.price-card--featured {
  border-color: var(--brand-blue);
  box-shadow: 0 10px 26px var(--shadow-color);
}

.price-badge {
  position: absolute;
  top: -10px;
  left: 20px;
  background: var(--brand-blue);
  color: #ffffff;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

.price-name {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 10px;
}

.price-amount {
  font-size: 26px;
  font-weight: 900;
  letter-spacing: -0.8px;
  color: var(--text-main);
  line-height: 1.1;
}

.price-currency {
  font-size: 15px;
  font-weight: 800;
  margin-right: 2px;
  color: var(--text-secondary);
}

.price-ctf {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 13px;
  color: var(--brand-blue);
  font-weight: 800;
}

.price-desc {
  margin-top: 10px;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--text-muted);
  flex: 1;
}

.price-rate {
  margin-top: 12px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--text-secondary);
}

.price-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 14px;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  color: var(--text-main);
  font-size: 12.5px;
  font-weight: 800;
  text-decoration: none;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.price-cta:hover {
  background: var(--brand-blue);
  border-color: var(--brand-blue);
  color: #ffffff;
}

.pricing-note {
  margin-top: 14px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-muted);
}

.pricing-note--warn {
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
}

/* ---- FAKTA CTF ---- */
.pricing-facts {
  margin-top: 26px;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  padding: 22px 24px;
}

.pricing-facts-title,
.pricing-methods-title {
  font-size: 14px;
  font-weight: 900;
  color: var(--text-main);
  margin-bottom: 12px;
}

.pricing-facts-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 24px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pricing-facts-list li {
  position: relative;
  padding-left: 18px;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.pricing-facts-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand-blue);
}

.pricing-facts-list strong {
  color: var(--text-main);
  font-weight: 800;
}

/* ---- METODE PEMBAYARAN ---- */
.pricing-methods {
  margin-top: 22px;
}

.pricing-methods-sub {
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-muted);
  margin-top: -6px;
  margin-bottom: 14px;
}

.method-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.method-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.method-group-label {
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: var(--text-muted);
  min-width: 112px;
}

.method-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.method-chip {
  padding: 6px 13px;
  border-radius: 999px;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
}

/* ---- CTA PENUTUP ---- */
.pricing-foot {
  margin-top: 28px;
  text-align: center;
}

.pricing-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 30px;
  border-radius: 999px;
  background: var(--brand-blue);
  color: #ffffff;
  font-size: 14.5px;
  font-weight: 900;
  text-decoration: none;
  box-shadow: 0 10px 24px var(--shadow-color);
  transition: transform 0.2s ease;
}

.pricing-cta:hover {
  transform: scale(1.03);
}

.pricing-foot-note {
  margin-top: 12px;
  font-size: 12.5px;
  color: var(--text-muted);
}

.pricing-foot-note a {
  color: var(--brand-blue);
  font-weight: 800;
  text-decoration: none;
}

.pricing-foot-note a:hover {
  text-decoration: underline;
}

/* ---- RESPONSIF ---- */
@media (max-width: 992px) {
  .lp-pricing {
    margin-bottom: 72px;
  }

  .pricing-facts-list {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 600px) {
  .lp-pricing {
    margin-bottom: 56px;
  }

  /* Daftar kompak 1 kolom: harga & CTF sejajar supaya 5 paket bisa
     dibandingkan tanpa scroll panjang, dan tidak ada kartu yatim. */
  .pricing-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
  }

  .price-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: baseline;
    gap: 4px 12px;
    padding: 16px;
  }

  .price-badge {
    top: -9px;
    left: 16px;
    font-size: 10px;
  }

  .price-name {
    grid-column: 1;
    grid-row: 1;
    margin-bottom: 0;
  }

  .price-amount {
    grid-column: 2;
    grid-row: 1;
    font-size: 20px;
    text-align: right;
  }

  .price-ctf {
    grid-column: 1;
    grid-row: 2;
    margin-top: 2px;
  }

  .price-rate {
    grid-column: 2;
    grid-row: 2;
    margin-top: 2px;
    text-align: right;
  }

  .price-desc {
    grid-column: 1 / -1;
    grid-row: 3;
    margin-top: 6px;
    font-size: 12px;
  }

  .price-cta {
    grid-column: 1 / -1;
    grid-row: 4;
    margin-top: 10px;
    padding: 9px 16px;
  }

  .pricing-facts {
    padding: 18px 16px;
    border-radius: 16px;
  }

  .method-group {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .method-group-label {
    min-width: 0;
  }

  .pricing-cta {
    width: 100%;
    padding: 13px 20px;
    font-size: 13.5px;
  }
}
</style>
