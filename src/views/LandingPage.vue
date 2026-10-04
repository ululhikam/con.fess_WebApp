<template>
  <div class="lp-root">
    <!-- HERO SECTION (ELECTRIC BLUE WITH GRID & DOODLES) -->
    <section class="lp-hero">
      <!-- Grid background overlay -->
      <div class="hero-grid-bg"></div>

      <!-- NAVBAR -->
      <nav class="lp-nav" :class="{ scrolled: isScrolled }">
        <div class="nav-left">
          <router-link to="/" class="nav-logo-pill">
            <span class="logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </span>
            <span class="logo-text">BASE <strong>CONFESS</strong></span>
          </router-link>
        </div>

        <div class="nav-center">
          <a href="#fitur" class="nav-pill-link">Fitur Utama</a>
          <a href="#cara-kerja" class="nav-pill-link">Cara Kerja</a>
          <a href="#komunitas" class="nav-pill-link">Base Komunitas</a>
          <a href="#faq" class="nav-pill-link">FAQ</a>
        </div>

        <div class="nav-right">
          <router-link to="/login" class="nav-connect-btn">Masuk App</router-link>
        </div>
      </nav>

      <!-- HERO CONTAINER & MAIN TYPOGRAPHY -->
      <div class="hero-main">
        <!-- SVG Neon Green Hashtag Doodle -->
        <div class="doodle-hashtag">
          <svg width="110" height="110" viewBox="0 0 100 100" fill="none" stroke="#BAFF00" stroke-width="14" stroke-linecap="round">
            <line x1="30" y1="15" x2="20" y2="85" />
            <line x1="75" y1="15" x2="65" y2="85" />
            <line x1="10" y1="38" x2="90" y2="38" />
            <line x1="10" y1="68" x2="90" y2="68" />
          </svg>
        </div>

        <!-- SVG Top Right Curved Neon Arrow -->
        <div class="doodle-arrow-top">
          <svg width="130" height="130" viewBox="0 0 100 100" fill="none" stroke="#BAFF00" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M 20 80 Q 75 80 75 30 T 45 20" />
            <polyline points="35,32 45,20 58,32" />
          </svg>
        </div>

        <!-- SVG Bottom Left Curved Neon Arrow -->
        <div class="doodle-arrow-bottom">
          <svg width="140" height="140" viewBox="0 0 100 100" fill="none" stroke="#BAFF00" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M 80 80 Q 20 70 30 20" />
            <polyline points="15,35 30,20 45,35" />
          </svg>
        </div>

        <!-- MASSIVE TYPOGRAPHY (HIGH-CONTRAST & PROPORTIONAL) -->
        <div class="hero-title-wrap">
          <h1 class="hero-title-line line-1">#CONFESS</h1>
          <h1 class="hero-title-line line-2">AUTO POST</h1>
          <h1 class="hero-title-line line-3">BASE</h1>
        </div>

        <!-- FLOATING FROSTED GLASS CARDS -->
        <!-- Card 1: Top Right (pearl_anon) -->
        <div class="hero-glass-card card-top-right">
          <div class="glass-avatar">
            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=pearl" alt="Avatar" />
          </div>
          <div class="glass-info">
            <div class="glass-handle">pearl_anon</div>
            <div class="glass-sub">293 582 disukai</div>
          </div>
        </div>

        <!-- Card 2: Center/Bottom (base_sender) -->
        <div class="hero-glass-card card-center-left">
          <div class="glass-avatar monkey-bg">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=baseclub" alt="Avatar" />
          </div>
          <div class="glass-info">
            <div class="glass-handle">base_sender</div>
            <div class="glass-sub">23 422 fess terkirim</div>
          </div>
        </div>

        <!-- ROTATING BADGE STICKER -->
        <div class="hero-badge-sticker">
          <div class="sticker-circle">
            <svg class="sticker-text-svg" viewBox="0 0 100 100">
              <path id="textPath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none"/>
              <text font-size="11.5" font-weight="900" letter-spacing="2" fill="#000">
                <textPath href="#textPath" startOffset="0%">KIRIM FESS SEKARANG • KIRIM FESS SEKARANG • </textPath>
              </text>
            </svg>
            <div class="sticker-center-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="7" y1="17" x2="17" y2="7"/>
                <polyline points="7,7 17,7 17,17"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- LOWER SECTION (WHITE CONTAINER WITH ROUNDED TOP CORNERS) -->
    <section class="lp-white-section">
      <div class="white-container">
        
        <!-- THREE CARDS GRID (EXACT LAYOUT FROM REFERENCE) -->
        <div id="fitur" class="features-trio-grid">
          
          <!-- CARD 1: KIRIM CONFESS ANONIM -->
          <div class="trio-card">
            <h3 class="trio-title">KIRIM CONFESS ANONIM</h3>
            <p class="trio-desc">Tulis pesan tanpa ragu, 100% rahasia tanpa jejak data pribadi.</p>

            <div class="trio-bottom-preview preview-1">
              <div class="blue-avatar-pill">
                <div class="mini-avatar">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=baseclub" alt="User" />
                </div>
                <div class="pill-meta">
                  <span class="pm-handle">base_sender</span>
                  <span class="pm-sub">23 422 fess terkirim</span>
                </div>
              </div>
              <div class="green-token-tag">
                <span>100% ANONIM</span>
              </div>
            </div>
          </div>

          <!-- ARROW DOODLE 1 -> 2 -->
          <div class="trio-connector-arrow arrow-1">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="#000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M 10 45 Q 35 45 45 15" />
              <polyline points="32,15 45,15 45,28" />
            </svg>
          </div>

          <!-- CARD 2: AUTO-PUBLISH SOSMED -->
          <div class="trio-card">
            <h3 class="trio-title">AUTO-PUBLISH KE SOSMED</h3>
            <p class="trio-desc">Bot menyalurkan otomatis ke Instagram, Threads, & X.</p>

            <div class="trio-bottom-preview preview-2">
              <div class="dual-pills-row">
                <div class="blue-val-pill">AUTO POST</div>
                <div class="dark-token-pill">INSTANT</div>
              </div>
              <div class="mini-green-badge-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7"/>
                  <polyline points="7,7 17,7 17,17"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- ARROW DOODLE 2 -> 3 -->
          <div class="trio-connector-arrow arrow-2">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="#000" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M 10 40 Q 30 10 50 35" />
              <polyline points="38,32 50,35 50,22" />
            </svg>
          </div>

          <!-- CARD 3: ANALITIK & REAKSI REALTIME -->
          <div class="trio-card">
            <h3 class="trio-title">ANALITIK & REAKSI REALTIME</h3>
            <p class="trio-desc">Pantau jumlah pembaca & reaksi komunitas dari setiap fess.</p>

            <div class="trio-bottom-preview preview-3">
              <div class="speech-bubble-green">
                <div class="sb-label">EST. TOTAL PEMBACA</div>
                <div class="sb-val">188.342 K</div>
                <div class="sb-tail"></div>
              </div>
            </div>
          </div>

        </div>

        <!-- CARA KERJA SECTION -->
        <div id="cara-kerja" class="lp-steps-section">
          <div class="section-head-center">
            <span class="stats-badge-tag">LANGKAH MUDAH</span>
            <h2 class="stats-h2">Cara Kerja Base Confess Engine</h2>
            <p class="section-subtext">Hanya butuh 3 langkah sederhana untuk mengirimkan pesan anonimmu ke ribuan pembaca.</p>
          </div>

          <div class="steps-grid">
            <div class="step-card">
              <div class="step-number-badge">01</div>
              <h3 class="step-title">Pilih Base Komunitas</h3>
              <p class="step-desc">Cari dan pilih Base sesuai topik yang kamu inginkan, mulai dari meme, dunia kampus, hingga teknologi.</p>
            </div>

            <div class="step-card">
              <div class="step-number-badge">02</div>
              <h3 class="step-title">Tulis Confession Anonim</h3>
              <p class="step-desc">Ketik pesanmu bebas tanpa khawatir. Sistem enkripsi data kami menjaga identitasmu 100% anonim.</p>
            </div>

            <div class="step-card">
              <div class="step-number-badge">03</div>
              <h3 class="step-title">Auto-Posting Ke Sosmed</h3>
              <p class="step-desc">Bot akan memverifikasi dan memposting pesanmu ke IG/Threads/X secara instan tanpa tunda.</p>
            </div>
          </div>
        </div>

        <!-- BASE COMMUNITY SHOWCASE -->
        <div id="komunitas" class="lp-base-showcase">
          <div class="showcase-head">
            <div>
              <span class="stats-badge-tag">JELAJAHI BASE</span>
              <h2 class="stats-h2">Temukan Komunitas Favoritmu</h2>
            </div>
            <router-link to="/login" class="nav-connect-btn dark-btn">Jelajahi Semua Base →</router-link>
          </div>

          <div class="base-cards-grid">
            <div class="base-card-item" v-for="b in sampleBases" :key="b.handle">
              <div class="bci-top">
                <div class="bci-icon" :style="{ background: b.color }">{{ b.initial }}</div>
                <div class="bci-meta">
                  <h4>{{ b.name }}</h4>
                  <span>{{ b.handle }}</span>
                </div>
                <span class="bci-badge">{{ b.members }} anggota</span>
              </div>
              <p class="bci-desc">{{ b.desc }}</p>
              <div class="bci-footer">
                <router-link to="/login" class="bci-join-btn">Kirim Fess Ke Base →</router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- STATS & COMMUNITY SUMMARY SECTION -->
        <div class="lp-stats-row-container">
          <div class="stats-header">
            <span class="stats-badge-tag">REPUTASI & STATISTIK BASE</span>
            <h2 class="stats-h2">Platform Auto-Base Confession Terbesar di Indonesia</h2>
          </div>
          
          <div class="stats-numbers-grid">
            <div class="stat-box">
              <div class="sb-num">120.4K+</div>
              <div class="sb-lbl">Total Confession Terkirim</div>
            </div>
            <div class="stat-box">
              <div class="sb-num">48.2K</div>
              <div class="sb-lbl">Pengguna Aktif Bulanan</div>
            </div>
            <div class="stat-box">
              <div class="sb-num">350+</div>
              <div class="sb-lbl">Base Komunitas Terhubung</div>
            </div>
            <div class="stat-box">
              <div class="sb-num">0.00s</div>
              <div class="sb-lbl">Delay Otomatisasi Post</div>
            </div>
          </div>
        </div>

        <!-- FAQ SECTION (CLEAN & NON-CRYPTO) -->
        <div id="faq" class="lp-faq-section">
          <div class="faq-head">
            <span class="stats-badge-tag">FAQ KOMPREHENSIF</span>
            <h2 class="stats-h2">Pertanyaan Sering Diajukan</h2>
            <p class="section-subtext">Klik pada pertanyaan untuk melihat jawaban lengkap seputar Base Confess.</p>
          </div>

          <div class="faq-accordion">
            <div 
              class="faq-item" 
              v-for="(faq, idx) in faqs" 
              :key="idx" 
              :class="{ open: openFaq === idx }"
              @click="toggleFaq(idx)"
            >
              <div class="faq-question">
                <div class="faq-q-text">
                  <span class="faq-num">0{{ idx + 1 }}</span>
                  <span>{{ faq.q }}</span>
                </div>
                <div class="faq-icon-wrap">
                  <svg 
                    class="faq-chevron" 
                    :class="{ rotated: openFaq === idx }"
                    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>
              <transition name="faq-slide">
                <div class="faq-answer" v-if="openFaq === idx">
                  <p>{{ faq.a }}</p>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- CALL TO ACTION BANNER -->
        <div class="lp-cta-banner">
          <div class="cta-inner">
            <h2>Mulai Kirim Fess Anonim Sekarang!</h2>
            <p>Bergabung dengan ribuan pengguna lainnya di Base Confess Engine.</p>
            <router-link to="/login" class="hero-cta-btn">Masuk ke App Sekarang →</router-link>
          </div>
        </div>

        <!-- FOOTER -->
        <footer class="lp-footer">
          <div class="footer-left">
            <div class="nav-logo-pill dark-logo">
              <span class="logo-text">BASE <strong>CONFESS</strong></span>
            </div>
            <p>© 2026 BASE CONFESS - Automatic Social Media Confession Platform.</p>
          </div>
          <div class="footer-links">
            <router-link to="/login">Masuk</router-link>
            <a href="#fitur">Fitur</a>
            <a href="#cara-kerja">Cara Kerja</a>
            <a href="#komunitas">Komunitas</a>
            <a href="#faq">FAQ</a>
          </div>
        </footer>

      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const openFaq = ref(0) // Open first FAQ by default

