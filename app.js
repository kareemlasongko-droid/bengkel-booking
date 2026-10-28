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
  const dig = (v) => String(v || "").replace(/\D/g, "").length;
  const fmt = (m) => m < 60 ? "\xB1" + m + " menit" : "\xB1" + String(m / 60).replace(".", ",") + " jam";
  const scrollTop = () => {
    try {
      window.scrollTo(0, 0);
    } catch (e) {
    }
  };
  const SERVICES = SERVICE_CATALOG.map((sv) => ({
    id: sv.id,
    name: sv.name,
    mins: sv.mins,
    hint: sv.mins === 0 ? "Mekanik cek dulu (\xB130\u201360 menit), lalu estimasi biaya dan durasi dikirim ke WhatsApp untuk kamu setujui." : "Perkiraan selesai " + fmt(sv.mins) + "."
  }));
  const SLOTS = SLOT_TEMPLATE.map((sl) => ({ t: sl.t }));
  const MECHS = [{ id: "auto", name: "Otomatis", sub: "Dipilihkan yang kosong, paling cepat dikerjakan" }].concat(MECHANICS.map((m) => ({ id: m.id, name: m.name, sub: "Jadwal mengikuti booking yang masuk" })));
  const DAYS = upcomingDays(DAYS_SHOWN);
  const mechNameOf = (id) => id && id !== "auto" ? (MECHANICS.find((m) => m.id === id) || {}).name || "" : "";
  const slotOkFor = (dateISO, slot, mechId, count) => slotOk(dateISO, slot, mechNameOf(mechId), count);
  const toCarList = (phoneValue) => loadVehicles(phoneValue).map((c, i) => ({
    id: "v" + i + "-" + String(c.plate).replace(/\W/g, ""),
    plate: c.plate,
    model: c.model,
    last: c.last
  }));
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
    const [accent, setAccent] = useState(() => {
      const saved = readAccent();
      return ACCENTS.indexOf(saved) === -1 ? ACCENTS[0] : saved;
    });
    const [step, setStep] = useState("phone");
    const [phone, setPhone] = useState("0812 0000 1234");
    const [otp, setOtp] = useState("");
    const [role, setRole] = useState("owner");
    const [ownerPhone, setOwnerPhone] = useState("");
    const [cars, setCars] = useState(() => toCarList(phone));
    const [selected, setSelected] = useState(() => {
      const list = toCarList(phone);
      return list[0] ? { [list[0].id]: true } : {};
    });
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
    const [checkin, setCheckin] = useState("");
    const [savedId, setSavedId] = useState("");
    const [lookCode, setLookCode] = useState("");
    const [lookPhone, setLookPhone] = useState("");
    const [lookErr, setLookErr] = useState("");
    const [looked, setLooked] = useState(null);
    const [resDay, setResDay] = useState(0);
    const [resSlot, setResSlot] = useState("");
    const [resMsg, setResMsg] = useState("");
    useEffect(() => {
      const list = toCarList(phone);
      setCars(list);
      setSelected((prev) => {
        const keep = {};
        list.forEach((c) => {
          if (prev[c.id] || Object.keys(prev).length === 0) keep[c.id] = true;
        });
        return Object.keys(keep).length ? keep : list[0] ? { [list[0].id]: true } : {};
      });
      setSvc({});
      setSlot("");
    }, [phone]);
    const driver = role === "driver";
    const selectedCars = cars.filter((c) => selected[c.id]);
    const n = selectedCars.length;
    const canNext = {
      phone: dig(phone) >= 9,
      otp: otp.length === 4,
      cars: n >= 1 && (!driver || dig(ownerPhone) >= 9),
      service: n >= 1 && selectedCars.every((c) => !!svc[c.id]),
      schedule: slot !== "" && slotOkFor((DAYS[day] || {}).iso, slot, mech, n),
      confirm: true
    }[step] === true;
    const goNext = () => {
      if (!canNext) return;
      if (step === "confirm") {
        const chosenMech = mechNameOf(mech);
        const dayObj2 = DAYS[day];
        const booking = saveBooking({
          phone: phone.trim(),
          role,
          ownerPhone: driver ? ownerPhone.trim() : "",
          cars: selectedCars.map((c) => {
            const sv = SERVICES.find((x) => x.id === svc[c.id]);
            return { plate: c.plate, model: c.model, svc: sv ? sv.name : "-", mech: chosenMech, done: false };
          }),
          note: note.trim(),
          wait,
          dateISO: dayObj2.iso,
          dayFull: dayObj2.full,
          slot,
          mech: chosenMech || AUTO_MECH,
          remindOn,
          promoOn,
          actor: "pelanggan"
        });
        setCode(booking.id);
        setCheckin(booking.checkinCode);
        setSavedId(booking.id);
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
      setCheckin("");
      setSavedId("");
      setLookErr("");
      setLooked(null);
      setResSlot("");
      setResMsg("");
      scrollTop();
    };
    const toggleCar = (id) => {
      setSelected((prev) => __spreadProps(__spreadValues({}, prev), { [id]: !prev[id] }));
      setSlot("");
    };
    const saveCar = () => {
      const plate = newPlate.trim().toUpperCase();
      if (!plate) return;
      const res = upsertVehicle(phone, { plate, model: newModel.trim() });
      if (!res.ok) return;
      const list = toCarList(phone);
      const added = list.find((c) => c.plate === res.car.plate);
      setCars(list);
      if (added) setSelected((prev) => Object.assign({}, prev, { [added.id]: true }));
      setAddOpen(false);
      setNewPlate("");
      setNewModel("");
      setSlot("");
    };
    const pickDay = (i) => {
      setDay(i);
      setSlot("");
    };
    const openLookup = () => {
      setLookErr("");
      setResMsg("");
      setResSlot("");
      setLookPhone(phone);
      setStep("status");
      scrollTop();
    };
    const doLookup = () => {
      const res = findBookingForCustomer(lookCode, lookPhone);
      if (!res.ok) {
        setLookErr(res.error);
        setLooked(null);
        return;
      }
      setLookErr("");
      setLooked(res.booking);
      setResDay(0);
      setResSlot("");
    };
    const refreshLooked = (id) => {
      const fresh = findBooking(id);
      setLooked(fresh);
    };
    const cancelMine = () => {
      if (!looked) return;
      const reason = window.prompt("Alasan pembatalan (boleh dikosongkan):", "") || "";
      const res = closeBooking(looked.id, "cancelled", reason || "Dibatalkan pelanggan", "pelanggan");
      if (!res.ok) {
        setResMsg(res.error);
        return;
      }
      setResMsg("Booking dibatalkan.");
      refreshLooked(looked.id);
    };
    const rescheduleMine = () => {
      if (!looked || !resSlot) {
        setResMsg("Pilih tanggal dan jam baru dulu.");
        return;
      }
      const dayInfo2 = DAYS[resDay] || DAYS[0];
      const res = rescheduleBooking(looked.id, dayInfo2.iso, resSlot, "pelanggan");
      if (!res.ok) {
        setResMsg(res.error);
        return;
      }
      setResMsg("Jadwal dipindah ke " + dayInfo2.full + " \xB7 " + resSlot + ".");
      setResSlot("");
      refreshLooked(looked.id);
    };
    const pickMech = (m) => {
      setMech(m.id);
      if (slot && !slotOkFor((DAYS[day] || {}).iso, slot, m.id, n)) setSlot("");
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
      const ok = slotOkFor((DAYS[day] || {}).iso, sl.t, mech, n);
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
    const mechName = mechNameOf(mech) || AUTO_MECH;
    const whenText = dayObj.full + " \xB7 " + slot;
    const waitText = wait === "tunggu" ? "Menunggu di bengkel" : "Mobil ditinggal";
    const dayIso = (DAYS[day] || {}).iso;
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
    const showProgress = step !== "done" && step !== "status";
    const showBack = step !== "phone" && step !== "done" && step !== "status";
    const showFooter = step !== "done" && step !== "status";
    const roleLabel = driver ? "Pengantar" : "Pemilik";
    return /* @__PURE__ */ React.createElement("div", { style: { minHeight: 844, background: BG, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK, display: "flex", justifyContent: "center", boxSizing: "border-box" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxWidth: 440, minHeight: 844, boxSizing: "border-box", padding: "20px 20px 28px", display: "flex", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 44, height: 44, borderRadius: 12, background: accent, color: INK, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" } }, /* @__PURE__ */ React.createElement(WrenchIcon, null)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 17, fontWeight: 800 } }, "[Nama Bengkel]"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Booking servis mobil")), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: openLookup,
        style: { height: 36, padding: "0 12px", borderRadius: 18, border: "2px solid " + LINE, background: "#FFFFFF", color: INK, fontSize: 12, fontWeight: 700, cursor: "pointer", flex: "none" }
      },
      "Cek status"
    )), showProgress && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, showBack && /* @__PURE__ */ React.createElement(
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
    )), /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 16px", background: "#FFFFFF", border: "1px dashed " + MUTED, borderRadius: 12, fontSize: 14, lineHeight: 1.5, color: GRAY } }, "Catatan prototipe: ketik 4 angka apa saja, misalnya 1234.")), step === "cars" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 } }, "Mobil mana yang diservis?"), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 16, lineHeight: 1.5, color: GRAY } }, "Nomor dikenali. Pilih satu atau lebih mobil yang pernah kamu servis di sini.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, cars.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 16px", background: "#FFFFFF", border: "1px dashed " + MUTED, borderRadius: 12, fontSize: 14, lineHeight: 1.5, color: GRAY } }, "Belum ada mobil tersimpan untuk nomor ini. Tambahkan mobil dulu \u2014 data tersimpan per nomor WhatsApp."), cars.map((c) => {
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
        onClick: () => pickDay(d.i),
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
    )), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: GRAY } }, "Biaya dan durasi final dikirim setelah mobil dicek. Pekerjaan tambahan hanya dilakukan setelah kamu setuju lewat WhatsApp.")), step === "done" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 52, height: 52, borderRadius: 26, background: "#1F7A45", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(CheckIcon, { size: 26, width: 2 })), /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 } }, "Booking berhasil"), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 16, lineHeight: 1.5, color: GRAY } }, whenText, ". Konfirmasi sudah dikirim ke WhatsApp ", phone, ".")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, padding: 16, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Kode booking"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 28, fontWeight: 800, letterSpacing: 3 } }, code), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: GRAY } }, carsLine)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, padding: 16, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Kode check-in (tunjukkan di kasir saat tiba)"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 28, fontWeight: 800, letterSpacing: 6 } }, checkin), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: GRAY } }, "Petugas memakai kode ini untuk mencatat kedatanganmu. Tanpa kode, booking tidak bisa ditandai tiba.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Pesan WhatsApp yang kamu terima"), /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 16px", background: "#DCF5E1", borderRadius: "14px 14px 14px 4px", fontSize: 14, lineHeight: 1.6, color: INK } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700 } }, "[Nama Bengkel] \xB7 Booking ", code, " dikonfirmasi"), /* @__PURE__ */ React.createElement("div", null, whenText), /* @__PURE__ */ React.createElement("div", null, carsLine), /* @__PURE__ */ React.createElement("div", null, "Mekanik: ", mechName))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14, padding: 16, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800 } }, "Setelah ini"), nextSteps.map((st) => /* @__PURE__ */ React.createElement("div", { key: st.n, style: { display: "flex", gap: 12, alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 26, height: 26, flex: "none", borderRadius: 13, background: accent, color: INK, fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" } }, st.n), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700 } }, st.title), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: GRAY } }, st.body))))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: GRAY } }, prefsLine), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          setLookCode(code);
          setLookPhone(phone);
          openLookup();
        },
        style: { width: "100%", height: 56, border: "none", borderRadius: 14, background: accent, color: INK, fontSize: 16, fontWeight: 800, cursor: "pointer" }
      },
      "Cek status booking"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: restart,
        style: { width: "100%", height: 56, border: "2px solid " + INK, borderRadius: 14, background: "#FFFFFF", color: INK, fontSize: 16, fontWeight: 800, cursor: "pointer" }
      },
      "Buat booking baru"
    )), step === "status" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        "aria-label": "Kembali",
        onClick: () => {
          setStep("phone");
          setLooked(null);
          scrollTop();
        },
        style: { width: 44, height: 44, flex: "none", borderRadius: 12, border: "1.5px solid " + MUTED, background: "#FFFFFF", color: INK, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }
      },
      /* @__PURE__ */ React.createElement(BackIcon, null)
    ), /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 24, lineHeight: 1.2, fontWeight: 800 } }, "Cek status booking")), !looked && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14, padding: 16, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, lineHeight: 1.5, color: GRAY } }, "Masukkan kode booking dan nomor WhatsApp yang dipakai saat booking."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "look-code", style: { fontSize: 14, fontWeight: 700 } }, "Kode booking"), /* @__PURE__ */ React.createElement(
      "input",
      {
        id: "look-code",
        type: "text",
        placeholder: "BK-0271",
        value: lookCode,
        onChange: (e) => {
          setLookCode(e.target.value.toUpperCase());
          setLookErr("");
        },
        style: { width: "100%", height: 52, boxSizing: "border-box", padding: "0 16px", border: "1.5px solid " + MUTED, borderRadius: 12, background: "#FFFFFF", color: INK, fontSize: 16, letterSpacing: 1 }
      }
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "look-phone", style: { fontSize: 14, fontWeight: 700 } }, "Nomor WhatsApp"), /* @__PURE__ */ React.createElement(
      "input",
      {
        id: "look-phone",
        type: "tel",
        placeholder: "08xx xxxx xxxx",
        value: lookPhone,
        onChange: (e) => {
          setLookPhone(e.target.value);
          setLookErr("");
        },
        style: { width: "100%", height: 52, boxSizing: "border-box", padding: "0 16px", border: "1.5px solid " + MUTED, borderRadius: 12, background: "#FFFFFF", color: INK, fontSize: 16 }
      }
    )), lookErr ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: "#B42318", background: "#FDE8E6", borderRadius: 10, padding: "10px 12px" } }, lookErr) : null, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: doLookup,
        style: { width: "100%", height: 52, border: "none", borderRadius: 12, background: accent, color: INK, fontSize: 16, fontWeight: 800, cursor: "pointer" }
      },
      "Lihat status"
    )), looked && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6, padding: 16, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 20, fontWeight: 800, letterSpacing: 1 } }, looked.id), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: (BOOKING_STATUS[looked.status] || {}).tone === "green" ? "#DCF5E1" : looked.status === "cancelled" || looked.status === "no_show" ? "#FDE8E6" : "#E7F0FD", color: looked.status === "done" ? "#165C34" : looked.status === "cancelled" || looked.status === "no_show" ? "#B42318" : "#1D4E89" } }, statusLabel(looked.status))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 700 } }, looked.dayFull, " \xB7 ", looked.slot), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: GRAY } }, looked.wait === "tunggu" ? "Menunggu di bengkel" : "Mobil ditinggal", " \xB7 Mekanik: ", mechanicSummary(looked)), looked.status === "confirmed" && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4, padding: "10px 12px", background: BG, borderRadius: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRAY, fontWeight: 700 } }, "Kode check-in"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, fontWeight: 800, letterSpacing: 5 } }, looked.checkinCode))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, padding: 16, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800 } }, "Progres per mobil"), looked.cars.map((c) => /* @__PURE__ */ React.createElement("div", { key: c.plate, style: { display: "flex", alignItems: "center", gap: 10, background: BG, borderRadius: 10, padding: "8px 12px" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 22, height: 22, flex: "none", borderRadius: 11, background: c.done ? "#1F7A45" : "#FFFFFF", border: "2px solid " + (c.done ? "#1F7A45" : MUTED), color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" } }, c.done ? /* @__PURE__ */ React.createElement(CheckIcon, { size: 12, width: 2.6 }) : null), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 800, textDecoration: c.done ? "line-through" : "none" } }, c.plate), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRAY } }, c.svc, " \xB7 ", c.mech || "mekanik belum ditugaskan"))))), looked.audit.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, padding: 16, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800 } }, "Riwayat"), looked.audit.slice(0, 5).map((a, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", flexDirection: "column", gap: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 700 } }, a.action), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRAY } }, fmtDateID(a.at), " \xB7 ", a.actor, a.note ? " \xB7 " + a.note : "")))), (looked.status === "confirmed" || looked.status === "arrived") && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12, padding: 16, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800 } }, "Ubah jadwal"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, DAYS.map((d, i) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: d.iso,
        type: "button",
        onClick: () => {
          setResDay(i);
          setResSlot("");
          setResMsg("");
        },
        style: { flex: "1 1 auto", minHeight: 48, padding: "4px 8px", borderRadius: 10, border: "2px solid " + (resDay === i ? INK : LINE), background: resDay === i ? accent : "#FFFFFF", color: INK, fontSize: 12, fontWeight: 700, cursor: "pointer" }
      },
      d.dow,
      " ",
      d.date
    ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, SLOTS.map((sl) => {
      const ok = slotOk((DAYS[resDay] || {}).iso, sl.t, "", looked.cars.length, looked.id);
      const on = resSlot === sl.t;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: sl.t,
          type: "button",
          disabled: !ok,
          onClick: () => {
            setResSlot(sl.t);
            setResMsg("");
          },
          style: { flex: "1 1 30%", minHeight: 48, padding: "4px", borderRadius: 10, border: "2px solid " + (on ? INK : ok ? MUTED : LINE), background: on ? accent : ok ? "#FFFFFF" : "#EEF0F3", color: ok ? INK : GRAY, fontSize: 13, fontWeight: 700, cursor: ok ? "pointer" : "default" }
        },
        sl.t
      );
    })), resMsg ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: GRAY } }, resMsg) : null, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: rescheduleMine,
        style: { width: "100%", height: 48, border: "none", borderRadius: 12, background: accent, color: INK, fontSize: 15, fontWeight: 800, cursor: "pointer" }
      },
      "Simpan jadwal baru"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: cancelMine,
        style: { width: "100%", height: 48, border: "1.5px solid " + MUTED, borderRadius: 12, background: "#FFFFFF", color: "#B42318", fontSize: 15, fontWeight: 700, cursor: "pointer" }
      },
      "Batalkan booking"
    )), resMsg && !(looked.status === "confirmed" || looked.status === "arrived") ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: GRAY } }, resMsg) : null, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          setLooked(null);
          setLookCode("");
          setLookErr("");
        },
        style: { width: "100%", height: 48, border: "none", borderRadius: 12, background: "#FFFFFF", border: "1px solid " + LINE, color: INK, fontSize: 14, fontWeight: 700, cursor: "pointer" }
      },
      "Cek booking lain"
    ))), showFooter && /* @__PURE__ */ React.createElement("div", { style: { marginTop: "auto", paddingTop: 8 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        disabled: !canNext,
        onClick: goNext,
        style: { width: "100%", height: 56, border: "none", borderRadius: 14, background: canNext ? accent : LINE, color: canNext ? INK : GRAY, fontSize: 17, fontWeight: 800, cursor: "pointer", opacity: canNext ? 1 : 0.75 }
      },
      NEXTLABEL[step]
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: showFooter ? 4 : 0 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: MUTED } }, "Warna bengkel:"), ACCENTS.map((c) => /* @__PURE__ */ React.createElement(AccentDot, { key: c, accent, color: c, on: accent === c, onClick: () => {
      setAccent(c);
      writeAccent(c);
    } })), /* @__PURE__ */ React.createElement("span", { style: { width: 1, height: 16, background: LINE, marginLeft: 4 } }), /* @__PURE__ */ React.createElement("a", { href: "admin.html", style: { fontSize: 12, color: GRAY, fontWeight: 700 } }, "Panel admin bengkel \u2192")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("a", { href: "mech.html", style: { fontSize: 12, color: MUTED, fontWeight: 700 } }, "Portal mekanik \u2192"))));
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
})();
