/* ============================================================
 *  Tes aturan domain (booking.js) — tanpa browser.
 *  Jalankan: npm test
 * ============================================================ */
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';

const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'dangerously', url: 'https://x.test/' });
const w = dom.window;
w.scrollTo = () => {};
const script = w.document.createElement('script');
script.textContent = readFileSync('booking.js', 'utf8');
w.document.body.appendChild(script);

w.eval(`window.B = {
  SERVICE_CATALOG, MECHANICS, SLOT_TEMPLATE, AUTO_MECH, BOOKING_STATUS, STATUS_FLOW,
  todayISO, upcomingDays, bookableDays, dayInfo, slotFree, slotQuota, slotUsed, slotOk, mechUsed, mechFree,
  saveBooking, loadBookings, loadArchivedBookings, loadAllBookings, findBooking,
  assignMechanic, autoAssignMechanics, updateBookingStatus, checkInBooking, closeBooking,
  rescheduleBooking, setCarDone, updateBooking, archiveBooking, restoreBooking, purgeBooking,
  loadVehicles, upsertVehicle, seedSampleData, clearSampleData, hasSampleData,
  findBookingForCustomer, mechanicSummary, durText, estimateMinutes, holdsSlot, carsDone,
  isUnassigned, mechHasBooking, readAccent, writeAccent, normPhone
}`);

const B = w.B;
const rows = [];
const ok = (name, cond) => rows.push([name, !!cond]);

/* ---------- 1. konfigurasi master ---------- */
ok('katalog servis 6 item', B.SERVICE_CATALOG.length === 6);
ok('mekanik 4 orang', B.MECHANICS.length === 4);
ok('tanggal pertama = hari ini', B.upcomingDays(1)[0].iso === B.todayISO());
ok('tidak ada tanggal lampau', B.upcomingDays(7).every((d) => d.iso >= B.todayISO()));
ok('hari libur/tutup dilewati', B.bookableDays().every((d) => d.iso >= B.todayISO()));

const day = B.upcomingDays(1)[0];

/* ---------- 2. booking dasar ---------- */
const quota1000 = B.slotQuota('10:00');
ok('kuota dibatasi jumlah mekanik', quota1000 === Math.min(2, B.MECHANICS.length));
ok('slot kosong sebelum dipakai', B.slotFree(day.iso, '10:00') === quota1000);

const b1 = B.saveBooking({
  phone: '0812 1111 2222', role: 'owner', cars: [{ plate: 'B 1 A', model: 'X', svc: 'Ganti oli', mech: '', done: false }],
  dateISO: day.iso, dayFull: day.full, slot: '10:00', actor: 'pelanggan'
});
ok('kode check-in 4 angka', /^\d{4}$/.test(b1.checkinCode));
ok('audit awal tercatat', b1.audit.length === 1 && /booking dibuat/.test(b1.audit[0].action));
ok('nomor urut booking dibuat', /^BK-\d{4}$/.test(b1.id));
ok('status awal konfirmasi', b1.status === 'confirmed');
ok('slot berkurang setelah booking', B.slotFree(day.iso, '10:00') === quota1000 - 1);
ok('slotOk menolak bila sisa kurang', B.slotOk(day.iso, '10:00', '', 2) === false);

/* ---------- 3. satu mekanik maksimal satu mobil per slot ---------- */
B.assignMechanic(b1.id, 0, 'Pak Budi', 'admin');
ok('mekanik tercatat di mobil', B.findBooking(b1.id).cars[0].mech === 'Pak Budi');
ok('mekanik sibuk di slot itu', B.slotOk(day.iso, '10:00', 'Pak Budi', 1) === false);
ok('mekanik lain masih bisa', B.slotOk(day.iso, '10:00', 'Andi', 1) === true);

const bSame = B.saveBooking({
  phone: '0812 9999 0000', role: 'owner', cars: [{ plate: 'B 9 ZZ', svc: 'Servis AC', mech: '', done: false }],
  dateISO: day.iso, dayFull: day.full, slot: '10:00', actor: 'pelanggan'
});
ok('slot penuh setelah 2 mobil', B.slotFree(day.iso, '10:00') === 0);
const dup = B.assignMechanic(bSame.id, 0, 'Pak Budi', 'admin');
ok('penugasan ganda ditolak', dup.ok === false && /sudah memegang/.test(dup.error));
ok('mobil kedua tetap belum ditugaskan', B.findBooking(bSame.id).cars[0].mech === '');

