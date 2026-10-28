# Briefing Teknis & Skenario Demo
### Untuk presentasi ke pemilik bengkel — disiapkan oleh pihak teknis

Dokumen ini isinya: (1) fakta teknis aplikasi apa adanya, (2) yang harus kamu siapkan sebelum presentasi, (3) skenario demo, (4) batasan yang wajib kamu sebutkan sendiri, dan (5) peta jalan + perkiraan biaya.

Aturan main presentasi: **jangan menjual yang belum ada.** Pemilik bengkel akan menguji dengan pertanyaan operasional ("kalau 2 kasir buka bersamaan gimana?"). Kalau kamu sudah menyebut batasannya lebih dulu, sisanya jadi diskusi rencana — bukan kejutan.

---

## 1. Ringkasan satu menit (buka dengan ini)

> "Ini sistem booking servis mobil yang bisa langsung dibuka di HP pelanggan tanpa install aplikasi. Pelanggan pilih mobil, servis, tanggal dan jam yang benar-benar kosong, lalu dapat kode booking + kode check-in. Di bengkel, admin memverifikasi kedatangan dengan kode itu, membagi mobil ke mekanik, dan tiap mekanik punya portal sendiri di HP-nya untuk menandai progres. Semua perpindahan status tercatat siapa yang mengubah dan kapan.
>
> Versi sekarang adalah **prototipe kerja yang utuh alurnya**, jalan tanpa server dan tanpa biaya bulanan. Yang belum ada adalah bagian yang butuh server: penyimpanan data bersama antar-HP, OTP WhatsApp sungguhan, dan login admin. Itu tahap berikutnya, dan saya sudah siapkan rancangannya."

Kalau hanya diingat satu kalimat: **"Alurnya sudah utuh dan bisa dicoba hari ini; yang belum adalah data bersama antar perangkat."**

---

## 2. Fakta teknis aplikasi (jawaban untuk pertanyaan "pakai apa?")

### 2.1 Stack

| Lapisan | Isi sebenarnya | Catatan untuk pemilik |
|---|---|---|
| **Frontend** | React **18.3.1** (file produksi disimpan lokal di `vendor/`, tanpa CDN), JSX dikompilasi **esbuild 0.24** menjadi 3 bundle IIFE: `app.js`, `admin.js`, `mech.js` | Tidak butuh Node/React jalan di server. Halaman jadi file statis biasa. |
| **Styling** | Inline style React + CSS global kecil di `<head>` (safe-area, anti auto-zoom iOS, focus ring, reduced motion) | Tidak ada framework CSS berat (tidak ada Tailwind/Bootstrap) → ringan. |
| **Backend** | **Belum ada.** Tidak ada API, tidak ada server aplikasi | Ini keputusan sadar untuk prototipe: bisa didemokan tanpa biaya & tanpa risiko data pelanggan. |
| **Database** | **Belum ada.** Data disimpan di `localStorage` browser | Artinya: data ikut perangkat/browser, **tidak** tersinkron antar HP. Lihat §5.1 — ini yang wajib kamu sampaikan. |
| **Lapisan data** | `booking.js` (756 baris) = satu sumber kebenaran: konfigurasi master, aturan ketersediaan, alur status, audit trail, operasi booking | Semua portal memanggil file yang sama. Ganti isi file ini dengan panggilan API saat naik ke server — tampilan tidak perlu diubah. |
| **Hosting** | **Vercel**, static build (`outputDirectory: public`, framework "Other") | Gratis untuk trafik kecil; deploy tiap push ke `main`. |
| **Domain** | Subdomain Vercel (`.vercel.app`); domain sendiri tinggal ditambahkan di dashboard | Bisa pakai `booking.namabengkel.com` nanti. |
| **Build** | `npm run build` (esbuild) → `npm run build:site` (salin ke `public/`) → Vercel menjalankan `npm run vercel-build` | Tidak ada proses build yang rapuh. |
| **Tes** | `npm test` → **145 cek otomatis** (71 aturan domain + 74 UI 3 portal, jsdom) | Bisa ditunjukkan: setiap perubahan dicek ulang otomatis, termasuk "semua tombol ≥ 44 px". |
| **Ukuran** | Muat pertama halaman pelanggan: **65 KB** (gzip, termasuk React) | Ringan untuk jaringan 3G di bengkel. |

