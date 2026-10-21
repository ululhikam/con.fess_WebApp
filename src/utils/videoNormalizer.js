/**
 * Normalisasi video di browser dengan ffmpeg.wasm.
 *
 * Instagram mensyaratkan semua item carousel punya rasio yang sama. Video
 * user dinormalkan ke 1080×1350 (4:5) dengan mode "contain" (pad putih),
 * dipotong maksimal 60 detik, dan di-encode H.264/AAC agar diterima Meta.
 *
 * Core ffmpeg disajikan dari /ffmpeg (domain sendiri) — bukan CDN.
 */

const TARGET_WIDTH = 1080;
const TARGET_HEIGHT = 1350;
const MAX_DURATION = 60;
const MAX_OUTPUT_BYTES = 96 * 1024 * 1024; // beri margin dari batas Meta 100MB
const CORE_BASE = `${import.meta.env.BASE_URL || '/'}ffmpeg/`;

let ffmpegInstance = null;
let ffmpegLoading = null;
let activeProgress = null;
// Satu instance ffmpeg.wasm tidak boleh menjalankan dua transcode sekaligus.
// Antrekan agar pemilihan beberapa video tetap aman dan hasilnya tidak rusak.
let ffmpegQueue = Promise.resolve();

function enqueueFfmpeg(task) {
  const run = ffmpegQueue.then(task, task);
  ffmpegQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

async function getFFmpeg() {
  if (ffmpegInstance) return ffmpegInstance;
  if (ffmpegLoading) return ffmpegLoading;

  ffmpegLoading = (async () => {
    const [{ FFmpeg }, { toBlobURL, fetchFile }] = await Promise.all([
      import('@ffmpeg/ffmpeg'),
      import('@ffmpeg/util'),
    ]);

    const ffmpeg = new FFmpeg();
    ffmpeg.on('progress', ({ progress }) => {
      activeProgress?.(clamp01(progress));
    });

    const [coreURL, wasmURL] = await Promise.all([
      toBlobURL(`${CORE_BASE}ffmpeg-core.js`, 'text/javascript'),
      toBlobURL(`${CORE_BASE}ffmpeg-core.wasm`, 'application/wasm'),
    ]);

    await ffmpeg.load({ coreURL, wasmURL });
    ffmpegInstance = ffmpeg;
    // Simpan fetchFile untuk writeFile di pemanggil.
    ffmpeg.__fetchFile = fetchFile;
    return ffmpeg;
  })();

  try {
    return await ffmpegLoading;
  } catch (err) {
    ffmpegLoading = null;
    throw new Error(
      `Gagal memuat pemroses video (ffmpeg.wasm): ${err?.message || err}. ` +
        'Coba unggah video MP4 4:5 maksimal 60 detik, atau gunakan koneksi yang lebih stabil.',
    );
  }
}

/** Baca dimensi & durasi video lewat elemen <video> (tanpa ffmpeg). */
export function probeVideo(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    let settled = false;

    const cleanup = () => {
      video.removeAttribute('src');
      video.load?.();
      URL.revokeObjectURL(objectUrl);
    };

    const finish = (result, error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      cleanup();
      error ? reject(error) : resolve(result);
    };

    const timer = window.setTimeout(
      () => finish(null, new Error('Tidak bisa membaca metadata video (timeout).')),
      15000,
    );

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => {
      finish({
        width: Number(video.videoWidth) || 0,
        height: Number(video.videoHeight) || 0,
        duration: Number(video.duration) || 0,
      });
    };
    video.onerror = () => finish(null, new Error('Format video tidak bisa dibaca browser.'));
    video.src = objectUrl;
  });
}

function baseName(name) {
  return String(name || 'video').replace(/\.[^.]+$/, '') || 'video';
}

/**
 * @param {File} file
 * @param {{ onStatus?: (message: string, progress?: number) => void }} options
 */
