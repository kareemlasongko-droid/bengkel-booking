# Sistem Booking Bengkel

Sistem booking servis mobil untuk pelanggan — implementasi setia dari design
terlampir (`Main.dc.html`), ditambah **panel admin bengkel** agar menjadi
sistem yang utuh: pelanggan membuat booking, admin melihat dan
mengubah statusnya.

## Halaman

| File | Isi |
|---|---|
| `index.html` | Alur booking pelanggan (mobile-first, 440px): 5 langkah — Nomor WhatsApp → OTP → Mobil → Servis → Jadwal → Konfirmasi → Berhasil |
| `admin.html` | Panel admin: statistik, filter status, daftar booking, alur status (Tiba → Dikerjakan → Selesai), batalkan/hapus |

## Cara menjalankan

Tanpa dependensi apa pun — semua sudah terkompilasi dan React di-vendor
lokal di `vendor/`:

```bash
# dari folder ini
python3 -m http.server 8000
# buka http://localhost:8000  (pelanggan)
# buka http://localhost:8000/admin.html  (admin)
```

Atau cukup buka `index.html` langsung di browser (file://) — tetap berjalan.

## Deploy ke Vercel

Proyek ini **situs statis murni** (dua halaman HTML + JS yang sudah
terkompilasi), jadi di Vercel memakai preset **Other** dengan root direktori
repo. Semuanya sudah diatur di `vercel.json`, jadi tidak perlu mengubah
Framework Preset lewat dashboard:

```json
{
  "framework": null,
  "installCommand": "npm install --no-audit --no-fund",
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "."
}
```

Arti tiap baris:

| Kunci | Nilai | Kenapa |
|---|---|---|
| `framework` | `null` = preset **Other** | proyek bukan Next.js/Vite/CRA; Vercel tidak akan menebak-nebak framework |
| `installCommand` | `npm install` | hanya perlu untuk esbuild (devDependency) |
| `buildCommand` | `npm run vercel-build` → `npm run build` | mengompilasi `src/app.jsx` & `src/admin.jsx` jadi `app.js` & `admin.js`; hasil build juga sudah ikut di repo |
| `outputDirectory` | `"."` (root repo) | `index.html` & `admin.html` ada di root, bukan di `public/` atau `dist/` |

Langkah deploy:

1. Buka [vercel.com/new](https://vercel.com/new) → import repo ini.
2. **Root Directory** biarkan kosong (root repo) — jangan diarahkan ke subfolder.
3. Framework Preset, Build Command, dan Output Directory **biarkan apa adanya**;
   `vercel.json` yang menentukannya (nilainya menimpa setting dashboard).
4. Deploy. Hasilnya:
   - `/` → halaman pelanggan (`index.html`)
   - `/admin.html` → panel admin

Catatan:

- Tautan antar-halaman memakai path relatif (`admin.html`, `index.html`,
  `./vendor/...`, `./app.js`), jadi tetap jalan baik di root domain maupun di
  preview deployment — tidak ada URL absolut yang perlu diubah.
- `.vercelignore` mencegah `node_modules`, artefak tunnel lama (`tunnel.log`,
  `tunnel-watchdog.sh`, `PUBLIC_URL.txt`), dan `README.md` ikut ter-upload
  sebagai file publik.
- `node_modules/` di-`.gitignore`; `package-lock.json` ikut di-commit supaya
  versi esbuild saat build di Vercel sama dengan di lokal.
- Data booking tetap disimpan di `localStorage` browser (tanpa backend), jadi
  di Vercel pun tidak butuh database atau environment variable. Lihat bagian
  *Menyambung ke backend sungguhan* bila ingin data terpusat.
- `npm run start` (python http.server) hanya untuk lokal; Vercel tidak
  menjalankan server apa pun.

## Logika yang di-port dari design

Semua perilaku design dipertahankan:

- Progress bar 5 segmen + tombol kembali; label CTA per langkah
  (`Kirim kode`, `Verifikasi`, `Lanjut`, `Konfirmasi booking`).
- Validasi: nomor WA ≥ 9 digit; OTP 4 digit; minimal 1 mobil; jika peran
  *pengantar* maka WA pemilik wajib diisi; semua mobil wajib punya servis;
  jadwal harus valid.
- Mobil dapat dipilih lebih dari satu + tambah mobil baru.
- Peran *Pemilik* / *Mengantar (supir atau kerabat)* dengan nomor WA pemilik.
- 6 opsi servis per mobil (ganti oli, servis berkala, rem, AC, ada keluhan,
  minta dicek) dengan hint durasi + kolom catatan.
- Pilihan tunggu/ditinggal, 5 tanggal, 5 mekanik (termasuk *Otomatis*),
  6 jam datang. Slot menjadi **Penuh** jika kuota jam < jumlah mobil yang
  dipilih atau mekanik terpilih sedang sibuk di jam itu.
- Kotak **Perkiraan**: estimasi selesai dari durasi servis terpanjang;
  jika ada mobil "minta dicek", teks beralih ke estimasi setelah cek.
- Layar berhasil: kode booking (urutan dari `BK-0271`), preview pesan
  WhatsApp, 4 langkah "Setelah ini" (dinamis sesuai peran & pilihan tunggu),
  dan tombol buat booking baru.

## Yang ditambahkan di luar design

- **Panel admin** (`admin.html`) — design hanya berisi sisi pelanggan.
  Status booking dapat digerakkan: Konfirmasi → Tiba → Dikerjakan → Selesai
  (atau Dibatalkan). Ada data contoh ("Muat data contoh").
- **Persistensi**: booking tersimpan di `localStorage` (kunci
  `bengkel.bookings.v1`), jadi pelanggan dan admin di browser yang sama
  saling terhubung tanpa backend.
- **Pilihan warna aksen** (titik warna di bawah CTA) — sesuai prop `accent`
  di design dengan 4 opsi warna.
- Tautan *Panel admin bengkel →* di bagian bawah halaman pelanggan.

## Struktur

```
bengkel-booking/
├── index.html          # halaman pelanggan
├── admin.html          # halaman admin
├── booking.js          # lapisan data bersama (localStorage) + data contoh
├── app.js              # aplikasi pelanggan (sudah terkompilasi)
├── admin.js            # aplikasi admin (sudah terkompilasi)
├── src/
│   ├── app.jsx         # sumber aplikasi pelanggan (React JSX)
│   └── admin.jsx       # sumber aplikasi admin (React JSX)
├── vendor/
│   ├── react.js        # React 18 (UMD, lokal — tanpa CDN)
│   └── react-dom.js
├── package.json        # skrip build (esbuild) + vercel-build
├── package-lock.json   # versi esbuild terkunci untuk build di Vercel
├── vercel.json         # preset deploy: Other, build, output = root
├── .vercelignore       # file yang tidak di-upload/di-serve di Vercel
└── .gitignore          # node_modules, .vercel, dll.
```

## Kustomisasi

| Yang mau diubah | Lokasi |
|---|---|
| Nama bengkel | Cari-ganti `[Nama Bengkel]` di `src/app.jsx` & `src/admin.jsx`, lalu build |
| Daftar servis + durasi | `SERVICES` di `src/app.jsx` |
| Jam & kuota per jam | `SLOTS` di `src/app.jsx` |
| Mekanik + jam sibuk | `MECHS` di `src/app.jsx` |
| Tanggal yang bisa dipilih | `DAYS` di `src/app.jsx` |
| Warna aksen | `ACCENTS` di `src/app.jsx` |
| Alur status admin | `NEXT_ACTION` & `BOOKING_STATUS` di `src/admin.jsx` / `booking.js` |

## Menyambung ke backend sungguhan

Semua akses data terpusat di `booking.js`:

```js
loadBookings()          // daftar booking
saveBooking(data)       // tambah booking (kembali dengan id)
updateBookingStatus(id, status)
deleteBooking(id)
nextCode()              // penomoran BK-0001...
```

Ganti isi fungsi-fungsi itu dengan `fetch()` ke API Anda — dua halaman
tidak perlu diubah. Untuk produksi juga tambahkan: pengiriman OTP WhatsApp
sesungguhnya (saat ini: "ketik 4 angka apa saja"), autentikasi admin,
dan database.

## Build ulang (setelah mengedit `src/`)

```bash
npm install     # sekali saja (mengunduh esbuild)
npm run build   # menulis ulang app.js & admin.js
```

Hasil build sudah disertakan, jadi build ulang hanya perlu jika Anda
mengedit sumber JSX.
