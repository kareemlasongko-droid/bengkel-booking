/* ============================================================
 *  Sistem Booking Bengkel — lapisan data & aturan bisnis
 *  Dipakai bersama oleh tiga portal di origin yang sama:
 *    - index.html  (pelanggan)
 *    - admin.html  (admin bengkel)
 *    - mech.html   (mekanik)
 *
 *  Semua aturan operasional (konfigurasi master, ketersediaan
 *  slot, alur status, penugasan mekanik, audit trail, arsip,
 *  kendaraan pelanggan, data contoh) ada di sini supaya ketiga
 *  portal memakai satu sumber kebenaran.
 * ============================================================ */

const STORE_KEY = 'bengkel.bookings.v1';
const SEQ_KEY = 'bengkel.seq.v1';
const ACCENT_KEY = 'bengkel.accent.v1';
const VEHICLES_KEY = 'bengkel.vehicles.v1';
const DEFAULT_ACCENT = '#FFB81C';

/* ============================================================
 *  1. KONFIGURASI MASTER (satu sumber untuk semua portal)
 * ============================================================ */

/* Katalog servis + durasi (menit). mins = 0 artinya "dicek dulu". */
const SERVICE_CATALOG = [
  { id: 'oli', name: 'Ganti oli', mins: 45 },
  { id: 'berkala', name: 'Servis berkala', mins: 120 },
  { id: 'rem', name: 'Cek dan servis rem', mins: 60 },
  { id: 'ac', name: 'Servis AC', mins: 90 },
  { id: 'keluhan', name: 'Ada keluhan', mins: 0 },
  { id: 'cek', name: 'Belum tahu, minta dicek', mins: 0 }
];

/* Mekanik bengkel. Satu mekanik menangani maksimal 1 mobil per slot. */
const MECHANICS = [
  { id: 'budi', name: 'Pak Budi', phone: '0812 3456 0001', pin: '1111' },
  { id: 'andi', name: 'Andi', phone: '0812 3456 0002', pin: '2222' },
  { id: 'rizal', name: 'Rizal', phone: '0812 3456 0003', pin: '3333' },
  { id: 'dedi', name: 'Dedi', phone: '0812 3456 0004', pin: '4444' }
];

/* Jam datang + kuota mobil per jam (dibatasi juga oleh jumlah mekanik). */
const SLOT_TEMPLATE = [
  { t: '08:30', quota: 4 },
  { t: '10:00', quota: 2 },
  { t: '11:30', quota: 3 },
  { t: '13:00', quota: 4 },
  { t: '14:30', quota: 3 },
  { t: '16:00', quota: 1 }
];

/* Hari tutup (0 = Minggu ... 6 = Sabtu) dan tanggal libur (YYYY-MM-DD). */
const CLOSED_DOW = [];
const HOLIDAYS = [];
const DAYS_AHEAD = 7;   /* berapa hari ke depan yang ditawarkan */
const DAYS_SHOWN = 5;   /* jumlah tanggal yang tampil seperti design */

/* Mekanik "otomatis" pada data lama / pilihan pelanggan */
const AUTO_MECH = 'Otomatis (dipilihkan bengkel)';

/* ============================================================
 *  2. STATUS & ALURNYA
 * ============================================================ */

const BOOKING_STATUS = {
  confirmed:   { label: 'Konfirmasi',  tone: 'blue' },
  arrived:     { label: 'Tiba',        tone: 'amber' },
  in_progress: { label: 'Dikerjakan',  tone: 'violet' },
  done:        { label: 'Selesai',     tone: 'green' },
  cancelled:   { label: 'Dibatalkan',  tone: 'red' },
  no_show:     { label: 'Tidak datang', tone: 'red' }
};

/* Transisi status yang sah — mencegah status liar / typo. */
const STATUS_FLOW = {
  confirmed: ['arrived', 'cancelled', 'no_show'],
  arrived: ['in_progress', 'cancelled', 'no_show'],
  in_progress: ['done', 'cancelled'],
  done: [],
  cancelled: [],
  no_show: []
};

function canTransition(from, to) {
  return (STATUS_FLOW[from] || []).indexOf(to) !== -1;
}

/* Status yang masih memakai slot (booking aktif). */
function holdsSlot(status) {
  return status !== 'cancelled' && status !== 'no_show';
}