### 2.2 Isi kode (kalau ditanya "seberapa besar?")

| Berkas | Baris | Fungsi |
|---|---|---|
| `booking.js` | 756 | Aturan bisnis + data (satu sumber untuk 3 portal) |
| `src/app.jsx` | 909 | Portal pelanggan (5 langkah + cek status) |
| `src/admin.jsx` | 591 | Panel admin (check-in, mekanik, walk-in, reschedule, arsip, audit) |
| `src/mech.jsx` | 526 | Portal mekanik (login nomor + PIN, tugas sendiri) |
| `tests/` | 455 | Tes otomatis (domain + UI) |

### 2.3 Konfigurasi yang bisa diubah tanpa menyentuh logika (semua di `booking.js`)

| Konstanta | Isi sekarang | Guna saat presentasi |
|---|---|---|
| `SERVICE_CATALOG` | 6 servis + durasi (oli 45 mnt, berkala 120, rem 60, AC 90, keluhan/cek = 0) | Ganti nama servis & durasi sesuai bengkel asli → terasa "punya mereka" |
| `MECHANICS` | 4 mekanik: Pak Budi `/1111`, Andi `/2222`, Rizal `/3333`, Dedi `/4444` | Ganti nama & nomor HP asli sebelum demo |
| `SLOT_TEMPLATE` | 08:30, 10:00, 11:30, 13:00, 14:30, 16:00 + kuota per jam | Sesuaikan jam buka bengkel |
| `CLOSED_DOW` / `HOLIDAYS` | kosong | Isi hari tutup (mis. Minggu) & tanggal libur |
| `DAYS_AHEAD` / `DAYS_SHOWN` | 7 (admin) / 5 (pelanggan) | Jumlah hari yang ditawarkan |
| Warna aksen | default `#FFB81C`, 4 pilihan, tersimpan per browser | Bisa disetel ke warna bengkel sebelum demo |

> Lakukan ini **sebelum** presentasi, pakai nama bengkel asli. Efeknya besar: owner langsung melihat "sistem saya", bukan "aplikasi contoh".

### 2.4 Data yang tersimpan (kunci `localStorage`)

| Kunci | Isi |
|---|---|
| `bengkel.bookings.v1` | Semua booking + audit trail + arsip |
| `bengkel.vehicles.v1` | Garasi pelanggan per nomor HP |
| `bengkel.accent.v1` | Warna aksen pilihan |
| `bengkel.seq.v1` | Nomor urut kode booking (`BK-0271`, …) |
| `bengkel.mech.session.v1` | Sesi login portal mekanik |

### 2.5 Model status (hafalkan — sering ditanya)

```
Konfirmasi → Tiba → Dikerjakan → Selesai
     ↘         ↘          ↘
     Dibatalkan / Tidak datang (slot otomatis dilepas)
```

- Setiap perpindahan divalidasi (`STATUS_FLOW`) — status tidak bisa dilompati atau diketik sembarangan.
- Setiap perubahan menulis audit: **siapa** (`admin` / `mekanik:Andi` / `pelanggan`), **aksi**, **dari→ke**, **catatan**.
- **Tiba** hanya bisa dicatat kalau kode check-in 4 angka milik pelanggan dimasukkan dengan benar.

### 2.6 Aturan kapasitas (ini yang bikin owner percaya)

- Kuota per jam = `min(kuota jam, jumlah mekanik)`.
- **Satu mekanik maksimal 1 mobil per slot** — tidak mungkin double-assign (ditolak sistem dengan pesan jelas).
- Ketersediaan dihitung dari booking nyata per **tanggal + jam**, bukan angka tetap.
- Batal / tidak datang / diarsipkan → slot otomatis kembali kosong.
- Multi-mobil dalam satu booking dikerjakan bersamaan oleh mekanik berbeda; jam yang tampil sudah memperhitungkan jumlah mobil.

---

## 3. Yang harus kamu siapkan sebelum presentasi

### 3.1 Persiapan teknis (H-1)

