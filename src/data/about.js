/**
 * Konten halaman Tentang Kami (/about) — satu sumber isi, dipisah dari
 * presentasi supaya teks mudah ditinjau tanpa menyentuh markup.
 *
 * Semua klaim di sini harus mencerminkan fitur yang benar-benar ada di
 * platform. Jangan menambah angka statistik tanpa data nyata.
 */
import { ORGANIZER_NAME, ORGANIZER_URL } from './organization';

export const ABOUT_HERO = {
  badge: 'TENTANG KAMI',
  title: 'Ruang aman untuk bicara jujur',
  subtitle:
    'Fess n Curious adalah platform pesan anonim berbasis komunitas. Kami membangun tempat orang bisa menyampaikan isi pikirannya tanpa harus membuka identitasnya.',
};

export const ABOUT_STORY = {
  title: 'Berawal dari satu pertanyaan sederhana',
  paragraphs: [
    'Banyak orang punya sesuatu yang ingin disampaikan tetapi menahan diri karena takut diketahui. Bukan karena isinya salah, melainkan karena identitasnya bisa menimbulkan konsekuensi sosial.',
    'Fess n Curious hadir untuk menutup jarak itu. Kamu menulis pesan, sistem menyamarkan identitasmu, lalu pesan itu dibaca oleh komunitas yang relevan. Tidak ada nama, tidak ada jejak publik yang bisa dilacak balik ke akunmu.',
    'Kami menyebut pesan itu "fess" dan komunitasnya "Base". Setiap Base punya topik dan pengelolanya sendiri, sementara aturan tingkat platform berlaku untuk semuanya.',
  ],
};

export const ABOUT_VALUES = [
  {
    icon: 'ShieldCheck',
    title: 'Anonim sejak awal',
    desc: 'Identitas disamarkan berlapis. Base Admin pun tidak bisa melihat siapa pengirim fess. Handle di komentar adalah alias acak yang berbeda di setiap thread.',
  },
  {
    icon: 'MessagesSquare',
    title: 'Komunitas yang dijaga',
    desc: 'Setiap fess melewati moderasi sebelum terbit. Konten SARA, pelecehan, dan kekerasan eksplisit ditolak agar ruang ini tetap layak dipakai.',
  },
  {
    icon: 'Sparkles',
    title: 'Terbit tanpa ribet',
    desc: 'Base yang akun Instagram-nya sudah terhubung bisa menerbitkan fess otomatis ke feed. Kalau belum terhubung, fess tetap tayang normal di FnC.',
  },
  {
    icon: 'Coins',
    title: 'Biaya yang transparan',
    desc: 'Fess di base berbayar memotong 1 CTF, dan selalu ditampilkan di composer sebelum kamu mengirim. Base baru mendapat masa trial, base gratis permanen tanpa potongan.',
  },
];

export const ABOUT_ORGANIZER = {
  title: `Dibangun oleh ${ORGANIZER_NAME}`,
  paragraphs: [
    `Fess n Curious adalah produk yang dirancang, dibangun, dan dikelola oleh ${ORGANIZER_NAME}. Seluruh pengembangan teknis, infrastruktur, moderasi tingkat platform, dan pengelolaan data pengguna berada di bawah tanggung jawab ${ORGANIZER_NAME}.`,
    `Base dikelola oleh Base Admin masing-masing sebagai pengelola komunitas. Namun penyelenggara layanan tetap ${ORGANIZER_NAME} — bukan pihak per base.`,
    `Informasi resmi ${ORGANIZER_NAME} dapat dilihat di ${ORGANIZER_URL}.`,
  ],
};

export const ABOUT_CONTACT = {
  title: 'Ada yang ingin ditanyakan?',
  desc: 'Pertanyaan soal platform, kerja sama, atau laporan terkait data bisa dikirim ke email resmi kami.',
};
