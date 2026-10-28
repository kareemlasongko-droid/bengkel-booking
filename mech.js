(() => {
  const { useState, useEffect } = React;
  const INK = "#12161C";
  const GRAY = "#5A6270";
  const LINE = "#DDE1E7";
  const MUTED = "#8791A0";
  const BG = "#F2F3F5";
  const GREEN = "#1F7A45";
  const RED = "#B42318";
  const TONE = {
    blue: { bg: "#E7F0FD", fg: "#1D4E89" },
    amber: { bg: "#FDF1DC", fg: "#8A5307" },
    violet: { bg: "#EFE9FD", fg: "#5B21B6" },
    green: { bg: "#DCF5E1", fg: "#165C34" },
    red: { bg: "#FDE8E6", fg: "#B42318" }
  };
  const SESSION_KEY = "bengkel.mech.session.v1";
  const MECH_ACCOUNTS = MECHANICS;
  const STATUS_ORDER = { in_progress: 0, arrived: 1, confirmed: 2, done: 3 };
  const ACTOR = "mekanik";
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
    const accent = useAccent();
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
    return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK, boxSizing: "border-box" } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 440, margin: "0 auto", padding: "32px 20px 48px", display: "flex", flexDirection: "column", gap: 20, minHeight: "100vh", boxSizing: "border-box" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 44, height: 44, borderRadius: 12, background: accent, color: INK, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" } }, /* @__PURE__ */ React.createElement(WrenchIcon, null)), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800 } }, "[Nama Bengkel] \xB7 Portal Mekanik"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Masuk dari HP mekanik masing-masing"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 800 } }, "Masuk sebagai mekanik"), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 16, lineHeight: 1.5, color: GRAY } }, "Gunakan nomor HP yang terdaftar di bengkel dan PIN 4 angka kamu.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16, padding: 20, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "mech-phone", style: { fontSize: 14, fontWeight: 700 } }, "Nomor HP"), /* @__PURE__ */ React.createElement(
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
        style: { width: "100%", height: 56, border: "none", borderRadius: 14, background: canSubmit ? accent : LINE, color: canSubmit ? INK : GRAY, fontSize: 17, fontWeight: 800, cursor: canSubmit ? "pointer" : "default" }
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
  function JobCard({ b, accent, me, onChanged }) {
    const [code, setCode] = useState("");
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");
    const total = b.cars.length;
    const done = carsDone(b);
    const allDone = done === total;
    const pct = total ? Math.round(done / total * 100) : 0;
    const myCars = b.cars.filter((c) => c.mech === me).length;
    const openCars = mineUnassigned(b).length;
    const run = (result, okText) => {
      if (!result || result.ok === false) {
        setErr(result && result.error || "Aksi gagal.");
        setMsg("");
        return false;
      }
      setErr("");
      setMsg(okText || "");
      onChanged();
      return true;
    };
    const verify = () => {
      if (run(checkInBooking(b.id, code, ACTOR + ":" + me), "Check-in terverifikasi, status menjadi Tiba.")) setCode("");
    };
    const claim = () => {
      let taken = 0;
      mineUnassigned(b).forEach((unassignedCar, idx) => {
        const realIndex = b.cars.indexOf(unassignedCar);
        const res = assignMechanic(b.id, realIndex, me, ACTOR + ":" + me);
        if (res.ok) taken += 1;
      });
      if (!taken) {
        setErr("Tidak ada mobil yang bisa diambil (mekanik lain mungkin sudah menanganinya).");
        return;
      }
      setErr("");
      setMsg(taken + " mobil diambil untuk " + me + ".");
      onChanged();
    };
    const finish = () => {
      const missing = total - done;
      if (!allDone && !window.confirm("Masih ada " + missing + " mobil yang belum ditandai selesai. Tetap tandai booking " + b.id + " selesai?")) return;
      run(updateBookingStatus(b.id, "done", ACTOR + ":" + me), "Booking " + b.id + " selesai.");
    };
    return /* @__PURE__ */ React.createElement("div", { style: { background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, minWidth: 0, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 18, fontWeight: 800, letterSpacing: 1 } }, b.id), /* @__PURE__ */ React.createElement(StatusChip, { status: b.status }), openCars > 0 ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 800, color: TONE.amber.fg, background: TONE.amber.bg, borderRadius: 999, padding: "4px 10px" } }, openCars, " mobil belum ada mekanik") : null), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: MUTED } }, b.dayFull, " \xB7 ", b.slot)), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRAY, fontWeight: 700 } }, "Jadwal"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700 } }, b.dayFull, " \xB7 ", b.slot), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, b.wait === "tunggu" ? "Menunggu di bengkel" : "Mobil ditinggal", " \xB7 ", total, " mobil \xB7 ", myCars, " untukmu")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRAY, fontWeight: 700 } }, "Pelanggan"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700 } }, b.role === "driver" ? "Pengantar" : "Pemilik", " \xB7 ", b.phone), b.ownerPhone ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Pemilik (persetujuan biaya): ", b.ownerPhone) : null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, done, " dari ", total, " mobil selesai"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, b.cars.map((c, i) => {
      const mine = c.mech === me;
      const canToggle = mine && b.status === "in_progress";
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: c.plate + i,
          type: "button",
          onClick: () => canToggle && run(setCarDone(b.id, i, !c.done, ACTOR + ":" + me), c.done ? c.plate + " dibuka lagi." : c.plate + " ditandai selesai."),
          disabled: !canToggle,
          style: { display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", background: BG, borderRadius: 10, padding: "8px 12px", border: mine ? "2px solid " + accent : "2px solid transparent", cursor: canToggle ? "pointer" : "default", font: "inherit", color: INK }
        },
        /* @__PURE__ */ React.createElement(CarCheck, { on: c.done }),
        /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 800, textDecoration: c.done ? "line-through" : "none", color: c.done ? GRAY : INK } }, c.plate), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: GRAY } }, " \xB7 ", c.model)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, c.svc, " \xB7 ", durText(c.svc), " \xB7 ", c.mech ? c.mech : "belum ada mekanik")),
        canToggle ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: GRAY, whiteSpace: "nowrap" } }, c.done ? "selesai" : "tandai selesai") : null
      );
    })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: 6, borderRadius: 3, background: LINE, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: pct + "%", height: "100%", background: GREEN, transition: "width .2s ease" } })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 800, color: GRAY, whiteSpace: "nowrap" } }, done, "/", total, " mobil")), b.status === "cancelled" || b.status === "no_show" ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: RED, background: TONE.red.bg, borderRadius: 10, padding: "8px 12px" } }, statusLabel(b.status), b.closedReason ? " \xB7 " + b.closedReason : "") : null, b.note ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: GRAY, background: "#FFFFFF", border: "1px dashed " + MUTED, borderRadius: 10, padding: "8px 12px" } }, "Catatan pelanggan: ", b.note) : null, b.status === "confirmed" ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, padding: 12, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 700 } }, "Kode check-in pelanggan (4 angka)"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        inputMode: "numeric",
        maxLength: 4,
        placeholder: "0000",
        value: code,
        onChange: (e) => {
          setCode(e.target.value.replace(/\D/g, "").slice(0, 4));
          setErr("");
        },
        style: { width: 110, height: 44, boxSizing: "border-box", textAlign: "center", letterSpacing: 6, fontSize: 18, fontWeight: 700, border: "1.5px solid " + MUTED, borderRadius: 10, background: "#FFFFFF", color: INK }
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: verify,
        style: { height: 44, padding: "0 16px", borderRadius: 10, border: "none", background: accent, color: INK, fontSize: 14, fontWeight: 800, cursor: "pointer" }
      },
      "Verifikasi kedatangan"
    ))) : null, err ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: RED, background: TONE.red.bg, borderRadius: 10, padding: "8px 12px" } }, err) : null, msg ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: TONE.green.fg, background: TONE.green.bg, borderRadius: 10, padding: "8px 12px" } }, msg) : null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" } }, openCars > 0 && b.status !== "done" ? /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: claim,
        style: { height: 44, padding: "0 16px", borderRadius: 10, border: "none", background: accent, color: INK, fontSize: 14, fontWeight: 800, cursor: "pointer" }
      },
      "Ambil ",
      openCars,
      " mobil ini"
    ) : null, b.status === "arrived" && myCars > 0 ? /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => run(updateBookingStatus(b.id, "in_progress", ACTOR + ":" + me), "Pekerjaan dimulai."),
        style: { height: 44, padding: "0 16px", borderRadius: 10, border: "none", background: INK, color: "#FFFFFF", fontSize: 14, fontWeight: 800, cursor: "pointer" }
      },
      "Mulai dikerjakan"
    ) : null, b.status === "in_progress" && myCars > 0 ? /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: finish,
        style: { height: 44, padding: "0 16px", borderRadius: 10, border: "none", background: accent, color: INK, fontSize: 14, fontWeight: 800, cursor: "pointer", opacity: allDone ? 1 : 0.8 }
      },
      "Selesai & serahkan"
    ) : null, b.status === "done" ? /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: GREEN } }, /* @__PURE__ */ React.createElement(CheckIcon, { size: 16 }), " Selesai ", b.updatedAt ? fmtDateID(b.updatedAt) : "") : null, b.audit && b.audit.length > 0 ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: MUTED, marginLeft: "auto" } }, b.audit.length, " perubahan tercatat") : null));
  }
  function Dashboard({ session, onLogout }) {
    const accent = useAccent();
    const [bookings, setBookings] = useState(() => loadBookings());
    const [scope, setScope] = useState("mine");
    const [filter, setFilter] = useState("all");
    const [notice, setNotice] = useState("");
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
    const current = bookings.filter((b) => b.status !== "cancelled" && b.status !== "no_show");
    const isMine = (b) => mechHasBooking(b, session.name);
    const isOpen = (b) => isUnassigned(b) && b.status !== "done";
    const inScope = scope === "mine" ? current.filter(isMine) : current.filter(isOpen);
    const stats = {
      active: current.filter(isMine).filter((b) => b.status !== "done").length,
      arrived: current.filter(isMine).filter((b) => b.status === "arrived").length,
      in_progress: current.filter(isMine).filter((b) => b.status === "in_progress").length,
      done: bookings.filter(isMine).filter((b) => b.status === "done").length
    };
    const filtered = (filter === "all" ? inScope : inScope.filter((b) => b.status === filter)).slice().sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || String(a.slot).localeCompare(String(b.slot)));
    const tabs = [
      { id: "all", label: "Semua (" + inScope.length + ")" },
      { id: "arrived", label: "Menunggu dikerjakan (" + inScope.filter((b) => b.status === "arrived").length + ")" },
      { id: "in_progress", label: "Dikerjakan (" + inScope.filter((b) => b.status === "in_progress").length + ")" },
      { id: "confirmed", label: "Belum tiba (" + inScope.filter((b) => b.status === "confirmed").length + ")" },
      { id: "done", label: "Selesai (" + inScope.filter((b) => b.status === "done").length + ")" }
    ];
    const pill = (on) => ({
      height: 40,
      padding: "0 14px",
      borderRadius: 20,
      border: "2px solid " + (on ? INK : LINE),
      background: on ? accent : "#FFFFFF",
      color: INK,
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer"
    });
    return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK, boxSizing: "border-box" } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 880, margin: "0 auto", padding: "24px 20px 48px", display: "flex", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 44, height: 44, borderRadius: 12, background: accent, color: INK, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" } }, /* @__PURE__ */ React.createElement(WrenchIcon, null)), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800 } }, "Halo, ", session.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "[Nama Bengkel] \xB7 ", session.phone)), /* @__PURE__ */ React.createElement("a", { href: "admin.html", style: { fontSize: 13, fontWeight: 800, color: INK, textDecoration: "none" } }, "Panel admin"), /* @__PURE__ */ React.createElement(
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
    }, style: pill(scope === "mine") }, "Tugas saya (", current.filter(isMine).length, ")"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      setScope("open");
      setFilter("all");
    }, style: pill(scope === "open") }, "Belum ada mekanik (", current.filter(isOpen).length, ")"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(StatCard, { label: "Tugas aktif", value: stats.active }), /* @__PURE__ */ React.createElement(StatCard, { label: "Menunggu dikerjakan", value: stats.arrived }), /* @__PURE__ */ React.createElement(StatCard, { label: "Sedang dikerjakan", value: stats.in_progress }), /* @__PURE__ */ React.createElement(StatCard, { label: "Selesai", value: stats.done })), notice ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: TONE.green.fg, background: TONE.green.bg, borderRadius: 10, padding: "8px 12px" } }, notice) : null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, tabs.map((t) => /* @__PURE__ */ React.createElement("button", { key: t.id, type: "button", onClick: () => setFilter(t.id), style: pill(filter === t.id) }, t.label))), filtered.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 24px", background: "#FFFFFF", border: "1px dashed " + MUTED, borderRadius: 16, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 800 } }, scope === "mine" ? "Belum ada pekerjaan untukmu" : "Tidak ada mobil tanpa mekanik"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: GRAY, lineHeight: 1.6, maxWidth: 440 } }, scope === "mine" ? "Admin menugaskan mobil kepadamu dari panel admin. Kamu juga bisa mengambil mobil yang belum punya mekanik." : "Semua mobil sudah punya mekanik. Cek tab Tugas saya untuk melihat pekerjaanmu."), /* @__PURE__ */ React.createElement("a", { href: "admin.html", style: { fontSize: 13, fontWeight: 800, color: INK } }, "Buka panel admin")) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, filtered.map((b) => /* @__PURE__ */ React.createElement(
      JobCard,
      {
        key: b.id,
        b,
        accent,
        me: session.name,
        onChanged: () => {
          setNotice("");
          refresh();
        }
      }
    ))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: MUTED, textAlign: "center" } }, "Setiap aksi tercatat atas namamu (audit trail). Data tersimpan di browser ini (localStorage); untuk produksi, ganti lapisan data di ", /* @__PURE__ */ React.createElement("b", null, "booking.js"), " dengan API backend.", " ", /* @__PURE__ */ React.createElement("a", { href: "index.html", style: { color: GRAY, fontWeight: 700 } }, "Situs pelanggan \u2192"))));
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