const toggleFaq = (idx) => {
  openFaq.value = openFaq.value === idx ? null : idx
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 40
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const sampleBases = [
  { name: 'Base Indonesia Memes', handle: '@basememes', members: '14.2K', initial: 'BM', color: '#0038FF', desc: 'Wadah fess meme paling kocak & viral se-Indonesia.' },
  { name: 'Developer & Tech Fess', handle: '@techdevs', members: '9.8K', initial: 'TD', color: '#7000FF', desc: 'Curhatan developer IT, coding, & kehidupan dunia kerja startup.' },
  { name: 'Kuliah & Kampus Fess', handle: '@kampusfess', members: '28.5K', initial: 'KF', color: '#FF0055', desc: 'Anonimitas mahasiswa dari seluruh universitas.' },
  { name: 'Curhat Malam Base', handle: '@curhatmalam', members: '42.1K', initial: 'CM', color: '#00B2FF', desc: 'Tempat aman meluapkan isi hati & pikiran tanpa di-judge.' },
]

const faqs = [
  { 
    q: 'Apakah pengiriman confession benar-benar 100% anonim?', 
    a: 'Ya, 100%! Identitas, nama akun, maupun email kamu tidak pernah ditampilkan ke publik atau disimpan di postingan. Pesan diproses secara anonim.' 
  },
  { 
    q: 'Bagaimana cara kerja bot otomatis memposting ke Instagram, Threads, dan X?', 
    a: 'Setelah confession kamu dikirim dan lolos verifikasi moderasi AI/Admin, bot terintegrasi kami akan langsung membuat desain gambar dan memposting pesan tersebut ke akun sosial media Base secara otomatis & realtime.' 
  },
  { 
    q: 'Apakah gratis untuk mengirim Fess?', 
    a: 'Pengiriman pesan dasar 100% gratis tanpa biaya apapun. Kamu bisa mengirim pesan ke Base favorit kapan saja.' 
  },
  { 
    q: 'Apakah saya wajib mendaftar akun untuk mengirim Fess?', 
    a: 'Kamu bisa mengirim pesan secara langsung melalui form publik tanpa ribet, atau mendaftar akun untuk menyimpan riwayat dan mengelola fess buatanmu.' 
  },
  { 
    q: 'Berapa lama proses hingga fess saya disetujui dan terbit di sosial media?', 
    a: 'Proses moderasi AI berlangsung secara realtime kurang dari 5 detik. Jika lolos filter kata sensitif, bot akan langsung mengunggahnya detik itu juga.' 
  },
  { 
    q: 'Bagaimana jika pesan confession saya melanggar aturan komunitas?', 
    a: 'Platform kami dilengkapi sistem moderasi AI otomatis. Pesan yang mengandung ujaran kebencian, doxxing, atau spam akan otomatis ditolak demi menjaga kenyamanan bersama.' 
  },
  { 
    q: 'Bisakah saya mendaftarkan dan mengelola Base Komunitas milik saya sendiri?', 
    a: 'Tentu saja! Kamu dapat mendaftarkan Base baru melalui dashboard, menghubungkan akun sosmed milikmu, dan menentukan aturan moderasi komunitasmu sendiri.' 
  },
  { 
    q: 'Bagaimana cara melaporkan pesan yang tidak pantas?', 
    a: 'Setiap postingan dilengkapi tombol "Laporkan" (Report). Jika pesan menerima laporan dari pengguna, moderasi akan membekukan sementara postingan tersebut untuk ditinjau ulang.' 
  },
  { 
    q: 'Bisakah saya menghapus fess yang telah terunggah?', 
    a: 'Jika kamu login saat mengirim fess, kamu dapat mengajukan permintaan hapus langsung melalui menu riwayat fess di profil akunmu.' 
  },
  { 
    q: 'Apakah platform ini aman dari pelacakan IP address?', 
    a: 'Sangat aman. Kami menerapkan sistem enkripsi dan tidak menyimpan log IP pengirim yang menghubungkan identitas asli dengan konten yang ditulis.' 
  }
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&display=swap');

.lp-root {
  min-height: 100vh;
  background: #0B39FA; /* Vibrant Electric Royal Blue */
  color: #FFFFFF;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow-x: hidden;
}

/* ==========================================================================
   1. HERO SECTION (ELECTRIC BLUE WITH GRID & DOODLES)
   ========================================================================== */
.lp-hero {
  position: relative;
  background: #0B39FA;
  padding-bottom: 80px;
  overflow: hidden;
}

/* Grid background overlay */
.hero-grid-bg {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 1;
}

/* NAVBAR */
.lp-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 48px;
  transition: all 0.3s ease;
}

.lp-nav.scrolled {
  background: rgba(11, 57, 250, 0.94);
  backdrop-filter: blur(12px);
  padding: 16px 48px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.nav-logo-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #FFFFFF;
  color: #000000;
  padding: 10px 20px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 800;
  font-size: 15px;
  letter-spacing: -0.3px;
}

.logo-icon {
  display: flex;
  align-items: center;
  color: #0B39FA;
}

.nav-center {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.nav-pill-link {
  color: #FFFFFF;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  padding: 8px 18px;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.nav-pill-link:hover {
  background: rgba(255, 255, 255, 0.25);
}

.nav-connect-btn {
  background: transparent;
  color: #FFFFFF;
  border: 2px solid #FFFFFF;
  padding: 10px 26px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-block;
}

.nav-connect-btn:hover {
  background: #FFFFFF;
  color: #0B39FA;
}

/* HERO MAIN BODY */
.hero-main {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 40px auto 0 auto;
  padding: 0 24px;
  text-align: center;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* DOODLES POSITIONING */
.doodle-hashtag {
  position: absolute;
  top: -10px;
  left: 14%;
  z-index: 5;
  animation: pulseRotate 6s ease-in-out infinite alternate;
}

.doodle-arrow-top {
  position: absolute;
  top: 10px;
  right: 18%;
  z-index: 5;
  animation: floatSlow 4s ease-in-out infinite alternate;
}

.doodle-arrow-bottom {
  position: absolute;
  bottom: 20px;
  left: 20%;
  z-index: 5;
}

/* MASSIVE TYPOGRAPHY */
.hero-title-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.02;
  user-select: none;
}

.hero-title-line {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(64px, 10.5vw, 132px);
  font-weight: 900;
  letter-spacing: -1.5px;
  color: #FFFFFF;
  text-transform: uppercase;
  margin: 0;
  text-shadow: 0 12px 36px rgba(0,0,0,0.18);
  font-stretch: normal;
}

/* FLOATING FROSTED GLASS CARDS */
.hero-glass-card {
  position: absolute;
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18);
  z-index: 10;
  transition: transform 0.3s ease;
}

.card-top-right {
  top: 60px;
  right: 22%;
  transform: rotate(7deg);
}

.card-top-right:hover {
  transform: rotate(4deg) scale(1.05);
}

.card-center-left {
  bottom: 40px;
  left: 28%;
  transform: rotate(-8deg);
}

.card-center-left:hover {
  transform: rotate(-5deg) scale(1.05);
}

.glass-avatar {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: #EBF0FF;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glass-avatar.monkey-bg {
  background: #FFE082;
}

.glass-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.glass-info {
  text-align: left;
}

.glass-handle {
  font-weight: 800;
  font-size: 15px;
  color: #FFFFFF;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
}

.glass-sub {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
}

/* ROTATING BADGE STICKER */
.hero-badge-sticker {
  position: absolute;
  bottom: 10px;
  right: 14%;
  z-index: 12;
}

.sticker-circle {
  position: relative;
  width: 120px;
  height: 120px;
  background: #BAFF00; /* Electric Lime */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 30px rgba(0,0,0,0.2);
}

.sticker-text-svg {
  position: absolute;
  width: 100%;
  height: 100%;
  animation: spinSlow 12s linear infinite;
}

.sticker-center-arrow {
  width: 44px;
  height: 44px;
  background: #BAFF00;
  border: 3px solid #000000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ==========================================================================
   2. LOWER WHITE SECTION & TRIO CARDS
   ========================================================================== */
.lp-white-section {
  position: relative;
  z-index: 10;
  background: #FFFFFF;
  color: #000000;
  border-radius: 48px 48px 0 0;
  padding: 60px 48px 80px 48px;
  box-shadow: 0 -20px 40px rgba(0, 0, 0, 0.1);
  margin-top: -20px;
}

.white-container {
  max-width: 1160px;
  margin: 0 auto;
}

/* TRIO CARDS GRID */
.features-trio-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-bottom: 80px;
}

.trio-card {
  background: #F4F5F8;
  border-radius: 28px;
  padding: 36px 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 280px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.trio-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.06);
}

