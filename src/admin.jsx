/* ============================================================
 *  Sistem Booking Bengkel — panel admin
 *  Melihat & mengubah status booking yang dibuat pelanggan di
 *  index.html (data bersama via localStorage, lihat booking.js).
 * ============================================================ */

const { useState } = React;

const INK = '#12161C';
const GRAY = '#5A6270';
const LINE = '#DDE1E7';
const MUTED = '#8791A0';
const BG = '#F2F3F5';

const TONE = {
  blue:   { bg: '#E7F0FD', fg: '#1D4E89' },
  amber:  { bg: '#FDF1DC', fg: '#8A5307' },
  violet: { bg: '#EFE9FD', fg: '#5B21B6' },
  green:  { bg: '#DCF5E1', fg: '#165C34' },
  red:    { bg: '#FDE8E6', fg: '#B42318' }
};

const NEXT_ACTION = {
  confirmed:   { label: 'Pelanggan tiba', to: 'arrived' },
  arrived:     { label: 'Mulai dikerjakan', to: 'in_progress' },
  in_progress: { label: 'Selesai & dibayar', to: 'done' }
};

const WrenchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"></path></svg>
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

function BookingCard({ b, onAdvance, onCancel, onDelete }) {
  const canAdvance = NEXT_ACTION[b.status];
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
          <div style={{ fontSize: 12, color: GRAY, fontWeight: 700 }}>Kontak</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{b.role === 'driver' ? 'Pengantar' : 'Pemilik'} · {b.phone}</div>
          {b.ownerPhone ? <div style={{ fontSize: 13, color: GRAY }}>Pemilik (persetujuan biaya): {b.ownerPhone}</div> : null}
          <div style={{ fontSize: 13, color: GRAY }}>
            {b.remindOn ? 'Pengingat servis: aktif' : 'Pengingat servis: mati'} · {b.promoOn ? 'Promo: boleh' : 'Promo: tidak'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {b.cars.map((c, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, background: BG, borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 800 }}>{c.plate}</span>
              <span style={{ fontSize: 13, color: GRAY }}> · {c.model}</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, textAlign: 'right' }}>{c.svc}</span>
          </div>
        ))}
      </div>

      {b.note ? (
        <div style={{ fontSize: 13, lineHeight: 1.5, color: GRAY, background: '#FFFFFF', border: '1px dashed ' + MUTED, borderRadius: 10, padding: '8px 12px' }}>
          Catatan: {b.note}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {canAdvance ? (
          <button type="button" onClick={() => onAdvance(b.id, canAdvance.to)}
            style={{ height: 44, padding: '0 16px', borderRadius: 10, border: 'none', background: INK, color: '#FFFFFF', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
            {canAdvance.label}
          </button>
        ) : null}
        {(b.status === 'confirmed' || b.status === 'arrived') ? (
          <button type="button" onClick={() => onCancel(b.id)}
            style={{ height: 44, padding: '0 16px', borderRadius: 10, border: '1.5px solid ' + MUTED, background: '#FFFFFF', color: INK, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Batalkan
          </button>
        ) : null}
        <button type="button" onClick={() => onDelete(b.id)}
          style={{ height: 44, padding: '0 14px', marginLeft: 'auto', borderRadius: 10, border: '1.5px solid ' + LINE, background: '#FFFFFF', color: '#B42318', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Hapus
        </button>
      </div>
    </div>
  );
}

function Admin() {
  const [bookings, setBookings] = useState(() => loadBookings());
  const [filter, setFilter] = useState('all');

  const refresh = () => setBookings(loadBookings());

  const isToday = (b) => {
    const d = new Date(b.createdAt);
    const t = new Date();
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
  };

  const stats = {
    today: bookings.filter(isToday).length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    in_progress: bookings.filter((b) => b.status === 'in_progress').length,
    done: bookings.filter((b) => b.status === 'done').length
  };

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  const tabs = [
    { id: 'all', label: 'Semua (' + bookings.length + ')' },
    { id: 'confirmed', label: 'Konfirmasi (' + stats.confirmed + ')' },
    { id: 'in_progress', label: 'Dikerjakan (' + stats.in_progress + ')' },
    { id: 'done', label: 'Selesai (' + stats.done + ')' },
    { id: 'cancelled', label: 'Dibatalkan (' + bookings.filter((b) => b.status === 'cancelled').length + ')' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK, boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '24px 20px 48px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFB81C', color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <WrenchIcon />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>[Nama Bengkel] · Panel Admin</div>
            <div style={{ fontSize: 13, color: GRAY }}>Kelola booking servis masuk</div>
          </div>
          <a href="index.html" style={{ fontSize: 13, fontWeight: 800, color: INK, textDecoration: 'none' }}>← Situs pelanggan</a>
        </div>

        {/* Statistik */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <StatCard label="Booking hari ini" value={stats.today} />
          <StatCard label="Menunggu konfirmasi tiba" value={stats.confirmed} />
          <StatCard label="Sedang dikerjakan" value={stats.in_progress} />
          <StatCard label="Selesai" value={stats.done} />
        </div>

        {/* Tab filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tabs.map((t) => {
            const on = filter === t.id;
            return (
              <button key={t.id} type="button" onClick={() => setFilter(t.id)}
                style={{ height: 40, padding: '0 14px', borderRadius: 20, border: '2px solid ' + (on ? INK : LINE), background: on ? INK : '#FFFFFF', color: on ? '#FFFFFF' : INK, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Daftar */}
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 24px', background: '#FFFFFF', border: '1px dashed ' + MUTED, borderRadius: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Belum ada booking di sini</div>
            <div style={{ fontSize: 14, color: GRAY, lineHeight: 1.6, maxWidth: 420 }}>
              Booking yang pelanggan buat di situs pelanggan akan muncul otomatis di panel ini.
              Coba buat satu booking dari <a href="index.html" style={{ fontWeight: 700 }}>situs pelanggan</a>,
              atau muat data contoh untuk melihat tata letaknya.
            </div>
            <button type="button" onClick={() => { seedSampleBookings(); refresh(); }}
              style={{ height: 48, padding: '0 20px', borderRadius: 12, border: 'none', background: INK, color: '#FFFFFF', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              Muat data contoh
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((b) => (
              <BookingCard
                key={b.id}
                b={b}
                onAdvance={(id, to) => { updateBookingStatus(id, to); refresh(); }}
                onCancel={(id) => { if (confirm('Batalkan booking ' + id + '?')) { updateBookingStatus(id, 'cancelled'); refresh(); } }}
                onDelete={(id) => { if (confirm('Hapus booking ' + id + '? Tindakan ini tidak bisa dibatalkan.')) { deleteBooking(id); refresh(); } }}
              />
            ))}
          </div>
        )}

        <div style={{ fontSize: 12, color: MUTED, textAlign: 'center' }}>
          Data tersimpan di browser ini (localStorage). Untuk produksi, ganti lapisan data di <b>booking.js</b> dengan API backend.
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Admin />);
