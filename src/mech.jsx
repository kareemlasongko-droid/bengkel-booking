/* ============================================================
 *  Sistem Booking Bengkel — portal mekanik
 *  Daftar pekerjaan untuk mekanik: melihat tugas yang
 *  ditugaskan, menandai mobil selesai, memulai & menyelesaikan
 *  pekerjaan. Data bersama dengan index.html & admin.html
 *  (lihat booking.js, satu origin yang sama).
 * ============================================================ */

const { useState, useEffect } = React;

const INK = '#12161C';
const GRAY = '#5A6270';
const LINE = '#DDE1E7';
const MUTED = '#8791A0';
const BG = '#F2F3F5';
const AMBER = '#FFB81C';
const GREEN = '#1F7A45';

const TONE = {
  blue:   { bg: '#E7F0FD', fg: '#1D4E89' },
  amber:  { bg: '#FDF1DC', fg: '#8A5307' },
  violet: { bg: '#EFE9FD', fg: '#5B21B6' },
  green:  { bg: '#DCF5E1', fg: '#165C34' },
  red:    { bg: '#FDE8E6', fg: '#B42318' }
};

/* Sama dengan MECHS di src/app.jsx + opsi "belum ditugaskan" */
const AUTO_MECH = 'Otomatis (dipilihkan bengkel)';
const MECH_LIST = [
  { id: 'all', name: 'Semua mekanik' },
  { id: 'budi', name: 'Pak Budi' },
  { id: 'andi', name: 'Andi' },
  { id: 'rizal', name: 'Rizal' },
  { id: 'dedi', name: 'Dedi' },
  { id: 'auto', name: 'Belum ditugaskan' }
];

/* Durasi per servis — sama dengan SERVICES di src/app.jsx */
const SVC_MINS = {
  'Ganti oli': 45,
  'Servis berkala': 120,
  'Cek dan servis rem': 60,
  'Servis AC': 90
};

const STATUS_ORDER = { in_progress: 0, arrived: 1, confirmed: 2, done: 3 };

const durText = (svc) => {
  const m = SVC_MINS[svc];
  if (!m) return 'cek dulu ±30–60 menit';
  return m < 60 ? '±' + m + ' menit' : '±' + String(m / 60).replace('.', ',') + ' jam';
};

/* ---------- ikon (SVG dari design) ---------- */
const WrenchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
);
const CheckIcon = ({ size = 14, width = 2.4 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"></path></svg>
);

function StatusChip({ status }) {
  const meta = BOOKING_STATUS[status] || { label: status, tone: 'blue' };
  const t = TONE[meta.tone] || TONE.blue;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: t.bg, color: t.fg, fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>
      {status === 'done' ? <CheckIcon /> : null}
      {meta.label}
    </span>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{ flex: '1 1 140px', minWidth: 130, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 14, padding: '14px 16px' }}>
      <div style={{ fontSize: 12, color: GRAY, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, marginTop: 2 }}>{value}</div>
      {sub ? <div style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>{sub}</div> : null}
    </div>
  );
}