- [ ] `npm install && npm run build && npm run test` → pastikan **145 cek lulus**. Screenshot hasilnya untuk lampiran.
- [ ] Deploy ulang (`git push` → Vercel) dan cek **ketiga URL** di HP asli, bukan cuma laptop: `/`, `/admin.html`, `/mech.html`.
- [ ] Ganti nama bengkel pada teks `[Nama Bengkel]` (3 file HTML + 3 JSX) dan nama mekanik/jam buka di `booking.js`.
- [ ] Siapkan **dua perangkat**: laptop (panel admin) + HP (portal pelanggan & mekanik).
- [ ] **HP cadangan / tethering**: kalau Wi-Fi bengkel mati, demo tetap jalan.
- [ ] Bersihkan data demo di perangkat yang akan dipakai, lalu muat ulang data contoh secukupnya (jangan campur sisa data uji).
- [ ] Catat kredensial demo di kertas kecil: Pak Budi `0812 3456 0001` / PIN `1111`.
- [ ] Siapkan **mode pesawat test**: tunjukkan aplikasi tetap terbuka (data lokal) — lalu jelaskan batasnya.
- [ ] Kalau ada: domain sendiri sudah aktif, HTTPS aman.

### 3.2 Persiapan non-teknis

- [ ] **Handout 2 halaman**: ringkasan §1, tabel stack §2.1, model status §2.5, batasan §5, peta jalan §6. (Owner sering minta "tinggalin file-nya".)
- [ ] **Diagram 1 gambar** alur: Pelanggan → Booking → Check-in → Mekanik → Selesai → Audit. Cetak besar atau tampilkan di slide.
- [ ] **Daftar harga/estimasi** biaya tahap server (§6) — owner akan tanya biaya bulanan.
- [ ] **Daftar pertanyaan yang kamu ingin tanyakan balik** (§4.5) supaya sesi terasa konsultatif, bukan jualan.
- [ ] Tentukan **satu keputusan yang kamu minta** di akhir: *"Boleh saya lanjut ke tahap server dengan data 2 minggu percobaan?"*

### 3.3 Yang **jangan** dibawa / dijanjikan

- Jangan bilang "sudah online semua orang lihat data yang sama" — **belum** (lihat §5.1).
- Jangan bilang "OTP WhatsApp sudah jalan" — masih mode demo.
- Jangan bilang "ada laporan pendapatan / integrasi kasir" — belum ada.
- Jangan demo pakai data pelanggan asli bengkel (nomor HP) di perangkat pribadimu.

---

## 4. Skenario demo (8–10 menit, urutan ini)

**0:00 — Konteks (1 mnt).** Buka di HP: "Ini yang dilihat pelanggan. Tanpa install, tanpa bikin akun."

**1:00 — Booking (3 mnt).** Isi nomor HP → kode demo → pilih mobil (perhatikan garasi otomatis terisi untuk nomor lama) → pilih servis (tunjukkan hint durasi) → **jadwal**: sorot label *Hari ini / Besok*, tunjukkan jam **Penuh** otomatis dan jam yang tersisa → konfirmasi → **kode booking + kode check-in**.

**4:00 — Pelanggan ubah sendiri (1 mnt).** "Cek status": masukkan kode + nomor → tampil status, kode check-in, progres per mobil, riwayat, tombol ubah jadwal & batal. *"Pelanggan tidak perlu telepon bengkel."*

**5:00 — Admin (2 mnt).** Di laptop: kartu booking masuk → masukkan kode check-in **salah** dulu (ditolak) → kode benar → status *Tiba* → pilih mekanik per mobil → coba pilih mekanik yang sudah sibuk (ditolak sistem, tunjukkan pesannya) → tekan *Arsipkan* lalu tunjukkan tab *Arsip*.

**7:00 — Mekanik (1,5 mnt).** Di HP, buka `/mech.html` → login nomor + PIN → **hanya tugas dia** → tandai mobil selesai → "Mulai dikerjakan" → "Selesai & serahkan".

**8:30 — Bukti audit (30 dtk).** Kembali ke admin, buka *Riwayat perubahan* pada booking tadi: terlihat siapa mengubah apa dan jam berapa. Ini yang membedakan dari catatan WhatsApp/kertas.