export async function normalizeVideoFile(file, { onStatus } = {}) {
  onStatus?.('Memeriksa video…', 0.05);
  const meta = await probeVideo(file);

  if (!meta.width || !meta.height) {
    throw new Error('Dimensi video tidak terdeteksi. Coba unggah ulang video.');
  }

  // Jalur cepat: MP4, sudah 1080×1350, dan ≤ 60 detik. Tidak perlu transcode.
  const isMp4 = file.type === 'video/mp4' || /\.mp4$/i.test(file.name || '');
  if (
    isMp4 &&
    meta.width === TARGET_WIDTH &&
    meta.height === TARGET_HEIGHT &&
    meta.duration > 0 &&
    meta.duration <= MAX_DURATION + 0.5
  ) {
    return {
      file,
      width: meta.width,
      height: meta.height,
      duration: meta.duration,
      trimmed: false,
      normalized: false,
    };
  }

  if (meta.duration > MAX_DURATION + 0.5) {
    onStatus?.(`Video ${Math.round(meta.duration)} dtk akan dipotong ke 60 dtk pertama.`, 0.08);
  } else {
    onStatus?.('Menyiapkan video 4:5…', 0.08);
  }

  const ffmpeg = await getFFmpeg();
  const inputName = `input_${Date.now()}.${(file.name.split('.').pop() || 'mp4').toLowerCase()}`;
  const outputName = `output_${Date.now()}.mp4`;
  const fetchFile = ffmpeg.__fetchFile;

  return enqueueFfmpeg(async () => {
    activeProgress = (progress) => {
      // Map progres ffmpeg ke 10–85%; sisa 15% untuk upload.
      const percent = 0.1 + progress * 0.75;
      onStatus?.(`Memproses video 4:5… ${Math.round(progress * 100)}%`, percent);
    };

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const filter =
        `scale=${TARGET_WIDTH}:${TARGET_HEIGHT}:force_original_aspect_ratio=decrease:flags=lanczos,` +
        `pad=${TARGET_WIDTH}:${TARGET_HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=white,setsar=1`;

      let data = null;
      for (const crf of [23, 28, 32, 35]) {
        onStatus?.('Mengompres video…', 0.5);
        const code = await ffmpeg.exec([
          '-y',
          '-i',
          inputName,
          '-t',
          String(MAX_DURATION),
          '-vf',
          filter,
          '-map',
          '0:v:0',
          '-map',
          '0:a?',
          '-c:v',
          'libx264',
          '-preset',
          'veryfast',
          '-crf',
          String(crf),
          '-maxrate',
          '8M',
          '-bufsize',
          '16M',
          '-pix_fmt',
          'yuv420p',
          '-c:a',
          'aac',
          '-b:a',
          '128k',
          '-movflags',
          '+faststart',
          '-r',
          '30',
          outputName,
        ]);
        if (code !== 0) {
          throw new Error(`ffmpeg gagal mengolah video (kode ${code}).`);
        }
        data = await ffmpeg.readFile(outputName);
        if (data?.length && data.length <= MAX_OUTPUT_BYTES) break;
        await ffmpeg.deleteFile(outputName).catch(() => {});
      }

      if (!data?.length) {
        throw new Error('Video hasil pemrosesan kosong.');
      }
      if (data.length > MAX_OUTPUT_BYTES) {
        throw new Error(
          'Video masih lebih dari 96MB setelah dikompres. Potong durasinya atau gunakan video yang lebih ringan.',
        );
      }

      const blob = new Blob([data], { type: 'video/mp4' });
      const normalizedFile = new File([blob], `${baseName(file.name)}-ig-4x5.mp4`, {
        type: 'video/mp4',
        lastModified: Date.now(),
      });

      return {
        file: normalizedFile,
        width: TARGET_WIDTH,
        height: TARGET_HEIGHT,
        duration: Math.min(meta.duration || MAX_DURATION, MAX_DURATION),
        trimmed: meta.duration > MAX_DURATION + 0.5,
        normalized: true,
      };
    } finally {
      activeProgress = null;
      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});
    }
  });
}