.trio-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.5px;
  color: #000000;
  margin: 0 0 8px 0;
}

.trio-desc {
  font-size: 14px;
  font-weight: 600;
  color: #666666;
  margin: 0;
  line-height: 1.4;
}

/* CONNECTOR ARROWS BETWEEN CARDS */
.trio-connector-arrow {
  position: absolute;
  z-index: 5;
  pointer-events: none;
}

.arrow-1 {
  top: 50%;
  left: 31%;
  transform: translateY(-50%);
}

.arrow-2 {
  bottom: 25%;
  left: 64%;
}

/* TRIO CARD PREVIEWS */
.trio-bottom-preview {
  margin-top: 32px;
}

.preview-1 {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.blue-avatar-pill {
  background: #0B39FA;
  color: #FFFFFF;
  padding: 10px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.mini-avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #FFE082;
  overflow: hidden;
}

.mini-avatar img {
  width: 100%;
  height: 100%;
}

.pill-meta {
  display: flex;
  flex-direction: column;
}

.pm-handle {
  font-weight: 800;
  font-size: 13px;
}

.pm-sub {
  font-size: 11px;
  opacity: 0.8;
}

.green-token-tag {
  align-self: flex-end;
  background: #BAFF00;
  color: #000000;
  font-weight: 900;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 999px;
}

.preview-2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.dual-pills-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.blue-val-pill {
  background: #0B39FA;
  color: #FFFFFF;
  font-weight: 800;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 999px;
}

.dark-token-pill {
  background: #041B78;
  color: #FFFFFF;
  font-weight: 900;
  font-size: 13px;
  padding: 10px 18px;
  border-radius: 999px;
}

.mini-green-badge-arrow {
  width: 38px;
  height: 38px;
  background: #BAFF00;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-3 {
  display: flex;
  justify-content: center;
}

.speech-bubble-green {
  position: relative;
  background: #BAFF00;
  color: #000000;
  padding: 16px 24px;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(186, 255, 0, 0.4);
}

.sb-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.sb-val {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.sb-tail {
  position: absolute;
  bottom: -10px;
  left: 24px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 12px solid #BAFF00;
}

/* ==========================================================================
   3. CARA KERJA (HOW IT WORKS) SECTION
   ========================================================================== */
.lp-steps-section {
  margin-bottom: 90px;
}

.section-head-center {
  text-align: center;
  max-width: 680px;
  margin: 0 auto 48px auto;
}

.section-subtext {
  font-size: 15px;
  color: #666;
  margin-top: 8px;
  line-height: 1.5;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.step-card {
  background: #F8F9FC;
  border: 1px solid #EAECEF;
  border-radius: 28px;
  padding: 36px 28px;
  position: relative;
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.step-card:hover {
  transform: translateY(-6px);
  border-color: #0B39FA;
}

.step-number-badge {
  width: 48px;
  height: 48px;
  background: #0B39FA;
  color: #FFFFFF;
  font-weight: 900;
  font-size: 18px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 8px 18px rgba(11, 57, 250, 0.25);
}

.step-title {
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 10px 0;
  color: #000;
}

.step-desc {
  font-size: 14px;
  color: #555;
  margin: 0;
  line-height: 1.6;
}

/* ==========================================================================
   4. BASE COMMUNITY SHOWCASE
   ========================================================================== */
.lp-base-showcase {
  margin-bottom: 90px;
}

.showcase-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 36px;
}

.dark-btn {
  background: #000000;
  color: #FFFFFF;
  border: none;
}

.dark-btn:hover {
  background: #0B39FA;
  color: #FFFFFF;
}

.base-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.base-card-item {
  background: #F8F9FC;
  border-radius: 24px;
  padding: 28px;
  border: 1px solid #EAECEF;
  transition: transform 0.2s ease;
}

.base-card-item:hover {
  transform: translateY(-4px);
}

.bci-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.bci-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  color: #FFFFFF;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bci-meta h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
}

.bci-meta span {
  font-size: 12px;
  color: #777;
}

.bci-badge {
  margin-left: auto;
  background: #E6ECFF;
  color: #0B39FA;
  font-weight: 800;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 999px;
}

.bci-desc {
  font-size: 14px;
  color: #444;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.bci-join-btn {
  color: #0B39FA;
  font-weight: 800;
  font-size: 14px;
  text-decoration: none;
}

/* ==========================================================================
   5. STATS SECTION
   ========================================================================== */
.stats-badge-tag {
  display: inline-block;
  background: rgba(11, 57, 250, 0.08);
  color: #0B39FA;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 0.5px;
  padding: 6px 14px;
  border-radius: 999px;
  margin-bottom: 12px;
}

.stats-h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.8px;
  line-height: 1.25;
  margin: 0;
}

.lp-stats-row-container {
  margin-bottom: 90px;
}

.stats-numbers-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 36px;
}

