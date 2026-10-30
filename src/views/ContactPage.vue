<template>
  <main class="contact-page">
    <div class="contact-wrap">
      <header class="contact-top">
        <RouterLink to="/" class="contact-back">
          <ChevronLeft :size="16" />
          <span>Kembali</span>
        </RouterLink>
        <span class="contact-brand">Fess n Curious</span>
        <RouterLink to="/login" class="contact-login">Masuk App</RouterLink>
      </header>

      <!-- HERO -->
      <section class="contact-hero" aria-labelledby="contact-title">
        <span class="contact-badge">HUBUNGI KAMI</span>
        <h1 id="contact-title" class="contact-title">Ada yang bisa kami bantu?</h1>
        <p class="contact-subtitle">
          Pertanyaan tentang akun, konten, kerja sama, atau transaksi pembayaran — tim kami siap
          membantu. Semua pesan masuk ke email resmi di bawah ini.
        </p>
      </section>

      <!-- KANAL KONTAK -->
      <section class="contact-channels" aria-label="Kanal kontak">
        <article v-for="channel in CONTACT_CHANNELS" :key="channel.title" class="channel-card">
          <span class="channel-icon" aria-hidden="true">
            <component :is="ICONS[channel.icon]" :size="20" />
          </span>
          <h2 class="channel-title">{{ channel.title }}</h2>
          <p class="channel-desc">{{ channel.desc }}</p>

          <a v-if="channel.href" class="channel-action" :href="channel.href">
            {{ channel.value }}
          </a>
          <span v-else class="channel-value">{{ channel.value }}</span>
        </article>
      </section>

      <!-- KHUSUS PEMBAYARAN -->
      <section class="contact-payment" aria-labelledby="contact-payment-title">
        <div class="contact-payment-head">
          <span class="contact-payment-icon" aria-hidden="true">
            <CreditCard :size="20" />
          </span>
          <h2 id="contact-payment-title" class="contact-section-title">
            Kendala pembayaran atau top up CTF
          </h2>
        </div>

        <p class="contact-para">
          Transaksi pembayaran di Fess n Curious diproses oleh <strong>Midtrans</strong>. Jika
          pembayaranmu gagal, terpotong dua kali, atau saldo CTF tidak masuk, kirim email ke
          <a class="contact-inline-link" :href="`mailto:${LEGAL_CONTACT_EMAIL}`">
            {{ LEGAL_CONTACT_EMAIL }}</a
          >
          dengan subjek <strong>"Kendala Pembayaran"</strong>.
        </p>

        <p class="contact-para contact-para--tight">
          Sertakan informasi berikut agar kami bisa menelusuri lebih cepat:
        </p>

        <ul class="contact-checklist">
          <li>ID pesanan (format <code>ORD-…</code>) dari halaman Dompet</li>
          <li>Tanggal dan nominal transaksi</li>
          <li>Metode pembayaran yang digunakan (QRIS, Virtual Account, atau e-wallet)</li>
          <li>Tangkapan layar bukti pembayaran, bila ada</li>
        </ul>

        <p class="contact-para contact-para--tight">
          Kami membalas paling lambat <strong>2 × 24 jam kerja</strong>. Untuk transaksi yang
          dinyatakan gagal, dana biasanya dikembalikan otomatis oleh penyedia pembayaran dalam 1–7
          hari kerja sesuai kebijakan bank atau penerbit kartu.
        </p>
      </section>

      <!-- PENYELENGGARA -->
      <section class="contact-organizer" aria-labelledby="contact-organizer-title">
        <div class="contact-organizer-head">
          <img
            class="contact-organizer-logo"
            :src="ORGANIZER_LOGO"
            alt="Logo Concern Dev"
            width="40"
            height="40"
            loading="lazy"
            decoding="async"
          />
          <h2 id="contact-organizer-title" class="contact-section-title">Penyelenggara layanan</h2>
        </div>

        <p class="contact-para">
          Fess n Curious dibangun dan dikelola oleh <strong>{{ ORGANIZER_NAME }}</strong
          >. Informasi resmi mengenai penyelenggara tersedia di situs perusahaan.
        </p>

        <a
          class="contact-organizer-link"
          :href="ORGANIZER_URL"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Kunjungi {{ ORGANIZER_NAME }}</span>
          <ArrowUpRight :size="15" />
        </a>
      </section>

      <!-- TAUTAN LAIN -->
      <nav class="contact-links" aria-label="Tautan terkait">
        <RouterLink to="/about">Tentang Kami</RouterLink>
        <RouterLink to="/terms">Ketentuan Layanan</RouterLink>
        <RouterLink to="/privacy">Kebijakan Privasi</RouterLink>
        <RouterLink to="/data-deletion">Penghapusan Data</RouterLink>
      </nav>

      <ConcernAttribution variant="legal" class="contact-attribution" />
    </div>
  </main>
</template>

<script setup>
/**
 * ContactPage — halaman publik /contact.
 *
 * Dibuat sebagai bagian dari syarat verifikasi payment gateway: footer publik
 * wajib memuat tautan "Contact Us" yang benar-benar bisa dibuka, bukan sekadar
 * alamat email di dalam teks. Kanal pembayaran dipisahkan supaya penelusuran
 * transaksi lebih cepat.
 */
