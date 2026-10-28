/* ============================================================
 *  Sistem Booking Bengkel — portal mekanik
 *  Setiap mekanik masuk dari HP-nya sendiri dengan nomor HP +
 *  PIN, lalu hanya melihat pekerjaan yang ditugaskan kepadanya.
 *  Data bersama index.html & admin.html (lihat booking.js).
 * ============================================================ */

const { useState, useEffect } = React;

const INK = '#12161C';
const GRAY = '#5A6270';
const LINE = '#DDE1E7';
const MUTED = '#8791A0';
const BG = '#F2F3F5';
const GREEN = '#1F7A45';
const RED = '#B42318';

const TONE = {
  blue:   { bg: '#E7F0FD', fg: '#1D4E89' },
  amber:  { bg: '#FDF1DC', fg: '#8A5307' },
  violet: { bg: '#EFE9FD', fg: '#5B21B6' },
  green:  { bg: '#DCF5E1', fg: '#165C34' },
  red:    { bg: '#FDE8E6', fg: '#B42318' }
};

/* Booking dengan mekanik "Otomatis" belum ditugaskan ke siapa pun */
const AUTO_MECH = 'Otomatis (dipilihkan bengkel)';
const SESSION_KEY = 'bengkel.mech.session.v1';

/* Akun mekanik — nomor HP masing-masing + PIN 4 angka.
   Samakan `name` dengan MECHS di src/app.jsx agar tugasnya cocok. */
const MECH_ACCOUNTS = [
  { id: 'budi',  name: 'Pak Budi', phone: '0812 3456 0001', pin: '1111' },
  { id: 'andi',  name: 'Andi',     phone: '0812 3456 0002', pin: '2222' },
  { id: 'rizal', name: 'Rizal',    phone: '0812 3456 0003', pin: '3333' },
  { id: 'dedi',  name: 'Dedi',     phone: '0812 3456 0004', pin: '4444' }
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

const normPhone = (v) => String(v || '').replace(/\D/g, '').replace(/^62/, '0');

/* ---------- sesi login per HP mekanik ---------- */
function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const s = raw ? JSON.parse(raw) : null;
    if (!s || !s.id) return null;
    const acc = MECH_ACCOUNTS.find((a) => a.id === s.id);
    return acc ? { id: acc.id, name: acc.name, phone: acc.phone } : null;
  } catch (e) {
    return null;
  }
}

function saveSession(acc) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: acc.id, at: new Date().toISOString() }));
  } catch (e) {}
}

function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
}

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

const inputStyle = {
  width: '100%', height: 56, boxSizing: 'border-box', padding: '0 16px',
  border: '1.5px solid ' + MUTED, borderRadius: 12, background: '#FFFFFF',
  color: INK, fontSize: 18
};

/* ============================================================
 *  Layar masuk: nomor HP mekanik + PIN
 * ============================================================ */