.stat-box {
  background: #F8F9FC;
  padding: 28px 20px;
  border-radius: 20px;
  border: 1px solid #EAECEF;
}

.sb-num {
  font-size: 32px;
  font-weight: 900;
  color: #0B39FA;
  margin-bottom: 6px;
}

.sb-lbl {
  font-size: 13px;
  font-weight: 700;
  color: #555555;
}

/* ==========================================================================
   6. FAQ RICH DROPDOWN ACCORDION
   ========================================================================== */
.lp-faq-section {
  margin-bottom: 90px;
}

.faq-head {
  margin-bottom: 36px;
}

.faq-accordion {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.faq-item {
  background: #F8F9FC;
  border-radius: 20px;
  padding: 22px 28px;
  cursor: pointer;
  border: 1.5px solid #EAECEF;
  transition: all 0.25 ease;
  user-select: none;
}

.faq-item:hover {
  border-color: rgba(11, 57, 250, 0.4);
  background: #FFFFFF;
}

.faq-item.open {
  background: #FFFFFF;
  border-color: #0B39FA;
  box-shadow: 0 10px 30px rgba(11, 57, 250, 0.08);
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.faq-q-text {
  display: flex;
  align-items: center;
  gap: 16px;
  font-weight: 800;
  font-size: 16.5px;
  color: #111111;
}

.faq-num {
  font-size: 14px;
  font-weight: 900;
  color: #0B39FA;
  background: rgba(11, 57, 250, 0.08);
  padding: 4px 10px;
  border-radius: 8px;
}

.faq-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #FFFFFF;
  border-radius: 50%;
  border: 1px solid #EAECEF;
  color: #0B39FA;
  transition: background 0.2s ease;
}

.faq-item.open .faq-icon-wrap {
  background: #0B39FA;
  color: #FFFFFF;
  border-color: #0B39FA;
}

.faq-chevron {
  transition: transform 0.3s ease;
}

.faq-chevron.rotated {
  transform: rotate(180deg);
}

.faq-answer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #EAECEF;
  font-size: 14.5px;
  color: #444444;
  line-height: 1.65;
}

