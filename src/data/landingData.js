/**
 * src/data/landingData.js
 * ---------------------------------------------------------------------------
 * Static marketing content for the landing page.
 * Kept out of the view so the section components stay purely presentational.
 */

/** Anchor links rendered in the sticky nav (targets exist on the page). */
export const landingNavLinks = [
  { href: '#fitur', label: 'Fitur Utama' },
  { href: '#cara-kerja', label: 'Cara Kerja' },
  { href: '#komunitas', label: 'Base Komunitas' },
  { href: '#faq', label: 'FAQ' },
];

/**
 * Feature trio cards.
 * `preview` picks which mock-UI illustration is rendered inside the card.
 */
export const landingFeatures = [
  {
    title: 'KIRIM CONFESS ANONIM',
    desc: 'Tulis pesan tanpa ragu, 100% rahasia tanpa jejak data pribadi.',
    preview: 'anonim',
  },
  {
    title: 'AUTO-PUBLISH KE SOSMED',
    desc: 'Bot menyalurkan otomatis ke Instagram, Threads, & X.',
    preview: 'autopublish',
  },
  {
    title: 'ANALITIK & REAKSI REALTIME',
    desc: 'Pantau jumlah pembaca & reaksi komunitas dari setiap fess.',
    preview: 'analitik',
  },
];

/** "Cara kerja" — three step cards. */
export const landingSteps = [
  {
    number: '01',
    title: 'Pilih Base Komunitas',
    desc: 'Cari dan pilih Base sesuai topik yang kamu inginkan, mulai dari meme, dunia kampus, hingga teknologi.',
  },
  {
    number: '02',
    title: 'Tulis Confession Anonim',
    desc: 'Ketik pesanmu bebas tanpa khawatir. Sistem enkripsi data kami menjaga identitasmu 100% anonim.',
  },
  {
    number: '03',
    title: 'Auto-Posting Ke Sosmed',
    desc: 'Bot akan memverifikasi dan memposting pesanmu ke IG/Threads/X secara instan tanpa tunda.',
  },
];

/** Community showcase cards. */
export const landingSampleBases = [
  {
    name: 'Base Indonesia Memes',
    handle: '@basememes',
    members: '14.2K',
    initial: 'BM',
    color: '#0038FF',
    desc: 'Wadah fess meme paling kocak & viral se-Indonesia.',
  },
  {
    name: 'Developer & Tech Fess',
    handle: '@techdevs',
    members: '9.8K',
    initial: 'TD',
    color: '#7000FF',
    desc: 'Curhatan developer IT, coding, & kehidupan dunia kerja startup.',
  },
  {
    name: 'Kuliah & Kampus Fess',
    handle: '@kampusfess',
    members: '28.5K',
    initial: 'KF',
    color: '#FF0055',
    desc: 'Anonimitas mahasiswa dari seluruh universitas.',
  },
  {
    name: 'Curhat Malam Base',
    handle: '@curhatmalam',
    members: '42.1K',
    initial: 'CM',
    color: '#00B2FF',
    desc: 'Tempat aman meluapkan isi hati & pikiran tanpa di-judge.',
  },
];

/** Reputation / statistics row. */
export const landingStats = [
  { value: '120.4K+', label: 'Total Confession Terkirim' },
  { value: '48.2K', label: 'Pengguna Aktif Bulanan' },
  { value: '350+', label: 'Base Komunitas Terhubung' },
  { value: '0.00s', label: 'Delay Otomatisasi Post' },
];

/** FAQ accordion content. */
export const landingFaqs = [
  {
    q: 'Apakah pengiriman confession benar-benar 100% anonim?',
    a: 'Ya, 100%! Identitas, nama akun, maupun email kamu tidak pernah ditampilkan ke publik atau disimpan di postingan. Pesan diproses secara anonim.',
  },
  {
    q: 'Bagaimana cara kerja bot otomatis memposting ke Instagram, Threads, dan X?',
    a: 'Setelah confession kamu dikirim dan lolos verifikasi moderasi AI/Admin, bot terintegrasi kami akan langsung membuat desain gambar dan memposting pesan tersebut ke akun sosial media Base secara otomatis & realtime.',
  },
  {
    q: 'Apakah gratis untuk mengirim Fess?',
    a: 'Pengiriman pesan dasar 100% gratis tanpa biaya apapun. Kamu bisa mengirim pesan ke Base favorit kapan saja.',
  },
  {
    q: 'Apakah saya wajib mendaftar akun untuk mengirim Fess?',
    a: 'Kamu bisa mengirim pesan secara langsung melalui form publik tanpa ribet, atau mendaftar akun untuk menyimpan riwayat dan mengelola fess buatanmu.',
  },
  {
    q: 'Berapa lama proses hingga fess saya disetujui dan terbit di sosial media?',
    a: 'Proses moderasi AI berlangsung secara realtime kurang dari 5 detik. Jika lolos filter kata sensitif, bot akan langsung mengunggahnya detik itu juga.',
  },
  {
    q: 'Bagaimana jika pesan confession saya melanggar aturan komunitas?',
    a: 'Platform kami dilengkapi sistem moderasi AI otomatis. Pesan yang mengandung ujaran kebencian, doxxing, atau spam akan otomatis ditolak demi menjaga kenyamanan bersama.',
  },
  {
    q: 'Bisakah saya mendaftarkan dan mengelola Base Komunitas milik saya sendiri?',
    a: 'Tentu saja! Kamu dapat mendaftarkan Base baru melalui dashboard, menghubungkan akun sosmed milikmu, dan menentukan aturan moderasi komunitasmu sendiri.',
  },
  {
    q: 'Bagaimana cara melaporkan pesan yang tidak pantas?',
    a: 'Setiap postingan dilengkapi tombol "Laporkan" (Report). Jika pesan menerima laporan dari pengguna, moderasi akan membekukan sementara postingan tersebut untuk ditinjau ulang.',
  },
  {
    q: 'Bisakah saya menghapus fess yang telah terunggah?',
    a: 'Jika kamu login saat mengirim fess, kamu dapat mengajukan permintaan hapus langsung melalui menu riwayat fess di profil akunmu.',
  },
  {
    q: 'Apakah platform ini aman dari pelacakan IP address?',
    a: 'Sangat aman. Kami menerapkan sistem enkripsi dan tidak menyimpan log IP pengirim yang menghubungkan identitas asli dengan konten yang ditulis.',
  },
];