**9:00 — Tutup dengan batasan + tawaran (§5 → §6).**

> Selalu demo **1 booking utuh** sampai selesai. Jangan melompat-lompat fitur — owner menilai "apakah ini bisa dipakai harian", bukan jumlah tombol.

### 4.5 Pertanyaan yang kamu tanyakan balik ke owner (penting)

1. Berapa mobil rata-rata per hari, dan jam tersibuknya? (untuk setel kuota slot)
2. Berapa mekanik, dan apakah satu mekanik bisa pegang 2 mobil sekaligus?
3. Pelanggan biasanya booking atau langsung datang? (menentukan porsi fitur walk-in)
4. Siapa yang pegang HP untuk update status: kasir, service advisor, atau mekanik?
5. Perlu nomor polisi saja atau sekalian model/tahun untuk riwayat servis?
6. Ada hari tutup / tanggal libur yang harus dikunci?
7. Perlu kirim pengingat servis berikutnya? Lewat WhatsApp pribadi atau WA Business?
8. Apakah pelanggan minta estimasi harga di awal, atau cukup "dicek dulu"?

Jawaban ini langsung jadi isi `SERVICE_CATALOG`, `SLOT_TEMPLATE`, dan prioritas tahap berikutnya.

---

## 5. Batasan versi sekarang — sebutkan sendiri, jangan ditanya

### 5.1 Yang paling krusial: data belum bersama (single-device)

| Kenyataan | Akibat di bengkel nyata | Jawaban jujurmu |
|---|---|---|
| Data di `localStorage` browser | HP pelanggan, laptop kasir, HP mekanik **tidak** melihat data yang sama | "Ini prototipe alur. Untuk dipakai harian, tahap 1 adalah server + database supaya semua perangkat melihat data yang sama." |
| Tidak ada API/backend | Tidak ada sinkronisasi, tidak ada backup terpusat | "Data bisa hilang kalau browser di-clear. Itu sebabnya server jadi langkah pertama sebelum dipakai nyata." |
| Tanpa login admin | Siapa pun yang tahu URL bisa buka panel admin | "Panel admin sekarang terbuka untuk demo. Autentikasi masuk tahap 1." |
| OTP masih mode demo | Kode verifikasi apa saja diterima; tidak ada SMS/WA sungguhan | "OTP asli butuh penyedia WhatsApp Business API — tahap 2." |
| Pesan WhatsApp hanya contoh tampilan | Tidak ada pesan yang benar-benar terkirim | "Isi pesannya sudah dirancang; pengiriman otomatis menyusul." |
| Tanpa harga & pembayaran | Estimasi hanya durasi, tidak ada rupiah | "Harga sengaja belum dimasukkan supaya tidak mengunci skema biaya bengkel. Bisa ditambah katalog harga per servis." |
| Tanpa laporan/ekspor | Belum ada rekap harian/bulanan, ekspor Excel | "Rekap & ekspor masuk tahap 3." |

Kalau kamu menyampaikan tabel ini dengan tenang, kredibilitasmu naik — owner biasanya lebih takut pada sistem yang "katanya sudah jadi semua" daripada yang jelas batasnya.

### 5.2 Privasi data (singgung 30 detik)

- Yang disimpan: nomor WhatsApp, plat/model mobil, keluhan, riwayat servis.
- Sekarang data berada di perangkat pengguna, bukan di server — belum ada data pelanggan terkumpul di satu tempat.
- Begitu naik ke server, wajib: persetujuan pemakaian nomor untuk pengingat/promo, masa simpan, dan hak hapus (UU PDP). Aplikasi sudah memisahkan dua izin: **pengingat servis** dan **info promo** — itu titik awal yang benar.

---

## 6. Peta jalan & perkiraan (bawa angkanya, beri label "estimasi")