/* ============================================================
 *  3. UTILITAS DASAR
 * ============================================================ */

const pad2 = (v) => String(v).padStart(2, '0');

function fmtISO(date) {
  return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
}

function todayISO() {
  return fmtISO(new Date());
}

function parseISO(iso) {
  const [y, m, d] = String(iso || '').split('-').map((v) => parseInt(v, 10));
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return isNaN(date) ? null : date;
}

const DOW_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const DOW_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTH_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function normPhone(v) {
  return String(v || '').replace(/\D/g, '').replace(/^62/, '0');
}

function isClosedDate(iso) {
  const d = parseISO(iso);
  if (!d) return true;
  if (CLOSED_DOW.indexOf(d.getDay()) !== -1) return true;
  return HOLIDAYS.indexOf(iso) !== -1;
}

function dayInfo(iso) {
  const d = parseISO(iso);
  if (!d) return null;
  return {
    iso: iso,
    dow: DOW_SHORT[d.getDay()],
    date: d.getDate() + ' ' + MONTH_SHORT[d.getMonth()],
    full: DOW_FULL[d.getDay()] + ', ' + d.getDate() + ' ' + MONTH_SHORT[d.getMonth()],
    fullLong: DOW_FULL[d.getDay()] + ', ' + d.getDate() + ' ' + MONTH_FULL[d.getMonth()] + ' ' + d.getFullYear()
  };
}

/* Tanggal yang bisa dipilih, mulai hari ini, melewati hari tutup/libur. */
function upcomingDays(count) {
  const out = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  let guard = 0;
  while (out.length < (count || DAYS_SHOWN) && guard < 120) {
    const iso = fmtISO(cursor);
    if (!isClosedDate(iso)) out.push(dayInfo(iso));
    cursor.setDate(cursor.getDate() + 1);
    guard += 1;
  }
  return out;
}

/* Semua tanggal yang ditawarkan ke admin (lebih panjang dari pelanggan). */
function bookableDays() {
  return upcomingDays(DAYS_AHEAD);
}

function fmtDateID(isoStr) {
  const d = new Date(isoStr);
  if (isNaN(d)) return '';
  return DOW_SHORT[d.getDay()] + ', ' + d.getDate() + ' ' + MONTH_SHORT[d.getMonth()] + ' ' + d.getFullYear() +
    ' · ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
}

/* ============================================================
 *  4. WARNA AKSEN (dipilih pelanggan, dipakai 3 portal)
 * ============================================================ */

function readAccent() {
  try {
    const v = localStorage.getItem(ACCENT_KEY);
    return /^#[0-9a-fA-F]{6}$/.test(v || '') ? v : DEFAULT_ACCENT;
  } catch (e) {
    return DEFAULT_ACCENT;
  }
}

function writeAccent(color) {
  try { localStorage.setItem(ACCENT_KEY, color); } catch (e) {}
}

