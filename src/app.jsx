/* ============================================================
 *  Sistem Booking Bengkel — aplikasi pelanggan
 *  Port setia dari design "Booking Pelanggan" (Main.dc.html):
 *  5 langkah — Nomor WA → OTP → Mobil → Servis → Jadwal →
 *  Konfirmasi → Berhasil.
 *
 *  Data & aturan: booking.js (satu sumber untuk 3 portal). Halaman
 *  admin: admin.html · portal mekanik: mech.html.
 * ============================================================ */

const { useState, useEffect, useRef } = React;

const INK = '#12161C';
const GRAY = '#5A6270';
const LINE = '#DDE1E7';
const MUTED = '#8791A0';
const BG = '#F2F3F5';
const ACCENTS = ['#FFB81C', '#F26A21', '#2F80ED', '#1F9D6B'];

const ORDER = ['phone', 'otp', 'cars', 'service', 'schedule', 'confirm'];
const STEPNO = { phone: 1, otp: 1, cars: 2, service: 3, schedule: 4, confirm: 5 };
const STEPNAME = { 1: 'Nomor WhatsApp', 2: 'Mobil', 3: 'Servis', 4: 'Jadwal', 5: 'Konfirmasi' };
const NEXTLABEL = { phone: 'Kirim kode', otp: 'Verifikasi', cars: 'Lanjut', service: 'Lanjut', schedule: 'Lanjut', confirm: 'Konfirmasi booking' };
const PREV = { otp: 'phone', cars: 'phone', service: 'cars', schedule: 'service', confirm: 'schedule' };

const dig = (v) => String(v || '').replace(/\D/g, '').length;
const fmt = (m) => (m < 60 ? '±' + m + ' menit' : '±' + String(m / 60).replace('.', ',') + ' jam');
const scrollTop = () => { try { window.scrollTo(0, 0); } catch (e) {} };

/* ---------- konfigurasi master: satu sumber di booking.js ---------- */
const SERVICES = SERVICE_CATALOG.map((sv) => ({
  id: sv.id,
  name: sv.name,
  mins: sv.mins,
  hint: sv.mins === 0
    ? 'Mekanik cek dulu (±30–60 menit), lalu estimasi biaya dan durasi dikirim ke WhatsApp untuk kamu setujui.'
    : 'Perkiraan selesai ' + fmt(sv.mins) + '.'
}));

const SLOTS = SLOT_TEMPLATE.map((sl) => ({ t: sl.t }));

const MECHS = [{ id: 'auto', name: 'Otomatis', sub: 'Dipilihkan yang kosong, paling cepat dikerjakan' }]
  .concat(MECHANICS.map((m) => ({ id: m.id, name: m.name, sub: 'Jadwal mengikuti booking yang masuk' })));

/* Tanggal ditawarkan selalu mulai hari ini (bukan tanggal mati) */
const DAYS = upcomingDays(DAYS_SHOWN);

const mechNameOf = (id) => (id && id !== 'auto'
  ? ((MECHANICS.find((m) => m.id === id) || {}).name || '')
  : '');

const slotOkFor = (dateISO, slot, mechId, count) => slotOk(dateISO, slot, mechNameOf(mechId), count);

/* Daftar mobil dari "garasi" nomor HP (persisten, bukan data contoh) */
const toCarList = (phoneValue) => loadVehicles(phoneValue).map((c, i) => ({
  id: 'v' + i + '-' + String(c.plate).replace(/\W/g, ''),
  plate: c.plate,
  model: c.model,
  last: c.last
}));

/* ---------- ikon (SVG dari design) ---------- */
const WrenchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
);
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4l-6 6 6 6"></path></svg>
);
const CheckIcon = ({ size = 16, width = 2.4 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"></path></svg>
);
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12"></path></svg>
);

