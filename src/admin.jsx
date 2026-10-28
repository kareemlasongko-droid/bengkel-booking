/* ============================================================
 *  Sistem Booking Bengkel — panel admin
 *  Operasional harian: verifikasi check-in, penugasan mekanik,
 *  walk-in, reschedule, batal/tidak datang dengan alasan,
 *  arsip, dan audit trail. Data & aturan di booking.js.
 * ============================================================ */

const { useState } = React;

const INK = '#12161C';
const GRAY = '#5A6270';
const LINE = '#DDE1E7';
const MUTED = '#8791A0';
const BG = '#F2F3F5';
const RED = '#B42318';
const GREEN = '#1F7A45';

const TONE = {
  blue:   { bg: '#E7F0FD', fg: '#1D4E89' },
  amber:  { bg: '#FDF1DC', fg: '#8A5307' },
  violet: { bg: '#EFE9FD', fg: '#5B21B6' },
  green:  { bg: '#DCF5E1', fg: '#165C34' },
  red:    { bg: '#FDE8E6', fg: '#B42318' }
};

/* Tombol aksi lanjutan per status (mengikuti STATUS_FLOW di booking.js) */
const NEXT_ACTION = {
  confirmed:   { label: 'Pelanggan tiba', to: 'arrived' },
  arrived:     { label: 'Mulai dikerjakan', to: 'in_progress' },
  in_progress: { label: 'Selesai & dibayar', to: 'done' }
};

const ACTOR = 'admin';

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

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ flex: '1 1 140px', minWidth: 130, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 14, padding: '14px 16px' }}>
      <div style={{ fontSize: 12, color: GRAY, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, marginTop: 2, color: accent || INK }}>{value}</div>
      {sub ? <div style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>{sub}</div> : null}
    </div>
  );
}

function Notice({ kind, children }) {
  const palette = kind === 'error'
    ? { bg: TONE.red.bg, fg: RED }
    : kind === 'ok'
      ? { bg: TONE.green.bg, fg: TONE.green.fg }
      : { bg: '#FFFFFF', fg: GRAY };
  return (
    <div style={{ fontSize: 13, lineHeight: 1.5, color: palette.fg, background: palette.bg, border: kind === 'info' ? '1px dashed ' + MUTED : 'none', borderRadius: 10, padding: '8px 12px' }}>
      {children}
    </div>
  );
}

const inputBase = {
  height: 44, boxSizing: 'border-box', padding: '0 12px',
  border: '1.5px solid ' + MUTED, borderRadius: 10, background: '#FFFFFF',
  color: INK, fontSize: 14, font: 'inherit'
};

const btnPrimary = (accent) => ({
  height: 44, padding: '0 16px', borderRadius: 10, border: 'none',
  background: accent, color: INK, fontSize: 14, fontWeight: 800, cursor: 'pointer'
});
const btnGhost = {
  height: 44, padding: '0 14px', borderRadius: 10,
  border: '1.5px solid ' + MUTED, background: '#FFFFFF',
  color: INK, fontSize: 14, fontWeight: 700, cursor: 'pointer'
};
const btnDanger = {
  height: 44, padding: '0 14px', borderRadius: 10,
  border: '1.5px solid ' + LINE, background: '#FFFFFF',
  color: RED, fontSize: 13, fontWeight: 700, cursor: 'pointer'
};

/* ---------- pilih mekanik per mobil ---------- */
function MechSelect({ car, b, accent, onChange }) {
  const busyElsewhere = (name) => name !== car.mech && !mechFree(b.dateISO, b.slot, name);
  return (
    <select value={car.mech || ''} onChange={(e) => onChange(e.target.value)} disabled={b.status === 'done' || b.status === 'cancelled'}
      aria-label={'Mekanik untuk ' + car.plate}
      style={Object.assign({}, inputBase, { height: 36, fontSize: 13, width: '100%', maxWidth: 190, borderColor: car.mech ? LINE : accent })}>
      <option value="">— belum ditugaskan —</option>
      {MECHANICS.map((m) => (
        <option key={m.id} value={m.name} disabled={busyElsewhere(m.name)}>
          {m.name}{busyElsewhere(m.name) ? ' (sibuk di jam ini)' : ''}
        </option>
      ))}
    </select>
  );
}