import {
  ChevronLeft,
  ArrowUpRight,
  CreditCard,
  Mail,
  Clock,
  MessagesSquare,
} from 'lucide-vue-next';
import ConcernAttribution from '../components/common/ConcernAttribution.vue';
import { ORGANIZER_NAME, ORGANIZER_URL, ORGANIZER_LOGO } from '../data/organization';
import { LEGAL_CONTACT_EMAIL } from '../data/legal';

/** Nama ikon di CONTACT_CHANNELS dipetakan ke komponen lucide yang diimpor. */
const ICONS = { Mail, Clock, MessagesSquare };

const CONTACT_CHANNELS = [
  {
    icon: 'Mail',
    title: 'Email Support',
    desc: 'Kanal utama untuk semua pertanyaan akun, konten, dan transaksi.',
    value: LEGAL_CONTACT_EMAIL,
    href: `mailto:${LEGAL_CONTACT_EMAIL}`,
  },
  {
    icon: 'Clock',
    title: 'Jam Operasional',
    desc: 'Senin–Sabtu, 08.00–22.00 WIB. Pesan di luar jam ini dibalas pada hari kerja berikutnya.',
    value: 'Senin–Sabtu · 08.00–22.00 WIB',
    href: '',
  },
  {
    icon: 'MessagesSquare',
    title: 'Waktu Respons',
    desc: 'Rata-rata kami membalas dalam 1×24 jam kerja. Kendala pembayaran diprioritaskan.',
    value: 'Maksimal 2×24 jam kerja',
    href: '',
  },
];
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: var(--bg-page);
  color: var(--text-main);
  font-family: var(--font-sans);
}

.contact-wrap {
  width: min(820px, 100%);
  margin: 0 auto;
  padding: 20px 20px 64px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ---- TOP BAR ---- */
.contact-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 0 8px;
}

.contact-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.15s ease;
}

.contact-back:hover {
  color: var(--neon-blue);
}

.contact-brand {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.4px;
  color: var(--text-main);
}

.contact-login {
  font-size: 13px;
  font-weight: 800;
  color: var(--neon-blue);
  text-decoration: none;
  white-space: nowrap;
}

.contact-login:hover {
  text-decoration: underline;
}

/* ---- HERO ---- */
.contact-hero {
  text-align: center;
  padding: 12px 0 4px;
}

.contact-badge {
  display: inline-block;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--neon-blue);
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.6px;
  padding: 5px 13px;
  border-radius: var(--radius-pill);
  margin-bottom: 14px;
}

.contact-title {
  font-size: clamp(26px, 5vw, 36px);
  font-weight: 900;
  letter-spacing: -1px;
  line-height: 1.2;
  color: var(--text-main);
}

.contact-subtitle {
  font-size: 14.5px;
  line-height: 1.65;
  color: var(--text-muted);
  max-width: 620px;
  margin: 12px auto 0;
}

/* ---- KANAL ---- */
.contact-channels {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.channel-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 18px;
}

.channel-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  color: var(--neon-blue);
  flex-shrink: 0;
}

.channel-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--text-main);
}

.channel-desc {
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-muted);
  flex: 1;
}

.channel-action {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--neon-blue);
  text-decoration: none;
  word-break: break-word;
}

.channel-action:hover {
  text-decoration: underline;
}

.channel-value {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-secondary);
}

/* ---- PEMBAYARAN ---- */
.contact-payment,
.contact-organizer {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 20px;
}

.contact-payment-head {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 12px;
}

.contact-payment-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  color: var(--neon-blue);
  flex-shrink: 0;
}

.contact-section-title {
  font-size: 15px;
  font-weight: 900;
  letter-spacing: -0.3px;
  color: var(--text-main);
  line-height: 1.3;
}

.contact-para {
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.contact-para:last-child {
  margin-bottom: 0;
}

.contact-para--tight {
  margin-top: 4px;
}

.contact-para strong {
  color: var(--text-main);
  font-weight: 800;
}

.contact-inline-link {
  color: var(--neon-blue);
  font-weight: 800;
  text-decoration: none;
}

.contact-inline-link:hover {
  text-decoration: underline;
}

.contact-checklist {
  margin: 0 0 12px;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.contact-checklist li {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.contact-checklist code {
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  padding: 1px 5px;
  border-radius: 5px;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
}

/* ---- PENYELENGGARA ---- */
.contact-organizer-head {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 12px;
}

.contact-organizer-logo {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  object-fit: contain;
  flex-shrink: 0;
}

.contact-organizer-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  font-size: 13px;
  font-weight: 800;
  color: var(--neon-blue);
  text-decoration: none;
}

.contact-organizer-link:hover {
  text-decoration: underline;
}

/* ---- TAUTAN ---- */
.contact-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 18px;
  margin-top: 4px;
}

.contact-links a {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-decoration: none;
}

.contact-links a:hover {
  color: var(--neon-blue);
}

.contact-attribution {
  margin-top: 4px;
}

@media (max-width: 720px) {
  .contact-channels {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 640px) {
  .contact-wrap {
    padding: 16px 16px 48px;
    gap: 16px;
  }

  .contact-payment,
  .contact-organizer {
    padding: 16px;
  }

  .contact-para,
  .channel-desc {
    font-size: 13px;
  }
}
</style>