function Login({ onLogin }) {
  const accent = useAccent();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  const found = MECH_ACCOUNTS.find((a) => normPhone(a.phone) === normPhone(phone));
  const canSubmit = normPhone(phone).length >= 9 && pin.length === 4;

  const submit = () => {
    if (!canSubmit) return;
    if (!found) {
      setErr('Nomor HP ini belum terdaftar sebagai mekanik. Hubungi admin bengkel.');
      return;
    }
    if (found.pin !== pin) {
      setErr('PIN salah. Coba lagi.');
      return;
    }
    saveSession(found);
    setErr('');
    onLogin({ id: found.id, name: found.name, phone: found.phone });
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK, boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '32px 20px 48px', display: 'flex', flexDirection: 'column', gap: 20, minHeight: '100vh', boxSizing: 'border-box' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: accent, color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <WrenchIcon />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>[Nama Bengkel] · Portal Mekanik</div>
            <div style={{ fontSize: 13, color: GRAY }}>Masuk dari HP mekanik masing-masing</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 }}>Masuk sebagai mekanik</h1>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: GRAY }}>Gunakan nomor HP yang terdaftar di bengkel dan PIN 4 angka kamu.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label htmlFor="mech-phone" style={{ fontSize: 14, fontWeight: 700 }}>Nomor HP</label>
            <input id="mech-phone" type="tel" inputMode="tel" placeholder="08xx xxxx xxxx" value={phone}
              onChange={(e) => { setPhone(e.target.value); setErr(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              style={inputStyle} />
            {found ? <div style={{ fontSize: 13, color: GREEN, fontWeight: 700 }}>{found.name}</div> : null}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label htmlFor="mech-pin" style={{ fontSize: 14, fontWeight: 700 }}>PIN</label>
            <input id="mech-pin" type="password" inputMode="numeric" placeholder="••••" value={pin}
              onChange={(e) => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setErr(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              style={Object.assign({}, inputStyle, { fontSize: 24, fontWeight: 700, letterSpacing: 10, textAlign: 'center' })} />
          </div>

          {err ? (
            <div style={{ fontSize: 13, lineHeight: 1.5, color: RED, background: TONE.red.bg, borderRadius: 10, padding: '10px 12px' }}>{err}</div>
          ) : null}

          <button type="button" disabled={!canSubmit} onClick={submit}
            style={{ width: '100%', height: 56, border: 'none', borderRadius: 14, background: canSubmit ? accent : LINE, color: canSubmit ? INK : GRAY, fontSize: 17, fontWeight: 800, cursor: canSubmit ? 'pointer' : 'default' }}>
            Masuk
          </button>

          <div style={{ fontSize: 13, lineHeight: 1.5, color: GRAY }}>
            Sesi tersimpan di HP ini, jadi kamu tidak perlu mengetik ulang setiap membuka portal. Selalu ada tombol <b>Keluar</b> untuk berganti mekanik.
          </div>
        </div>

        <div style={{ padding: '14px 16px', background: '#FFFFFF', border: '1px dashed ' + MUTED, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button type="button" onClick={() => setShowDemo(!showDemo)}
            style={{ alignSelf: 'flex-start', padding: 0, border: 'none', background: 'transparent', color: GRAY, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {showDemo ? 'Sembunyikan akun demo' : 'Lihat akun demo (prototipe)'}
          </button>
          {showDemo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: GRAY }}>
              {MECH_ACCOUNTS.map((a) => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontWeight: 700, color: INK }}>{a.name}</span>
                  <span>{a.phone} · PIN {a.pin}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <a href="admin.html" style={{ fontSize: 12, color: GRAY, fontWeight: 700 }}>← Panel admin</a>
          <a href="index.html" style={{ fontSize: 12, color: GRAY, fontWeight: 700 }}>Situs pelanggan →</a>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 *  Kartu pekerjaan
 * ============================================================ */
function JobCard({ b, onArrive, onStart, onFinish, onToggleCar, onClaim, accent }) {
  const total = b.cars.length;
  const doneCars = Array.isArray(b.doneCars) ? b.doneCars : [];
  const done = b.cars.filter((c, i) => doneCars.indexOf(i) !== -1).length;
  const allDone = done === total;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const unassigned = b.mech === AUTO_MECH;

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: 1 }}>{b.id}</span>
          <StatusChip status={b.status} />
          {unassigned ? (
            <span style={{ fontSize: 12, fontWeight: 800, color: TONE.amber.fg, background: TONE.amber.bg, borderRadius: 999, padding: '4px 10px' }}>Belum ditugaskan</span>
          ) : null}
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
        {unassigned ? (
          <>
            <button type="button" onClick={() => onClaim(b.id)}
              style={{ height: 44, padding: '0 16px', borderRadius: 10, border: 'none', background: accent, color: INK, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              Ambil tugas ini
            </button>
            <span style={{ fontSize: 12, color: MUTED }}>Belum ada mekanik yang ditugaskan.</span>
          </>
        ) : null}

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
            style={{ height: 44, padding: '0 16px', borderRadius: 10, border: 'none', background: accent, color: INK, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
            Mulai dikerjakan
          </button>
        ) : null}

        {b.status === 'in_progress' ? (
          <>
            <button type="button" onClick={() => onFinish(b.id, allDone, total - done)}
              style={{ height: 44, padding: '0 16px', borderRadius: 10, border: 'none', background: accent, color: INK, fontSize: 14, fontWeight: 800, cursor: 'pointer', opacity: allDone ? 1 : 0.78 }}>
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

/* ============================================================
 *  Dasbor mekanik (setelah masuk)
 * ============================================================ */
function Dashboard({ session, onLogout }) {
  const accent = useAccent();
  const [bookings, setBookings] = useState(() => loadBookings());
  const [scope, setScope] = useState('mine');
  const [filter, setFilter] = useState('all');

  const refresh = () => setBookings(loadBookings());

  /* Segarkan saat tab kembali aktif atau data diubah tab/aplikasi lain */
  useEffect(() => {
    const onSync = () => setBookings(loadBookings());
    window.addEventListener('focus', onSync);
    window.addEventListener('storage', onSync);
    return () => {
      window.removeEventListener('focus', onSync);
      window.removeEventListener('storage', onSync);
    };
  }, []);

  /* Mekanik hanya melihat pekerjaannya sendiri + yang belum ditugaskan */
  const active = bookings.filter((b) => b.status !== 'cancelled');
  const isMine = (b) => b.mech === session.name;
  const isOpen = (b) => b.mech === AUTO_MECH;

  const inScope = scope === 'mine' ? active.filter(isMine) : active.filter(isOpen);

  const stats = {
    active: active.filter(isMine).filter((b) => b.status !== 'done').length,
    arrived: active.filter(isMine).filter((b) => b.status === 'arrived').length,
    in_progress: active.filter(isMine).filter((b) => b.status === 'in_progress').length,
    done: active.filter(isMine).filter((b) => b.status === 'done').length
  };

  const filtered = (filter === 'all' ? inScope : inScope.filter((b) => b.status === filter))
    .slice()
    .sort((a, b) => (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) || String(a.slot).localeCompare(String(b.slot)));

  const tabs = [
    { id: 'all', label: 'Semua (' + inScope.length + ')' },
    { id: 'arrived', label: 'Menunggu dikerjakan (' + inScope.filter((b) => b.status === 'arrived').length + ')' },
    { id: 'in_progress', label: 'Dikerjakan (' + inScope.filter((b) => b.status === 'in_progress').length + ')' },
    { id: 'confirmed', label: 'Belum tiba (' + inScope.filter((b) => b.status === 'confirmed').length + ')' },
    { id: 'done', label: 'Selesai (' + inScope.filter((b) => b.status === 'done').length + ')' }
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

  const claim = (id) => {
    updateBooking(id, { mech: session.name });
    setScope('mine');
    refresh();
  };

  const pill = (on) => ({
    height: 40, padding: '0 14px', borderRadius: 20,
    border: '2px solid ' + (on ? INK : LINE),
    background: on ? accent : '#FFFFFF', color: INK,
    fontSize: 13, fontWeight: 700, cursor: 'pointer'
  });

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK, boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 20px 48px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header + identitas mekanik yang sedang masuk */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: accent, color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <WrenchIcon />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Halo, {session.name}</div>
            <div style={{ fontSize: 13, color: GRAY }}>[Nama Bengkel] · {session.phone}</div>
          </div>
          <a href="admin.html" style={{ fontSize: 13, fontWeight: 800, color: INK, textDecoration: 'none' }}>Panel admin</a>
          <button type="button" onClick={onLogout}
            style={{ height: 40, padding: '0 14px', borderRadius: 20, border: '2px solid ' + LINE, background: '#FFFFFF', color: INK, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Keluar
          </button>
        </div>

        {/* Pilih lingkup pekerjaan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, color: GRAY, fontWeight: 700 }}>Pekerjaan</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => { setScope('mine'); setFilter('all'); }} style={pill(scope === 'mine')}>
              Tugas saya ({active.filter(isMine).length})
            </button>
            <button type="button" onClick={() => { setScope('open'); setFilter('all'); }} style={pill(scope === 'open')}>
              Belum ditugaskan ({active.filter(isOpen).length})
            </button>
          </div>
        </div>

        {/* Statistik tugas saya */}
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
            <div style={{ fontSize: 16, fontWeight: 800 }}>
              {scope === 'mine' ? 'Belum ada pekerjaan untukmu' : 'Tidak ada pekerjaan yang belum ditugaskan'}
            </div>
            <div style={{ fontSize: 14, color: GRAY, lineHeight: 1.6, maxWidth: 420 }}>
              {scope === 'mine'
                ? 'Booking dari situs pelanggan yang ditugaskan ke ' + session.name + ' akan muncul otomatis di sini. Kamu juga bisa mengambil pekerjaan yang belum ditugaskan.'
                : 'Semua booking sudah punya mekanik. Cek tab Tugas saya untuk melihat pekerjaanmu.'}
            </div>
            {scope === 'mine' ? (
              <button type="button" onClick={() => { seedSampleBookings(); refresh(); }}
                style={{ height: 48, padding: '0 20px', borderRadius: 12, border: 'none', background: accent, color: INK, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                Muat data contoh
              </button>
            ) : null}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((b) => (
              <JobCard
                key={b.id}
                b={b}
                accent={accent}
                onClaim={claim}
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
          Untuk produksi, ganti lapisan data di <b>booking.js</b> dengan API backend.
        </div>
      </div>
    </div>
  );
}

function Mech() {
  const [session, setSession] = useState(() => loadSession());

  const logout = () => {
    clearSession();
    setSession(null);
    try { window.scrollTo(0, 0); } catch (e) {}
  };

  if (!session) return <Login onLogin={(acc) => { setSession(acc); try { window.scrollTo(0, 0); } catch (e) {} }} />;
  return <Dashboard session={session} onLogout={logout} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Mech />);