/* ---------- 4. transisi status dijaga ---------- */
ok('lompat status ditolak', B.updateBookingStatus(b1.id, 'done', 'admin').ok === false);
ok('konfirmasi → tiba diterima', B.updateBookingStatus(b1.id, 'arrived', 'admin').ok === true);
ok('audit menyebut perubahan status', B.findBooking(b1.id).audit[0].action.includes('Konfirmasi → Tiba'));
ok('tiba → dikerjakan diterima', B.updateBookingStatus(b1.id, 'in_progress', 'admin').ok === true);
ok('dikerjakan → selesai diterima', B.updateBookingStatus(b1.id, 'done', 'admin').ok === true);
ok('status selesai bersifat final', B.updateBookingStatus(b1.id, 'cancelled', 'admin').ok === false);

/* ---------- 5. batal & tidak datang melepas slot ---------- */
const freeBeforeCancel = B.slotFree(day.iso, '10:00');
B.closeBooking(bSame.id, 'cancelled', 'Pelanggan membatalkan', 'admin');
ok('batal melepas slot', B.slotFree(day.iso, '10:00') === freeBeforeCancel + 1);
ok('alasan batal tersimpan', B.findBooking(bSame.id).closedReason === 'Pelanggan membatalkan');

const b2 = B.saveBooking({
  phone: '0813 3333 4444', role: 'owner', cars: [{ plate: 'B 3 CC', svc: 'Cek dan servis rem', mech: '', done: false }],
  dateISO: day.iso, dayFull: day.full, slot: '13:00', actor: 'pelanggan'
});
ok('check-in kode salah ditolak', B.checkInBooking(b2.id, '0000', 'admin').ok === false);
ok('status tetap setelah kode salah', B.findBooking(b2.id).status === 'confirmed');
ok('check-in kode benar diterima', B.checkInBooking(b2.id, b2.checkinCode, 'admin').ok === true);
ok('status jadi tiba', B.findBooking(b2.id).status === 'arrived');
const freeBeforeNoShow = B.slotFree(day.iso, '13:00');
B.closeBooking(b2.id, 'no_show', 'Tidak datang', 'admin');
ok('tidak datang melepas slot', B.slotFree(day.iso, '13:00') === freeBeforeNoShow + 1);
ok('label status indonesia', B.BOOKING_STATUS.no_show.label === 'Tidak datang');
ok('booking batal tidak memakai slot', B.holdsSlot('cancelled') === false && B.holdsSlot('confirmed') === true);

/* ---------- 6. reschedule ---------- */
const b3 = B.saveBooking({
  phone: '0814 4444 5555', role: 'owner', cars: [{ plate: 'B 4 DD', model: 'Avanza', svc: 'Ganti oli', mech: '', done: false }],
  dateISO: day.iso, dayFull: day.full, slot: '16:00', actor: 'pelanggan'
});
ok('reschedule ke slot kosong', B.rescheduleBooking(b3.id, day.iso, '14:30', 'pelanggan').ok === true &&
  B.findBooking(b3.id).slot === '14:30');
ok('reschedule tercatat audit', B.findBooking(b3.id).audit[0].action === 'jadwal diubah');
ok('reschedule ke tanggal lampau ditolak', B.rescheduleBooking(b3.id, '2020-01-01', '14:30', 'admin').ok === false);
ok('reschedule booking selesai ditolak', B.rescheduleBooking(b1.id, day.iso, '14:30', 'admin').ok === false);

/* ---------- 7. progres per mobil ---------- */
B.setCarDone(b3.id, 0, true, 'mekanik:Andi');
ok('mobil ditandai selesai', B.findBooking(b3.id).cars[0].done === true);
ok('audit menyebut plat', B.findBooking(b3.id).audit[0].action.includes('B 4 DD'));
B.setCarDone(b3.id, 0, false, 'mekanik:Andi');
ok('tanda selesai bisa dibatalkan', B.findBooking(b3.id).cars[0].done === false);
B.assignMechanic(b3.id, 0, 'Andi', 'admin');
ok('ringkasan mekanik', B.mechanicSummary(B.findBooking(b3.id)) === 'Andi');
ok('mekanikHasBooking', B.mechHasBooking(B.findBooking(b3.id), 'Andi') === true);

/* ---------- 8. whitelist field ---------- */
B.updateBooking(b3.id, { id: 'HACKED', status: 'done', note: 'catatan baru' }, 'admin');
ok('id tidak bisa ditimpa', B.findBooking(b3.id).id === b3.id);
ok('status tidak bisa ditimpa', B.findBooking(b3.id).status === 'confirmed');
ok('field sah tetap tersimpan', B.findBooking(b3.id).note === 'catatan baru');

