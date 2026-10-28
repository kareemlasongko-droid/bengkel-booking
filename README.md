# Sistem Booking Bengkel

Sistem booking servis mobil untuk pelanggan — implementasi setia dari design
terlampir (`Main.dc.html`), ditambah **panel admin bengkel** dan **portal
mekanik** agar menjadi sistem yang utuh: pelanggan membuat booking, admin
melihat dan mengubah statusnya, mekanik mengerjakan dan menandai selesai.

## Halaman

| File | Isi |
|---|---|
| `index.html` | Alur booking pelanggan (mobile-first, 440px): 5 langkah — Nomor WhatsApp → OTP → Mobil → Servis → Jadwal → Konfirmasi → Berhasil |
| `admin.html` | Panel admin operasional: KPI per tanggal servis, verifikasi check-in, penugasan mekanik per mobil, walk-in, reschedule, batal/tidak datang dengan alasan, arsip, audit trail |
| `mech.html` | Portal mekanik: **masuk per mekanik** (nomor HP + PIN), hanya melihat tugasnya sendiri, ambil tugas yang belum ditugaskan, progres per mobil, mulai & selesaikan pekerjaan, tombol keluar |

## Cara menjalankan

Tanpa dependensi apa pun — semua sudah terkompilasi dan React di-vendor
lokal di `vendor/`:

```bash
# dari folder ini
python3 -m http.server 8000
# buka http://localhost:8000            (pelanggan)
# buka http://localhost:8000/admin.html  (admin)
# buka http://localhost:8000/mech.html   (mekanik)
```