function useAccent() {
  const [accent, setAccent] = React.useState(readAccent);
  React.useEffect(() => {
    const sync = () => setAccent(readAccent());
    window.addEventListener('focus', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('focus', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return accent;
}

/* ============================================================
 *  5. PENYIMPANAN BOOKING + NORMALISASI DATA LAMA
 * ============================================================ */

function normalizeCar(car, booking) {
  const c = Object.assign({}, car);
  c.plate = c.plate || '-';
  c.model = c.model || '';
  c.svc = c.svc || '-';
  if (typeof c.done !== 'boolean') {
    c.done = Array.isArray(booking.doneCars) && booking.doneCars.indexOf(car.__i) !== -1;
  }
  if (typeof c.mech !== 'string') {
    const fallback = booking.mech && booking.mech !== AUTO_MECH ? booking.mech : '';
    c.mech = fallback;
  }
  return c;
}

/* Bawa data v1 (tanpa dateISO / mech per mobil / audit) ke bentuk baru. */
function normalizeBooking(raw) {
  const b = Object.assign({}, raw);
  if (!b.dateISO) b.dateISO = todayISO();
  if (!b.dayFull) {
    const info = dayInfo(b.dateISO);
    b.dayFull = info ? info.full : b.dateISO;
  }
  b.cars = Array.isArray(b.cars) ? b.cars.map((c, i) => normalizeCar(Object.assign({ __i: i }, c), raw)) : [];
  b.cars.forEach((c) => { delete c.__i; });
  if (!Array.isArray(b.audit)) b.audit = [];
  if (typeof b.archived !== 'boolean') b.archived = false;
  if (!b.checkinCode) b.checkinCode = legacyCheckinCode(b.id);
  if (!b.source) b.source = 'online';
  if (!b.status) b.status = 'confirmed';
  b.sample = !!b.sample;
  return b;
}

/* Kode check-in untuk data lama: deterministik dari id, 4 angka. */
function legacyCheckinCode(id) {
  let h = 0;
  const s = String(id || 'BK-0000');
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) % 10000;
  return String(h).padStart(4, '0');
}

function randomCheckinCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function persistBookings(list) {
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

/* Semua booking (termasuk arsip) */
function loadAllBookings() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    return list.map(normalizeBooking);
  } catch (e) {
    return [];
  }
}

/* Booking aktif (belum diarsipkan) — dipakai semua portal */
function loadBookings() {
  return loadAllBookings().filter((b) => !b.archived);
}

function loadArchivedBookings() {
  return loadAllBookings().filter((b) => b.archived);
}

/* Booking yang masih memakai slot (bukan batal / tidak datang / arsip) */
function slotBookings() {
  return loadBookings().filter((b) => holdsSlot(b.status));
}

function nextCode() {
  let seq = 270;
  try { seq = parseInt(localStorage.getItem(SEQ_KEY), 10) || 270; } catch (e) {}
  seq += 1;
  try { localStorage.setItem(SEQ_KEY, String(seq)); } catch (e) {}
  return 'BK-' + String(seq).padStart(4, '0');
}

/* ============================================================
 *  6. AUDIT TRAIL
 * ============================================================ */

function logAudit(booking, actor, action, detail) {
  if (!Array.isArray(booking.audit)) booking.audit = [];
  booking.audit.unshift({
    at: new Date().toISOString(),
    actor: actor || 'sistem',
    action: action,
    from: (detail && detail.from) || null,
    to: (detail && detail.to) || null,
    note: (detail && detail.note) || ''
  });
  if (booking.audit.length > 40) booking.audit = booking.audit.slice(0, 40);
}

/* ============================================================
 *  7. KETERSEDIAAN SLOT (nyata, dihitung dari booking)
 * ============================================================ */

function slotQuota(slot) {
  const found = SLOT_TEMPLATE.find((s) => s.t === slot);
  const quota = found ? found.quota : 0;
  return Math.min(quota, MECHANICS.length);
}

/* Berapa mobil yang sudah memakai slot itu pada tanggal tsb. */
function slotUsed(dateISO, slot) {
  return slotBookings()
    .filter((b) => b.dateISO === dateISO && b.slot === slot)
    .reduce((n, b) => n + b.cars.length, 0);
}

function slotFree(dateISO, slot) {
  return Math.max(0, slotQuota(slot) - slotUsed(dateISO, slot));
}

/* Berapa mobil yang dipegang seorang mekanik pada slot itu. */
function mechUsed(dateISO, slot, mechName) {
  if (!mechName) return 0;
  return slotBookings()
    .filter((b) => b.dateISO === dateISO && b.slot === slot)
    .reduce((n, b) => n + b.cars.filter((c) => c.mech === mechName).length, 0);
}

function mechFree(dateISO, slot, mechName) {
  return mechUsed(dateISO, slot, mechName) === 0;
}

/* Pelanggan memilih: otomatis ('' ) atau satu mekanik untuk semua mobilnya. */
function slotOk(dateISO, slot, mechName, carCount, ignoreId) {
  if (!dateISO || isClosedDate(dateISO)) return false;
  if (dateISO < todayISO()) return false;
  const n = carCount || 1;
  let used = 0;
  if (ignoreId) {
    used = slotBookings()
      .filter((b) => b.id !== ignoreId && b.dateISO === dateISO && b.slot === slot)
      .reduce((acc, b) => acc + b.cars.length, 0);
  } else {
    used = slotUsed(dateISO, slot);
  }
  if (slotQuota(slot) - used < n) return false;
  if (!mechName) return true;
  const busy = slotBookings().filter((b) => b.id !== ignoreId && b.dateISO === dateISO && b.slot === slot)
    .reduce((acc, b) => acc + b.cars.filter((c) => c.mech === mechName).length, 0);
  return busy === 0;
}

/* ============================================================
 *  8. OPERASI BOOKING
 * ============================================================ */

/* 'status' sengaja tidak ada di sini: status hanya lewat updateBookingStatus */
const PATCH_FIELDS = [
  'cars', 'note', 'phone', 'role', 'ownerPhone', 'wait',
  'remindOn', 'promoOn', 'dateISO', 'dayFull', 'slot', 'mech',
  'archived', 'archivedAt', 'source', 'checkinCode', 'sample'
];

function saveBooking(data) {
  const list = loadAllBookings();
  const info = dayInfo(data.dateISO || todayISO());
  const booking = Object.assign({
    id: nextCode(),
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    dateISO: data.dateISO || todayISO(),
    dayFull: info ? info.full : '',
    checkinCode: randomCheckinCode(),
    source: 'online',
    archived: false,
    audit: [],
    cars: []
  }, data);
  booking.cars = (booking.cars || []).map((c) => ({
    plate: c.plate || '-',
    model: c.model || '',
    svc: c.svc || '-',
    mech: c.mech || '',
    done: !!c.done
  }));
  logAudit(booking, data.actor || 'pelanggan', 'booking dibuat', {
    to: booking.status,
    note: booking.source === 'walkin' ? 'Walk-in di bengkel' : 'Booking online'
  });
  delete booking.actor;
  list.unshift(booking);
  persistBookings(list);
  return booking;
}

function findBooking(id) {
  return loadAllBookings().find((b) => b.id === id) || null;
}

function withBooking(id, mutate) {
  const list = loadAllBookings();
  const b = list.find((x) => x.id === id);
  if (!b) return { ok: false, error: 'Booking tidak ditemukan.' };
  const result = mutate(b, list) || {};
  if (result.ok === false) return result;
  persistBookings(list);
  return Object.assign({ ok: true, booking: b }, result);
}

/* Ubah sebagian field dengan whitelist (mencegah id/status dirusak). */
function updateBooking(id, patch, actor, action) {
  return withBooking(id, (b) => {
    let changed = false;
    Object.keys(patch || {}).forEach((key) => {
      if (PATCH_FIELDS.indexOf(key) === -1) return;
      b[key] = patch[key];
      changed = true;
    });
    if (changed) {
      b.updatedAt = new Date().toISOString();
      logAudit(b, actor || 'sistem', action || 'data diperbarui');
    }
    return { ok: true };
  });
}

/* Transisi status yang dijaga STATUS_FLOW. */
function updateBookingStatus(id, to, actor, note) {
  return withBooking(id, (b) => {
    if (b.status === to) return { ok: true, unchanged: true };
    if (!canTransition(b.status, to)) {
      return { ok: false, error: 'Status tidak bisa diubah dari ' + statusLabel(b.status) + ' ke ' + statusLabel(to) + '.' };
    }
    const from = b.status;
    b.status = to;
    b.updatedAt = new Date().toISOString();
    if (to === 'cancelled' || to === 'no_show') b.closedReason = note || '';
    logAudit(b, actor || 'sistem', 'status: ' + statusLabel(from) + ' → ' + statusLabel(to), { from: from, to: to, note: note || '' });
    return { ok: true };
  });
}

function statusLabel(status) {
  return (BOOKING_STATUS[status] || { label: status }).label;
}

/* Check-in: kode 4 angka dari pelanggan → status Tiba. */
function checkInBooking(id, code, actor) {
  return withBooking(id, (b) => {
    if (b.status !== 'confirmed') {
      return { ok: false, error: 'Check-in hanya untuk booking berstatus Konfirmasi.' };
    }
    if (String(code || '').trim() !== String(b.checkinCode)) {
      return { ok: false, error: 'Kode check-in tidak cocok.' };
    }
    b.status = 'arrived';
    b.updatedAt = new Date().toISOString();
    b.checkedInAt = b.updatedAt;
    logAudit(b, actor || 'admin', 'status: Konfirmasi → Tiba', { from: 'confirmed', to: 'arrived', note: 'Check-in terverifikasi kode' });
    return { ok: true };
  });
}

/* Batal / tidak datang dengan alasan (tercatat di audit). */
function closeBooking(id, to, reason, actor) {
  if (to !== 'cancelled' && to !== 'no_show') return { ok: false, error: 'Status penutup tidak dikenal.' };
  return updateBookingStatus(id, to, actor, reason);
}

/* Reschedule ke tanggal/jam lain, dengan cek ketersediaan. */
function rescheduleBooking(id, dateISO, slot, actor) {
  return withBooking(id, (b) => {
    if (b.status !== 'confirmed' && b.status !== 'arrived') {
      return { ok: false, error: 'Booking yang sudah dikerjakan tidak bisa dijadwal ulang.' };
    }
    if (isClosedDate(dateISO)) return { ok: false, error: 'Bengkel tutup pada tanggal itu.' };
    if (dateISO < todayISO()) return { ok: false, error: 'Tanggal sudah lewat.' };
    if (!slotOk(dateISO, slot, '', b.cars.length, b.id)) {
      return { ok: false, error: 'Slot ' + slot + ' sudah penuh untuk ' + b.cars.length + ' mobil.' };
    }
    const from = b.dayFull + ' · ' + b.slot;
    b.dateISO = dateISO;
    b.slot = slot;
    const info = dayInfo(dateISO);
    b.dayFull = info ? info.full : dateISO;
    /* mekanik yang bentrok di jam baru dilepas supaya bisa ditugaskan lagi */
    b.cars = b.cars.map((c) => (c.mech && !mechFree(dateISO, slot, c.mech) ? Object.assign({}, c, { mech: '' }) : c));
    b.updatedAt = new Date().toISOString();
    logAudit(b, actor || 'pelanggan', 'jadwal diubah', { note: from + ' → ' + b.dayFull + ' · ' + slot });
    return { ok: true };
  });
}

/* Penugasan mekanik per mobil. */
function assignMechanic(id, carIndex, mechName, actor) {
  return withBooking(id, (b) => {
    if (!b.cars[carIndex]) return { ok: false, error: 'Mobil tidak ditemukan.' };
    if (mechName && !mechFree(b.dateISO, b.slot, mechName) && b.cars[carIndex].mech !== mechName) {
      return { ok: false, error: mechName + ' sudah memegang mobil lain di jam itu.' };
    }
    const before = b.cars[carIndex].mech || 'belum ada';
    b.cars[carIndex].mech = mechName || '';
    b.updatedAt = new Date().toISOString();
    logAudit(b, actor || 'admin', 'mekanik ' + b.cars[carIndex].plate, { note: before + ' → ' + (mechName || 'belum ada') });
    return { ok: true };
  });
}

/* Bagikan mobil ke mekanik paling longgar pada slot itu. */
function autoAssignMechanics(id, actor) {
  return withBooking(id, (b) => {
    const load = {};
    MECHANICS.forEach((m) => { load[m.id] = mechUsed(b.dateISO, b.slot, m.name); });
    const assigned = [];
    b.cars.forEach((c, i) => {
      if (c.mech) load[MECHANICS.find((m) => m.name === c.mech) ? MECHANICS.find((m) => m.name === c.mech).id : ''] = 99;
      if (c.mech) return;
      const pick = MECHANICS.slice().sort((x, y) => load[x.id] - load[y.id])[0];
      if (!pick || load[pick.id] > 0) return;
      b.cars[i].mech = pick.name;
      load[pick.id] += 1;
      assigned.push(c.plate + ' → ' + pick.name);
    });
    if (!assigned.length) return { ok: false, error: 'Semua mekanik sudah memegang mobil di jam itu.' };
    b.updatedAt = new Date().toISOString();
    logAudit(b, actor || 'admin', 'penugasan otomatis', { note: assigned.join(', ') });
    return { ok: true, assigned: assigned };
  });
}

/* Progres per mobil. */
function setCarDone(id, carIndex, done, actor) {
  return withBooking(id, (b) => {
    if (!b.cars[carIndex]) return { ok: false, error: 'Mobil tidak ditemukan.' };
    b.cars[carIndex].done = !!done;
    b.updatedAt = new Date().toISOString();
    logAudit(b, actor || 'mekanik', (done ? 'selesai: ' : 'batal selesai: ') + b.cars[carIndex].plate);
    return { ok: true };
  });
}

/* Arsip (soft delete) — riwayat tetap ada. */
function archiveBooking(id, actor) {
  return withBooking(id, (b) => {
    b.archived = true;
    b.archivedAt = new Date().toISOString();
    logAudit(b, actor || 'admin', 'booking diarsipkan');
    return { ok: true };
  });
}

function restoreBooking(id, actor) {
  return withBooking(id, (b) => {
    b.archived = false;
    b.archivedAt = null;
    logAudit(b, actor || 'admin', 'booking dipulihkan dari arsip');
    return { ok: true };
  });
}

/* Hapus permanen hanya untuk data yang sudah diarsipkan / data contoh. */
function purgeBooking(id, actor) {
  const all = loadAllBookings();
  const b = all.find((x) => x.id === id);
  if (!b) return { ok: false, error: 'Booking tidak ditemukan.' };
  if (!b.archived && !b.sample) return { ok: false, error: 'Arsipkan dulu sebelum menghapus permanen.' };
  persistBookings(all.filter((x) => x.id !== id));
  return { ok: true };
}

/* ============================================================
 *  9. KENDARAAN PELANGGAN (persisten per nomor HP)
 * ============================================================ */

function loadVehicleMap() {
  try {
    const raw = localStorage.getItem(VEHICLES_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map && typeof map === 'object' ? map : {};
  } catch (e) {
    return {};
  }
}

function persistVehicleMap(map) {
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(map));
}

const DEMO_PHONE = '0812 0000 1234';
const DEMO_CARS = [
  { plate: 'B 1234 XYZ', model: 'Toyota Avanza 2018', last: 'Servis terakhir 12 Agu 2026' },
  { plate: 'B 5678 ABC', model: 'Honda Brio 2020', last: 'Servis terakhir 3 Mei 2026' }
];

function loadVehicles(phone) {
  const key = normPhone(phone);
  if (!key) return [];
  const map = loadVehicleMap();
  if (Array.isArray(map[key])) return map[key];
  /* nomor demo: isi mobil contoh sekali, setelah itu persisten */
  if (key === normPhone(DEMO_PHONE)) {
    map[key] = DEMO_CARS.map((c) => Object.assign({}, c));
    try { persistVehicleMap(map); } catch (e) {}
    return map[key];
  }
  return [];
}

function upsertVehicle(phone, car) {
  const key = normPhone(phone);
  if (!key) return { ok: false, error: 'Nomor HP belum diisi.' };
  const map = loadVehicleMap();
  const list = Array.isArray(map[key]) ? map[key].slice() : [];
  const plate = String(car.plate || '').trim().toUpperCase();
  if (!plate) return { ok: false, error: 'Plat nomor wajib diisi.' };
  const existing = list.findIndex((c) => c.plate === plate);
  const entry = { plate: plate, model: car.model || 'Tipe belum diisi', last: 'Baru ditambahkan' };
  if (existing === -1) list.push(entry);
  else list[existing] = Object.assign({}, list[existing], entry);
  map[key] = list;
  persistVehicleMap(map);
  return { ok: true, car: entry, list: list };
}

function vehiclesForPhone(phone) {
  return loadVehicles(phone);
}

/* ============================================================
 *  10. DATA CONTOH (ditandai, tidak memakai nomor urut asli)
 * ============================================================ */

function hasSampleData() {
  return loadAllBookings().some((b) => b.sample);
}

function seedSampleData() {
  const all = loadAllBookings();
  if (all.some((b) => b.sample)) return { ok: true, created: 0 };
  const days = upcomingDays(3);
  const dev = ['Pak Budi', 'Andi', 'Rizal'];
  const base = [
    { status: 'in_progress', hour: 7, minute: 42, phone: '0812 3456 7890', role: 'owner',
      cars: [{ plate: 'B 1234 XYZ', model: 'Toyota Avanza 2018', svc: 'Ganti oli', mech: 'Pak Budi' },
             { plate: 'B 5678 ABC', model: 'Honda Brio 2020', svc: 'Cek dan servis rem', mech: 'Andi' }],
      note: 'Bunyi berdecit saat mengerem pelan.', wait: 'tunggu', slot: '08:30', dayIndex: 0 },
    { status: 'confirmed', hour: 8, minute: 15, phone: '0821 9876 5432', role: 'driver', ownerPhone: '0813 1111 2222',
      cars: [{ plate: 'D 9012 KLM', model: 'Mitsubishi Xpander 2021', svc: 'Servis berkala', mech: '' }],
      note: '', wait: 'tinggal', slot: '13:00', dayIndex: 0 },
    { status: 'confirmed', hour: 9, minute: 5, phone: '0857 2233 4455', role: 'owner',
      cars: [{ plate: 'A 3345 QWE', model: 'Suzuki Ertiga 2019', svc: 'Belum tahu, minta dicek', mech: 'Rizal' }],
      note: 'Lampu depan sebelah kiri redup, A/C kurang dingin pagi hari.', wait: 'tunggu', slot: '10:00', dayIndex: Math.min(1, days.length - 1) },
    { status: 'done', hour: 8, minute: 55, phone: '0812 0000 1234', role: 'owner',
      cars: [{ plate: 'B 7788 MNO', model: 'Toyota Innova 2016', svc: 'Servis AC', mech: 'Andi' }],
      note: '', wait: 'tinggal', slot: '11:30', dayIndex: 0 }
  ];
  const created = base.map((s, i) => {
    const day = days[s.dayIndex] || days[0];
    const at = new Date();
    at.setHours(s.hour, s.minute, 0, 0);
    return normalizeBooking({
      id: 'BK-C' + String(i + 1).padStart(3, '0'),
      status: s.status,
      createdAt: at.toISOString(),
      dateISO: day.iso,
      dayFull: day.full,
      slot: s.slot,
      phone: s.phone,
      role: s.role,
      ownerPhone: s.ownerPhone || '',
      cars: s.cars.map((c) => Object.assign({ done: s.status === 'done' }, c)),
      note: s.note,
      wait: s.wait,
      mech: AUTO_MECH,
      remindOn: true,
      promoOn: false,
      checkinCode: String(1100 + i),
      source: 'online',
      sample: true,
      audit: [{ at: at.toISOString(), actor: 'sistem', action: 'data contoh dimuat', from: null, to: s.status, note: '' }]
    });
  });
  persistBookings(created.concat(all));
  return { ok: true, created: created.length };
}

function clearSampleData() {
  const all = loadAllBookings();
  const remaining = all.filter((b) => !b.sample);
  persistBookings(remaining);
  return { ok: true, removed: all.length - remaining.length };
}

/* ============================================================
 *  11. RINGKASAN UNTUK TAMPILAN
 * ============================================================ */

function carsDone(b) {
  return (b.cars || []).filter((c) => c.done).length;
}

function mechanicSummary(b) {
  const names = [];
  (b.cars || []).forEach((c) => {
    if (c.mech && names.indexOf(c.mech) === -1) names.push(c.mech);
  });
  if (!names.length) return 'Belum ditugaskan';
  if (names.length === 1) return names[0];
  return names.length + ' mekanik';
}

function isUnassigned(b) {
  return (b.cars || []).some((c) => !c.mech);
}

function mechHasBooking(b, mechName) {
  return (b.cars || []).some((c) => c.mech === mechName);
}

function mineUnassigned(b) {
  return (b.cars || []).filter((c) => !c.mech);
}

function durationOf(svcName) {
  const s = SERVICE_CATALOG.find((x) => x.name === svcName);
  return s ? s.mins : 0;
}

function durText(svcName) {
  const m = durationOf(svcName);
  if (!m) return 'cek dulu ±30–60 menit';
  return m < 60 ? '±' + m + ' menit' : '±' + String(m / 60).replace('.', ',') + ' jam';
}

function estimateMinutes(b) {
  const mins = (b.cars || []).map((c) => durationOf(c.svc));
  if (mins.some((m) => m === 0)) return 0;
  return Math.max(0, ...mins);
}

/* Cari booking untuk pelanggan: kode + nomor HP. */
function findBookingForCustomer(code, phone) {
  const id = String(code || '').trim().toUpperCase();
  const key = normPhone(phone);
  const b = loadAllBookings().find((x) => String(x.id).toUpperCase() === id);
  if (!b) return { ok: false, error: 'Kode booking tidak ditemukan.' };
  if (!key) return { ok: false, error: 'Masukkan nomor WhatsApp yang dipakai saat booking.' };
  const phones = [normPhone(b.phone), normPhone(b.ownerPhone)].filter(Boolean);
  if (phones.indexOf(key) === -1) return { ok: false, error: 'Nomor tidak cocok dengan booking ini.' };
  return { ok: true, booking: b };
}