/* Kotak centang mobil — sama seperti BoxCheck di design */
function CarCheck({ on }) {
  return (
    <span style={{ width: 26, height: 26, flex: 'none', boxSizing: 'border-box', borderRadius: 8, border: '2px solid ' + (on ? INK : MUTED), background: on ? INK : '#FFFFFF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {on ? <CheckIcon size={16} /> : null}
    </span>
  );
}

function JobCard({ b, onArrive, onStart, onFinish, onToggleCar }) {
  const total = b.cars.length;
  const doneCars = Array.isArray(b.doneCars) ? b.doneCars : [];
  const done = b.cars.filter((c, i) => doneCars.indexOf(i) !== -1).length;
  const allDone = done === total;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: 1 }}>{b.id}</span>
          <StatusChip status={b.status} />
        </div>
        <span style={{ fontSize: 12, color: MUTED }}>{fmtDateID(b.createdAt)} WIB</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 12, color: GRAY, fontWeight: 700 }}>Jadwal</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{b.dayFull} · {b.slot}</div>
          <div style={{ fontSize: 13, color: GRAY }}>{b.wait === 'tunggu' ? 'Menunggu di bengkel' : 'Mobil ditinggal'} · Mekanik: {b.mech}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 12, color: GRAY, fontWeight: 700 }}>Pelanggan</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{b.role === 'driver' ? 'Pengantar' : 'Pemilik'} · {b.phone}</div>
          {b.ownerPhone ? <div style={{ fontSize: 13, color: GRAY }}>Pemilik (persetujuan biaya): {b.ownerPhone}</div> : null}
          <div style={{ fontSize: 13, color: GRAY }}>{total} mobil · {done} selesai</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {b.cars.map((c, i) => {
          const on = doneCars.indexOf(i) !== -1;
          return (
            <button key={i} type="button" onClick={() => onToggleCar(b.id, i)} disabled={b.status === 'done'}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', background: BG, borderRadius: 10, padding: '8px 12px', border: 'none', cursor: b.status === 'done' ? 'default' : 'pointer', font: 'inherit', color: INK }}>
              <CarCheck on={on} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 800, textDecoration: on ? 'line-through' : 'none', color: on ? GRAY : INK }}>{c.plate}</span>
                  <span style={{ fontSize: 13, color: GRAY }}> · {c.model}</span>
                </div>
                <div style={{ fontSize: 13, color: GRAY }}>{c.svc} · {durText(c.svc)}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: LINE, overflow: 'hidden' }}>
          <div style={{ width: pct + '%', height: '100%', background: GREEN, transition: 'width .2s ease' }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, color: GRAY, whiteSpace: 'nowrap' }}>{done}/{total} mobil</span>
      </div>

      {b.note ? (
        <div style={{ fontSize: 13, lineHeight: 1.5, color: GRAY, background: '#FFFFFF', border: '1px dashed ' + MUTED, borderRadius: 10, padding: '8px 12px' }}>
          Catatan pelanggan: {b.note}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {b.status === 'confirmed' ? (
          <>
            <button type="button" onClick={() => onArrive(b.id)}
              style={{ height: 44, padding: '0 16px', borderRadius: 10, border: '2px solid ' + INK, background: '#FFFFFF', color: INK, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              Catat kedatangan
            </button>
            <span style={{ fontSize: 12, color: MUTED }}>Mobil belum tiba di bengkel.</span>
          </>
        ) : null}

        {b.status === 'arrived' ? (
          <button type="button" onClick={() => onStart(b.id)}
            style={{ height: 44, padding: '0 16px', borderRadius: 10, border: 'none', background: INK, color: '#FFFFFF', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
            Mulai dikerjakan
          </button>
        ) : null}

        {b.status === 'in_progress' ? (
          <>
            <button type="button" onClick={() => onFinish(b.id, allDone, total - done)}
              style={{ height: 44, padding: '0 16px', borderRadius: 10, border: 'none', background: allDone ? INK : AMBER, color: INK, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              Selesai & serahkan
            </button>
            <span style={{ fontSize: 12, color: GRAY }}>
              {allDone ? 'Semua mobil sudah ditandai selesai.' : (total - done) + ' mobil belum ditandai selesai.'}
            </span>
          </>
        ) : null}

        {b.status === 'done' ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: GREEN }}>
            <CheckIcon size={16} /> Selesai {b.updatedAt ? fmtDateID(b.updatedAt) : ''}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Mech() {
  const [bookings, setBookings] = useState(() => loadBookings());
  const [mech, setMech] = useState('all');
  const [filter, setFilter] = useState('all');

  const refresh = () => setBookings(loadBookings());

  /* Segarkan otomatis saat tab ini kembali aktif atau tab lain mengubah data */
  useEffect(() => {
    const onSync = () => setBookings(loadBookings());
    window.addEventListener('focus', onSync);
    window.addEventListener('storage', onSync);
    return () => {
      window.removeEventListener('focus', onSync);
      window.removeEventListener('storage', onSync);
    };
  }, []);

  const mine = (b) => {
    if (mech === 'all') return true;
    if (mech === 'auto') return b.mech === AUTO_MECH;
    const m = MECH_LIST.find((x) => x.id === mech);
    return !!m && b.mech === m.name;
  };

  /* Mekanik tidak menangani booking yang dibatalkan */
  const visible = bookings.filter((b) => b.status !== 'cancelled' && mine(b));

  const stats = {
    active: visible.filter((b) => b.status !== 'done').length,
    arrived: visible.filter((b) => b.status === 'arrived').length,
    in_progress: visible.filter((b) => b.status === 'in_progress').length,
    done: visible.filter((b) => b.status === 'done').length
  };

  const filtered = (filter === 'all' ? visible : visible.filter((b) => b.status === filter))
    .slice()
    .sort((a, b) => (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) || String(a.slot).localeCompare(String(b.slot)));

  const mechTabs = MECH_LIST.map((m) => {
    const n = m.id === 'all'
      ? bookings.filter((b) => b.status !== 'cancelled').length
      : bookings.filter((b) => b.status !== 'cancelled' && (m.id === 'auto' ? b.mech === AUTO_MECH : b.mech === m.name)).length;
    return { id: m.id, label: m.name + ' (' + n + ')' };
  });

  const tabs = [
    { id: 'all', label: 'Semua (' + visible.length + ')' },
    { id: 'arrived', label: 'Menunggu dikerjakan (' + stats.arrived + ')' },
    { id: 'in_progress', label: 'Dikerjakan (' + stats.in_progress + ')' },
    { id: 'confirmed', label: 'Belum tiba (' + visible.filter((b) => b.status === 'confirmed').length + ')' },
    { id: 'done', label: 'Selesai (' + stats.done + ')' }
  ];

  const toggleCar = (id, index) => {
    const b = loadBookings().find((x) => x.id === id);
    if (!b) return;
    const doneCars = Array.isArray(b.doneCars) ? b.doneCars.slice() : [];
    const at = doneCars.indexOf(index);
    if (at === -1) doneCars.push(index); else doneCars.splice(at, 1);
    doneCars.sort((x, y) => x - y);
    updateBooking(id, { doneCars: doneCars });
    refresh();
  };

  const pill = (on) => ({
    height: 40, padding: '0 14px', borderRadius: 20,
    border: '2px solid ' + (on ? INK : LINE),
    background: on ? INK : '#FFFFFF', color: on ? '#FFFFFF' : INK,
    fontSize: 13, fontWeight: 700, cursor: 'pointer'
  });

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK, boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 20px 48px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: AMBER, color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <WrenchIcon />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>[Nama Bengkel] · Portal Mekanik</div>
            <div style={{ fontSize: 13, color: GRAY }}>Daftar pekerjaan & progres servis</div>
          </div>
          <a href="admin.html" style={{ fontSize: 13, fontWeight: 800, color: INK, textDecoration: 'none' }}>← Panel admin</a>
        </div>

        {/* Pilih mekanik */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, color: GRAY, fontWeight: 700 }}>Mekanik</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {mechTabs.map((t) => (
              <button key={t.id} type="button" onClick={() => setMech(t.id)} style={pill(mech === t.id)}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Statistik */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <StatCard label="Tugas aktif" value={stats.active} />
          <StatCard label="Menunggu dikerjakan" value={stats.arrived} />
          <StatCard label="Sedang dikerjakan" value={stats.in_progress} />
          <StatCard label="Selesai" value={stats.done} />
        </div>

        {/* Tab filter status */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setFilter(t.id)} style={pill(filter === t.id)}>{t.label}</button>
          ))}
        </div>

        {/* Daftar pekerjaan */}
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 24px', background: '#FFFFFF', border: '1px dashed ' + MUTED, borderRadius: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Belum ada pekerjaan di sini</div>
            <div style={{ fontSize: 14, color: GRAY, lineHeight: 1.6, maxWidth: 420 }}>
              Booking yang masuk dari <a href="index.html" style={{ fontWeight: 700 }}>situs pelanggan</a> dan
              sudah ditugaskan ke mekanik ini akan muncul otomatis. Coba muat data contoh untuk melihat tata letaknya.
            </div>
            <button type="button" onClick={() => { seedSampleBookings(); refresh(); }}
              style={{ height: 48, padding: '0 20px', borderRadius: 12, border: 'none', background: INK, color: '#FFFFFF', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              Muat data contoh
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((b) => (
              <JobCard
                key={b.id}
                b={b}
                onArrive={(id) => { updateBookingStatus(id, 'arrived'); refresh(); }}
                onStart={(id) => { updateBookingStatus(id, 'in_progress'); refresh(); }}
                onFinish={(id, allDone, left) => {
                  if (!allDone && !confirm('Masih ada ' + left + ' mobil yang belum ditandai selesai. Tetap tandai booking ' + id + ' selesai?')) return;
                  updateBookingStatus(id, 'done');
                  refresh();
                }}
                onToggleCar={toggleCar}
              />
            ))}
          </div>
        )}

        <div style={{ fontSize: 12, color: MUTED, textAlign: 'center' }}>
          Data tersimpan di browser ini (localStorage) dan sama dengan yang dipakai panel admin.
          Untuk produksi, ganti lapisan data di <b>booking.js</b> dengan API backend.{' '}
          <a href="index.html" style={{ color: GRAY, fontWeight: 700 }}>Situs pelanggan →</a>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Mech />);
