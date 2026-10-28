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

/* Akun mekanik, durasi servis, dan "otomatis" berasal dari booking.js
   (satu sumber dengan situs pelanggan & panel admin). */
const SESSION_KEY = 'bengkel.mech.session.v1';
const MECH_ACCOUNTS = MECHANICS;

const STATUS_ORDER = { in_progress: 0, arrived: 1, confirmed: 2, done: 3 };
const ACTOR = 'mekanik';

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
function CarCheck({ on, accent }) {
  return (
    <span aria-hidden="true" style={{ width: 26, height: 26, flex: 'none', boxSizing: 'border-box', borderRadius: 8, border: '2px solid ' + (on ? INK : MUTED), background: on ? (accent || INK) : '#FFFFFF', color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
    <div style={{ minHeight: '100dvh', background: BG, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK, boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 440, margin: '0 auto', padding: '32px 20px', paddingBottom: 'calc(32px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 20, minHeight: '100dvh', boxSizing: 'border-box' }}>

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
            <input id="mech-phone" type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="next" autoFocus placeholder="08xx xxxx xxxx" value={phone}
              onChange={(e) => { setPhone(e.target.value); setErr(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              style={inputStyle} />
            {found ? <div style={{ fontSize: 13, color: GREEN, fontWeight: 700 }}>{found.name}</div> : null}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label htmlFor="mech-pin" style={{ fontSize: 14, fontWeight: 700 }}>PIN</label>
            <input id="mech-pin" type="password" inputMode="numeric" autoComplete="current-password" enterKeyHint="done" placeholder="••••" value={pin}
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
function JobCard({ b, accent, me, onChanged }) {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const total = b.cars.length;
  const done = carsDone(b);
  const allDone = done === total;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const myCars = b.cars.filter((c) => c.mech === me).length;
  const openCars = mineUnassigned(b).length;

  const run = (result, okText) => {
    if (!result || result.ok === false) {
      setErr((result && result.error) || 'Aksi gagal.');
      setMsg('');
      return false;
    }
    setErr('');
    setMsg(okText || '');
    onChanged();
    return true;
  };

  const verify = () => {
    if (run(checkInBooking(b.id, code, ACTOR + ':' + me), 'Check-in terverifikasi, status menjadi Tiba.')) setCode('');
  };

  const claim = () => {
    let taken = 0;
    mineUnassigned(b).forEach((unassignedCar, idx) => {
      const realIndex = b.cars.indexOf(unassignedCar);
      const res = assignMechanic(b.id, realIndex, me, ACTOR + ':' + me);
      if (res.ok) taken += 1;
      void idx;
    });
    if (!taken) { setErr('Tidak ada mobil yang bisa diambil (mekanik lain mungkin sudah menanganinya).'); return; }
    setErr('');
    setMsg(taken + ' mobil diambil untuk ' + me + '.');
    onChanged();
  };

  const finish = () => {
    const missing = total - done;
    if (!allDone && !window.confirm('Masih ada ' + missing + ' mobil yang belum ditandai selesai. Tetap tandai booking ' + b.id + ' selesai?')) return;
    run(updateBookingStatus(b.id, 'done', ACTOR + ':' + me), 'Booking ' + b.id + ' selesai.');
  };

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: 1 }}>{b.id}</span>
          <StatusChip status={b.status} />
          {openCars > 0 ? (
            <span style={{ fontSize: 12, fontWeight: 800, color: TONE.amber.fg, background: TONE.amber.bg, borderRadius: 999, padding: '4px 10px' }}>
              {openCars} mobil belum ada mekanik
            </span>
          ) : null}
        </div>
        <span style={{ fontSize: 12, color: MUTED }}>{b.dayFull} · {b.slot}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 12, color: GRAY, fontWeight: 700 }}>Jadwal</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{b.dayFull} · {b.slot}</div>
          <div style={{ fontSize: 13, color: GRAY }}>{b.wait === 'tunggu' ? 'Menunggu di bengkel' : 'Mobil ditinggal'} · {total} mobil · {myCars} untukmu</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 12, color: GRAY, fontWeight: 700 }}>Pelanggan</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{b.role === 'driver' ? 'Pengantar' : 'Pemilik'} · {b.phone}</div>
          {b.ownerPhone ? <div style={{ fontSize: 13, color: GRAY }}>Pemilik (persetujuan biaya): {b.ownerPhone}</div> : null}
          <div style={{ fontSize: 13, color: GRAY }}>{done} dari {total} mobil selesai</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {b.cars.map((c, i) => {
          const mine = c.mech === me;
          const canToggle = mine && b.status === 'in_progress';
          return (
            <button key={c.plate + i} type="button" onClick={() => canToggle && run(setCarDone(b.id, i, !c.done, ACTOR + ':' + me), c.done ? c.plate + ' dibuka lagi.' : c.plate + ' ditandai selesai.')}
              disabled={!canToggle}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', minHeight: 60, boxSizing: 'border-box', textAlign: 'left', background: BG, borderRadius: 12, padding: '10px 12px', border: mine ? '2px solid ' + accent : '2px solid transparent', cursor: canToggle ? 'pointer' : 'default', font: 'inherit', color: INK }}>
              <CarCheck on={c.done} accent={accent} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 800, textDecoration: c.done ? 'line-through' : 'none', color: c.done ? GRAY : INK }}>{c.plate}</span>
                  <span style={{ fontSize: 13, color: GRAY }}> · {c.model}</span>
                </div>
                <div style={{ fontSize: 13, color: GRAY }}>{c.svc} · {durText(c.svc)} · {c.mech ? c.mech : 'belum ada mekanik'}</div>
              </div>
              {canToggle ? <span style={{ fontSize: 11, fontWeight: 800, color: GRAY, whiteSpace: 'nowrap' }}>{c.done ? 'selesai' : 'tandai selesai'}</span> : null}
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

      {b.status === 'cancelled' || b.status === 'no_show' ? (
        <div style={{ fontSize: 13, color: RED, background: TONE.red.bg, borderRadius: 10, padding: '8px 12px' }}>
          {statusLabel(b.status)}{b.closedReason ? ' · ' + b.closedReason : ''}
        </div>
      ) : null}

      {b.note ? (
        <div style={{ fontSize: 13, lineHeight: 1.5, color: GRAY, background: '#FFFFFF', border: '1px dashed ' + MUTED, borderRadius: 10, padding: '8px 12px' }}>
          Catatan pelanggan: {b.note}
        </div>
      ) : null}

      {b.status === 'confirmed' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Kode check-in pelanggan (4 angka)</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input type="text" inputMode="numeric" maxLength={4} placeholder="0000" value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 4)); setErr(''); }}
              style={{ width: 120, minHeight: 48, boxSizing: 'border-box', textAlign: 'center', letterSpacing: 6, fontSize: 20, fontWeight: 700, border: '1.5px solid ' + MUTED, borderRadius: 12, background: '#FFFFFF', color: INK }} />
            <button type="button" onClick={verify}
              style={{ minHeight: 48, padding: '0 18px', borderRadius: 12, border: 'none', background: accent, color: INK, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
              Verifikasi kedatangan
            </button>
          </div>
        </div>
      ) : null}

      {err ? <div role="alert" style={{ fontSize: 13, color: RED, background: TONE.red.bg, borderRadius: 10, padding: '10px 14px' }}>{err}</div> : null}
      {msg ? <div role="status" aria-live="polite" style={{ fontSize: 13, color: TONE.green.fg, background: TONE.green.bg, borderRadius: 10, padding: '10px 14px' }}>{msg}</div> : null}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {openCars > 0 && b.status !== 'done' ? (
          <button type="button" onClick={claim}
            style={{ minHeight: 48, padding: '0 18px', borderRadius: 12, border: 'none', background: accent, color: INK, fontSize: 15, fontWeight: 800, cursor: 'pointer', flex: '1 1 auto' }}>
            Ambil {openCars} mobil ini
          </button>
        ) : null}

        {b.status === 'arrived' && myCars > 0 ? (
          <button type="button" onClick={() => run(updateBookingStatus(b.id, 'in_progress', ACTOR + ':' + me), 'Pekerjaan dimulai.')}
            style={{ minHeight: 48, padding: '0 18px', borderRadius: 12, border: 'none', background: accent, color: INK, fontSize: 15, fontWeight: 800, cursor: 'pointer', flex: '1 1 auto' }}>
            Mulai dikerjakan
          </button>
        ) : null}

        {b.status === 'in_progress' && myCars > 0 ? (
          <button type="button" onClick={finish}
            style={{ minHeight: 48, padding: '0 18px', borderRadius: 12, border: 'none', background: accent, color: INK, fontSize: 15, fontWeight: 800, cursor: 'pointer', opacity: allDone ? 1 : 0.85, flex: '1 1 auto' }}>
            Selesai & serahkan
          </button>
        ) : null}

        {b.status === 'done' ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: GREEN }}>
            <CheckIcon size={16} /> Selesai {b.updatedAt ? fmtDateID(b.updatedAt) : ''}
          </span>
        ) : null}

        {b.audit && b.audit.length > 0 ? (
          <span style={{ fontSize: 12, color: MUTED, marginLeft: 'auto' }}>{b.audit.length} perubahan tercatat</span>
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
  const [notice, setNotice] = useState('');

  const refresh = () => setBookings(loadBookings());

  useEffect(() => {
    const onSync = () => setBookings(loadBookings());
    window.addEventListener('focus', onSync);
    window.addEventListener('storage', onSync);
    return () => {
      window.removeEventListener('focus', onSync);
      window.removeEventListener('storage', onSync);
    };
  }, []);

  /* Mekanik melihat pekerjaan yang ditugaskan kepadanya + mobil yang belum ada mekanik */
  const current = bookings.filter((b) => b.status !== 'cancelled' && b.status !== 'no_show');
  const isMine = (b) => mechHasBooking(b, session.name);
  const isOpen = (b) => isUnassigned(b) && b.status !== 'done';

  const inScope = scope === 'mine' ? current.filter(isMine) : current.filter(isOpen);

  const stats = {
    active: current.filter(isMine).filter((b) => b.status !== 'done').length,
    arrived: current.filter(isMine).filter((b) => b.status === 'arrived').length,
    in_progress: current.filter(isMine).filter((b) => b.status === 'in_progress').length,
    done: bookings.filter(isMine).filter((b) => b.status === 'done').length
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

  const pill = (on) => ({
    minHeight: 44, padding: '0 14px', borderRadius: 22,
    border: '2px solid ' + (on ? INK : LINE),
    background: on ? accent : '#FFFFFF', color: INK,
    fontSize: 13, fontWeight: 700, cursor: 'pointer'
  });

  return (
    <div style={{ minHeight: '100dvh', background: BG, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK, boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 20px', paddingBottom: 'calc(48px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 20 }}>

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
            style={{ minHeight: 44, padding: '0 16px', borderRadius: 22, border: '2px solid ' + LINE, background: '#FFFFFF', color: INK, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Keluar
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, color: GRAY, fontWeight: 700 }}>Pekerjaan</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => { setScope('mine'); setFilter('all'); }} style={pill(scope === 'mine')}>
              Tugas saya ({current.filter(isMine).length})
            </button>
            <button type="button" onClick={() => { setScope('open'); setFilter('all'); }} style={pill(scope === 'open')}>
              Belum ada mekanik ({current.filter(isOpen).length})
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <StatCard label="Tugas aktif" value={stats.active} />
          <StatCard label="Menunggu dikerjakan" value={stats.arrived} />
          <StatCard label="Sedang dikerjakan" value={stats.in_progress} />
          <StatCard label="Selesai" value={stats.done} />
        </div>

        {notice ? <div style={{ fontSize: 13, color: TONE.green.fg, background: TONE.green.bg, borderRadius: 10, padding: '8px 12px' }}>{notice}</div> : null}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setFilter(t.id)} style={pill(filter === t.id)}>{t.label}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 24px', background: '#FFFFFF', border: '1px dashed ' + MUTED, borderRadius: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>
              {scope === 'mine' ? 'Belum ada pekerjaan untukmu' : 'Tidak ada mobil tanpa mekanik'}
            </div>
            <div style={{ fontSize: 14, color: GRAY, lineHeight: 1.6, maxWidth: 440 }}>
              {scope === 'mine'
                ? 'Admin menugaskan mobil kepadamu dari panel admin. Kamu juga bisa mengambil mobil yang belum punya mekanik.'
                : 'Semua mobil sudah punya mekanik. Cek tab Tugas saya untuk melihat pekerjaanmu.'}
            </div>
            <a href="admin.html" style={{ fontSize: 13, fontWeight: 800, color: INK }}>Buka panel admin</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((b) => (
              <JobCard key={b.id} b={b} accent={accent} me={session.name}
                onChanged={() => { setNotice(''); refresh(); }} />
            ))}
          </div>
        )}

        <div style={{ fontSize: 12, color: MUTED, textAlign: 'center' }}>
          Setiap aksi tercatat atas namamu (audit trail). Data tersimpan di browser ini (localStorage);
          untuk produksi, ganti lapisan data di <b>booking.js</b> dengan API backend.{' '}
          <a href="index.html" style={{ color: GRAY, fontWeight: 700 }}>Situs pelanggan →</a>
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