| Tahap | Isi | Kenapa penting | Estimasi effort | Biaya bulanan (estimasi) |
|---|---|---|---|---|
| **1. Server + data bersama** | Backend API + database (mis. Supabase/Postgres), login admin, pindahkan `booking.js` ke API | Tanpa ini, tidak bisa dipakai >1 perangkat | 1–2 minggu kerja | Rp0–150rb (free tier → paid kecil) |
| **2. WhatsApp sungguhan** | WhatsApp Business API / gateway: OTP, konfirmasi booking, pengingat H-1, "mobil siap" | Menghemat telepon, menaikkan angka kedatangan | 3–5 hari | Rp150rb–1jt tergantung volume |
| **3. Uang & laporan** | Katalog harga per servis, estimasi biaya, rekap harian/bulanan, ekspor CSV, QRIS | Owner butuh angka, bukan hanya status | 1–2 minggu | ikut hosting |
| **4. Penyempurnaan** | Multi-cabang, jam istirahat, kapasitas mekanik >1 mobil, pengingat servis berkala otomatis | Skala & retensi | bertahap | — |

Biaya domain: ±Rp150–200rb/tahun. Hosting Vercel: gratis untuk skala bengkel kecil.

**Kalimat penutup yang disarankan:**
> "Yang Anda lihat hari ini sudah bisa dipakai untuk mengukur apakah alur ini cocok dengan bengkel Anda — tanpa biaya server. Kalau cocok, langkah pertama yang saya sarankan adalah memindahkan data ke server (±1–2 minggu) supaya pelanggan, kasir, dan mekanik melihat data yang sama. Setelah itu baru WhatsApp otomatis."

---

## 7. Kartu jawaban cepat (hafalkan 8 ini)

| Pertanyaan owner | Jawaban singkat |
|---|---|
| "Pakai apa ini?" | React 18 untuk tampilan, esbuild untuk build, hosting Vercel. Backend & database belum ada — masih penyimpanan lokal di browser. |
| "Kenapa belum ada database?" | Supaya bisa didemokan hari ini tanpa biaya dan tanpa mengumpulkan data pelanggan. Database adalah tahap 1 sebelum dipakai nyata. |
| "Kalau internet mati?" | Halaman sudah terbuka tetap jalan karena ringan dan data lokal; yang berhenti hanya fitur yang butuh server (belum ada sekarang). |
| "Data hilang kalau HP di-reset?" | Ya, untuk versi ini. Itu alasan server jadi prioritas pertama. |
| "Bisa dipakai 2 orang sekaligus?" | Belum — sekarang satu perangkat. Setelah tahap 1, semua perangkat lihat data yang sama. |
| "Pelanggan bisa curang / ubah data orang?" | Untuk melihat booking butuh **kode booking + nomor HP** yang cocok. Pembatalan & reschedule tercatat di audit. (Catatan: panel admin masih terbuka, akan diberi login.) |
| "Mekanik harus pintar pakai aplikasi?" | Tidak. Login sekali dengan nomor + PIN, lalu tinggal ketuk nama mobilnya. Tombolnya besar (≥44 px), dibuat untuk satu tangan. |
| "Berapa biayanya?" | Versi ini Rp0/bulan (hosting gratis). Tahap server ±Rp0–150rb/bulan, WhatsApp menyusul sesuai volume. |

---

## 8. Lampiran

**Perintah penting**
```bash
npm install            # sekali
npm run build          # kompilasi src/*.jsx → app.js, admin.js, mech.js
npm test               # 71 cek domain + 74 cek UI
npm run vercel-build   # build + siapkan public/ (yang dijalankan Vercel)
npm run preview        # coba hasil build di http://localhost:8000
```

**Akun demo portal mekanik**

| Nama | Nomor HP | PIN |
|---|---|---|
| Pak Budi | 0812 3456 0001 | 1111 |
| Andi | 0812 3456 0002 | 2222 |
| Rizal | 0812 3456 0003 | 3333 |
| Dedi | 0812 3456 0004 | 4444 |

**Tiga URL yang dipakai saat demo:** `/` (pelanggan) · `/admin.html` (admin) · `/mech.html` (mekanik)

**Checklist 5 menit sebelum masuk ruangan**
- [ ] HP terisi >50%, hotspot siap
- [ ] Ketiga URL dibuka lebih dulu di tab terpisah (hindari loading di depan owner)
- [ ] Data demo bersih & 4 booking contoh sudah dimuat
- [ ] Handout tercetak
- [ ] Kamu sudah hafal §1 dan §5.1
