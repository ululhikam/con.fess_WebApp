/**
 * Konten legal Fess n Curious — satu sumber untuk panel in-app
 * (AccountPanels.vue) dan halaman publik Meta App Review
 * (/privacy, /terms, /data-deletion di LegalPage.vue).
 */

export const LEGAL_LAST_UPDATED = '24 Oktober 2026';
export const LEGAL_CONTACT_EMAIL = 'fessncurious@gmail.com';

export const TERMS_SECTIONS = [
  {
    title: '1. Penerimaan Ketentuan',
    paragraphs: [
      'Dengan mengakses atau menggunakan layanan Fess n Curious ("Platform"), kamu menyetujui ketentuan layanan ini secara menyeluruh. Jika tidak setuju, harap hentikan penggunaan Platform.',
      'Fess n Curious berhak memperbarui ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui notifikasi di dalam aplikasi atau email terdaftar.',
    ],
  },
  {
    title: '2. Layanan Platform',
    paragraphs: [
      'Fess n Curious menyediakan platform pengiriman pesan anonim (confession/fess) dalam berbagai komunitas tematik yang disebut "Base". Setiap Base dikelola oleh Base Admin yang telah terverifikasi.',
      'Penggunaan Platform hanya diperuntukkan bagi pengguna berusia 13 tahun ke atas. Pengguna di bawah 17 tahun wajib mendapat izin orang tua atau wali.',
    ],
  },
  {
    title: '3. Konten Terlarang',
    paragraphs: [
      'Dilarang keras mengirim konten yang mengandung: SARA, pelecehan seksual, kekerasan eksplisit, informasi palsu (hoaks), promosi produk ilegal, atau konten yang melanggar hak cipta pihak ketiga.',
      'Pelanggaran dapat mengakibatkan pembekuan akun sementara hingga penutupan akun permanen tanpa pengembalian saldo CTF.',
    ],
  },
  {
    title: '4. Mata Uang Virtual (CTF)',
    paragraphs: [
      'CTF (Coin to Fess) adalah mata uang virtual yang hanya berlaku di dalam ekosistem Fess n Curious. CTF tidak dapat dikonversi kembali ke uang tunai atau mata uang lainnya.',
      'Setiap fess yang diterbitkan di base berbayar memotong 1 CTF. Base baru dapat memperoleh masa trial 7 hari (satu kali per kreator) tanpa potongan CTF, dan base dengan status gratis permanen tidak memotong CTF. Ketentuan biaya selalu ditampilkan di composer sebelum fess dikirim.',
      'CTF dikembalikan otomatis jika fess ditolak atau dihapus sebelum pertama kali terbit. Setelah fess pernah terbit, CTF tidak dapat dikembalikan. Top up CTF bersifat final dan tidak dapat dikembalikan (non-refundable), kecuali terdapat kesalahan teknis yang terbukti dari pihak Fess n Curious.',
    ],
  },
  {
    title: '5. Privasi & Keamanan',
    paragraphs: [
      'Fess n Curious berkomitmen melindungi privasi penggunanya. Sistem anonymisasi berlapis memastikan identitas kamu tidak bocor ke publik atau sesama pengguna.',
      'Data pengguna tidak dijual atau dibagikan kepada pihak ketiga untuk keperluan komersial tanpa persetujuan eksplisit.',
    ],
  },
  {
    title: '6. Pembatasan Tanggung Jawab',
    paragraphs: [
      'Fess n Curious tidak bertanggung jawab atas konten yang dikirim oleh pengguna. Tanggung jawab konten sepenuhnya berada pada pengirim.',
      'Platform disediakan "as is". Fess n Curious tidak menjamin ketersediaan layanan 100% dan tidak bertanggung jawab atas kerugian akibat gangguan sistem.',
    ],
  },
];

