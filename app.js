(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  const { useState, useEffect } = React;
  const INK = "#12161C";
  const GRAY = "#5A6270";
  const LINE = "#DDE1E7";
  const MUTED = "#8791A0";
  const BG = "#F2F3F5";
  const ACCENTS = ["#FFB81C", "#F26A21", "#2F80ED", "#1F9D6B"];
  const ORDER = ["phone", "otp", "cars", "service", "schedule", "confirm"];
  const STEPNO = { phone: 1, otp: 1, cars: 2, service: 3, schedule: 4, confirm: 5 };
  const STEPNAME = { 1: "Nomor WhatsApp", 2: "Mobil", 3: "Servis", 4: "Jadwal", 5: "Konfirmasi" };
  const NEXTLABEL = { phone: "Kirim kode", otp: "Verifikasi", cars: "Lanjut", service: "Lanjut", schedule: "Lanjut", confirm: "Konfirmasi booking" };
  const PREV = { otp: "phone", cars: "phone", service: "cars", schedule: "service", confirm: "schedule" };
  const SERVICES = [
    { id: "oli", name: "Ganti oli", mins: 45, hint: "Perkiraan selesai \xB145 menit." },
    { id: "berkala", name: "Servis berkala", mins: 120, hint: "Perkiraan selesai \xB12 jam." },
    { id: "rem", name: "Cek dan servis rem", mins: 60, hint: "Perkiraan selesai \xB11 jam." },
    { id: "ac", name: "Servis AC", mins: 90, hint: "Perkiraan selesai \xB11,5 jam." },
    { id: "keluhan", name: "Ada keluhan", mins: 0, hint: "Mekanik cek dulu (\xB130\u201360 menit), lalu estimasi biaya dan durasi dikirim ke WhatsApp untuk kamu setujui." },
    { id: "cek", name: "Belum tahu, minta dicek", mins: 0, hint: "Mekanik cek dulu (\xB130\u201360 menit), lalu estimasi biaya dan durasi dikirim ke WhatsApp untuk kamu setujui." }
  ];
  const SLOTS = [
    { t: "08:30", free: 4 },
    { t: "10:00", free: 2 },
    { t: "11:30", free: 3 },
    { t: "13:00", free: 6 },
    { t: "14:30", free: 5 },
    { t: "16:00", free: 1 }
  ];
  const MECHS = [
    { id: "auto", name: "Otomatis", sub: "Dipilihkan yang kosong, paling cepat dikerjakan", busy: [] },
    { id: "budi", name: "Pak Budi", sub: "Kosong mulai 13:00", busy: ["08:30", "10:00", "11:30"] },
    { id: "andi", name: "Andi", sub: "Penuh jam 14:30", busy: ["14:30"] },
    { id: "rizal", name: "Rizal", sub: "Kosong semua jam", busy: [] },
    { id: "dedi", name: "Dedi", sub: "Penuh jam 10:00 dan 13:00", busy: ["10:00", "13:00"] }
  ];
  const DAYS = [
    { dow: "Rab", date: "28 Okt", full: "Rabu, 28 Okt" },
    { dow: "Kam", date: "29 Okt", full: "Kamis, 29 Okt" },
    { dow: "Jum", date: "30 Okt", full: "Jumat, 30 Okt" },
    { dow: "Sab", date: "31 Okt", full: "Sabtu, 31 Okt" },
    { dow: "Sen", date: "2 Nov", full: "Senin, 2 Nov" }
  ];
  const INITIAL_CARS = [
    { id: "c1", plate: "B 1234 XYZ", model: "Toyota Avanza 2018", last: "Servis terakhir 12 Agu 2026" },
    { id: "c2", plate: "B 5678 ABC", model: "Honda Brio 2020", last: "Servis terakhir 3 Mei 2026" }
  ];
  function slotOk(slot, mech, n) {
    const sl = SLOTS.find((x) => x.t === slot);
    if (!sl || sl.free < n) return false;
    const m = MECHS.find((x) => x.id === mech);
    return !(m && m.busy.includes(slot));
  }
  const dig = (v) => String(v || "").replace(/\D/g, "").length;
  const fmt = (m) => m < 60 ? "\xB1" + m + " menit" : "\xB1" + String(m / 60).replace(".", ",") + " jam";
  const scrollTop = () => {
    try {
      window.scrollTo(0, 0);
    } catch (e) {
    }
  };
  const WrenchIcon = () => /* @__PURE__ */ React.createElement("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" }));
  const BackIcon = () => /* @__PURE__ */ React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M12 4l-6 6 6 6" }));
  const CheckIcon = ({ size = 16, width = 2.4 }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M3 8.5l3.2 3L13 4.5", stroke: "currentColor", strokeWidth: width, strokeLinecap: "round", strokeLinejoin: "round" }));
  const PlusIcon = () => /* @__PURE__ */ React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M10 4v12M4 10h12" }));
  function BoxCheck({ on }) {
    return /* @__PURE__ */ React.createElement("span", { style: { width: 26, height: 26, flex: "none", boxSizing: "border-box", borderRadius: 8, border: "2px solid " + INK, background: on ? INK : "#FFFFFF", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" } }, on ? /* @__PURE__ */ React.createElement(CheckIcon, null) : null);
  }
  function AccentDot({ on, accent, color, onClick }) {
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        "aria-label": "Warna aksen " + color,
        onClick,
        style: { width: 18, height: 18, borderRadius: 9, background: color, border: on ? "2px solid " + INK : "2px solid rgba(0,0,0,0.12)", outline: "none", cursor: "pointer", padding: 0 }
      }
    );
  }
  function App() {
    const [accent, setAccent] = useState(ACCENTS[0]);
    const [step, setStep] = useState("phone");
    const [phone, setPhone] = useState("0812 0000 1234");
    const [otp, setOtp] = useState("");
    const [role, setRole] = useState("owner");
    const [ownerPhone, setOwnerPhone] = useState("");
    const [cars, setCars] = useState(INITIAL_CARS);
    const [selected, setSelected] = useState({ c1: true });
    const [addOpen, setAddOpen] = useState(false);
    const [newPlate, setNewPlate] = useState("");
    const [newModel, setNewModel] = useState("");
    const [svc, setSvc] = useState({});
    const [note, setNote] = useState("");
    const [wait, setWait] = useState("tunggu");
    const [day, setDay] = useState(0);
    const [mech, setMech] = useState("auto");
    const [slot, setSlot] = useState("");
    const [remindOn, setRemindOn] = useState(true);
    const [promoOn, setPromoOn] = useState(false);
    const [code, setCode] = useState("");
    const driver = role === "driver";
    const selectedCars = cars.filter((c) => selected[c.id]);
    const n = selectedCars.length;
    const canNext = {
      phone: dig(phone) >= 9,
      otp: otp.length === 4,
      cars: n >= 1 && (!driver || dig(ownerPhone) >= 9),
      service: n >= 1 && selectedCars.every((c) => !!svc[c.id]),
      schedule: slot !== "" && slotOk(slot, mech, n),
      confirm: true
    }[step] === true;
    const goNext = () => {
      if (!canNext) return;
      if (step === "confirm") {
        const mechName2 = mech === "auto" ? "Otomatis (dipilihkan bengkel)" : MECHS.find((m) => m.id === mech).name;
        const booking = saveBooking({
          phone: phone.trim(),
          role,
          ownerPhone: driver ? ownerPhone.trim() : "",
          cars: selectedCars.map((c) => {
            const sv = SERVICES.find((x) => x.id === svc[c.id]);
            return { plate: c.plate, model: c.model, svc: sv ? sv.name : "-" };
          }),
          note: note.trim(),
          wait,
          dayFull: DAYS[day].full,
          slot,
          mech: mechName2,
          remindOn,
          promoOn
        });
        setCode(booking.id);
        setStep("done");
        scrollTop();
        return;
      }
      const i = ORDER.indexOf(step);
      setStep(ORDER[i + 1]);
      scrollTop();
    };
    const goBack = () => {
      if (PREV[step]) {
        setStep(PREV[step]);
        scrollTop();
      }
    };
    const restart = () => {
      setStep("phone");
      setOtp("");
      setRole("owner");
      setOwnerPhone("");
      setSelected({ c1: true });
      setSvc({});
      setNote("");
      setWait("tunggu");
      setDay(0);
      setMech("auto");
      setSlot("");
      setRemindOn(true);
      setPromoOn(false);
      setCode("");
      scrollTop();
    };
    const toggleCar = (id) => {
      setSelected((prev) => __spreadProps(__spreadValues({}, prev), { [id]: !prev[id] }));
      setSlot("");
    };
    const saveCar = () => {
      const plate = newPlate.trim().toUpperCase();
      if (!plate) return;
      const id = "n" + cars.length;
      setCars((prev) => [...prev, { id, plate, model: newModel.trim() || "Tipe belum diisi", last: "Baru ditambahkan" }]);
      setSelected((prev) => __spreadProps(__spreadValues({}, prev), { [id]: true }));
      setAddOpen(false);
      setNewPlate("");
      setNewModel("");
      setSlot("");
    };
    const pickMech = (m) => {
      setMech(m.id);
      if (slot && !slotOk(slot, m.id, n)) setSlot("");
    };
    const stepNo = STEPNO[step] || 5;
    const segs = [1, 2, 3, 4, 5].map((i) => ({ bg: i <= stepNo ? INK : "#CBD1D9" }));
    const roles = [
      { id: "owner", label: "Pemilik mobil" },
      { id: "driver", label: "Mengantar (supir atau kerabat)" }
    ].map((r) => {
      const on = role === r.id;
      return __spreadProps(__spreadValues({}, r), { on, bg: on ? INK : "#FFFFFF", fg: on ? "#FFFFFF" : INK, border: on ? INK : MUTED });
    });
    const waits = [
      { id: "tunggu", label: "Saya tunggu di bengkel" },
      { id: "tinggal", label: "Saya tinggal" }
    ].map((w) => {
      const on = wait === w.id;
      return __spreadProps(__spreadValues({}, w), { on, bg: on ? INK : "#FFFFFF", fg: on ? "#FFFFFF" : INK, border: on ? INK : MUTED });
    });
    const waitNote = wait === "tunggu" ? "Kamu dapat QR di ruang tunggu untuk memantau progres dan estimasi selesai." : "Tidak perlu menunggu. Kabar dikirim lewat WhatsApp: mulai dikerjakan, persetujuan biaya, dan mobil siap diambil.";
    const days = DAYS.map((d, i) => {
      const on = day === i;
      return __spreadProps(__spreadValues({}, d), { i, on, bg: on ? INK : "#FFFFFF", fg: on ? "#FFFFFF" : INK, border: on ? INK : MUTED });
    });
    const mechList = MECHS.map((m) => {
      const on = mech === m.id;
      return __spreadProps(__spreadValues({}, m), { on, border: on ? INK : LINE, dotBg: on ? INK : "#FFFFFF" });
    });
    const slotList = SLOTS.map((sl) => {
      const ok = slotOk(sl.t, mech, n);
      const on = ok && slot === sl.t;
      return __spreadProps(__spreadValues({}, sl), {
        ok,
        on,
        sub: !ok ? "Penuh" : on ? "Dipilih" : "Kosong",
        bg: on ? INK : ok ? "#FFFFFF" : "#EEF0F3",
        fg: on ? "#FFFFFF" : ok ? INK : GRAY,
        subFg: on ? "#D6DAE1" : GRAY,
        border: on ? INK : ok ? MUTED : LINE
      });
    });
    const chosen = selectedCars.map((c) => SERVICES.find((x) => x.id === svc[c.id])).filter(Boolean);
    const needsCheck = chosen.some((x) => x.mins === 0);
    const maxMins = Math.max(0, ...chosen.map((x) => x.mins));
    let estimate = "Pilih servis dulu untuk melihat perkiraan.";
    if (chosen.length) {
      estimate = needsCheck ? "Ada mobil yang dicek dulu (\xB130\u201360 menit). Setelah itu estimasi biaya dan durasi dikirim lewat WhatsApp untuk kamu setujui." : "Selesai " + fmt(maxMins) + (n > 1 ? ", semua mobil dikerjakan bersamaan oleh mekanik berbeda." : ".");
    }
    const multiNote = n + " mobil dikerjakan bersamaan, masing-masing 1 mekanik. Jam yang tampil sudah memperhitungkan jumlah mekanik yang kosong.";
    const dayObj = DAYS[day];
    const mechObj = MECHS.find((m) => m.id === mech);
    const mechName = mech === "auto" ? "Otomatis (dipilihkan bengkel)" : mechObj.name;
    const whenText = dayObj.full + " \xB7 " + slot;
    const waitText = wait === "tunggu" ? "Menunggu di bengkel" : "Mobil ditinggal";
    const confirmCars = selectedCars.map((c) => {
      const sv = SERVICES.find((x) => x.id === svc[c.id]);
      return { plate: c.plate, model: c.model, svc: sv ? sv.name : "-" };
    });
    const carsLine = confirmCars.map((c) => c.plate + " (" + c.svc + ")").join(", ");
    const who = driver ? "pemilik" : "kamu";
    const nextSteps = [
      { n: 1, title: "Datang sesuai jadwal", body: "Sebut plat nomor atau tunjukkan kode booking." },
      { n: 2, title: "Setujui estimasi lewat WhatsApp", body: "Estimasi biaya dan durasi dikirim ke " + who + " setelah mobil dicek. Pekerjaan tambahan menunggu persetujuan." },
      wait === "tunggu" ? { n: 3, title: "Pantau progres lewat QR", body: "Status berubah setiap mekanik mengetuk: dikerjakan, lalu selesai." } : { n: 3, title: "Tunggu kabar di WhatsApp", body: "Kamu diberi tahu saat mulai dikerjakan dan saat mobil siap diambil." },
      { n: 4, title: "Bayar dan terima struk", body: "Bayar lewat QRIS di kasir. Struk digital dikirim ke WhatsApp." + (driver ? " Kabar jemput dikirim ke nomor kamu." : "") }
    ];
    const prefsLine = (remindOn ? "Pengingat servis berikutnya aktif." : "Pengingat servis berikutnya tidak aktif.") + (promoOn ? " Info promo aktif." : " Info promo tidak aktif.");
    const showProgress = step !== "done";
    const showBack = step !== "phone" && step !== "done";
    const showFooter = step !== "done";
    const roleLabel = driver ? "Pengantar" : "Pemilik";
    return /* @__PURE__ */ React.createElement("div", { style: { minHeight: 844, background: BG, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK, display: "flex", justifyContent: "center", boxSizing: "border-box" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxWidth: 440, minHeight: 844, boxSizing: "border-box", padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 44, height: 44, borderRadius: 12, background: accent, color: INK, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" } }, /* @__PURE__ */ React.createElement(WrenchIcon, null)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 17, fontWeight: 800 } }, "[Nama Bengkel]"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Booking servis mobil"))), showProgress && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, showBack && /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        "aria-label": "Kembali",
        onClick: goBack,
        style: { width: 44, height: 44, flex: "none", borderRadius: 12, border: "1.5px solid " + MUTED, background: "#FFFFFF", color: INK, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }
      },
      /* @__PURE__ */ React.createElement(BackIcon, null)
    ), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, segs.map((seg, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { flex: 1, height: 6, borderRadius: 3, background: seg.bg } }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Langkah ", stepNo, " dari 5 \xB7 ", STEPNAME[stepNo]))), step === "phone" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 } }, "Booking servis dalam 1 menit"), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 16, lineHeight: 1.5, color: GRAY } }, "Cukup nomor WhatsApp. Tanpa akun dan tanpa password.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "wa", style: { fontSize: 14, fontWeight: 700 } }, "Nomor WhatsApp"), /* @__PURE__ */ React.createElement(
      "input",
      {
        id: "wa",
        type: "tel",
        placeholder: "08xx xxxx xxxx",
        value: phone,
        onChange: (e) => setPhone(e.target.value),
        style: { width: "100%", height: 56, boxSizing: "border-box", padding: "0 16px", border: "1.5px solid " + MUTED, borderRadius: 12, background: "#FFFFFF", color: INK, fontSize: 18 }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: GRAY } }, "Kode verifikasi dikirim lewat WhatsApp. Pelanggan lama langsung dikenali dan mobilnya terisi otomatis.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12, padding: 16, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16 } }, ["Pilih mobil, servis, dan jadwal dalam 4 langkah", "Kabar progres dan biaya langsung ke WhatsApp", "Riwayat servis tiap mobil tersimpan rapi"].map((t) => /* @__PURE__ */ React.createElement("div", { key: t, style: { display: "flex", alignItems: "center", gap: 12, fontSize: 15, lineHeight: 1.4 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 24, height: 24, flex: "none", borderRadius: 12, background: accent, display: "flex", alignItems: "center", justifyContent: "center", color: INK } }, /* @__PURE__ */ React.createElement(CheckIcon, { size: 14, width: 2.4 })), t)))), step === "otp" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 } }, "Masukkan kode verifikasi"), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 16, lineHeight: 1.5, color: GRAY } }, "Kode 4 angka sudah dikirim ke WhatsApp ", phone, ".")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "otp", style: { fontSize: 14, fontWeight: 700 } }, "Kode verifikasi"), /* @__PURE__ */ React.createElement(
      "input",
      {
        id: "otp",
        type: "tel",
        inputMode: "numeric",
        placeholder: "0000",
        value: otp,
        onChange: (e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4)),
        style: { width: "100%", height: 64, boxSizing: "border-box", padding: "0 16px", border: "1.5px solid " + MUTED, borderRadius: 12, background: "#FFFFFF", color: INK, fontSize: 28, fontWeight: 700, letterSpacing: 12, textAlign: "center" }
      }
    )), /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 16px", background: "#FFFFFF", border: "1px dashed " + MUTED, borderRadius: 12, fontSize: 14, lineHeight: 1.5, color: GRAY } }, "Catatan prototipe: ketik 4 angka apa saja, misalnya 1234.")), step === "cars" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 } }, "Mobil mana yang diservis?"), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 16, lineHeight: 1.5, color: GRAY } }, "Nomor dikenali. Pilih satu atau lebih mobil yang pernah kamu servis di sini.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, cars.map((c) => {
      const on = !!selected[c.id];
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: c.id,
          type: "button",
          "aria-pressed": on,
          onClick: () => toggleCar(c.id),
          style: { width: "100%", minHeight: 72, boxSizing: "border-box", padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, textAlign: "left", background: "#FFFFFF", color: INK, border: "2px solid " + (on ? INK : LINE), borderRadius: 14, cursor: "pointer" }
        },
        /* @__PURE__ */ React.createElement(BoxCheck, { on }),
        /* @__PURE__ */ React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 17, fontWeight: 800 } }, c.plate), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, color: GRAY } }, c.model), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: GRAY } }, c.last))
      );
    }), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setAddOpen(!addOpen),
        style: { width: "100%", minHeight: 52, boxSizing: "border-box", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "transparent", color: INK, border: "2px dashed " + MUTED, borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer" }
      },
      /* @__PURE__ */ React.createElement(PlusIcon, null),
      "Tambah mobil baru"
    ), addOpen && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12, padding: 16, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "plate", style: { fontSize: 14, fontWeight: 700 } }, "Plat nomor"), /* @__PURE__ */ React.createElement(
      "input",
      {
        id: "plate",
        type: "text",
        placeholder: "B 1234 XYZ",
        value: newPlate,
        onChange: (e) => setNewPlate(e.target.value),
        style: { width: "100%", height: 48, boxSizing: "border-box", padding: "0 14px", border: "1.5px solid " + MUTED, borderRadius: 10, background: "#FFFFFF", color: INK, fontSize: 16 }
      }
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "model", style: { fontSize: 14, fontWeight: 700 } }, "Tipe dan tahun (opsional)"), /* @__PURE__ */ React.createElement(
      "input",
      {
        id: "model",
        type: "text",
        placeholder: "Contoh: Toyota Avanza 2018",
        value: newModel,
        onChange: (e) => setNewModel(e.target.value),
        style: { width: "100%", height: 48, boxSizing: "border-box", padding: "0 14px", border: "1.5px solid " + MUTED, borderRadius: 10, background: "#FFFFFF", color: INK, fontSize: 16 }
      }
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: saveCar,
        style: { height: 48, border: "none", borderRadius: 10, background: INK, color: "#FFFFFF", fontSize: 15, fontWeight: 700, cursor: "pointer" }
      },
      "Simpan mobil"
    ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 700 } }, "Kamu sebagai"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, roles.map((r) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: r.id,
        type: "button",
        "aria-pressed": r.on,
        onClick: () => setRole(r.id),
        style: { flex: 1, minHeight: 56, boxSizing: "border-box", padding: "8px 10px", background: r.bg, color: r.fg, border: "2px solid " + r.border, borderRadius: 12, fontSize: 14, fontWeight: 700, lineHeight: 1.3, cursor: "pointer" }
      },
      r.label
    ))), driver && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "owner", style: { fontSize: 14, fontWeight: 700 } }, "WhatsApp pemilik mobil"), /* @__PURE__ */ React.createElement(
      "input",
      {
        id: "owner",
        type: "tel",
        placeholder: "08xx xxxx xxxx",
        value: ownerPhone,
        onChange: (e) => setOwnerPhone(e.target.value),
        style: { width: "100%", height: 52, boxSizing: "border-box", padding: "0 16px", border: "1.5px solid " + MUTED, borderRadius: 12, background: "#FFFFFF", color: INK, fontSize: 16 }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: GRAY } }, "Persetujuan biaya dikirim ke pemilik. Kabar mobil diterima dan siap diambil tetap ke nomor kamu.")))), step === "service" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 } }, "Servis apa yang dibutuhkan?"), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 16, lineHeight: 1.5, color: GRAY } }, "Pilih satu untuk tiap mobil. Belum yakin? Pilih minta dicek, mekanik memeriksa dulu.")), selectedCars.map((c) => {
      const cur = svc[c.id];
      const curSvc = SERVICES.find((x) => x.id === cur);
      return /* @__PURE__ */ React.createElement("div", { key: c.id, style: { display: "flex", flexDirection: "column", gap: 14, padding: 16, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 17, fontWeight: 800 } }, c.plate), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: GRAY } }, c.model)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 } }, SERVICES.map((sv) => {
        const on = cur === sv.id;
        return /* @__PURE__ */ React.createElement(
          "button",
          {
            key: sv.id,
            type: "button",
            "aria-pressed": on,
            onClick: () => setSvc((prev) => __spreadProps(__spreadValues({}, prev), { [c.id]: sv.id })),
            style: { minHeight: 44, boxSizing: "border-box", padding: "0 14px", display: "flex", alignItems: "center", gap: 6, background: on ? INK : "#FFFFFF", color: on ? "#FFFFFF" : INK, border: "2px solid " + (on ? INK : MUTED), borderRadius: 22, fontSize: 14, fontWeight: 700, cursor: "pointer" }
          },
          on ? /* @__PURE__ */ React.createElement(CheckIcon, { size: 14, width: 2.4 }) : null,
          sv.name
        );
      })), /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 12px", background: BG, borderRadius: 10, fontSize: 13, lineHeight: 1.5, color: GRAY } }, curSvc ? curSvc.hint : "Pilih salah satu servis di atas."));
    }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "note", style: { fontSize: 14, fontWeight: 700 } }, "Keluhan atau catatan (opsional)"), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        id: "note",
        rows: "3",
        placeholder: "Contoh: bunyi berdecit saat mengerem, lampu depan redup",
        value: note,
        onChange: (e) => setNote(e.target.value),
        style: { width: "100%", minHeight: 96, boxSizing: "border-box", padding: "12px 16px", border: "1.5px solid " + MUTED, borderRadius: 12, background: "#FFFFFF", color: INK, fontSize: 16, lineHeight: 1.5, resize: "vertical" }
      }
    ))), step === "schedule" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 22 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 } }, "Kapan mau datang?")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 700 } }, "Menunggu atau ditinggal?"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, waits.map((w) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: w.id,
        type: "button",
        "aria-pressed": w.on,
        onClick: () => setWait(w.id),
        style: { flex: 1, minHeight: 56, boxSizing: "border-box", padding: "8px 10px", background: w.bg, color: w.fg, border: "2px solid " + w.border, borderRadius: 12, fontSize: 14, fontWeight: 700, lineHeight: 1.3, cursor: "pointer" }
      },
      w.label
    ))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: GRAY } }, waitNote)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 700 } }, "Tanggal"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, days.map((d) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: d.i,
        type: "button",
        "aria-pressed": d.on,
        onClick: () => setDay(d.i),
        style: { flex: 1, minWidth: 0, minHeight: 60, boxSizing: "border-box", padding: "6px 2px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, background: d.bg, color: d.fg, border: "2px solid " + d.border, borderRadius: 12, cursor: "pointer" }
      },
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13 } }, d.dow),
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 800 } }, d.date)
    )))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 700 } }, "Mekanik"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: GRAY } }, "Opsional. Biarkan otomatis jika belum punya langganan.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, mechList.map((m) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: m.id,
        type: "button",
        "aria-pressed": m.on,
        onClick: () => pickMech(m),
        style: { width: "100%", minHeight: 60, boxSizing: "border-box", padding: "10px 16px", display: "flex", alignItems: "center", gap: 14, textAlign: "left", background: "#FFFFFF", color: INK, border: "2px solid " + m.border, borderRadius: 14, cursor: "pointer" }
      },
      /* @__PURE__ */ React.createElement("span", { style: { width: 24, height: 24, flex: "none", boxSizing: "border-box", borderRadius: 12, border: "2px solid " + INK, background: m.dotBg, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" } }, m.on ? /* @__PURE__ */ React.createElement(CheckIcon, { size: 14, width: 2.4 }) : null),
      /* @__PURE__ */ React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 16, fontWeight: 800 } }, m.name), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: GRAY } }, m.sub))
    ))), n > 1 && /* @__PURE__ */ React.createElement("div", { style: { padding: "10px 12px", background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 10, fontSize: 13, lineHeight: 1.5, color: GRAY } }, multiNote)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 700 } }, "Jam datang"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 } }, slotList.map((sl) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: sl.t,
        type: "button",
        disabled: !sl.ok,
        "aria-pressed": sl.on,
        onClick: () => setSlot(sl.t),
        style: { minHeight: 60, boxSizing: "border-box", padding: "6px 4px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, background: sl.bg, color: sl.fg, border: "2px solid " + sl.border, borderRadius: 12, cursor: "pointer" }
      },
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: 16, fontWeight: 800 } }, sl.t),
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: sl.subFg } }, sl.sub)
    )))), /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 16px", background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 14, fontSize: 14, lineHeight: 1.5 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, marginBottom: 2 } }, "Perkiraan"), /* @__PURE__ */ React.createElement("div", { style: { color: GRAY } }, estimate))), step === "confirm" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 } }, "Cek lagi, lalu konfirmasi")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6, padding: 16, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Jadwal"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800 } }, whenText), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: GRAY } }, waitText, " \xB7 Mekanik: ", mechName)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12, padding: 16, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Mobil dan servis"), confirmCars.map((cc) => /* @__PURE__ */ React.createElement("div", { key: cc.plate, style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 16, fontWeight: 800 } }, cc.plate), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: GRAY } }, cc.model)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 700, textAlign: "right" } }, cc.svc)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6, padding: 16, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Kontak"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15 } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700 } }, roleLabel), " \xB7 ", phone), driver && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15 } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700 } }, "Pemilik, untuk persetujuan biaya"), " \xB7 ", ownerPhone)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        "aria-pressed": remindOn,
        onClick: () => setRemindOn(!remindOn),
        style: { width: "100%", minHeight: 64, boxSizing: "border-box", padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, textAlign: "left", background: "#FFFFFF", color: INK, border: "2px solid " + (remindOn ? INK : LINE), borderRadius: 14, cursor: "pointer" }
      },
      /* @__PURE__ */ React.createElement(BoxCheck, { on: remindOn }),
      /* @__PURE__ */ React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 700 } }, "Ingatkan jadwal servis berikutnya"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: GRAY } }, "Dikirim per mobil dan menyebut plat nomor."))
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        "aria-pressed": promoOn,
        onClick: () => setPromoOn(!promoOn),
        style: { width: "100%", minHeight: 64, boxSizing: "border-box", padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, textAlign: "left", background: "#FFFFFF", color: INK, border: "2px solid " + (promoOn ? INK : LINE), borderRadius: 14, cursor: "pointer" }
      },
      /* @__PURE__ */ React.createElement(BoxCheck, { on: promoOn }),
      /* @__PURE__ */ React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 700 } }, "Boleh kirim info promo"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: GRAY } }, "Opsional. Bisa dimatikan kapan saja."))
    )), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: GRAY } }, "Biaya dan durasi final dikirim setelah mobil dicek. Pekerjaan tambahan hanya dilakukan setelah kamu setuju lewat WhatsApp.")), step === "done" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 52, height: 52, borderRadius: 26, background: "#1F7A45", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(CheckIcon, { size: 26, width: 2 })), /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 } }, "Booking berhasil"), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 16, lineHeight: 1.5, color: GRAY } }, whenText, ". Konfirmasi sudah dikirim ke WhatsApp ", phone, ".")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, padding: 16, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Kode booking"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 28, fontWeight: 800, letterSpacing: 3 } }, code), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: GRAY } }, carsLine)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Pesan WhatsApp yang kamu terima"), /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 16px", background: "#DCF5E1", borderRadius: "14px 14px 14px 4px", fontSize: 14, lineHeight: 1.6, color: INK } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700 } }, "[Nama Bengkel] \xB7 Booking ", code, " dikonfirmasi"), /* @__PURE__ */ React.createElement("div", null, whenText), /* @__PURE__ */ React.createElement("div", null, carsLine), /* @__PURE__ */ React.createElement("div", null, "Mekanik: ", mechName))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14, padding: 16, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800 } }, "Setelah ini"), nextSteps.map((st) => /* @__PURE__ */ React.createElement("div", { key: st.n, style: { display: "flex", gap: 12, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 26, height: 26, flex: "none", borderRadius: 13, background: accent, color: INK, fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" } }, st.n), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700 } }, st.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: GRAY } }, st.body))))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: GRAY } }, prefsLine), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: restart,
        style: { width: "100%", height: 56, border: "2px solid " + INK, borderRadius: 14, background: "#FFFFFF", color: INK, fontSize: 16, fontWeight: 800, cursor: "pointer" }
      },
      "Buat booking baru"
    )), showFooter && /* @__PURE__ */ React.createElement("div", { style: { marginTop: "auto", paddingTop: 8 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        disabled: !canNext,
        onClick: goNext,
        style: { width: "100%", height: 56, border: "none", borderRadius: 14, background: canNext ? accent : LINE, color: canNext ? INK : GRAY, fontSize: 17, fontWeight: 800, cursor: "pointer", opacity: canNext ? 1 : 0.75 }
      },
      NEXTLABEL[step]
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: showFooter ? 4 : 0 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: MUTED } }, "Warna bengkel:"), ACCENTS.map((c) => /* @__PURE__ */ React.createElement(AccentDot, { key: c, accent, color: c, on: accent === c, onClick: () => setAccent(c) })), /* @__PURE__ */ React.createElement("span", { style: { width: 1, height: 16, background: LINE, marginLeft: 4 } }), /* @__PURE__ */ React.createElement("a", { href: "admin.html", style: { fontSize: 12, color: GRAY, fontWeight: 700 } }, "Panel admin bengkel \u2192"))));
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
})();