.faq-slide-enter-active,
.faq-slide-leave-active {
  transition: all 0.3s ease-out;
  max-height: 300px;
  opacity: 1;
  overflow: hidden;
}

.faq-slide-enter-from,
.faq-slide-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  margin-top: 0;
}

/* ==========================================================================
   7. CTA BANNER & FOOTER
   ========================================================================== */
.lp-cta-banner {
  background: #0B39FA;
  color: #FFFFFF;
  border-radius: 36px;
  padding: 60px 32px;
  text-align: center;
  position: relative;
  overflow: hidden;
  margin-bottom: 60px;
}

.cta-inner h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 36px;
  font-weight: 900;
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.cta-inner p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 28px 0;
}

.hero-cta-btn {
  background: #BAFF00;
  color: #000000;
  font-weight: 900;
  font-size: 16px;
  padding: 16px 36px;
  border-radius: 999px;
  text-decoration: none;
  display: inline-block;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  transition: transform 0.2s ease;
}

.hero-cta-btn:hover {
  transform: scale(1.05);
}

/* FOOTER */
.lp-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 32px;
  border-top: 1px solid #EAECEF;
}

.dark-logo {
  border: 1px solid #EAECEF;
}

.footer-left p {
  font-size: 12px;
  color: #777;
  margin-top: 8px;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-links a {
  color: #555;
  text-decoration: none;
  font-weight: 700;
  font-size: 13px;
}

.footer-links a:hover {
  color: #0B39FA;
}

/* ANIMATIONS */
@keyframes spinSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes floatSlow {
  0% { transform: translateY(0); }
  100% { transform: translateY(-12px); }
}

@keyframes pulseRotate {
  0% { transform: rotate(0deg) scale(1); }
  100% { transform: rotate(10deg) scale(1.08); }
}

/* RESPONSIVE */
@media (max-width: 992px) {
  .hero-title-line {
    font-size: 72px;
  }
  .features-trio-grid, .steps-grid {
    grid-template-columns: 1fr;
  }
  .trio-connector-arrow {
    display: none;
  }
  .stats-numbers-grid, .base-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .hero-glass-card {
    display: none;
  }
  .lp-nav {
    padding: 16px 20px;
  }
  .nav-center {
    display: none;
  }
}

@media (max-width: 600px) {
  .hero-title-line {
    font-size: 48px;
  }
  .stats-numbers-grid, .base-cards-grid {
    grid-template-columns: 1fr;
  }
  .lp-white-section {
    padding: 40px 20px;
    border-radius: 32px 32px 0 0;
  }
  .showcase-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
