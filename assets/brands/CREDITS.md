# Logo merek mobil

Berkas PNG di folder ini dipakai untuk **identifikasi merek** di ketiga portal
(pelanggan, admin, mekanik). Logo adalah merek dagang masing-masing pabrikan
dan bukan milik proyek ini.

- Sumber: [filippofilip95/car-logos-dataset](https://github.com/filippofilip95/car-logos-dataset)
  (dataset logo mobil, versi *thumb*).
- Pengolahan: dipangkas tepinya (trim), diskalakan ke tinggi 96 px,
  diubah ke PNG-8 (maks. 128 warna) tanpa metadata. Total ±124 KB untuk 24 merek.
- Pemakaian yang wajar: hanya untuk menandai merek mobil pada pesanan servis.
  Jangan dipakai di materi promosi yang menyiratkan kerja sama/endorsement
  pabrikan, dan jangan mengubah bentuk/warna logo.

## Menambah merek baru

1. Simpan `namamerek.png` (latar transparan, tinggi ±96 px) di folder ini,
   nama berkas huruf kecil dan tanda hubung (mis. `mercedes-benz.png`).
2. Tambahkan nama merek ke `CAR_BRANDS` **dan** slug-nya ke `BRAND_LOGO_SLUGS`
   di `booking.js`.
3. `npm run build && npm run vercel-build`.

Merek yang tidak ada logonya tetap berfungsi: daftar merek memakai opsi
"Lainnya" (isian bebas) dan tampilan memakai kotak netral berisi huruf awal
merek.