export const PRIVACY_SECTIONS = [
  {
    title: '1. Informasi yang Kami Kumpulkan',
    paragraphs: [
      'Saat mendaftar: email, username/alias, dan password yang terenkripsi. Kami tidak menyimpan password dalam bentuk teks biasa.',
      'Saat menggunakan Platform: fess yang kamu kirim (terenkripsi), riwayat voting, base yang diikuti, dan data penggunaan aplikasi yang anonim untuk keperluan analitik internal.',
      'Saat top up CTF: ID pesanan, nominal, metode pembayaran, dan status transaksi dari Midtrans. Kami tidak menyimpan nomor kartu atau kredensial pembayaran kamu.',
    ],
  },
  {
    title: '2. Cara Kami Menggunakan Data',
    paragraphs: [
      'Data digunakan untuk: menyediakan dan meningkatkan layanan, verifikasi akun, moderasi konten, pencegahan penipuan, dan komunikasi terkait akun (contoh: notifikasi moderasi).',
      'Kami tidak menggunakan data kamu untuk iklan bertarget dari pihak ketiga.',
    ],
  },
  {
    title: '3. Anonymisasi & Perlindungan Identitas',
    paragraphs: [
      'Fess n Curious menggunakan sistem anonymisasi berlapis. Fess yang kamu kirim diproses melalui sistem enkripsi sebelum diteruskan ke Base Admin. Base Admin tidak dapat mengetahui identitas asli pengirim fess.',
      'Handle publik yang muncul di komentar adalah alias acak yang berbeda di setiap thread — tidak terhubung dengan akun asli kamu.',
    ],
  },
  {
    title: '4. Berbagi Data dengan Pihak Ketiga',
    paragraphs: [
      'Kami tidak menjual data pribadi kamu kepada pihak ketiga. Data hanya dibagikan dalam kondisi: (a) kamu memberikan persetujuan eksplisit, (b) diwajibkan oleh hukum, atau (c) untuk melindungi keamanan pengguna lain.',
      'Penyedia layanan teknis (server, analitik) yang kami gunakan terikat perjanjian kerahasiaan dan tidak diizinkan menggunakan data untuk tujuan lain.',
    ],
  },
  {
    title: '5. Keamanan Data',
    paragraphs: [
      'Kami menggunakan enkripsi TLS untuk semua transmisi data dan enkripsi AES-256 untuk data sensitif yang disimpan di server.',
      'Meskipun demikian, tidak ada sistem yang 100% aman. Kami menyarankan kamu menggunakan password yang kuat dan mengaktifkan 2FA.',
    ],
  },
  {
    title: '6. Hak Pengguna',
    paragraphs: [
      'Kamu berhak untuk: mengakses data pribadi kamu, memperbaiki data yang tidak akurat, meminta penghapusan akun dan seluruh data terkait, serta mengunduh salinan data kamu (data portability).',
      `Untuk mengajukan permintaan terkait data, hubungi kami di ${LEGAL_CONTACT_EMAIL} atau melalui menu Bantuan di dalam aplikasi.`,
    ],
  },
  {
    title: '7. Cookie & Penyimpanan Lokal',
    paragraphs: [
      'Fess n Curious menggunakan localStorage browser untuk menyimpan sesi login dan preferensi tema. Tidak ada cookie pihak ketiga untuk pelacakan iklan yang dipasang di Platform.',
    ],
  },
  {
    title: '8. Integrasi Instagram (Meta Platforms)',
    paragraphs: [
      'Saat Base Admin menghubungkan akun Instagram profesional ke Fess n Curious melalui Login Meta (OAuth), kami menerima dari Meta: nama pengguna Instagram, ID akun Instagram (Instagram-scoped ID), dan access token yang mewakili izin publikasi.',
      'Data tersebut hanya digunakan untuk mempublikasikan fess yang telah disetujui ke akun Instagram base yang bersangkutan (Feed, Carousel, atau Reels) melalui Meta Content Publishing API — tidak untuk iklan, analitik pihak ketiga, maupun tujuan lain.',
      'Access token disimpan di server kami dan hanya dipakai untuk publikasi otomatis. Base Admin dapat memutuskan koneksi kapan saja melalui panel "Koneksi Media Sosial" di dashboard admin base, atau mencabut akses aplikasi dari pengaturan Instagram (Apps and Websites). Setelah diputus, token dihapus dari server kami.',
      `Permintaan penghapusan data terkait Instagram dapat diajukan melalui halaman Penghapusan Data atau email ${LEGAL_CONTACT_EMAIL}.`,
    ],
  },
];

export const DATA_DELETION_SECTIONS = [
  {
    title: 'Ringkasan',
    paragraphs: [
      'Fess n Curious menghormati hak kamu untuk menghapus data pribadi. Halaman ini menjelaskan cara meminta penghapusan data akun maupun data yang kami terima dari Instagram (Meta) saat akun Instagram base dihubungkan ke platform.',
    ],
  },
  {
    title: '1. Memutuskan & Menghapus Data Instagram (Meta)',
    paragraphs: [
      'Di dalam aplikasi: buka Dashboard Base Admin → "Koneksi Media Sosial" → tekan "Putuskan Koneksi" pada kartu Instagram. Access token Instagram akan dihapus dari server kami.',
      'Melalui Instagram: kamu juga dapat mencabut akses aplikasi kapan saja dari aplikasi Instagram — Settings → Apps and websites → pilih Fess n Curious → Remove.',
      `Permintaan hapus permanen: kirim email ke ${LEGAL_CONTACT_EMAIL} dengan subjek "Hapus Data Instagram" — kami menghapus username, ID akun, dan token yang tersimpan paling lambat 30 hari setelah verifikasi.`,
    ],
  },
  {
    title: '2. Menghapus Akun & Data Lainnya',
    paragraphs: [
      `Kirim permintaan penghapusan akun ke ${LEGAL_CONTACT_EMAIL} dari email terdaftar akunmu, atau melalui menu Bantuan di dalam aplikasi.`,
      'Setelah permintaan diverifikasi, akun beserta data terkait (profil, fess, komentar, riwayat) dihapus permanen paling lambat 30 hari kerja. Data anonim yang tidak dapat dikaitkan dengan identitas dapat tetap tersimpan untuk keperluan statistik.',
    ],
  },
  {
    title: '3. Kontak',
    paragraphs: [
      `Pertanyaan seputar privasi & penghapusan data: ${LEGAL_CONTACT_EMAIL}.`,
      'Detail lengkap pengelolaan data tersedia di halaman Kebijakan Privasi.',
    ],
  },
];
