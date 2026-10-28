(() => {
  const { useState, useEffect } = React;
  const INK = "#12161C";
  const GRAY = "#5A6270";
  const LINE = "#DDE1E7";
  const MUTED = "#8791A0";
  const BG = "#F2F3F5";
  const AMBER = "#FFB81C";
  const GREEN = "#1F7A45";
  const RED = "#B42318";
  const TONE = {
    blue: { bg: "#E7F0FD", fg: "#1D4E89" },
    amber: { bg: "#FDF1DC", fg: "#8A5307" },
    violet: { bg: "#EFE9FD", fg: "#5B21B6" },
    green: { bg: "#DCF5E1", fg: "#165C34" },
    red: { bg: "#FDE8E6", fg: "#B42318" }
  };
  const AUTO_MECH = "Otomatis (dipilihkan bengkel)";
  const SESSION_KEY = "bengkel.mech.session.v1";
  const MECH_ACCOUNTS = [
    { id: "budi", name: "Pak Budi", phone: "0812 3456 0001", pin: "1111" },
    { id: "andi", name: "Andi", phone: "0812 3456 0002", pin: "2222" },
    { id: "rizal", name: "Rizal", phone: "0812 3456 0003", pin: "3333" },
    { id: "dedi", name: "Dedi", phone: "0812 3456 0004", pin: "4444" }
  ];
  const SVC_MINS = {
    "Ganti oli": 45,
    "Servis berkala": 120,
    "Cek dan servis rem": 60,
    "Servis AC": 90
  };
  const STATUS_ORDER = { in_progress: 0, arrived: 1, confirmed: 2, done: 3 };
  const durText = (svc) => {
    const m = SVC_MINS[svc];
    if (!m) return "cek dulu \xB130\u201360 menit";
    return m < 60 ? "\xB1" + m + " menit" : "\xB1" + String(m / 60).replace(".", ",") + " jam";
  };
  const normPhone = (v) => String(v || "").replace(/\D/g, "").replace(/^62/, "0");
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
      localStorage.setItem(SESSION_KEY, JSON.stringify({ id: acc.id, at: (/* @__PURE__ */ new Date()).toISOString() }));
    } catch (e) {
    }
  }
  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
    }
  }
  const WrenchIcon = () => /* @__PURE__ */ React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" }));
  const CheckIcon = ({ size = 14, width = 2.4 }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M3 8.5l3.2 3L13 4.5", stroke: "currentColor", strokeWidth: width, strokeLinecap: "round", strokeLinejoin: "round" }));
  function StatusChip({ status }) {
    const meta = BOOKING_STATUS[status] || { label: status, tone: "blue" };
    const t = TONE[meta.tone] || TONE.blue;
    return /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: t.bg, color: t.fg, fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" } }, status === "done" ? /* @__PURE__ */ React.createElement(CheckIcon, null) : null, meta.label);
  }
  function StatCard({ label, value, sub }) {
    return /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 140px", minWidth: 130, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 14, padding: "14px 16px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRAY, fontWeight: 700 } }, label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 26, fontWeight: 800, marginTop: 2 } }, value), sub ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRAY, marginTop: 2 } }, sub) : null);
  }
  function CarCheck({ on }) {
    return /* @__PURE__ */ React.createElement("span", { style: { width: 26, height: 26, flex: "none", boxSizing: "border-box", borderRadius: 8, border: "2px solid " + (on ? INK : MUTED), background: on ? INK : "#FFFFFF", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" } }, on ? /* @__PURE__ */ React.createElement(CheckIcon, { size: 16 }) : null);
  }
  const inputStyle = {
    width: "100%",
    height: 56,
    boxSizing: "border-box",
    padding: "0 16px",
    border: "1.5px solid " + MUTED,
    borderRadius: 12,
    background: "#FFFFFF",
    color: INK,
    fontSize: 18
  };
  function Login({ onLogin }) {
    const [phone, setPhone] = useState("");
    const [pin, setPin] = useState("");
    const [err, setErr] = useState("");
    const [showDemo, setShowDemo] = useState(false);
    const found = MECH_ACCOUNTS.find((a) => normPhone(a.phone) === normPhone(phone));
    const canSubmit = normPhone(phone).length >= 9 && pin.length === 4;
    const submit = () => {
      if (!canSubmit) return;
      if (!found) {
        setErr("Nomor HP ini belum terdaftar sebagai mekanik. Hubungi admin bengkel.");
        return;
      }
      if (found.pin !== pin) {
        setErr("PIN salah. Coba lagi.");
        return;
      }
      saveSession(found);
      setErr("");
      onLogin({ id: found.id, name: found.name, phone: found.phone });
    };
    return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK, boxSizing: "border-box" } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 440, margin: "0 auto", padding: "32px 20px 48px", display: "flex", flexDirection: "column", gap: 20, minHeight: "100vh", boxSizing: "border-box" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 44, height: 44, borderRadius: 12, background: AMBER, color: INK, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" } }, /* @__PURE__ */ React.createElement(WrenchIcon, null)), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800 } }, "[Nama Bengkel] \xB7 Portal Mekanik"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Masuk dari HP mekanik masing-masing"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 } }, "Masuk sebagai mekanik"), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 16, lineHeight: 1.5, color: GRAY } }, "Gunakan nomor HP yang terdaftar di bengkel dan PIN 4 angka kamu.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16, padding: 20, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "mech-phone", style: { fontSize: 14, fontWeight: 700 } }, "Nomor HP"), /* @__PURE__ */ React.createElement(
      "input",
      {
        id: "mech-phone",
        type: "tel",
        inputMode: "tel",
        placeholder: "08xx xxxx xxxx",
        value: phone,
        onChange: (e) => {
          setPhone(e.target.value);
          setErr("");
        },
        onKeyDown: (e) => {
          if (e.key === "Enter") submit();
        },
        style: inputStyle
      }
    ), found ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GREEN, fontWeight: 700 } }, found.name) : null), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "mech-pin", style: { fontSize: 14, fontWeight: 700 } }, "PIN"), /* @__PURE__ */ React.createElement(
      "input",
      {
        id: "mech-pin",
        type: "password",
        inputMode: "numeric",
        placeholder: "\u2022\u2022\u2022\u2022",
        value: pin,
        onChange: (e) => {
          setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
          setErr("");
        },
        onKeyDown: (e) => {
          if (e.key === "Enter") submit();
        },
        style: Object.assign({}, inputStyle, { fontSize: 24, fontWeight: 700, letterSpacing: 10, textAlign: "center" })
      }
    )), err ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: RED, background: TONE.red.bg, borderRadius: 10, padding: "10px 12px" } }, err) : null, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        disabled: !canSubmit,
        onClick: submit,
        style: { width: "100%", height: 56, border: "none", borderRadius: 14, background: canSubmit ? INK : LINE, color: canSubmit ? "#FFFFFF" : GRAY, fontSize: 17, fontWeight: 800, cursor: canSubmit ? "pointer" : "default" }
      },
      "Masuk"
    ), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: GRAY } }, "Sesi tersimpan di HP ini, jadi kamu tidak perlu mengetik ulang setiap membuka portal. Selalu ada tombol ", /* @__PURE__ */ React.createElement("b", null, "Keluar"), " untuk berganti mekanik.")), /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 16px", background: "#FFFFFF", border: "1px dashed " + MUTED, borderRadius: 12, display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setShowDemo(!showDemo),
        style: { alignSelf: "flex-start", padding: 0, border: "none", background: "transparent", color: GRAY, fontSize: 13, fontWeight: 700, cursor: "pointer" }
      },
      showDemo ? "Sembunyikan akun demo" : "Lihat akun demo (prototipe)"
    ), showDemo ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: GRAY } }, MECH_ACCOUNTS.map((a) => /* @__PURE__ */ React.createElement("div", { key: a.id, style: { display: "flex", justifyContent: "space-between", gap: 12 } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, color: INK } }, a.name), /* @__PURE__ */ React.createElement("span", null, a.phone, " \xB7 PIN ", a.pin)))) : null), /* @__PURE__ */ React.createElement("div", { style: { marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("a", { href: "admin.html", style: { fontSize: 12, color: GRAY, fontWeight: 700 } }, "\u2190 Panel admin"), /* @__PURE__ */ React.createElement("a", { href: "index.html", style: { fontSize: 12, color: GRAY, fontWeight: 700 } }, "Situs pelanggan \u2192"))));
  }
  function JobCard({ b, onArrive, onStart, onFinish, onToggleCar, onClaim }) {
    const total = b.cars.length;
    const doneCars = Array.isArray(b.doneCars) ? b.doneCars : [];
    const done = b.cars.filter((c, i) => doneCars.indexOf(i) !== -1).length;
    const allDone = done === total;
    const pct = total ? Math.round(done / total * 100) : 0;
    const unassigned = b.mech === AUTO_MECH;
    return /* @__PURE__ */ React.createElement("div", { style: { background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 18, fontWeight: 800, letterSpacing: 1 } }, b.id), /* @__PURE__ */ React.createElement(StatusChip, { status: b.status }), unassigned ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 800, color: TONE.amber.fg, background: TONE.amber.bg, borderRadius: 999, padding: "4px 10px" } }, "Belum ditugaskan") : null), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: MUTED } }, fmtDateID(b.createdAt), " WIB")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRAY, fontWeight: 700 } }, "Jadwal"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700 } }, b.dayFull, " \xB7 ", b.slot), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, b.wait === "tunggu" ? "Menunggu di bengkel" : "Mobil ditinggal", " \xB7 Mekanik: ", b.mech)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRAY, fontWeight: 700 } }, "Pelanggan"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700 } }, b.role === "driver" ? "Pengantar" : "Pemilik", " \xB7 ", b.phone), b.ownerPhone ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Pemilik (persetujuan biaya): ", b.ownerPhone) : null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, total, " mobil \xB7 ", done, " selesai"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, b.cars.map((c, i) => {
      const on = doneCars.indexOf(i) !== -1;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: i,
          type: "button",
          onClick: () => onToggleCar(b.id, i),
          disabled: b.status === "done",
          style: { display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", background: BG, borderRadius: 10, padding: "8px 12px", border: "none", cursor: b.status === "done" ? "default" : "pointer", font: "inherit", color: INK }
        },
        /* @__PURE__ */ React.createElement(CarCheck, { on }),
        /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 800, textDecoration: on ? "line-through" : "none", color: on ? GRAY : INK } }, c.plate), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: GRAY } }, " \xB7 ", c.model)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, c.svc, " \xB7 ", durText(c.svc)))
      );
    })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: 6, borderRadius: 3, background: LINE, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: pct + "%", height: "100%", background: GREEN, transition: "width .2s ease" } })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 800, color: GRAY, whiteSpace: "nowrap" } }, done, "/", total, " mobil")), b.note ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: GRAY, background: "#FFFFFF", border: "1px dashed " + MUTED, borderRadius: 10, padding: "8px 12px" } }, "Catatan pelanggan: ", b.note) : null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" } }, unassigned ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => onClaim(b.id),
        style: { height: 44, padding: "0 16px", borderRadius: 10, border: "none", background: AMBER, color: INK, fontSize: 14, fontWeight: 800, cursor: "pointer" }
      },
      "Ambil tugas ini"
    ), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: MUTED } }, "Belum ada mekanik yang ditugaskan.")) : null, b.status === "confirmed" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => onArrive(b.id),
        style: { height: 44, padding: "0 16px", borderRadius: 10, border: "2px solid " + INK, background: "#FFFFFF", color: INK, fontSize: 14, fontWeight: 800, cursor: "pointer" }
      },
      "Catat kedatangan"
    ), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: MUTED } }, "Mobil belum tiba di bengkel.")) : null, b.status === "arrived" ? /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => onStart(b.id),
        style: { height: 44, padding: "0 16px", borderRadius: 10, border: "none", background: INK, color: "#FFFFFF", fontSize: 14, fontWeight: 800, cursor: "pointer" }
      },
      "Mulai dikerjakan"
    ) : null, b.status === "in_progress" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => onFinish(b.id, allDone, total - done),
        style: { height: 44, padding: "0 16px", borderRadius: 10, border: "none", background: allDone ? INK : AMBER, color: INK, fontSize: 14, fontWeight: 800, cursor: "pointer" }
      },
      "Selesai & serahkan"
    ), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: GRAY } }, allDone ? "Semua mobil sudah ditandai selesai." : total - done + " mobil belum ditandai selesai.")) : null, b.status === "done" ? /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: GREEN } }, /* @__PURE__ */ React.createElement(CheckIcon, { size: 16 }), " Selesai ", b.updatedAt ? fmtDateID(b.updatedAt) : "") : null));
  }
  function Dashboard({ session, onLogout }) {
    const [bookings, setBookings] = useState(() => loadBookings());
    const [scope, setScope] = useState("mine");
    const [filter, setFilter] = useState("all");
    const refresh = () => setBookings(loadBookings());
    useEffect(() => {
      const onSync = () => setBookings(loadBookings());
      window.addEventListener("focus", onSync);
      window.addEventListener("storage", onSync);
      return () => {
        window.removeEventListener("focus", onSync);
        window.removeEventListener("storage", onSync);
      };
    }, []);
    const active = bookings.filter((b) => b.status !== "cancelled");
    const isMine = (b) => b.mech === session.name;
    const isOpen = (b) => b.mech === AUTO_MECH;
    const inScope = scope === "mine" ? active.filter(isMine) : active.filter(isOpen);
    const stats = {
      active: active.filter(isMine).filter((b) => b.status !== "done").length,
      arrived: active.filter(isMine).filter((b) => b.status === "arrived").length,
      in_progress: active.filter(isMine).filter((b) => b.status === "in_progress").length,
      done: active.filter(isMine).filter((b) => b.status === "done").length
    };
    const filtered = (filter === "all" ? inScope : inScope.filter((b) => b.status === filter)).slice().sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || String(a.slot).localeCompare(String(b.slot)));
    const tabs = [
      { id: "all", label: "Semua (" + inScope.length + ")" },
      { id: "arrived", label: "Menunggu dikerjakan (" + inScope.filter((b) => b.status === "arrived").length + ")" },
      { id: "in_progress", label: "Dikerjakan (" + inScope.filter((b) => b.status === "in_progress").length + ")" },
      { id: "confirmed", label: "Belum tiba (" + inScope.filter((b) => b.status === "confirmed").length + ")" },
      { id: "done", label: "Selesai (" + inScope.filter((b) => b.status === "done").length + ")" }
    ];
    const toggleCar = (id, index) => {
      const b = loadBookings().find((x) => x.id === id);
      if (!b) return;
      const doneCars = Array.isArray(b.doneCars) ? b.doneCars.slice() : [];
      const at = doneCars.indexOf(index);
      if (at === -1) doneCars.push(index);
      else doneCars.splice(at, 1);
      doneCars.sort((x, y) => x - y);
      updateBooking(id, { doneCars });
      refresh();
    };
    const claim = (id) => {
      updateBooking(id, { mech: session.name });
      setScope("mine");
      refresh();
    };
    const pill = (on) => ({
      height: 40,
      padding: "0 14px",
      borderRadius: 20,
      border: "2px solid " + (on ? INK : LINE),
      background: on ? INK : "#FFFFFF",
      color: on ? "#FFFFFF" : INK,
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer"
    });
    return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK, boxSizing: "border-box" } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 880, margin: "0 auto", padding: "24px 20px 48px", display: "flex", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 44, height: 44, borderRadius: 12, background: AMBER, color: INK, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" } }, /* @__PURE__ */ React.createElement(WrenchIcon, null)), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800 } }, "Halo, ", session.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "[Nama Bengkel] \xB7 ", session.phone)), /* @__PURE__ */ React.createElement("a", { href: "admin.html", style: { fontSize: 13, fontWeight: 800, color: INK, textDecoration: "none" } }, "Panel admin"), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: onLogout,
        style: { height: 40, padding: "0 14px", borderRadius: 20, border: "2px solid " + LINE, background: "#FFFFFF", color: INK, fontSize: 13, fontWeight: 700, cursor: "pointer" }
      },
      "Keluar"
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRAY, fontWeight: 700 } }, "Pekerjaan"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      setScope("mine");
      setFilter("all");
    }, style: pill(scope === "mine") }, "Tugas saya (", active.filter(isMine).length, ")"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      setScope("open");
      setFilter("all");
    }, style: pill(scope === "open") }, "Belum ditugaskan (", active.filter(isOpen).length, ")"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(StatCard, { label: "Tugas aktif", value: stats.active }), /* @__PURE__ */ React.createElement(StatCard, { label: "Menunggu dikerjakan", value: stats.arrived }), /* @__PURE__ */ React.createElement(StatCard, { label: "Sedang dikerjakan", value: stats.in_progress }), /* @__PURE__ */ React.createElement(StatCard, { label: "Selesai", value: stats.done })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, tabs.map((t) => /* @__PURE__ */ React.createElement("button", { key: t.id, type: "button", onClick: () => setFilter(t.id), style: pill(filter === t.id) }, t.label))), filtered.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 24px", background: "#FFFFFF", border: "1px dashed " + MUTED, borderRadius: 16, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 800 } }, scope === "mine" ? "Belum ada pekerjaan untukmu" : "Tidak ada pekerjaan yang belum ditugaskan"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: GRAY, lineHeight: 1.6, maxWidth: 420 } }, scope === "mine" ? "Booking dari situs pelanggan yang ditugaskan ke " + session.name + " akan muncul otomatis di sini. Kamu juga bisa mengambil pekerjaan yang belum ditugaskan." : "Semua booking sudah punya mekanik. Cek tab Tugas saya untuk melihat pekerjaanmu."), scope === "mine" ? /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          seedSampleBookings();
          refresh();
        },
        style: { height: 48, padding: "0 20px", borderRadius: 12, border: "none", background: INK, color: "#FFFFFF", fontSize: 14, fontWeight: 800, cursor: "pointer" }
      },
      "Muat data contoh"
    ) : null) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, filtered.map((b) => /* @__PURE__ */ React.createElement(
      JobCard,
      {
        key: b.id,
        b,
        onClaim: claim,
        onArrive: (id) => {
          updateBookingStatus(id, "arrived");
          refresh();
        },
        onStart: (id) => {
          updateBookingStatus(id, "in_progress");
          refresh();
        },
        onFinish: (id, allDone, left) => {
          if (!allDone && !confirm("Masih ada " + left + " mobil yang belum ditandai selesai. Tetap tandai booking " + id + " selesai?")) return;
          updateBookingStatus(id, "done");
          refresh();
        },
        onToggleCar: toggleCar
      }
    ))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: MUTED, textAlign: "center" } }, "Data tersimpan di browser ini (localStorage) dan sama dengan yang dipakai panel admin. Untuk produksi, ganti lapisan data di ", /* @__PURE__ */ React.createElement("b", null, "booking.js"), " dengan API backend.")));
  }
  function Mech() {
    const [session, setSession] = useState(() => loadSession());
    const logout = () => {
      clearSession();
      setSession(null);
      try {
        window.scrollTo(0, 0);
      } catch (e) {
      }
    };
    if (!session) return /* @__PURE__ */ React.createElement(Login, { onLogin: (acc) => {
      setSession(acc);
      try {
        window.scrollTo(0, 0);
      } catch (e) {
      }
    } });
    return /* @__PURE__ */ React.createElement(Dashboard, { session, onLogout: logout });
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(Mech, null));
})();