function BoxCheck({ on, accent }) {
  return (
    <span aria-hidden="true" style={{ width: 26, height: 26, flex: 'none', boxSizing: 'border-box', borderRadius: 8, border: '2px solid ' + INK, background: on ? (accent || INK) : '#FFFFFF', color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {on ? <CheckIcon /> : null}
    </span>
  );
}

function AccentDot({ on, accent, color, onClick }) {
  return (
    <button type="button" aria-label={'Warna aksen ' + color} aria-pressed={on} onClick={onClick}
      style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
      <span aria-hidden="true"
        style={{ width: 18, height: 18, borderRadius: 9, background: color, border: on ? '2px solid ' + INK : '2px solid rgba(0,0,0,0.12)', boxSizing: 'border-box' }} />
    </button>
  );
}

/* ============================================================
 *  Aplikasi utama
 * ============================================================ */
function App() {
  const [accent, setAccent] = useState(() => {
    const saved = readAccent();
    return ACCENTS.indexOf(saved) === -1 ? ACCENTS[0] : saved;
  });
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('owner');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [cars, setCars] = useState(() => toCarList(phone));
  const [selected, setSelected] = useState(() => {
    const list = toCarList(phone);
    return list[0] ? { [list[0].id]: true } : {};
  });
  const [addOpen, setAddOpen] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [newModel, setNewModel] = useState('');
  const [svc, setSvc] = useState({});
  const [note, setNote] = useState('');
  const [wait, setWait] = useState('tunggu');
  const [day, setDay] = useState(0);
  const [mech, setMech] = useState('auto');
  const [slot, setSlot] = useState('');
  const [remindOn, setRemindOn] = useState(true);
  const [promoOn, setPromoOn] = useState(false);
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [checkin, setCheckin] = useState('');
  const [savedId, setSavedId] = useState('');

  /* Cek status booking (pelanggan bisa pantau / batalkan / ubah jadwal) */
  const [lookCode, setLookCode] = useState('');
  const [lookPhone, setLookPhone] = useState('');
  const [lookErr, setLookErr] = useState('');
  const [looked, setLooked] = useState(null);
  const [resDay, setResDay] = useState(0);
  const [resSlot, setResSlot] = useState('');
  const [resMsg, setResMsg] = useState('');

  /* mobil ikut nomor HP yang dipakai booking */
  useEffect(() => {
    const list = toCarList(phone);
    setCars(list);
    setSelected((prev) => {
      const keep = {};
      list.forEach((c) => { if (prev[c.id] || Object.keys(prev).length === 0) keep[c.id] = true; });
      return Object.keys(keep).length ? keep : (list[0] ? { [list[0].id]: true } : {});
    });
    setSvc({});
    setSlot('');
  }, [phone]);

  const driver = role === 'driver';
  const selectedCars = cars.filter((c) => selected[c.id]);
  const n = selectedCars.length;

  const canNext = ({
    phone: dig(phone) >= 9,
    otp: otp.length === 4,
    cars: n >= 1 && (!driver || dig(ownerPhone) >= 9),
    service: n >= 1 && selectedCars.every((c) => !!svc[c.id]),
    schedule: slot !== '' && slotOkFor((DAYS[day] || {}).iso, slot, mech, n),
    confirm: true
  })[step] === true;

  const goNext = () => {
    if (!canNext || saving) return;
    if (step === 'confirm') {
      if (savingRef.current) return;
      savingRef.current = true;
      setSaving(true);
      const chosenMech = mechNameOf(mech);
      const dayObj = DAYS[day];
      const booking = saveBooking({
        phone: phone.trim(),
        role: role,
        ownerPhone: driver ? ownerPhone.trim() : '',
        cars: selectedCars.map((c) => {
          const sv = SERVICES.find((x) => x.id === svc[c.id]);
          return { plate: c.plate, model: c.model, svc: sv ? sv.name : '-', mech: chosenMech, done: false };
        }),
        note: note.trim(),
        wait: wait,
        dateISO: dayObj.iso,
        dayFull: dayObj.full,
        slot: slot,
        mech: chosenMech || AUTO_MECH,
        remindOn: remindOn,
        promoOn: promoOn,
        actor: 'pelanggan'
      });
      setCode(booking.id);
      setCheckin(booking.checkinCode);
      setSavedId(booking.id);
      setSaving(false);
      savingRef.current = false;
      setStep('done');
      scrollTop();
      return;
    }
    const i = ORDER.indexOf(step);
    setStep(ORDER[i + 1]);
    scrollTop();
  };

  const goBack = () => { if (PREV[step]) { setStep(PREV[step]); scrollTop(); } };

  const restart = () => {
    setStep('phone'); setOtp(''); setRole('owner'); setOwnerPhone('');
    setSelected({ c1: true }); setSvc({}); setNote('');
    setWait('tunggu'); setDay(0); setMech('auto'); setSlot('');
    setRemindOn(true); setPromoOn(false); setCode(''); setCheckin(''); setSavedId('');
    setLookErr(''); setLooked(null); setResSlot(''); setResMsg('');
    scrollTop();
  };

  const toggleCar = (id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
    setSlot('');
  };

  const saveCar = () => {
    const plate = newPlate.trim().toUpperCase();
    if (!plate) return;
    const res = upsertVehicle(phone, { plate: plate, model: newModel.trim() });
    if (!res.ok) return;
    const list = toCarList(phone);
    const added = list.find((c) => c.plate === res.car.plate);
    setCars(list);
    if (added) setSelected((prev) => Object.assign({}, prev, { [added.id]: true }));
    setAddOpen(false); setNewPlate(''); setNewModel(''); setSlot('');
  };

  const pickDay = (i) => { setDay(i); setSlot(''); };

  const openLookup = () => {
    setLookErr(''); setResMsg(''); setResSlot('');
    setLookPhone(phone);
    setStep('status');
    scrollTop();
  };

  const doLookup = () => {
    const res = findBookingForCustomer(lookCode, lookPhone);
    if (!res.ok) { setLookErr(res.error); setLooked(null); return; }
    setLookErr('');
    setLooked(res.booking);
    setResDay(0);
    setResSlot('');
  };

  const refreshLooked = (id) => {
    const fresh = findBooking(id);
    setLooked(fresh);
  };

  const cancelMine = () => {
    if (!looked) return;
    const reason = window.prompt('Alasan pembatalan (boleh dikosongkan):', '') || '';
    const res = closeBooking(looked.id, 'cancelled', reason || 'Dibatalkan pelanggan', 'pelanggan');
    if (!res.ok) { setResMsg(res.error); return; }
    setResMsg('Booking dibatalkan.');
    refreshLooked(looked.id);
  };

  const rescheduleMine = () => {
    if (!looked || !resSlot) { setResMsg('Pilih tanggal dan jam baru dulu.'); return; }
    const dayInfo2 = DAYS[resDay] || DAYS[0];
    const res = rescheduleBooking(looked.id, dayInfo2.iso, resSlot, 'pelanggan');
    if (!res.ok) { setResMsg(res.error); return; }
    setResMsg('Jadwal dipindah ke ' + dayInfo2.full + ' · ' + resSlot + '.');
    setResSlot('');
    refreshLooked(looked.id);
  };

  const pickMech = (m) => {
    setMech(m.id);
    if (slot && !slotOkFor((DAYS[day] || {}).iso, slot, m.id, n)) setSlot('');
  };

  /* ---------- turunan (sama persis dengan design) ---------- */
  const stepNo = STEPNO[step] || 5;
  const segs = [1, 2, 3, 4, 5].map((i) => ({ bg: i <= stepNo ? INK : '#CBD1D9' }));

  const roles = [
    { id: 'owner', label: 'Pemilik mobil' },
    { id: 'driver', label: 'Mengantar (supir atau kerabat)' }
  ].map((r) => {
    const on = role === r.id;
    return { ...r, on, bg: on ? accent : '#FFFFFF', fg: INK, border: on ? INK : MUTED };
  });

  const waits = [
    { id: 'tunggu', label: 'Saya tunggu di bengkel' },
    { id: 'tinggal', label: 'Saya tinggal' }
  ].map((w) => {
    const on = wait === w.id;
    return { ...w, on, bg: on ? accent : '#FFFFFF', fg: INK, border: on ? INK : MUTED };
  });
  const waitNote = wait === 'tunggu'
    ? 'Kamu dapat QR di ruang tunggu untuk memantau progres dan estimasi selesai.'
    : 'Tidak perlu menunggu. Kabar dikirim lewat WhatsApp: mulai dikerjakan, persetujuan biaya, dan mobil siap diambil.';

  const days = DAYS.map((d, i) => {
    const on = day === i;
    const hint = i === 0 ? 'Hari ini' : (i === 1 ? 'Besok' : d.dow);
    return { ...d, i, hint, on, bg: on ? accent : '#FFFFFF', fg: INK, border: on ? INK : MUTED };
  });

  const mechList = MECHS.map((m) => {
    const on = mech === m.id;
    return { ...m, on, border: on ? INK : LINE, dotBg: on ? accent : '#FFFFFF' };
  });

  const slotList = SLOTS.map((sl) => {
    const ok = slotOkFor((DAYS[day] || {}).iso, sl.t, mech, n);
    const on = ok && slot === sl.t;
    return {
      ...sl, ok, on,
      sub: !ok ? 'Penuh' : (on ? 'Dipilih' : 'Kosong'),
      bg: on ? accent : (ok ? '#FFFFFF' : '#EEF0F3'),
      fg: ok ? INK : GRAY,
      subFg: on ? 'rgba(18,22,28,0.72)' : GRAY,
      border: on ? INK : (ok ? MUTED : LINE)
    };
  });

  const chosen = selectedCars.map((c) => SERVICES.find((x) => x.id === svc[c.id])).filter(Boolean);
  const needsCheck = chosen.some((x) => x.mins === 0);
  const maxMins = Math.max(0, ...chosen.map((x) => x.mins));
  let estimate = 'Pilih servis dulu untuk melihat perkiraan.';
  if (chosen.length) {
    estimate = needsCheck
      ? 'Ada mobil yang dicek dulu (±30–60 menit). Setelah itu estimasi biaya dan durasi dikirim lewat WhatsApp untuk kamu setujui.'
      : 'Selesai ' + fmt(maxMins) + (n > 1 ? ', semua mobil dikerjakan bersamaan oleh mekanik berbeda.' : '.');
  }
  const multiNote = n + ' mobil dikerjakan bersamaan, masing-masing 1 mekanik. Jam yang tampil sudah memperhitungkan jumlah mekanik yang kosong.';

  const dayObj = DAYS[day];
  const mechName = mechNameOf(mech) || AUTO_MECH;
  const whenText = dayObj.full + ' · ' + slot;
  const waitText = wait === 'tunggu' ? 'Menunggu di bengkel' : 'Mobil ditinggal';
  const dayIso = (DAYS[day] || {}).iso;

  const confirmCars = selectedCars.map((c) => {
    const sv = SERVICES.find((x) => x.id === svc[c.id]);
    return { plate: c.plate, model: c.model, svc: sv ? sv.name : '-' };
  });
  const carsLine = confirmCars.map((c) => c.plate + ' (' + c.svc + ')').join(', ');

  const who = driver ? 'pemilik' : 'kamu';
  const nextSteps = [
    { n: 1, title: 'Datang sesuai jadwal', body: 'Sebut plat nomor atau tunjukkan kode booking.' },
    { n: 2, title: 'Setujui estimasi lewat WhatsApp', body: 'Estimasi biaya dan durasi dikirim ke ' + who + ' setelah mobil dicek. Pekerjaan tambahan menunggu persetujuan.' },
    wait === 'tunggu'
      ? { n: 3, title: 'Pantau progres lewat QR', body: 'Status berubah setiap mekanik mengetuk: dikerjakan, lalu selesai.' }
      : { n: 3, title: 'Tunggu kabar di WhatsApp', body: 'Kamu diberi tahu saat mulai dikerjakan dan saat mobil siap diambil.' },
    { n: 4, title: 'Bayar dan terima struk', body: 'Bayar lewat QRIS di kasir. Struk digital dikirim ke WhatsApp.' + (driver ? ' Kabar jemput dikirim ke nomor kamu.' : '') }
  ];
  const prefsLine = (remindOn ? 'Pengingat servis berikutnya aktif.' : 'Pengingat servis berikutnya tidak aktif.') + (promoOn ? ' Info promo aktif.' : ' Info promo tidak aktif.');

  const showProgress = step !== 'done' && step !== 'status';
  const showBack = step !== 'phone' && step !== 'done' && step !== 'status';
  const showFooter = step !== 'done' && step !== 'status';
  const roleLabel = driver ? 'Pengantar' : 'Pemilik';

  /* ---------- render ---------- */
  return (
    <div style={{ minHeight: '100dvh', background: BG, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK, display: 'flex', justifyContent: 'center', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: 440, minHeight: '100dvh', boxSizing: 'border-box', padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ===== Header ===== */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: accent, color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
            <WrenchIcon />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>[Nama Bengkel]</div>
            <div style={{ fontSize: 13, color: GRAY }}>Booking servis mobil</div>
          </div>
          <button type="button" onClick={openLookup} aria-label="Cek status booking"
            style={{ minHeight: 44, padding: '0 16px', borderRadius: 22, border: '2px solid ' + LINE, background: '#FFFFFF', color: INK, fontSize: 13, fontWeight: 700, cursor: 'pointer', flex: 'none' }}>
            Cek status
          </button>
        </div>

        {/* ===== Progress ===== */}
        {showProgress && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {showBack && (
              <button type="button" aria-label="Kembali" onClick={goBack}
                style={{ width: 44, height: 44, flex: 'none', borderRadius: 12, border: '1.5px solid ' + MUTED, background: '#FFFFFF', color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                <BackIcon />
              </button>
            )}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {segs.map((seg, i) => <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: seg.bg }} />)}
              </div>
              <div style={{ fontSize: 13, color: GRAY }}>Langkah {stepNo} dari 5 · {STEPNAME[stepNo]}</div>
            </div>
          </div>
        )}

        {/* ===== Langkah 1: Nomor WhatsApp ===== */}
        {step === 'phone' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 }}>Booking servis dalam 1 menit</h1>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: GRAY }}>Cukup nomor WhatsApp. Tanpa akun dan tanpa password.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor="wa" style={{ fontSize: 14, fontWeight: 700 }}>Nomor WhatsApp</label>
              <input id="wa" type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="next" placeholder="08xx xxxx xxxx" value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', height: 56, boxSizing: 'border-box', padding: '0 16px', border: '1.5px solid ' + MUTED, borderRadius: 12, background: '#FFFFFF', color: INK, fontSize: 18 }} />
              <div style={{ fontSize: 13, lineHeight: 1.5, color: GRAY }}>Kode verifikasi dikirim lewat WhatsApp. Pelanggan lama langsung dikenali dan mobilnya terisi otomatis.</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16 }}>
              {['Pilih mobil, servis, dan jadwal tanpa bikin akun', 'Kabar progres dan biaya langsung ke WhatsApp', 'Riwayat servis tiap mobil tersimpan rapi'].map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, lineHeight: 1.4 }}>
                  <span style={{ width: 24, height: 24, flex: 'none', borderRadius: 12, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: INK }}>
                    <CheckIcon size={14} width={2.4} />
                  </span>
                  {t}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== Langkah 2: OTP ===== */}
        {step === 'otp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 }}>Masukkan kode verifikasi</h1>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: GRAY }}>Kode 4 angka sudah dikirim ke WhatsApp {phone}.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor="otp" style={{ fontSize: 14, fontWeight: 700 }}>Kode verifikasi</label>
              <input id="otp" type="tel" inputMode="numeric" autoComplete="one-time-code" enterKeyHint="done" autoFocus placeholder="0000" value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                style={{ width: '100%', height: 64, boxSizing: 'border-box', padding: '0 16px', border: '1.5px solid ' + MUTED, borderRadius: 12, background: '#FFFFFF', color: INK, fontSize: 28, fontWeight: 700, letterSpacing: 12, textAlign: 'center' }} />
            </div>
            <div style={{ padding: '14px 16px', background: '#FFFFFF', border: '1px dashed ' + MUTED, borderRadius: 12, fontSize: 14, lineHeight: 1.5, color: GRAY }}>
              Mode demo: kode belum benar-benar dikirim lewat WhatsApp. Masukkan 4 angka apa saja, misalnya 1234.
            </div>
          </div>
        )}

        {/* ===== Langkah 3: Mobil ===== */}
        {step === 'cars' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 }}>Mobil mana yang diservis?</h1>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: GRAY }}>Nomor dikenali. Pilih satu atau lebih mobil yang pernah kamu servis di sini.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cars.length === 0 && (
                <div style={{ padding: '14px 16px', background: '#FFFFFF', border: '1px dashed ' + MUTED, borderRadius: 12, fontSize: 14, lineHeight: 1.5, color: GRAY }}>
                  Belum ada mobil tersimpan untuk nomor ini. Tambahkan mobil dulu — data tersimpan per nomor WhatsApp.
                </div>
              )}
              {cars.map((c) => {
                const on = !!selected[c.id];
                return (
                  <button key={c.id} type="button" aria-pressed={on} onClick={() => toggleCar(c.id)}
                    style={{ width: '100%', minHeight: 72, boxSizing: 'border-box', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', background: '#FFFFFF', color: INK, border: '2px solid ' + (on ? INK : LINE), borderRadius: 14, cursor: 'pointer' }}>
                    <BoxCheck on={on} accent={accent} />
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                      <span style={{ fontSize: 17, fontWeight: 800 }}>{c.plate}</span>
                      <span style={{ fontSize: 14, color: GRAY }}>{c.model}</span>
                      <span style={{ fontSize: 13, color: GRAY }}>{c.last}</span>
                    </span>
                  </button>
                );
              })}
              <button type="button" onClick={() => setAddOpen(!addOpen)}
                style={{ width: '100%', minHeight: 52, boxSizing: 'border-box', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'transparent', color: INK, border: '2px dashed ' + MUTED, borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                <PlusIcon />
                Tambah mobil baru
              </button>
              {addOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label htmlFor="plate" style={{ fontSize: 14, fontWeight: 700 }}>Plat nomor</label>
                    <input id="plate" type="text" placeholder="B 1234 XYZ" value={newPlate}
                      onChange={(e) => setNewPlate(e.target.value)}
                      style={{ width: '100%', height: 48, boxSizing: 'border-box', padding: '0 14px', border: '1.5px solid ' + MUTED, borderRadius: 10, background: '#FFFFFF', color: INK, fontSize: 16 }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label htmlFor="model" style={{ fontSize: 14, fontWeight: 700 }}>Tipe dan tahun (opsional)</label>
                    <input id="model" type="text" placeholder="Contoh: Toyota Avanza 2018" value={newModel}
                      onChange={(e) => setNewModel(e.target.value)}
                      style={{ width: '100%', height: 48, boxSizing: 'border-box', padding: '0 14px', border: '1.5px solid ' + MUTED, borderRadius: 10, background: '#FFFFFF', color: INK, fontSize: 16 }} />
                  </div>
                  <button type="button" onClick={saveCar}
                    style={{ height: 48, border: 'none', borderRadius: 10, background: INK, color: '#FFFFFF', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                    Simpan mobil
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Kamu sebagai</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {roles.map((r) => (
                  <button key={r.id} type="button" aria-pressed={r.on} onClick={() => setRole(r.id)}
                    style={{ flex: 1, minHeight: 56, boxSizing: 'border-box', padding: '8px 10px', background: r.bg, color: r.fg, border: '2px solid ' + r.border, borderRadius: 12, fontSize: 14, fontWeight: 700, lineHeight: 1.3, cursor: 'pointer' }}>
                    {r.label}
                  </button>
                ))}
              </div>
              {driver && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label htmlFor="owner" style={{ fontSize: 14, fontWeight: 700 }}>WhatsApp pemilik mobil</label>
                  <input id="owner" type="tel" placeholder="08xx xxxx xxxx" value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    style={{ width: '100%', height: 52, boxSizing: 'border-box', padding: '0 16px', border: '1.5px solid ' + MUTED, borderRadius: 12, background: '#FFFFFF', color: INK, fontSize: 16 }} />
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: GRAY }}>Persetujuan biaya dikirim ke pemilik. Kabar mobil diterima dan siap diambil tetap ke nomor kamu.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== Langkah 4: Servis ===== */}
        {step === 'service' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 }}>Servis apa yang dibutuhkan?</h1>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: GRAY }}>Pilih satu untuk tiap mobil. Belum yakin? Pilih minta dicek, mekanik memeriksa dulu.</p>
            </div>
            {selectedCars.map((c) => {
              const cur = svc[c.id];
              const curSvc = SERVICES.find((x) => x.id === cur);
              return (
                <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ fontSize: 17, fontWeight: 800 }}>{c.plate}</div>
                    <div style={{ fontSize: 14, color: GRAY }}>{c.model}</div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SERVICES.map((sv) => {
                      const on = cur === sv.id;
                      return (
                        <button key={sv.id} type="button" aria-pressed={on}
                          onClick={() => setSvc((prev) => ({ ...prev, [c.id]: sv.id }))}
                          style={{ minHeight: 44, boxSizing: 'border-box', padding: '0 14px', display: 'flex', alignItems: 'center', gap: 6, background: on ? accent : '#FFFFFF', color: INK, border: '2px solid ' + (on ? INK : MUTED), borderRadius: 22, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                          {on ? <CheckIcon size={14} width={2.4} /> : null}
                          {sv.name}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ padding: '10px 12px', background: BG, borderRadius: 10, fontSize: 13, lineHeight: 1.5, color: GRAY }}>
                    {curSvc ? curSvc.hint : 'Pilih salah satu servis di atas.'}
                  </div>
                </div>
              );
            })}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor="note" style={{ fontSize: 14, fontWeight: 700 }}>Keluhan atau catatan (opsional)</label>
              <textarea id="note" rows="3" placeholder="Contoh: bunyi berdecit saat mengerem, lampu depan redup" value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ width: '100%', minHeight: 96, boxSizing: 'border-box', padding: '12px 16px', border: '1.5px solid ' + MUTED, borderRadius: 12, background: '#FFFFFF', color: INK, fontSize: 16, lineHeight: 1.5, resize: 'vertical' }} />
            </div>
          </div>
        )}

        {/* ===== Langkah 5: Jadwal ===== */}
        {step === 'schedule' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 }}>Kapan mau datang?</h1>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Menunggu atau ditinggal?</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {waits.map((w) => (
                  <button key={w.id} type="button" aria-pressed={w.on} onClick={() => setWait(w.id)}
                    style={{ flex: 1, minHeight: 56, boxSizing: 'border-box', padding: '8px 10px', background: w.bg, color: w.fg, border: '2px solid ' + w.border, borderRadius: 12, fontSize: 14, fontWeight: 700, lineHeight: 1.3, cursor: 'pointer' }}>
                    {w.label}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: GRAY }}>{waitNote}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Tanggal</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {days.map((d) => (
                  <button key={d.i} type="button" aria-pressed={d.on} onClick={() => pickDay(d.i)}
                    style={{ flex: 1, minWidth: 0, minHeight: 60, boxSizing: 'border-box', padding: '6px 2px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, background: d.bg, color: d.fg, border: '2px solid ' + d.border, borderRadius: 12, cursor: 'pointer' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.9 }}>{d.hint}</span>
                    <span style={{ fontSize: 14, fontWeight: 800 }}>{d.date}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Mekanik</div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: GRAY }}>Opsional. Biarkan otomatis jika belum punya langganan.</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {mechList.map((m) => (
                  <button key={m.id} type="button" aria-pressed={m.on} onClick={() => pickMech(m)}
                    style={{ width: '100%', minHeight: 60, boxSizing: 'border-box', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', background: '#FFFFFF', color: INK, border: '2px solid ' + m.border, borderRadius: 14, cursor: 'pointer' }}>
                    <span style={{ width: 24, height: 24, flex: 'none', boxSizing: 'border-box', borderRadius: 12, border: '2px solid ' + INK, background: m.dotBg, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {m.on ? <CheckIcon size={14} width={2.4} /> : null}
                    </span>
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <span style={{ fontSize: 16, fontWeight: 800 }}>{m.name}</span>
                      <span style={{ fontSize: 13, color: GRAY }}>{m.sub}</span>
                    </span>
                  </button>
                ))}
              </div>
              {n > 1 && (
                <div style={{ padding: '10px 12px', background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 10, fontSize: 13, lineHeight: 1.5, color: GRAY }}>{multiNote}</div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Jam datang</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
                {slotList.map((sl) => (
                  <button key={sl.t} type="button" disabled={!sl.ok} aria-pressed={sl.on} onClick={() => setSlot(sl.t)}
                    style={{ minHeight: 60, boxSizing: 'border-box', padding: '6px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, background: sl.bg, color: sl.fg, border: '2px solid ' + sl.border, borderRadius: 12, cursor: 'pointer' }}>
                    <span style={{ fontSize: 16, fontWeight: 800 }}>{sl.t}</span>
                    <span style={{ fontSize: 12, color: sl.subFg }}>{sl.sub}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ padding: '14px 16px', background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 14, fontSize: 14, lineHeight: 1.5 }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>Perkiraan</div>
              <div style={{ color: GRAY }}>{estimate}</div>
            </div>
          </div>
        )}

        {/* ===== Konfirmasi ===== */}
        {step === 'confirm' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 }}>Cek lagi, lalu konfirmasi</h1>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 16, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16 }}>
              <div style={{ fontSize: 13, color: GRAY }}>Jadwal</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{whenText}</div>
              <div style={{ fontSize: 14, color: GRAY }}>{waitText} · Mekanik: {mechName}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16 }}>
              <div style={{ fontSize: 13, color: GRAY }}>Mobil dan servis</div>
              {confirmCars.map((cc) => (
                <div key={cc.plate} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                    <span style={{ fontSize: 16, fontWeight: 800 }}>{cc.plate}</span>
                    <span style={{ fontSize: 13, color: GRAY }}>{cc.model}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, textAlign: 'right' }}>{cc.svc}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 16, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16 }}>
              <div style={{ fontSize: 13, color: GRAY }}>Kontak</div>
              <div style={{ fontSize: 15 }}><span style={{ fontWeight: 700 }}>{roleLabel}</span> · {phone}</div>
              {driver && (
                <div style={{ fontSize: 15 }}><span style={{ fontWeight: 700 }}>Pemilik, untuk persetujuan biaya</span> · {ownerPhone}</div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button type="button" aria-pressed={remindOn} onClick={() => setRemindOn(!remindOn)}
                style={{ width: '100%', minHeight: 64, boxSizing: 'border-box', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', background: '#FFFFFF', color: INK, border: '2px solid ' + (remindOn ? INK : LINE), borderRadius: 14, cursor: 'pointer' }}>
                <BoxCheck on={remindOn} accent={accent} />
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Ingatkan jadwal servis berikutnya</span>
                  <span style={{ fontSize: 13, color: GRAY }}>Dikirim per mobil dan menyebut plat nomor.</span>
                </span>
              </button>
              <button type="button" aria-pressed={promoOn} onClick={() => setPromoOn(!promoOn)}
                style={{ width: '100%', minHeight: 64, boxSizing: 'border-box', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', background: '#FFFFFF', color: INK, border: '2px solid ' + (promoOn ? INK : LINE), borderRadius: 14, cursor: 'pointer' }}>
                <BoxCheck on={promoOn} accent={accent} />
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Boleh kirim info promo</span>
                  <span style={{ fontSize: 13, color: GRAY }}>Opsional. Bisa dimatikan kapan saja.</span>
                </span>
              </button>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: GRAY }}>Biaya dan durasi final dikirim setelah mobil dicek. Pekerjaan tambahan hanya dilakukan setelah kamu setuju lewat WhatsApp.</div>
          </div>
        )}

        {/* ===== Berhasil ===== */}
        {step === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14 }}>
              <span style={{ width: 52, height: 52, borderRadius: 26, background: '#1F7A45', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckIcon size={26} width={2} />
              </span>
              <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 }}>Booking berhasil</h1>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: GRAY }}>{whenText}. Konfirmasi sudah dikirim ke WhatsApp {phone}.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 16, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16 }}>
              <div style={{ fontSize: 13, color: GRAY }}>Kode booking</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 3 }}>{code}</div>
              <div style={{ fontSize: 14, color: GRAY }}>{carsLine}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 16, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16 }}>
              <div style={{ fontSize: 13, color: GRAY }}>Kode check-in (tunjukkan di kasir saat tiba)</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 6 }}>{checkin}</div>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: GRAY }}>Petugas memakai kode ini untuk mencatat kedatanganmu. Tanpa kode, booking tidak bisa ditandai tiba.</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 13, color: GRAY }}>Contoh pesan konfirmasi yang dikirim ke WhatsApp (mode demo: belum benar-benar terkirim)</div>
              <div style={{ padding: '14px 16px', background: '#DCF5E1', borderRadius: '14px 14px 14px 4px', fontSize: 14, lineHeight: 1.6, color: INK }}>
                <div style={{ fontWeight: 700 }}>[Nama Bengkel] · Booking {code} dikonfirmasi</div>
                <div>{whenText}</div>
                <div>{carsLine}</div>
                <div>Mekanik: {mechName}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>Setelah ini</div>
              {nextSteps.map((st) => (
                <div key={st.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 26, height: 26, flex: 'none', borderRadius: 13, background: accent, color: INK, fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{st.n}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{st.title}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: GRAY }}>{st.body}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: GRAY }}>{prefsLine}</div>
            <button type="button" onClick={() => { setLookCode(code); setLookPhone(phone); openLookup(); }}
              style={{ width: '100%', height: 56, border: 'none', borderRadius: 14, background: accent, color: INK, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>
              Cek status booking
            </button>
            <button type="button" onClick={restart}
              style={{ width: '100%', height: 56, border: '2px solid ' + INK, borderRadius: 14, background: '#FFFFFF', color: INK, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>
              Buat booking baru
            </button>
          </div>
        )}


        {/* ===== Cek status booking (pelanggan) ===== */}
        {step === 'status' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="button" aria-label="Kembali" onClick={() => { setStep('phone'); setLooked(null); scrollTop(); }}
                style={{ width: 44, height: 44, flex: 'none', borderRadius: 12, border: '1.5px solid ' + MUTED, background: '#FFFFFF', color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                <BackIcon />
              </button>
              <h1 style={{ margin: 0, fontSize: 24, lineHeight: 1.2, fontWeight: 800 }}>Cek status booking</h1>
            </div>

            {!looked && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16 }}>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: GRAY }}>Masukkan kode booking dan nomor WhatsApp yang dipakai saat booking.</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label htmlFor="look-code" style={{ fontSize: 14, fontWeight: 700 }}>Kode booking</label>
                  <input id="look-code" type="text" placeholder="BK-0271" value={lookCode}
                    onChange={(e) => { setLookCode(e.target.value.toUpperCase()); setLookErr(''); }}
                    style={{ width: '100%', height: 52, boxSizing: 'border-box', padding: '0 16px', border: '1.5px solid ' + MUTED, borderRadius: 12, background: '#FFFFFF', color: INK, fontSize: 16, letterSpacing: 1 }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label htmlFor="look-phone" style={{ fontSize: 14, fontWeight: 700 }}>Nomor WhatsApp</label>
                  <input id="look-phone" type="tel" placeholder="08xx xxxx xxxx" value={lookPhone}
                    onChange={(e) => { setLookPhone(e.target.value); setLookErr(''); }}
                    style={{ width: '100%', height: 52, boxSizing: 'border-box', padding: '0 16px', border: '1.5px solid ' + MUTED, borderRadius: 12, background: '#FFFFFF', color: INK, fontSize: 16 }} />
                </div>
                {lookErr ? <div style={{ fontSize: 13, lineHeight: 1.5, color: '#B42318', background: '#FDE8E6', borderRadius: 10, padding: '10px 12px' }}>{lookErr}</div> : null}
                <button type="button" onClick={doLookup}
                  style={{ width: '100%', height: 52, border: 'none', borderRadius: 12, background: accent, color: INK, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>
                  Lihat status
                </button>
              </div>
            )}

            {looked && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 16, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>{looked.id}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 999, background: (BOOKING_STATUS[looked.status] || {}).tone === 'green' ? '#DCF5E1' : (looked.status === 'cancelled' || looked.status === 'no_show' ? '#FDE8E6' : '#E7F0FD'), color: looked.status === 'done' ? '#165C34' : (looked.status === 'cancelled' || looked.status === 'no_show' ? '#B42318' : '#1D4E89') }}>
                      {statusLabel(looked.status)}
                    </span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{looked.dayFull} · {looked.slot}</div>
                  <div style={{ fontSize: 14, color: GRAY }}>{looked.wait === 'tunggu' ? 'Menunggu di bengkel' : 'Mobil ditinggal'} · Mekanik: {mechanicSummary(looked)}</div>
                  {looked.status === 'confirmed' && (
                    <div style={{ marginTop: 4, padding: '10px 12px', background: BG, borderRadius: 10 }}>
                      <div style={{ fontSize: 12, color: GRAY, fontWeight: 700 }}>Kode check-in</div>
                      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 5 }}>{looked.checkinCode}</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>Progres per mobil</div>
                  {looked.cars.map((c) => (
                    <div key={c.plate} style={{ display: 'flex', alignItems: 'center', gap: 10, background: BG, borderRadius: 10, padding: '8px 12px' }}>
                      <span style={{ width: 22, height: 22, flex: 'none', borderRadius: 11, background: c.done ? '#1F7A45' : '#FFFFFF', border: '2px solid ' + (c.done ? '#1F7A45' : MUTED), color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {c.done ? <CheckIcon size={12} width={2.6} /> : null}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, textDecoration: c.done ? 'line-through' : 'none' }}>{c.plate}</div>
                        <div style={{ fontSize: 12, color: GRAY }}>{c.svc} · {c.mech || 'mekanik belum ditugaskan'}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {looked.audit.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 800 }}>Riwayat</div>
                    {looked.audit.slice(0, 5).map((a, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{a.action}</div>
                        <div style={{ fontSize: 12, color: GRAY }}>{fmtDateID(a.at)} · {a.actor}{a.note ? ' · ' + a.note : ''}</div>
                      </div>
                    ))}
                  </div>
                )}

                {(looked.status === 'confirmed' || looked.status === 'arrived') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: '#FFFFFF', border: '1px solid ' + LINE, borderRadius: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 800 }}>Ubah jadwal</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {DAYS.map((d, i) => (
                        <button key={d.iso} type="button" onClick={() => { setResDay(i); setResSlot(''); setResMsg(''); }}
                          style={{ flex: '1 1 auto', minHeight: 48, padding: '4px 8px', borderRadius: 10, border: '2px solid ' + (resDay === i ? INK : LINE), background: resDay === i ? accent : '#FFFFFF', color: INK, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          {d.dow} {d.date}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {SLOTS.map((sl) => {
                        const ok = slotOk((DAYS[resDay] || {}).iso, sl.t, '', looked.cars.length, looked.id);
                        const on = resSlot === sl.t;
                        return (
                          <button key={sl.t} type="button" disabled={!ok} onClick={() => { setResSlot(sl.t); setResMsg(''); }}
                            style={{ flex: '1 1 30%', minHeight: 48, padding: '4px', borderRadius: 10, border: '2px solid ' + (on ? INK : (ok ? MUTED : LINE)), background: on ? accent : (ok ? '#FFFFFF' : '#EEF0F3'), color: ok ? INK : GRAY, fontSize: 13, fontWeight: 700, cursor: ok ? 'pointer' : 'default' }}>
                            {sl.t}
                          </button>
                        );
                      })}
                    </div>
                    {resMsg ? <div style={{ fontSize: 13, lineHeight: 1.5, color: GRAY }}>{resMsg}</div> : null}
                    <button type="button" onClick={rescheduleMine}
                      style={{ width: '100%', height: 48, border: 'none', borderRadius: 12, background: accent, color: INK, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
                      Simpan jadwal baru
                    </button>
                    <button type="button" onClick={cancelMine}
                      style={{ width: '100%', height: 48, border: '1.5px solid ' + MUTED, borderRadius: 12, background: '#FFFFFF', color: '#B42318', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                      Batalkan booking
                    </button>
                  </div>
                )}

                {resMsg && !(looked.status === 'confirmed' || looked.status === 'arrived') ? (
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: GRAY }}>{resMsg}</div>
                ) : null}

                <button type="button" onClick={() => { setLooked(null); setLookCode(''); setLookErr(''); }}
                  style={{ width: '100%', height: 48, border: 'none', borderRadius: 12, background: '#FFFFFF', border: '1px solid ' + LINE, color: INK, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Cek booking lain
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== Akses staf (dilipat, tidak mengganggu pelanggan) ===== */}
        <details style={{ marginTop: showFooter ? 0 : 8, paddingBottom: 4 }}>
          <summary style={{ cursor: 'pointer', listStyle: 'none', textAlign: 'center', fontSize: 12, fontWeight: 700, color: MUTED, padding: '10px 0', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Akses staf bengkel
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: MUTED }}>Warna bengkel:</span>
              {ACCENTS.map((c) => (
                <AccentDot key={c} accent={accent} color={c} on={accent === c} onClick={() => { setAccent(c); writeAccent(c); }} />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              <a href="admin.html" style={{ fontSize: 13, fontWeight: 700, color: GRAY, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Panel admin bengkel →</a>
              <a href="mech.html" style={{ fontSize: 13, fontWeight: 700, color: GRAY, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Portal mekanik →</a>
            </div>
          </div>
        </details>

        {/* ===== Footer CTA: menempel di bawah, aman dari home indicator ===== */}
        {showFooter && (
          <div style={{ position: 'sticky', bottom: 0, marginTop: 'auto', paddingTop: 10, paddingBottom: 'calc(10px + env(safe-area-inset-bottom))', background: 'linear-gradient(to top, ' + BG + ' 78%, rgba(242,243,245,0) 100%)' }}>
            <button type="button" disabled={!canNext || saving} onClick={goNext}
              aria-busy={saving}
              style={{ width: '100%', minHeight: 56, border: 'none', borderRadius: 14, background: canNext ? accent : LINE, color: canNext ? INK : GRAY, fontSize: 17, fontWeight: 800, cursor: canNext ? 'pointer' : 'default', opacity: canNext ? 1 : 0.75 }}>
              {saving ? 'Menyimpan…' : NEXTLABEL[step]}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