/* ---------- 9. arsip ---------- */
const b4 = B.saveBooking({
  phone: '0815 5555 6666', role: 'owner', cars: [{ plate: 'B 5 EE', svc: 'Ganti oli', mech: '', done: false }],
  dateISO: day.iso, dayFull: day.full, slot: '08:30', actor: 'pelanggan'
});
ok('hapus booking aktif ditolak', B.purgeBooking(b4.id, 'admin').ok === false);
B.archiveBooking(b4.id, 'admin');
ok('arsip hilang dari daftar aktif', B.loadBookings().every((b) => b.id !== b4.id));
ok('arsip masih tersimpan', B.loadArchivedBookings().some((b) => b.id === b4.id));
B.restoreBooking(b4.id, 'admin');
ok('pulih dari arsip', B.loadBookings().some((b) => b.id === b4.id));
B.archiveBooking(b4.id, 'admin');
ok('hapus permanen setelah arsip', B.purgeBooking(b4.id, 'admin').ok === true &&
  !B.loadAllBookings().some((b) => b.id === b4.id));

/* ---------- 10. garasi kendaraan ---------- */
ok('nomor demo punya 2 mobil', B.loadVehicles('0812 0000 1234').length === 2);
ok('nomor lain mulai kosong', B.loadVehicles('0899 7777 6666').length === 0);
B.upsertVehicle('0899 7777 6666', { plate: 'b 9999 zz', model: 'Daihatsu Xenia' });
const mine = B.loadVehicles('0899 7777 6666');
ok('mobil baru tersimpan & plat rapi', mine.length === 1 && mine[0].plate === 'B 9999 ZZ');
B.upsertVehicle('0899 7777 6666', { plate: 'B 9999 ZZ', model: 'Daihatsu Xenia 2022' });
ok('plat sama tidak duplikat', B.loadVehicles('0899 7777 6666').length === 1);
ok('nomor HP dinormalkan', B.normPhone('+62 812-0000-1234') === '081200001234');

/* ---------- 11. warna aksen ---------- */
B.writeAccent('#00A3FF');
ok('warna aksen tersimpan', B.readAccent() === '#00A3FF');

/* ---------- 12. data contoh ---------- */
const seeded = B.seedSampleData();
ok('data contoh dimuat 4 booking', seeded.created === 4);
ok('data contoh pakai kode BK-C', B.loadBookings().filter((b) => b.sample).every((b) => /^BK-C\d{3}$/.test(b.id)));
ok('data contoh ditandai', B.hasSampleData() === true);
ok('data contoh tidak memakai nomor urut asli', B.loadBookings().filter((b) => b.sample).every((b) => /^BK-C/.test(b.id)));
const cleared = B.clearSampleData();
ok('data contoh bisa dibersihkan', cleared.removed === 4 && B.hasSampleData() === false);
ok('data nyata tidak ikut terhapus', B.loadAllBookings().some((b) => b.id === b3.id));

/* ---------- 13. pencarian pelanggan ---------- */
ok('cari dengan kode + nomor benar', B.findBookingForCustomer(b3.id, '0814 4444 5555').ok === true);
ok('nomor salah ditolak', B.findBookingForCustomer(b3.id, '0800 0000 0000').ok === false);
ok('kode salah ditolak', B.findBookingForCustomer('BK-XXXX', '0814 4444 5555').ok === false);
ok('tanpa nomor ditolak', B.findBookingForCustomer(b3.id, '').ok === false);

/* ---------- 14. ringkasan durasi ---------- */
ok('durasi dari katalog', B.durText('Ganti oli') === '±45 menit');
ok('durasi jam', B.durText('Servis berkala') === '±2 jam');
ok('durasi belum pasti', B.durText('Ada keluhan').indexOf('cek dulu') === 0);
ok('estimasi ambil yang terlama', B.estimateMinutes({ cars: [{ svc: 'Ganti oli' }, { svc: 'Servis AC' }] }) === 90);

/* ---------- hasil ---------- */
let fail = 0;
for (const [name, pass] of rows) {
  if (!pass) { console.log('FAIL  ' + name); fail += 1; }
}
console.log(fail ? `${fail} GAGAL dari ${rows.length} cek` : `domain: LULUS semua (${rows.length} cek)`);
process.exit(fail ? 1 : 0);
