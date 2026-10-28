/* ============================================================
 *  Tes UI end-to-end (jsdom) untuk 3 portal.
 *  Menjalankan bundle hasil build: app.js · admin.js · mech.js
 *  Jalankan: npm test   (build dulu: npm run build)
 * ============================================================ */
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';

const rows = [];
const ok = (name, cond) => rows.push([name, !!cond]);
const read = (f) => readFileSync(f, 'utf8');
const tick = (ms = 160) => new Promise((r) => setTimeout(r, ms));

function boot(bundle, opts = {}) {
  const dom = new JSDOM('<!doctype html><html lang="id"><body><div id="root"></div></body></html>', {
    runScripts: 'dangerously', url: 'https://bengkel.test/' + (opts.page || 'index.html'), pretendToBeVisual: true
  });
  const w = dom.window;
  w.scrollTo = () => {};
  w.prompt = () => 'tes batal';
  w.confirm = () => true;
  const inject = (src) => {
    const s = w.document.createElement('script');
    s.textContent = read(src);
    w.document.body.appendChild(s);
  };
  inject('vendor/react.js');
  inject('vendor/react-dom.js');
  inject('booking.js');
  if (opts.seed) w.eval('seedSampleData()');
  inject(bundle);
  return w;
}

const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const text = (w) => norm(w.document.getElementById('root').textContent);
const all = (w, sel) => Array.from(w.document.querySelectorAll(sel));
const btn = (w, label) => all(w, 'button').find((b) => norm(b.textContent).includes(label));
const btnExact = (w, label) => all(w, 'button').find((b) => norm(b.textContent) === label);
const btnIn = (w, root, label) => Array.from(root.querySelectorAll('button')).find((b) => norm(b.textContent).includes(label));
const click = (w, el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
const type = (w, el, value) => {
  const proto = el.tagName === 'TEXTAREA' ? w.HTMLTextAreaElement.prototype : w.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
  el.dispatchEvent(new w.Event('input', { bubbles: true }));
};
const card = (w, id) => all(w, 'div').find((d) => d.children.length && norm(d.textContent).includes(id) && norm(d.textContent).length < 1400);
const px = (el) => {
  const s = el.style || {};
  const v = parseFloat(s.minHeight || s.height || '0');
  return isNaN(v) ? 0 : v;
};

/* ============================================================
 *  1. PORTAL PELANGGAN
 * ============================================================ */
const c = boot('app.js');
await tick(250);

ok('pelanggan: halaman awal tampil', text(c).includes('Booking servis dalam 1 menit'));
ok('pelanggan: nomor HP tidak terisi otomatis', c.document.getElementById('wa').value === '');
ok('pelanggan: tombol kirim kode terkunci saat kosong', btnExact(c, 'Kirim kode').disabled === true);
ok('pelanggan: input nomor pakai keyboard telepon', c.document.getElementById('wa').getAttribute('inputmode') === 'tel');
ok('pelanggan: input nomor ukuran 18px (anti zoom)', c.document.getElementById('wa').style.fontSize === '18px');

type(c, c.document.getElementById('wa'), '0812 0000 1234');
await tick();
ok('pelanggan: tombol aktif setelah nomor valid', btnExact(c, 'Kirim kode').disabled === false);
click(c, btnExact(c, 'Kirim kode'));
await tick();
ok('pelanggan: masuk layar kode verifikasi', text(c).includes('Masukkan kode verifikasi'));
ok('pelanggan: kode verifikasi satu kali pakai (autocomplete)', c.document.getElementById('otp').getAttribute('autocomplete') === 'one-time-code');
ok('pelanggan: catatan mode demo jujur', text(c).includes('Mode demo'));

type(c, c.document.getElementById('otp'), '1234');
await tick();
click(c, btnExact(c, 'Verifikasi'));
await tick();
ok('pelanggan: masuk langkah mobil', text(c).includes('Mobil mana yang diservis?'));
ok('pelanggan: garasi nomor demo terisi', text(c).includes('B 1234 XYZ') && text(c).includes('B 5678 ABC'));
ok('pelanggan: progres menyebut langkah 2 dari 5', text(c).includes('Langkah 2 dari 5'));

click(c, btnExact(c, 'Lanjut'));
await tick();
ok('pelanggan: masuk langkah servis', text(c).includes('Servis apa yang dibutuhkan?'));
const svcBtns = all(c, 'button').filter((b) => norm(b.textContent) === 'Ganti oli');
ok('pelanggan: pilihan servis tersedia', svcBtns.length >= 1);
ok('pelanggan: tombol lanjut terkunci sebelum servis dipilih', btnExact(c, 'Lanjut').disabled === true);
click(c, svcBtns[0]);
await tick();
ok('pelanggan: servis terpilih menampilkan estimasi durasi', text(c).includes('±45 menit'));
ok('pelanggan: masih terkunci bila mobil lain belum dipilih', svcBtns.length > 1 ? btnExact(c, 'Lanjut').disabled === true : true);
svcBtns.slice(1).forEach((b) => click(c, b));
await tick();
ok('pelanggan: lanjut aktif setelah semua mobil dapat servis', btnExact(c, 'Lanjut').disabled === false);
click(c, btnExact(c, 'Lanjut'));
await tick();

ok('pelanggan: masuk langkah jadwal', text(c).includes('Kapan mau datang?'));
ok('pelanggan: tanggal ada label Hari ini', text(c).includes('Hari ini'));
ok('pelanggan: tanggal ada label Besok', text(c).includes('Besok'));
const dayChips = all(c, 'button').filter((b) => b.getAttribute('aria-pressed') !== null && /Hari ini|Besok|Sen|Sel|Rab|Kam|Jum|Sab|Min/.test(norm(b.textContent)));
ok('pelanggan: chip tanggal punya aria-pressed', dayChips.length >= 5);
ok('pelanggan: tombol lanjut terkunci sebelum jam dipilih', btnExact(c, 'Lanjut').disabled === true);

const slotBtns = all(c, 'button').filter((b) => /^\d{2}:\d{2}/.test(norm(b.textContent)));
const freeSlot = slotBtns.find((b) => !b.disabled);
ok('pelanggan: jam datang ditawarkan', slotBtns.length === 6);
click(c, freeSlot);
await tick();
ok('pelanggan: jam terpilih bisa dilanjut', btnExact(c, 'Lanjut').disabled === false);
click(c, btnExact(c, 'Lanjut'));
await tick();

ok('pelanggan: masuk langkah konfirmasi', text(c).includes('Cek lagi, lalu konfirmasi'));
ok('pelanggan: ringkasan menyebut mobil', text(c).includes('B 1234 XYZ'));
const submit = btnExact(c, 'Konfirmasi booking');
ok('pelanggan: tombol konfirmasi siap', !!submit && submit.disabled === false);
click(c, submit);
await tick(300);

ok('pelanggan: booking berhasil', text(c).includes('Booking berhasil'));
const booking = c.eval('loadBookings()[0]');
ok('pelanggan: kode booking tampil', text(c).includes(booking.id));
ok('pelanggan: kode check-in 4 angka tampil', text(c).includes(booking.checkinCode));
ok('pelanggan: booking tersimpan dengan nomor benar', booking.phone === '0812 0000 1234');
ok('pelanggan: servis tersimpan', booking.cars[0].svc === 'Ganti oli');
ok('pelanggan: jadwal tersimpan', /^\d{2}:\d{2}$/.test(booking.slot));
ok('pelanggan: hanya sekali tersimpan (anti double booking)', c.eval('loadBookings().length') === 1);
ok('pelanggan: status awal konfirmasi', booking.status === 'confirmed');
ok('pelanggan: contoh pesan WA diberi label demo', text(c).includes('mode demo'));

/* akses staf disembunyikan untuk pelanggan */
const details = c.document.querySelector('details');
ok('pelanggan: akses staf dilipat', !!details && details.open === false);
ok('pelanggan: tautan admin tetap bisa diakses lewat lipatan', !!c.document.querySelector('details a[href="admin.html"]'));

/* cek status + batal */
const statusBtn = all(c, 'button').filter((b) => norm(b.textContent) === 'Cek status booking')[0];
click(c, statusBtn);
await tick();
ok('pelanggan: layar cek status terbuka', text(c).includes('Masukkan kode booking'));
type(c, c.document.getElementById('look-code'), booking.id);
type(c, c.document.getElementById('look-phone'), '0812 0000 1234');
await tick();
click(c, btnExact(c, 'Lihat status'));
await tick();
ok('pelanggan: status booking ditemukan', text(c).includes(booking.id) && text(c).includes('Konfirmasi'));
ok('pelanggan: kode check-in tampil di status', text(c).includes(booking.checkinCode));
click(c, btnExact(c, 'Batalkan booking'));
await tick();
ok('pelanggan: pembatalan berhasil', c.eval("findBooking('" + booking.id + "').status") === 'cancelled');
ok('pelanggan: alasan batal tercatat', text(c).includes('Booking dibatalkan.'));

/* target sentuh >= 44px di layar pelanggan */
const smallTargets = all(c, 'button, summary')
  .filter((el) => px(el) < 44)
  .map((el) => norm(el.textContent).slice(0, 30) || el.getAttribute('aria-label'));
ok('pelanggan: semua tombol minimal 44px' + (smallTargets.length ? ' → ' + smallTargets.join(' | ') : ''), smallTargets.length === 0);

/* ============================================================
 *  2. PANEL ADMIN
 * ============================================================ */
const a = boot('admin.js', { page: 'admin.html' });
await tick(250);
ok('admin: panel terbuka', text(a).includes('Panel Admin'));
ok('admin: keadaan kosong dijelaskan', text(a).includes('Tidak ada booking di sini'));

click(a, btn(a, 'Muat data contoh (demo)'));
await tick(250);
ok('admin: data contoh dimuat', text(a).includes('4 data contoh dimuat'));
ok('admin: 4 booking contoh terdaftar', a.eval('loadBookings().length') === 4);
ok('admin: tab filter lengkap', text(a).includes('Menunggu tiba (2)') && text(a).includes('Selesai (1)'));

const activePill = all(a, 'button').find((b) => norm(b.textContent).indexOf('Hari ini (') === 0);
ok('admin: tab aktif memakai warna aksen (bukan hitam)', activePill && !/rgb\(18, 22, 28\)|#12161C/i.test(activePill.style.background));

click(a, btn(a, 'Semua ('));
await tick(200);
ok('admin: daftar semua booking tampil', text(a).includes('BK-C001') && text(a).includes('BK-C004'));
ok('admin: data contoh ditandai CONTOH', text(a).includes('CONTOH'));

/* check-in: kode salah lalu benar */
const c2 = a.eval("findBooking('BK-C002')");
const checkinCard = all(a, 'div').find((d) => norm(d.textContent).includes('BK-C002') && d.querySelector('input[maxlength="4"]'));
ok('admin: kartu booking punya form check-in', !!checkinCard);
type(a, checkinCard.querySelector('input[maxlength="4"]'), '0000');
await tick();
click(a, btnIn(a, checkinCard, 'Verifikasi & catat tiba'));
await tick();
ok('admin: kode salah ditolak', text(a).includes('Kode check-in tidak cocok') && a.eval("findBooking('BK-C002').status") === 'confirmed');
type(a, checkinCard.querySelector('input[maxlength="4"]'), c2.checkinCode);
await tick();
click(a, btnIn(a, checkinCard, 'Verifikasi & catat tiba'));
await tick();
ok('admin: kode benar menandai tiba', a.eval("findBooking('BK-C002').status") === 'arrived');

/* penugasan mekanik */
const assignCard = all(a, 'div')
  .filter((d) => norm(d.textContent).includes('BK-C002') && Array.from(d.querySelectorAll('select')).some((s) => Array.from(s.options).some((o) => o.value === 'Pak Budi')))
  .pop();
ok('admin: ada pemilih mekanik per mobil', !!assignCard);
const select = Array.from(assignCard.querySelectorAll('select')).find((s) => Array.from(s.options).some((o) => o.value === 'Pak Budi'));
const opt = Array.from(select.options).find((o) => o.value === 'Dedi');
ok('admin: daftar mekanik tersedia', !!opt);
select.value = 'Dedi';
select.dispatchEvent(new a.Event('change', { bubbles: true }));
await tick(200);
ok('admin: mekanik tersimpan', a.eval("findBooking('BK-C002').cars[0].mech") === 'Dedi');

/* walk-in */
click(a, btn(a, '+ Daftarkan walk-in'));
await tick();
ok('admin: form walk-in terbuka', !!a.document.getElementById('wi-phone'));
type(a, a.document.getElementById('wi-phone'), '0899 1234 5678');
type(a, a.document.getElementById('wi-plate'), 'b 7777 qq');
type(a, a.document.getElementById('wi-model'), 'Suzuki Ertiga 2020');
await tick();
const slotSel = a.document.getElementById('wi-slot');
const freeOpt = Array.from(slotSel.options).find((o) => o.value && !o.disabled);
slotSel.value = freeOpt.value;
slotSel.dispatchEvent(new a.Event('change', { bubbles: true }));
await tick();
click(a, btnExact(a, 'Simpan walk-in'));
await tick(250);
const walkin = a.eval("loadBookings().find((b) => b.source === 'walkin')");
ok('admin: walk-in tersimpan', !!walkin && walkin.cars[0].plate === 'B 7777 QQ');
ok('admin: walk-in langsung berstatus tiba', walkin && walkin.status === 'arrived');
ok('admin: jumlah booking bertambah', a.eval('loadBookings().length') === 5);

const smallAdmin = all(a, 'button, summary, a[href]').filter((el) => px(el) < 44 && el.tagName !== 'A')
  .map((el) => norm(el.textContent).slice(0, 30) || el.getAttribute('aria-label'));
ok('admin: semua tombol minimal 44px' + (smallAdmin.length ? ' → ' + smallAdmin.join(' | ') : ''), smallAdmin.length === 0);

/* ============================================================
 *  3. PORTAL MEKANIK
 * ============================================================ */
const m = boot('mech.js', { page: 'mech.html', seed: true });
await tick(250);
ok('mekanik: layar masuk tampil', text(m).includes('Masuk sebagai mekanik'));
ok('mekanik: tombol masuk terkunci saat kosong', btnExact(m, 'Masuk').disabled === true);
type(m, m.document.getElementById('mech-phone'), '0812 3456 0001');
type(m, m.document.getElementById('mech-pin'), '9999');
await tick();
click(m, btnExact(m, 'Masuk'));
await tick();
ok('mekanik: PIN salah ditolak', text(m).includes('PIN') && text(m).includes('salah'));
type(m, m.document.getElementById('mech-pin'), '1111');
await tick();
click(m, btnExact(m, 'Masuk'));
await tick(250);
ok('mekanik: berhasil masuk sebagai Pak Budi', text(m).includes('Halo, Pak Budi'));
ok('mekanik: hanya melihat tugas sendiri', text(m).includes('Tugas saya (1)'));
ok('mekanik: mobil yang dipegang tampil', text(m).includes('B 1234 XYZ'));

const carRow = all(m, 'button').find((b) => norm(b.textContent).includes('B 1234 XYZ'));
ok('mekanik: mobil bisa diketuk untuk menandai selesai', !!carRow && !carRow.disabled);
click(m, carRow);
await tick(200);
ok('mekanik: progres mobil tersimpan', m.eval("findBooking('BK-C001').cars[0].done") === true);
ok('mekanik: konfirmasi progres tampil', text(m).includes('ditandai selesai'));

const smallMech = all(m, 'button, a[href]').filter((el) => px(el) < 44 && el.tagName !== 'A')
  .map((el) => norm(el.textContent).slice(0, 30) || el.getAttribute('aria-label'));
ok('mekanik: semua tombol minimal 44px' + (smallMech.length ? ' → ' + smallMech.join(' | ') : ''), smallMech.length === 0);

/* ---------- hasil ---------- */
let fail = 0;
for (const [name, pass] of rows) {
  if (!pass) { console.log('FAIL  ' + name); fail += 1; }
}
console.log(fail ? `${fail} GAGAL dari ${rows.length} cek` : `ui: LULUS semua (${rows.length} cek)`);
process.exit(fail ? 1 : 0);
