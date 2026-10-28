/* ============================================================
 *  build-static.mjs — menyiapkan folder `public/` untuk Vercel
 *
 *  Situs ini ditulis di root repo (index.html, admin.html, dll).
 *  Preset "Other" di Vercel menyajikan `public/` jika ada, jadi
 *  langkah build ini menyalin hasil kompilasi + aset ke `public/`
 *  supaya deploy tidak bergantung pada `outputDirectory: "."`.
 *
 *  Tidak ada yang diubah dari file sumber: hanya menyalin.
 *  Root repo tetap bisa dibuka langsung (index.html) seperti biasa.
 * ============================================================ */

import { access, cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public');

/* File yang wajib ada di root dan ikut disajikan */
const FILES = ['index.html', 'admin.html', 'mech.html', 'app.js', 'admin.js', 'mech.js', 'booking.js'];
/* Folder aset yang ikut disalin */
const DIRS = ['vendor'];

async function exists(p) {
  try { await access(p); return true; } catch (e) { return false; }
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  for (const file of FILES) {
    const src = path.join(ROOT, file);
    if (!(await exists(src))) {
      console.error(`build-static: file wajib tidak ditemukan: ${file}`);
      console.error('Jalankan "npm run build" lebih dulu (vercel-build melakukannya otomatis).');
      process.exit(1);
    }
    await cp(src, path.join(OUT, file));
  }

  for (const dir of DIRS) {
    const src = path.join(ROOT, dir);
    if (!(await exists(src))) {
      console.error(`build-static: folder wajib tidak ditemukan: ${dir}`);
      process.exit(1);
    }
    await cp(src, path.join(OUT, dir), { recursive: true });
  }

  const total = FILES.length + DIRS.length;
  console.log(`build-static: public/ siap (${total} entri) → ${FILES.join(', ')}, ${DIRS.join(', ')}/`);
}

main().catch((err) => {
  console.error('build-static gagal:', err);
  process.exit(1);
});
