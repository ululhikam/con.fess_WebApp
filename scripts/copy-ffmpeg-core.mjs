import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Salin core ffmpeg.wasm ke public/ffmpeg supaya browser mengambilnya dari
 * domain Vercel sendiri (tanpa CDN pihak ketiga). Dijalankan otomatis saat
 * `npm install`, dan aman dijalankan ulang.
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreRoot = path.join(root, 'node_modules', '@ffmpeg', 'core');
const target = path.join(root, 'public', 'ffmpeg');

function findFiles(dir, names, found = []) {
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findFiles(full, names, found);
    } else if (names.includes(entry.name)) {
      found.push(full);
    }
  }
  return found;
}

fs.mkdirSync(target, { recursive: true });

const wanted = ['ffmpeg-core.js', 'ffmpeg-core.wasm', 'ffmpeg-core.worker.js'];
const found = findFiles(coreRoot, wanted);

// Prioritaskan build ESM (cocok dengan @ffmpeg/ffmpeg 0.12.x).
found.sort((a, b) => {
  const score = (file) => (file.includes(`${path.sep}esm${path.sep}`) ? 0 : 1);
  return score(a) - score(b);
});

for (const name of wanted) {
  const source = found.find((file) => path.basename(file) === name);
  if (!source) {
    console.warn(`[ffmpeg] ${name} tidak ditemukan di @ffmpeg/core; lewati.`);
    continue;
  }
  const destination = path.join(target, name);
  fs.copyFileSync(source, destination);
  const sizeMb = (fs.statSync(destination).size / 1024 / 1024).toFixed(1);
  console.log(`[ffmpeg] ${name} → public/ffmpeg (${sizeMb} MB)`);
}

if (!fs.existsSync(path.join(target, 'ffmpeg-core.js'))) {
  console.warn('[ffmpeg] Core belum tersedia. Jalankan npm install ulang.');
}