/* ---------- kartu booking ---------- */
function BookingCard({ b, accent, onChange }) {
  const [codeInput, setCodeInput] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [resDay, setResDay] = useState(0);
  const [resSlot, setResSlot] = useState('');
  const [showAudit, setShowAudit] = useState(false);

  const canAdvance = NEXT_ACTION[b.status];
  const total = b.cars.length;
  const done = carsDone(b);
  const days = bookableDays();

  const run = (result, okText) => {
    if (!result || result.ok === false) {
      setErr((result && result.error) || 'Aksi gagal.');
      setMsg('');
      return false;
    }
    setErr('');
    setMsg(okText || '');
    onChange();
    return true;
  };

  const verify = () => {
    if (run(checkInBooking(b.id, codeInput, ACTOR), 'Check-in terverifikasi, status menjadi Tiba.')) setCodeInput('');
  };

  const cancel = () => {
    const reason = window.prompt('Alasan pembatalan (wajib diisi untuk audit):', '');
    if (reason === null) return;
    if (!String(reason).trim()) { setErr('Alasan pembatalan wajib diisi.'); return; }
    run(closeBooking(b.id, 'cancelled', String(reason).trim(), ACTOR), 'Booking dibatalkan.');
  };

  const noShow = () => {
    const reason = window.prompt('Catatan tidak datang (opsional):', 'Tidak datang sesuai jadwal');
    if (reason === null) return;
    run(closeBooking(b.id, 'no_show', String(reason).trim() || 'Tidak datang', ACTOR), 'Booking ditandai tidak datang; slot dilepas.');
  };

  const archive = () => {
    if (!window.confirm('Arsipkan booking ' + b.id + '? Riwayat tetap tersimpan dan bisa dipulihkan.')) return;
    run(archiveBooking(b.id, ACTOR), 'Booking diarsipkan.');
  };

  const applyReschedule = () => {
    if (!resSlot) { setErr('Pilih jam baru dulu.'); return; }
    const day = days[resDay] || days[0];
    if (run(rescheduleBooking(b.id, day.iso, resSlot, ACTOR), 'Jadwal dipindah ke ' + day.full + ' · ' + resSlot + '.')) setResSlot('');
  };

  const editable = b.status === 'confirmed' || b.status === 'arrived' || b.status === 'in_progress';

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: 1 }}>{b.id}</span>
          <StatusChip status={b.status} />
          {b.sample ? <span style={{ fontSize: 11, fontWeight: 800, color: GRAY, border: '1px solid ' + LINE, borderRadius: 999, padding: '3px 8px' }}>CONTOH</span> : null}
          {b.source === 'walkin' ? <span style={{ fontSize: 11, fontWeight: 800, color: TONE.violet.fg, background: TONE.violet.bg, borderRadius: 999, padding: '3px 8px' }}>WALK-IN</span> : null}
          {isUnassigned(b) ? <span style={{ fontSize: 11, fontWeight: 800, color: TONE.amber.fg, background: TONE.amber.bg, borderRadius: 999, padding: '3px 8px' }}>MEKANIK BELUM LENGKAP</span> : null}
        </div>
        <span style={{ fontSize: 12, color: MUTED }}>Dibuat {fmtDateID(b.createdAt)} WIB</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 12, color: GRAY, fontWeight: 700 }}>Jadwal servis</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{b.dayFull} · {b.slot}</div>
          <div style={{ fontSize: 13, color: GRAY }}>{b.wait === 'tunggu' ? 'Menunggu di bengkel' : 'Mobil ditinggal'} · {total} mobil · {done}/{total} selesai</div>
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

      {/* Mobil: mekanik + progres */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {b.cars.map((c, i) => (
          <div key={c.plate + i} style={{ display: 'flex', flexDirection: 'column', gap: 8, background: BG, borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 800, textDecoration: c.done ? 'line-through' : 'none', color: c.done ? GRAY : INK }}>{c.plate}</span>
                <span style={{ fontSize: 13, color: GRAY }}> · {c.model}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{c.svc}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <MechSelect car={c} b={b} accent={accent}
                onChange={(name) => run(assignMechanic(b.id, i, name, ACTOR), name ? 'Mekanik ' + c.plate + ': ' + name : 'Penugasan ' + c.plate + ' dilepas.')} />
              <button type="button" onClick={() => run(setCarDone(b.id, i, !c.done, ACTOR), c.done ? 'Progres ' + c.plate + ' dibatalkan.' : c.plate + ' ditandai selesai.')}
                disabled={b.status === 'done' || b.status === 'cancelled'}
                style={{ height: 36, padding: '0 12px', borderRadius: 10, border: '1.5px solid ' + (c.done ? GREEN : LINE), background: c.done ? TONE.green.bg : '#FFFFFF', color: c.done ? TONE.green.fg : INK, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                {c.done ? 'Selesai ✓' : 'Tandai selesai'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {b.note ? (
        <div style={{ fontSize: 13, lineHeight: 1.5, color: GRAY, background: '#FFFFFF', border: '1px dashed ' + MUTED, borderRadius: 10, padding: '8px 12px' }}>
          Catatan: {b.note}
        </div>
      ) : null}

      {(b.status === 'cancelled' || b.status === 'no_show') && b.closedReason ? (
        <Notice>Alasan: {b.closedReason}</Notice>
      ) : null}

      {/* Check-in */}
      {b.status === 'confirmed' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Verifikasi kedatangan (kode check-in dari pelanggan)</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="text" inputMode="numeric" maxLength={4} placeholder="4 angka" value={codeInput}
              onChange={(e) => { setCodeInput(e.target.value.replace(/\D/g, '').slice(0, 4)); setErr(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') verify(); }}
              style={Object.assign({}, inputBase, { width: 110, textAlign: 'center', letterSpacing: 6, fontSize: 18, fontWeight: 700 })} />
            <button type="button" onClick={verify} style={btnPrimary(accent)}>Verifikasi & catat tiba</button>
            <button type="button" onClick={() => { setCodeInput(b.checkinCode); setMsg('Kode demo ditampilkan (bantuan prototipe).'); }}
              style={{ height: 44, padding: 0, border: 'none', background: 'transparent', color: MUTED, fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
              lihat kode (demo)
            </button>
          </div>
        </div>
      ) : null}

      {/* Reschedule */}
      {editable ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Ubah jadwal</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={resDay} onChange={(e) => { setResDay(parseInt(e.target.value, 10)); setResSlot(''); }} style={Object.assign({}, inputBase)}>
              {days.map((d, i) => <option key={d.iso} value={i}>{d.full}</option>)}
            </select>
            <select value={resSlot} onChange={(e) => setResSlot(e.target.value)} style={Object.assign({}, inputBase)}>
              <option value="">— pilih jam —</option>
              {SLOT_TEMPLATE.map((sl) => {
                const ok = slotOk((days[resDay] || {}).iso, sl.t, '', b.cars.length, b.id);
                return <option key={sl.t} value={sl.t} disabled={!ok}>{sl.t}{ok ? '' : ' (penuh)'}</option>;
              })}
            </select>
            <button type="button" onClick={applyReschedule} style={btnGhost} disabled={!resSlot}>Pindahkan</button>
          </div>
        </div>
      ) : null}

      {msg ? <Notice kind="ok">{msg}</Notice> : null}
      {err ? <Notice kind="error">{err}</Notice> : null}

      {/* Aksi status */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {canAdvance ? (
          <button type="button" onClick={() => run(updateBookingStatus(b.id, canAdvance.to, ACTOR), 'Status: ' + statusLabel(canAdvance.to) + '.')}
            style={btnPrimary(accent)}>
            {canAdvance.label}
          </button>
        ) : null}
        {isUnassigned(b) && b.status !== 'done' && b.status !== 'cancelled' ? (
          <button type="button" onClick={() => run(autoAssignMechanics(b.id, ACTOR), 'Mekanik dibagikan otomatis.')} style={btnGhost}>
            Tugaskan otomatis
          </button>
        ) : null}
        {b.status === 'confirmed' || b.status === 'arrived' ? (
          <>
            <button type="button" onClick={cancel} style={btnGhost}>Batalkan…</button>
            <button type="button" onClick={noShow} style={btnGhost}>Tidak datang…</button>
          </>
        ) : null}
        <button type="button" onClick={archive} style={Object.assign({}, btnDanger, { marginLeft: 'auto' })}>Arsipkan</button>
      </div>

      {b.audit.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button type="button" onClick={() => setShowAudit(!showAudit)}
            style={{ alignSelf: 'flex-start', padding: 0, border: 'none', background: 'transparent', color: GRAY, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            {showAudit ? 'Sembunyikan riwayat' : 'Riwayat perubahan (' + b.audit.length + ')'}
          </button>
          {showAudit ? b.audit.slice(0, 12).map((a, i) => (
            <div key={i} style={{ fontSize: 12, color: GRAY, lineHeight: 1.5 }}>
              <b style={{ color: INK }}>{a.action}</b> · {fmtDateID(a.at)} · {a.actor}{a.note ? ' · ' + a.note : ''}
            </div>
          )) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ---------- form walk-in ---------- */
function WalkInForm({ accent, onCreated }) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('owner');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [svcId, setSvcId] = useState(SERVICE_CATALOG[0].id);
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState('');
  const [err, setErr] = useState('');
  const days = bookableDays();

  const reset = () => {
    setPhone(''); setRole('owner'); setOwnerPhone('');
    setPlate(''); setModel(''); setSvcId(SERVICE_CATALOG[0].id);
    setDayIdx(0); setSlot(''); setErr('');
  };

  const submit = () => {
    const day = days[dayIdx] || days[0];
    const svc = SERVICE_CATALOG.find((x) => x.id === svcId) || SERVICE_CATALOG[0];
    if (normPhone(phone).length < 9) { setErr('Nomor HP pelanggan minimal 9 digit.'); return; }
    if (role === 'driver' && normPhone(ownerPhone).length < 9) { setErr('Nomor HP pemilik wajib untuk peran pengantar.'); return; }
    if (!plate.trim()) { setErr('Plat nomor wajib diisi.'); return; }
    if (!slot) { setErr('Pilih jam kedatangan.'); return; }
    if (!slotOk(day.iso, slot, '', 1)) { setErr('Slot ' + slot + ' sudah penuh untuk tanggal itu.'); return; }

    const booking = saveBooking({
      phone: phone.trim(),
      role: role,
      ownerPhone: role === 'driver' ? ownerPhone.trim() : '',
      cars: [{ plate: plate.trim().toUpperCase(), model: model.trim(), svc: svc.name, mech: '', done: false }],
      note: 'Walk-in didaftarkan admin',
      wait: 'tunggu',
      dateISO: day.iso,
      dayFull: day.full,
      slot: slot,
      mech: AUTO_MECH,
      remindOn: false,
      promoOn: false,
      source: 'walkin',
      status: 'arrived',
      actor: ACTOR
    });
    upsertVehicle(phone, { plate: plate.trim().toUpperCase(), model: model.trim() });
    reset();
    setOpen(false);
    onCreated('Walk-in ' + booking.id + ' ditambahkan (status Tiba).');
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} style={btnGhost}>
        + Daftarkan walk-in
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: '#FFFFFF', border: '2px solid ' + INK, borderRadius: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 800 }}>Pelanggan datang langsung (walk-in)</div>
        <button type="button" onClick={() => { setOpen(false); reset(); }}
          style={{ border: 'none', background: 'transparent', color: GRAY, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Tutup</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label htmlFor="wi-phone" style={{ fontSize: 12, fontWeight: 700, color: GRAY }}>Nomor WhatsApp</label>
          <input id="wi-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xx xxxx xxxx" style={inputBase} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label htmlFor="wi-plate" style={{ fontSize: 12, fontWeight: 700, color: GRAY }}>Plat nomor</label>
          <input id="wi-plate" type="text" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="B 1234 XYZ" style={inputBase} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label htmlFor="wi-model" style={{ fontSize: 12, fontWeight: 700, color: GRAY }}>Tipe / tahun</label>
          <input id="wi-model" type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Toyota Avanza 2018" style={inputBase} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label htmlFor="wi-svc" style={{ fontSize: 12, fontWeight: 700, color: GRAY }}>Servis</label>
          <select id="wi-svc" value={svcId} onChange={(e) => setSvcId(e.target.value)} style={inputBase}>
            {SERVICE_CATALOG.map((sv) => <option key={sv.id} value={sv.id}>{sv.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label htmlFor="wi-day" style={{ fontSize: 12, fontWeight: 700, color: GRAY }}>Tanggal</label>
          <select id="wi-day" value={dayIdx} onChange={(e) => { setDayIdx(parseInt(e.target.value, 10)); setSlot(''); }} style={inputBase}>
            {days.map((d, i) => <option key={d.iso} value={i}>{d.full}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label htmlFor="wi-slot" style={{ fontSize: 12, fontWeight: 700, color: GRAY }}>Jam</label>
          <select id="wi-slot" value={slot} onChange={(e) => setSlot(e.target.value)} style={inputBase}>
            <option value="">— pilih jam —</option>
            {SLOT_TEMPLATE.map((sl) => {
              const ok = slotOk((days[dayIdx] || {}).iso, sl.t, '', 1);
              return <option key={sl.t} value={sl.t} disabled={!ok}>{sl.t}{ok ? '' : ' (penuh)'}</option>;
            })}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setRole('owner')}
          style={Object.assign({}, btnGhost, { border: '2px solid ' + (role === 'owner' ? INK : LINE) })}>Pemilik</button>
        <button type="button" onClick={() => setRole('driver')}
          style={Object.assign({}, btnGhost, { border: '2px solid ' + (role === 'driver' ? INK : LINE) })}>Pengantar</button>
        {role === 'driver' ? (
          <input type="tel" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} placeholder="WA pemilik" style={Object.assign({}, inputBase, { maxWidth: 200 })} />
        ) : null}
      </div>
      {err ? <Notice kind="error">{err}</Notice> : null}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={submit} style={btnPrimary(accent)}>Simpan walk-in</button>
        <button type="button" onClick={() => { reset(); setOpen(false); }} style={btnGhost}>Batal</button>
      </div>
    </div>
  );
}

/* ---------- panel admin ---------- */
function Admin() {
  const accent = useAccent();
  const [bookings, setBookings] = useState(() => loadBookings());
  const [archived, setArchived] = useState(() => loadArchivedBookings());
  const [filter, setFilter] = useState('today');
  const [notice, setNotice] = useState('');

  const refresh = () => {
    setBookings(loadBookings());
    setArchived(loadArchivedBookings());
  };

  const today = todayISO();
  const todays = bookings.filter((b) => b.dateISO === today);
  const active = bookings.filter((b) => holdsSlot(b.status));

  const stats = {
    today: todays.filter((b) => holdsSlot(b.status)).length,
    waiting: bookings.filter((b) => b.status === 'confirmed').length,
    working: bookings.filter((b) => b.status === 'in_progress').length,
    unassigned: active.filter(isUnassigned).length
  };

  const filtered = (() => {
    if (filter === 'today') return todays.slice().sort((a, b) => String(a.slot).localeCompare(String(b.slot)));
    if (filter === 'archived') return archived;
    if (filter === 'all') return bookings;
    return bookings.filter((b) => b.status === filter);
  })();

  const tabs = [
    { id: 'today', label: 'Hari ini (' + stats.today + ')' },
    { id: 'all', label: 'Semua (' + bookings.length + ')' },
    { id: 'confirmed', label: 'Menunggu tiba (' + stats.waiting + ')' },
    { id: 'arrived', label: 'Tiba (' + bookings.filter((b) => b.status === 'arrived').length + ')' },
    { id: 'in_progress', label: 'Dikerjakan (' + bookings.filter((b) => b.status === 'in_progress').length + ')' },
    { id: 'done', label: 'Selesai (' + bookings.filter((b) => b.status === 'done').length + ')' },
    { id: 'cancelled', label: 'Dibatalkan (' + bookings.filter((b) => b.status === 'cancelled').length + ')' },
    { id: 'no_show', label: 'Tidak datang (' + bookings.filter((b) => b.status === 'no_show').length + ')' },
    { id: 'archived', label: 'Arsip (' + archived.length + ')' }
  ];

  const pill = (on) => ({
    height: 38, padding: '0 12px', borderRadius: 19,
    border: '2px solid ' + (on ? INK : LINE),
    background: on ? accent : '#FFFFFF', color: INK,
    fontSize: 12, fontWeight: 700, cursor: 'pointer'
  });

  const hasSample = bookings.some((b) => b.sample);

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK, boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '24px 20px 48px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: accent, color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <WrenchIcon />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>[Nama Bengkel] · Panel Admin</div>
            <div style={{ fontSize: 13, color: GRAY }}>Operasional harian: check-in, mekanik, jadwal</div>
          </div>
          <a href="mech.html" style={{ fontSize: 13, fontWeight: 800, color: INK, textDecoration: 'none' }}>Portal mekanik</a>
          <a href="index.html" style={{ fontSize: 13, fontWeight: 800, color: INK, textDecoration: 'none' }}>← Situs pelanggan</a>
        </div>

        {/* Statistik */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <StatCard label="Servis hari ini" value={stats.today} sub={dayInfo(today) ? dayInfo(today).fullLong : today} accent={accent} />
          <StatCard label="Menunggu tiba" value={stats.waiting} />
          <StatCard label="Sedang dikerjakan" value={stats.working} />
          <StatCard label="Mekanik belum lengkap" value={stats.unassigned} />
        </div>

        {/* Aksi + walk-in */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <WalkInForm accent={accent} onCreated={(text) => { setNotice(text); refresh(); }} />
          {hasSample ? (
            <button type="button" onClick={() => { const r = clearSampleData(); setNotice(r.removed + ' data contoh dihapus.'); refresh(); }} style={btnGhost}>
              Hapus data contoh
            </button>
          ) : (
            <button type="button" onClick={() => { const r = seedSampleData(); setNotice(r.created ? r.created + ' data contoh dimuat (bertanda CONTOH).' : 'Data contoh sudah ada.'); refresh(); }} style={btnGhost}>
              Muat data contoh (demo)
            </button>
          )}
        </div>

        {notice ? <Notice kind="ok">{notice}</Notice> : null}

        {/* Tab filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setFilter(t.id)} style={pill(filter === t.id)}>{t.label}</button>
          ))}
        </div>

        {/* Daftar */}
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 24px', background: '#FFFFFF', border: '1px dashed ' + MUTED, borderRadius: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>
              {filter === 'archived' ? 'Arsip masih kosong' : 'Tidak ada booking di sini'}
            </div>
            <div style={{ fontSize: 14, color: GRAY, lineHeight: 1.6, maxWidth: 440 }}>
              Booking dari <a href="index.html" style={{ fontWeight: 700 }}>situs pelanggan</a> atau walk-in yang kamu daftarkan
              akan muncul di sini. Data contoh bisa dimuat untuk melihat tata letaknya.
            </div>
          </div>
        ) : filter === 'archived' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((b) => (
              <div key={b.id} style={{ background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: 1 }}>{b.id}</span>
                    <StatusChip status={b.status} />
                    <span style={{ fontSize: 12, color: MUTED }}>{b.dayFull} · {b.slot}</span>
                  </div>
                  <span style={{ fontSize: 12, color: MUTED }}>Diarsipkan {b.archivedAt ? fmtDateID(b.archivedAt) : ''}</span>
                </div>
                <div style={{ fontSize: 13, color: GRAY }}>{b.phone} · {b.cars.map((c) => c.plate).join(', ')}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => { restoreBooking(b.id, ACTOR); setNotice(b.id + ' dipulihkan dari arsip.'); refresh(); }} style={btnGhost}>
                    Pulihkan
                  </button>
                  <button type="button" onClick={() => {
                    if (!window.confirm('Hapus permanen ' + b.id + '? Tindakan ini tidak bisa dibatalkan.')) return;
                    const r = purgeBooking(b.id, ACTOR);
                    setNotice(r.ok ? b.id + ' dihapus permanen.' : r.error);
                    refresh();
                  }} style={btnDanger}>
                    Hapus permanen
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((b) => (
              <BookingCard key={b.id} b={b} accent={accent} onChange={() => { setNotice(''); refresh(); }} />
            ))}
          </div>
        )}

        <div style={{ fontSize: 12, color: MUTED, textAlign: 'center' }}>
          Semua perubahan tercatat di riwayat booking (audit trail). Data tersimpan di browser ini (localStorage);
          untuk produksi, ganti lapisan data di <b>booking.js</b> dengan API backend.
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Admin />);