Atau cukup buka `index.html` langsung di browser (file://) — tetap berjalan.

## Deploy ke Vercel

Proyek ini **situs statis murni** (dua halaman HTML + JS yang sudah
terkompilasi). Semuanya diatur di `vercel.json`, jadi tidak perlu menyentuh
Framework Preset / Build Command / Output Directory di dashboard:

```json
{
  "framework": null,
  "installCommand": "npm install --no-audit --no-fund",
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "public"
}
```

Arti tiap baris:

| Kunci | Nilai | Kenapa |
|---|---|---|
| `framework` | `null` = preset **Other** | proyek bukan Next.js/Vite/CRA |
| `installCommand` | `npm install` | hanya untuk esbuild (devDependency) |
| `buildCommand` | `npm run vercel-build` = `npm run build` + `npm run build:site` | mengompilasi `src/*.jsx` → `app.js` & `admin.js`, lalu **menyalin** HTML/JS/`vendor/` ke `public/` |
| `outputDirectory` | `"public"` | folder yang disajikan Vercel; berisi hasil build apa adanya |

Kenapa `public/` dan bukan `"."`: preset **Other** menyajikan `public/` bila
folder itu ada, dan `outputDirectory: "."` (menyajikan root repo) sering gagal
dibaca Vercel — muncul `No Output Directory named …` atau halaman 404.
Sekarang build **selalu menghasilkan folder `public/`** yang jelas, jadi
deploy tidak bergantung pada cara Vercel membaca root repo.

Isi `public/` (dibuat otomatis, tidak di-commit — lihat `.gitignore`):

```
public/
├── index.html   admin.html   mech.html
├── app.js       admin.js     mech.js     booking.js
└── vendor/react.js  vendor/react-dom.js
```

Skrip penyalinnya `scripts/build-static.mjs` — hanya `cp`, tidak mengubah satu
baris pun kode/desain. Root repo tetap bisa dibuka langsung seperti biasa.

Langkah deploy:

1. Buka [vercel.com/new](https://vercel.com/new) → import repo ini.
2. **Root Directory: kosongkan** (jangan diisi `.`, `/`, atau nama subfolder).
3. Framework Preset / Build Command / Output Directory: **biarkan default** —
   `vercel.json` yang menentukan (nilainya menimpa setting dashboard).
4. Deploy. Hasilnya `/` → halaman pelanggan, `/admin.html` → panel admin,
   `/mech.html` → portal mekanik.

### Troubleshooting

| Pesan / gejala | Penyebab | Perbaikan |
|---|---|---|
| `The specified Root Directory "…" does not exist` | kolom **Root Directory** di dashboard diisi path yang tidak ada (mis. `.`, `/`, atau subfolder lama) | Settings → Build and Deployment → kosongkan **Root Directory** → Save → Redeploy |
| `No Output Directory named "public" found` | langkah build tidak jalan / gagal sebelum `build:site` | cek log: `npm run vercel-build` harus mencetak `build-static: public/ siap` |
| Build sukses tapi semua URL 404 | output directory tidak cocok | pastikan `outputDirectory: "public"` dan `public/` diisi build |
| `vercel.json` sepertinya diabaikan | Root Directory menunjuk subfolder → Vercel tidak membaca `vercel.json` di root | kosongkan Root Directory |
| Halaman blank, font beda | `vendor/` tidak ikut tersalin | pastikan folder `vendor/` ada di repo (di-commit) |

Catatan: `rootDirectory` **tidak bisa** diatur lewat `vercel.json` — itu
khusus setting dashboard. Karena itu jangan diisi apa pun.

Catatan lain:

- Tautan antar-halaman memakai path relatif (`index.html`, `admin.html`,
  `mech.html`, `./vendor/...`, `./app.js`), jadi tetap jalan baik di root
  domain maupun di preview deployment — tidak ada URL absolut yang perlu diubah.
- `.vercelignore` mencegah `node_modules`, `public/` (hasil build lama),
  artefak tunnel lama (`tunnel.log`, `tunnel-watchdog.sh`, `PUBLIC_URL.txt`),
  dan `README.md` ikut ter-upload sebagai file publik.
- `node_modules/` dan `public/` di-`.gitignore`; `package-lock.json` ikut
  di-commit supaya versi esbuild saat build di Vercel sama dengan di lokal.
- Data booking tetap disimpan di `localStorage` browser (tanpa backend), jadi
  di Vercel pun tidak butuh database atau environment variable.
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
- **Portal mekanik** (`mech.html`) — sisi pengerjaan di bengkel, memakai
  bahasa desain yang sama (kartu, chip status, statistik, tab filter).
  Setiap mekanik punya HP sendiri, jadi portalnya **dibuka per mekanik**:
  masuk dengan **nomor HP terdaftar + PIN 4 angka** (`MECH_ACCOUNTS` di
  `src/mech.jsx`). Sesi disimpan di HP itu (`bengkel.mech.session.v1`),
  jadi tidak perlu mengetik ulang setiap membuka portal, dan tombol
  **Keluar** tersedia untuk berganti mekanik.
  Setelah masuk, mekanik **hanya melihat pekerjaannya sendiri**; tersedia
  tab *Belum ditugaskan* untuk mengambil booking yang mekaniknya masih
  “Otomatis” (*Ambil tugas ini* → mekaniknya menjadi dia). Tiap tugas
  menampilkan jadwal, pelanggan, dan durasi servis; mobil bisa
  **ditandai selesai satu per satu** (tersimpan di `doneCars` dengan
  progress bar), lalu *Catat kedatangan* → *Mulai dikerjakan* →
  *Selesai & serahkan*. Booking yang dibatalkan tidak ditampilkan.
  Akses sementara: tautan *Portal mekanik →* di bawah tautan admin pada
  halaman pelanggan.
- **Aturan operasional (audit P1)** — sebelumnya semua ini belum ada:
  - **Check-in terverifikasi**: tiap booking punya kode check-in 4 angka
    (ditampilkan ke pelanggan di layar berhasil & halaman status). Status
    *Tiba* hanya bisa dicatat bila kodenya cocok.
  - **Penugasan mekanik per mobil** (`cars[].mech`) — admin bisa memilih
    mekanik per mobil atau menekan *Tugaskan otomatis* (dibagi ke mekanik
    paling longgar). Mekanik juga bisa mengambil mobil yang belum ada
    mekanik. Satu mekanik maksimal 1 mobil per slot.
  - **Kapasitas nyata**: kuota jam & mekanik dihitung dari booking yang
    ada (bukan konstanta), per tanggal. Tanggal yang ditawarkan selalu
    mulai hari ini; hari tutup/libur bisa diatur (`CLOSED_DOW`, `HOLIDAYS`).
  - **Walk-in**: admin bisa mendaftarkan pelanggan yang datang langsung
    (langsung berstatus *Tiba*, ditandai WALK-IN).
  - **Reschedule & pembatalan oleh pelanggan** lewat menu *Cek status*
    (kode booking + nomor HP), termasuk pilihan tanggal/jam yang masih
    kosong. Admin membatalkan dengan **alasan wajib**, atau menandai
    **Tidak datang** (slot otomatis dilepas).
  - **Alur status dijaga** (`STATUS_FLOW`): transisi liar/typo ditolak.
  - **Audit trail** per booking: siapa (admin / mekanik:X / pelanggan),
    aksi, dari-ke status, dan catatan — tampil di admin & halaman status.
  - **Arsip (soft delete)**: tombol *Arsipkan* menggantikan hapus permanen;
    pemulihan dan hapus permanen hanya dari tab *Arsip*.
  - **Garasi pelanggan persisten**: mobil tersimpan per nomor HP
    (`bengkel.vehicles.v1`), jadi tambah mobil tidak hilang saat refresh.
  - **KPI benar**: "Servis hari ini" dihitung dari tanggal servis
    (`dateISO`), bukan tanggal booking dibuat. Ada tab *Tidak datang* dan
    *Arsip*.
  - **Data contoh dipisah**: id `BK-C001…` (tidak memakai nomor urut
    asli), bertanda CONTOH, dan bisa dihapus dengan satu tombol.
  - **Satu sumber konfigurasi**: `SERVICE_CATALOG`, `MECHANICS`,
    `SLOT_TEMPLATE`, `CLOSED_DOW`/`HOLIDAYS` hanya di `booking.js` —
    tidak lagi diduplikasi di tiap portal.
- **Persistensi**: booking tersimpan di `localStorage` (kunci
  `bengkel.bookings.v1`), jadi pelanggan dan admin di browser yang sama
  saling terhubung tanpa backend. Sesi portal mekanik memakai kunci
  terpisah `bengkel.mech.session.v1` dan hanya menyimpan id mekanik.
- **Pilihan warna aksen** (titik warna di bawah CTA) — sesuai prop `accent`
  di design dengan 4 opsi warna. Pilihan **tersimpan** di
  `localStorage` (`bengkel.accent.v1`) dan dipakai bersama: tombol aktif di
  **panel admin** dan **portal mekanik** (tab terpilih, tombol aksi utama,
  ikon header) memakai warna aksen ini, bukan hitam. Bila belum pernah
  dipilih, default `#FFB81C`.
- Tautan *Panel admin bengkel →* di bagian bawah halaman pelanggan.

## Struktur

```
bengkel-booking/
├── index.html          # halaman pelanggan
├── admin.html          # halaman admin
├── mech.html           # portal mekanik
├── booking.js          # lapisan data bersama (localStorage) + data contoh
├── app.js              # aplikasi pelanggan (sudah terkompilasi)
├── admin.js            # aplikasi admin (sudah terkompilasi)
├── mech.js             # aplikasi mekanik (sudah terkompilasi)
├── src/
│   ├── app.jsx         # sumber aplikasi pelanggan (React JSX)
│   ├── admin.jsx       # sumber aplikasi admin (React JSX)
│   └── mech.jsx        # sumber portal mekanik (React JSX)
├── vendor/
│   ├── react.js        # React 18 (UMD, lokal — tanpa CDN)
│   └── react-dom.js
├── scripts/
│   └── build-static.mjs # menyalin hasil build ke public/ (untuk Vercel)
├── package.json        # skrip build (esbuild) + vercel-build
├── package-lock.json   # versi esbuild terkunci untuk build di Vercel
├── vercel.json         # preset deploy: Other, build, output = public/
├── .vercelignore       # file yang tidak di-upload/di-serve di Vercel
└── .gitignore          # node_modules, public/, .vercel, dll.
```

## Kustomisasi

| Yang mau diubah | Lokasi |
|---|---|
| Nama bengkel | Cari-ganti `[Nama Bengkel]` di `src/app.jsx`, `src/admin.jsx` & `src/mech.jsx`, lalu build |
| Akun mekanik (nama, nomor HP, PIN) | `MECH_ACCOUNTS` di `src/mech.jsx` — `name` harus sama dengan `MECHS` di `src/app.jsx` |
| Durasi per servis di portal mekanik | `SVC_MINS` di `src/mech.jsx` (samakan dengan `SERVICES` di `src/app.jsx`) |
| Daftar servis + durasi | `SERVICE_CATALOG` di `booking.js` |
| Jam & kuota per jam | `SLOT_TEMPLATE` di `booking.js` |
| Mekanik (nama, HP, PIN) | `MECHANICS` di `booking.js` |
| Tanggal yang ditawarkan | `DAYS_SHOWN`/`DAYS_AHEAD`, `CLOSED_DOW`, `HOLIDAYS` di `booking.js` |
| Warna aksen | `ACCENTS` di `src/app.jsx`; default `DEFAULT_ACCENT` di `booking.js` |
| Alur status | `STATUS_FLOW` & `BOOKING_STATUS` di `booking.js` |

## Menyambung ke backend sungguhan

Semua akses data terpusat di `booking.js`:

```js
loadBookings()          // daftar booking
saveBooking(data)       // tambah booking (kembali dengan id)
updateBookingStatus(id, to, actor, note)  // dijaga STATUS_FLOW
updateBooking(id, patch, actor)           // whitelist field
checkInBooking(id, code, actor)
closeBooking(id, 'cancelled'|'no_show', reason, actor)
rescheduleBooking(id, dateISO, slot, actor)
assignMechanic(id, carIndex, mechName, actor)
autoAssignMechanics(id, actor)
setCarDone(id, carIndex, done, actor)
archiveBooking(id, actor) / restoreBooking(id) / purgeBooking(id)
slotOk(dateISO, slot, mechName, carCount, ignoreId)  // ketersediaan nyata
slotFree(dateISO, slot) / mechFree(dateISO, slot, name)
upcomingDays(n) / bookableDays()
loadVehicles(phone) / upsertVehicle(phone, car)
findBookingForCustomer(code, phone)
nextCode()              // penomoran BK-0001...
readAccent()            // warna aksen pilihan pelanggan (default #FFB81C)
writeAccent(color)      // simpan warna aksen
```

Ganti isi fungsi-fungsi itu dengan `fetch()` ke API Anda — dua halaman
tidak perlu diubah. Untuk produksi juga tambahkan: pengiriman OTP WhatsApp
sesungguhnya (saat ini: "ketik 4 angka apa saja"), autentikasi admin,
dan database.

## Build ulang (setelah mengedit `src/`)

```bash
npm install          # sekali saja (mengunduh esbuild)
npm run build        # menulis ulang app.js, admin.js & mech.js
npm run build:site   # (opsional) menyegarkan public/ seperti saat deploy
npm run vercel-build # keduanya sekaligus — inilah yang dijalankan Vercel
```

`public/` adalah folder hasil build untuk Vercel dan tidak di-commit; kalau
ingin menguji hasil deploy secara lokal:

```bash
npm run vercel-build
npm run preview        # http://localhost:8000 (Cache-Control: no-store)
```

`npm run preview` menyajikan `public/` seperti Vercel (tanpa cache), berguna
saat menguji tiga portal berdampingan.

Hasil build sudah disertakan, jadi build ulang hanya perlu jika Anda
mengedit sumber JSX.

## Uji otomatis

```bash
npm run build   # tes UI memakai bundle hasil build
npm test        # domain (booking.js) + UI end-to-end 3 portal (jsdom)
```

- `tests/domain.test.mjs` — 71 cek aturan murni: kuota slot, bentrok mekanik,
  alur status, check-in, batal/tidak datang, reschedule, whitelist field,
  arsip, garasi kendaraan, data contoh, pencarian booking pelanggan.
- `tests/ui.test.mjs` — 74 cek UI di jsdom untuk portal pelanggan, admin, dan
  mekanik: alur booking 5 langkah, pencegahan kirim ganda, cek status dan
  pembatalan, check-in admin, penugasan mekanik, walk-in, login mekanik, plus
  audit ukuran target sentuh (semua tombol ≥ 44 px).

Keduanya berjalan tanpa browser dan tanpa jaringan.

## Penyesuaian untuk HP (2026)

- `viewport-fit=cover` + `padding-bottom: env(safe-area-inset-bottom)` supaya
  tombol utama tidak tertutup home indicator iPhone.
- Semua tombol dan kolom input minimal 44–48 px; `input` berukuran 16 px ke
  atas agar iOS tidak memperbesar halaman saat fokus.
- Keyboard yang tepat per kolom (`inputMode="tel"`, `numeric`,
  `autoComplete="one-time-code"`, `enterKeyHint`).
- Tombol konfirmasi menempel di bawah (sticky) dan mengunci diri saat menyimpan
  supaya booking tidak terkirim dua kali.
- Status terpilih memakai warna aksen yang dipilih pelanggan (bukan hitam);
  semua pasangan warna aksen sudah lolos kontras WCAG AA dengan teks `INK`.
- `:focus-visible` jelas untuk pengguna keyboard dan `prefers-reduced-motion`
  dihormati.
- Tautan panel admin/portal mekanik dan pemilih warna bengkel dilipat di dalam
  "Akses staf bengkel" agar tidak mengganggu pelanggan.
