/* ============================================================
 *  Sistem Booking Bengkel — data layer (localStorage)
 *  Dipakai bersama oleh halaman pelanggan (index.html) dan
 *  halaman admin bengkel (admin.html) yang sama-sama di-host
 *  di origin yang sama.
 * ============================================================ */

const STORE_KEY = 'bengkel.bookings.v1';
const SEQ_KEY = 'bengkel.seq.v1';

const BOOKING_STATUS = {
  confirmed: { label: 'Konfirmasi', tone: 'blue' },
  arrived:   { label: 'Tiba',       tone: 'amber' },
  in_progress: { label: 'Dikerjakan', tone: 'violet' },
  done:      { label: 'Selesai',   tone: 'green' },
  cancelled: { label: 'Dibatalkan', tone: 'red' }
};

function loadBookings() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function persistBookings(list) {
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

function nextCode() {
  let seq = 270;
  try { seq = parseInt(localStorage.getItem(SEQ_KEY), 10) || 270; } catch (e) {}
  seq += 1;
  try { localStorage.setItem(SEQ_KEY, String(seq)); } catch (e) {}
  return 'BK-' + String(seq).padStart(4, '0');
}

function saveBooking(data) {
  const list = loadBookings();
  const booking = Object.assign({
    id: nextCode(),
    status: 'confirmed',
    createdAt: new Date().toISOString()
  }, data);
  list.unshift(booking);
  persistBookings(list);
  return booking;
}

function updateBookingStatus(id, status) {
  const list = loadBookings();
  const b = list.find((x) => x.id === id);
  if (b) {
    b.status = status;
    b.updatedAt = new Date().toISOString();
    persistBookings(list);
  }
  return b;
}

function deleteBooking(id) {
  persistBookings(loadBookings().filter((x) => x.id !== id));
}

/* Data contoh untuk mencobakan admin tanpa booking asli */
function seedSampleBookings() {
  const list = loadBookings();
  if (list.length > 0) return list;
  const now = new Date();
  const iso = (d) => d.toISOString();
  const d = (dayOffset, h, m) => { const x = new Date(now); x.setDate(x.getDate() + dayOffset); x.setHours(h, m, 0, 0); return x; };
  const samples = [
    {
      id: nextCode(), status: 'in_progress', createdAt: iso(d(0, 7, 42)),
      phone: '0812 3456 7890', role: 'owner', ownerPhone: '',
      cars: [
        { plate: 'B 1234 XYZ', model: 'Toyota Avanza 2018', svc: 'Ganti oli' },
        { plate: 'B 5678 ABC', model: 'Honda Brio 2020', svc: 'Cek dan servis rem' }
      ],
      note: 'Bunyi berdecit saat mengerem pelan.',
      wait: 'tunggu', dayFull: 'Rabu, 28 Okt', slot: '08:30',
      mech: 'Pak Budi', remindOn: true, promoOn: false
    },
    {
      id: nextCode(), status: 'confirmed', createdAt: iso(d(0, 8, 15)),
      phone: '0821 9876 5432', role: 'driver', ownerPhone: '0813 1111 2222',
      cars: [{ plate: 'D 9012 KLM', model: 'Mitsubishi Xpander 2021', svc: 'Servis berkala' }],
      note: '',
      wait: 'tinggal', dayFull: 'Rabu, 28 Okt', slot: '13:00',
      mech: 'Otomatis (dipilihkan bengkel)', remindOn: true, promoOn: true
    },
    {
      id: nextCode(), status: 'confirmed', createdAt: iso(d(0, 9, 5)),
      phone: '0857 2233 4455', role: 'owner', ownerPhone: '',
      cars: [{ plate: 'A 3345 QWE', model: 'Suzuki Ertiga 2019', svc: 'Belum tahu, minta dicek' }],
      note: 'Lampu depan sebelah kiri redup, A/C kurang dingin pagi hari.',
      wait: 'tunggu', dayFull: 'Kamis, 29 Okt', slot: '10:00',
      mech: 'Rizal', remindOn: false, promoOn: false
    },
    {
      id: nextCode(), status: 'done', createdAt: iso(d(-1, 8, 55)),
      phone: '0812 0000 1234', role: 'owner', ownerPhone: '',
      cars: [{ plate: 'B 7788 MNO', model: 'Toyota Innova 2016', svc: 'Servis AC' }],
      note: '',
      wait: 'tinggal', dayFull: 'Selasa, 27 Okt', slot: '11:30',
      mech: 'Andi', remindOn: true, promoOn: true
    }
  ];
  list.unshift(...samples);
  persistBookings(list);
  return list;
}

function fmtDateID(isoStr) {
  const d = new Date(isoStr);
  if (isNaN(d)) return '';
  const hari = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return hari[d.getDay()] + ', ' + d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear() +
    ' · ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
