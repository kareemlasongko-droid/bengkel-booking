(() => {
  const { useState } = React;
  const INK = "#12161C";
  const GRAY = "#5A6270";
  const LINE = "#DDE1E7";
  const MUTED = "#8791A0";
  const BG = "#F2F3F5";
  const RED = "#B42318";
  const GREEN = "#1F7A45";
  const TONE = {
    blue: { bg: "#E7F0FD", fg: "#1D4E89" },
    amber: { bg: "#FDF1DC", fg: "#8A5307" },
    violet: { bg: "#EFE9FD", fg: "#5B21B6" },
    green: { bg: "#DCF5E1", fg: "#165C34" },
    red: { bg: "#FDE8E6", fg: "#B42318" }
  };
  const NEXT_ACTION = {
    confirmed: { label: "Pelanggan tiba", to: "arrived" },
    arrived: { label: "Mulai dikerjakan", to: "in_progress" },
    in_progress: { label: "Selesai & dibayar", to: "done" }
  };
  const ACTOR = "admin";
  const WrenchIcon = () => /* @__PURE__ */ React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" }));
  const CheckIcon = ({ size = 14, width = 2.4 }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M3 8.5l3.2 3L13 4.5", stroke: "currentColor", strokeWidth: width, strokeLinecap: "round", strokeLinejoin: "round" }));
  function StatusChip({ status }) {
    const meta = BOOKING_STATUS[status] || { label: status, tone: "blue" };
    const t = TONE[meta.tone] || TONE.blue;
    return /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: t.bg, color: t.fg, fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" } }, status === "done" ? /* @__PURE__ */ React.createElement(CheckIcon, null) : null, meta.label);
  }
  function StatCard({ label, value, sub, accent }) {
    return /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 140px", minWidth: 130, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 14, padding: "14px 16px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRAY, fontWeight: 700 } }, label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 26, fontWeight: 800, marginTop: 2, color: accent || INK } }, value), sub ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRAY, marginTop: 2 } }, sub) : null);
  }
  function Notice({ kind, children }) {
    const palette = kind === "error" ? { bg: TONE.red.bg, fg: RED } : kind === "ok" ? { bg: TONE.green.bg, fg: TONE.green.fg } : { bg: "#FFFFFF", fg: GRAY };
    return /* @__PURE__ */ React.createElement("div", { role: "status", "aria-live": "polite", style: { fontSize: 13, lineHeight: 1.5, color: palette.fg, background: palette.bg, border: kind === "info" ? "1px dashed " + MUTED : "none", borderRadius: 10, padding: "10px 14px" } }, children);
  }
  const inputBase = {
    minHeight: 48,
    boxSizing: "border-box",
    padding: "0 14px",
    border: "1.5px solid " + MUTED,
    borderRadius: 12,
    background: "#FFFFFF",
    color: INK,
    fontSize: 16,
    fontFamily: "inherit"
  };
  const btnPrimary = (accent) => ({
    minHeight: 48,
    padding: "0 18px",
    borderRadius: 12,
    border: "none",
    background: accent,
    color: INK,
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer"
  });
  const btnGhost = {
    minHeight: 48,
    padding: "0 16px",
    borderRadius: 12,
    border: "1.5px solid " + MUTED,
    background: "#FFFFFF",
    color: INK,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer"
  };
  const btnDanger = {
    minHeight: 48,
    padding: "0 16px",
    borderRadius: 12,
    border: "1.5px solid " + LINE,
    background: "#FFFFFF",
    color: RED,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer"
  };
  function MechSelect({ car, b, accent, onChange }) {
    const busyElsewhere = (name) => name !== car.mech && !mechFree(b.dateISO, b.slot, name);
    return /* @__PURE__ */ React.createElement(
      "select",
      {
        value: car.mech || "",
        onChange: (e) => onChange(e.target.value),
        disabled: b.status === "done" || b.status === "cancelled",
        "aria-label": "Mekanik untuk " + car.plate,
        style: Object.assign({}, inputBase, { minHeight: 44, fontSize: 15, width: "100%", maxWidth: 240, borderColor: car.mech ? LINE : accent })
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 belum ditugaskan \u2014"),
      MECHANICS.map((m) => /* @__PURE__ */ React.createElement("option", { key: m.id, value: m.name, disabled: busyElsewhere(m.name) }, m.name, busyElsewhere(m.name) ? " (sibuk di jam ini)" : ""))
    );
  }
  function BookingCard({ b, accent, onChange }) {
    const [codeInput, setCodeInput] = useState("");
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");
    const [resDay, setResDay] = useState(0);
    const [resSlot, setResSlot] = useState("");
    const [showAudit, setShowAudit] = useState(false);
    const canAdvance = NEXT_ACTION[b.status];
    const total = b.cars.length;
    const done = carsDone(b);
    const days = bookableDays();
    const run = (result, okText) => {
      if (!result || result.ok === false) {
        setErr(result && result.error || "Aksi gagal.");
        setMsg("");
        return false;
      }
      setErr("");
      setMsg(okText || "");
      onChange();
      return true;
    };
    const verify = () => {
      if (run(checkInBooking(b.id, codeInput, ACTOR), "Check-in terverifikasi, status menjadi Tiba.")) setCodeInput("");
    };
    const cancel = () => {
      const reason = window.prompt("Alasan pembatalan (wajib diisi untuk audit):", "");
      if (reason === null) return;
      if (!String(reason).trim()) {
        setErr("Alasan pembatalan wajib diisi.");
        return;
      }
      run(closeBooking(b.id, "cancelled", String(reason).trim(), ACTOR), "Booking dibatalkan.");
    };
    const noShow = () => {
      const reason = window.prompt("Catatan tidak datang (opsional):", "Tidak datang sesuai jadwal");
      if (reason === null) return;
      run(closeBooking(b.id, "no_show", String(reason).trim() || "Tidak datang", ACTOR), "Booking ditandai tidak datang; slot dilepas.");
    };
    const archive = () => {
      if (!window.confirm("Arsipkan booking " + b.id + "? Riwayat tetap tersimpan dan bisa dipulihkan.")) return;
      run(archiveBooking(b.id, ACTOR), "Booking diarsipkan.");
    };
    const applyReschedule = () => {
      if (!resSlot) {
        setErr("Pilih jam baru dulu.");
        return;
      }
      const day = days[resDay] || days[0];
      if (run(rescheduleBooking(b.id, day.iso, resSlot, ACTOR), "Jadwal dipindah ke " + day.full + " \xB7 " + resSlot + ".")) setResSlot("");
    };
    const editable = b.status === "confirmed" || b.status === "arrived" || b.status === "in_progress";
    return /* @__PURE__ */ React.createElement("div", { style: { background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, minWidth: 0, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 18, fontWeight: 800, letterSpacing: 1 } }, b.id), /* @__PURE__ */ React.createElement(StatusChip, { status: b.status }), b.sample ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: GRAY, border: "1px solid " + LINE, borderRadius: 999, padding: "3px 8px" } }, "CONTOH") : null, b.source === "walkin" ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: TONE.violet.fg, background: TONE.violet.bg, borderRadius: 999, padding: "3px 8px" } }, "WALK-IN") : null, isUnassigned(b) ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: TONE.amber.fg, background: TONE.amber.bg, borderRadius: 999, padding: "3px 8px" } }, "MEKANIK BELUM LENGKAP") : null), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: MUTED } }, "Dibuat ", fmtDateID(b.createdAt), " WIB")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRAY, fontWeight: 700 } }, "Jadwal servis"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700 } }, b.dayFull, " \xB7 ", b.slot), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, b.wait === "tunggu" ? "Menunggu di bengkel" : "Mobil ditinggal", " \xB7 ", total, " mobil \xB7 ", done, "/", total, " selesai")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRAY, fontWeight: 700 } }, "Kontak"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700 } }, b.role === "driver" ? "Pengantar" : "Pemilik", " \xB7 ", b.phone), b.ownerPhone ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Pemilik (persetujuan biaya): ", b.ownerPhone) : null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, b.remindOn ? "Pengingat servis: aktif" : "Pengingat servis: mati", " \xB7 ", b.promoOn ? "Promo: boleh" : "Promo: tidak"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, b.cars.map((c, i) => /* @__PURE__ */ React.createElement("div", { key: c.plate + i, style: { display: "flex", flexDirection: "column", gap: 8, background: BG, borderRadius: 10, padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 800, textDecoration: c.done ? "line-through" : "none", color: c.done ? GRAY : INK } }, c.plate), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: GRAY } }, " \xB7 ", c.model)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 700 } }, c.svc)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(
      MechSelect,
      {
        car: c,
        b,
        accent,
        onChange: (name) => run(assignMechanic(b.id, i, name, ACTOR), name ? "Mekanik " + c.plate + ": " + name : "Penugasan " + c.plate + " dilepas.")
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => run(setCarDone(b.id, i, !c.done, ACTOR), c.done ? "Progres " + c.plate + " dibatalkan." : c.plate + " ditandai selesai."),
        disabled: b.status === "done" || b.status === "cancelled",
        style: { minHeight: 44, padding: "0 14px", borderRadius: 10, border: "1.5px solid " + (c.done ? GREEN : LINE), background: c.done ? TONE.green.bg : "#FFFFFF", color: c.done ? TONE.green.fg : INK, fontSize: 13, fontWeight: 800, cursor: "pointer" }
      },
      c.done ? "Selesai \u2713" : "Tandai selesai"
    ))))), b.note ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: GRAY, background: "#FFFFFF", border: "1px dashed " + MUTED, borderRadius: 10, padding: "8px 12px" } }, "Catatan: ", b.note) : null, (b.status === "cancelled" || b.status === "no_show") && b.closedReason ? /* @__PURE__ */ React.createElement(Notice, null, "Alasan: ", b.closedReason) : null, b.status === "confirmed" ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, padding: 12, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 700 } }, "Verifikasi kedatangan (kode check-in dari pelanggan)"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" } }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        inputMode: "numeric",
        maxLength: 4,
        placeholder: "4 angka",
        value: codeInput,
        onChange: (e) => {
          setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 4));
          setErr("");
        },
        onKeyDown: (e) => {
          if (e.key === "Enter") verify();
        },
        style: Object.assign({}, inputBase, { width: 110, textAlign: "center", letterSpacing: 6, fontSize: 18, fontWeight: 700 })
      }
    ), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: verify, style: btnPrimary(accent) }, "Verifikasi & catat tiba"), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          setCodeInput(b.checkinCode);
          setMsg("Kode demo ditampilkan (bantuan prototipe).");
        },
        style: { minHeight: 44, padding: "0 8px", border: "none", background: "transparent", color: MUTED, fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }
      },
      "lihat kode (demo)"
    ))) : null, editable ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 700 } }, "Ubah jadwal"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" } }, /* @__PURE__ */ React.createElement("select", { value: resDay, onChange: (e) => {
      setResDay(parseInt(e.target.value, 10));
      setResSlot("");
    }, style: Object.assign({}, inputBase) }, days.map((d, i) => /* @__PURE__ */ React.createElement("option", { key: d.iso, value: i }, d.full))), /* @__PURE__ */ React.createElement("select", { value: resSlot, onChange: (e) => setResSlot(e.target.value), style: Object.assign({}, inputBase) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 pilih jam \u2014"), SLOT_TEMPLATE.map((sl) => {
      const ok = slotOk((days[resDay] || {}).iso, sl.t, "", b.cars.length, b.id);
      return /* @__PURE__ */ React.createElement("option", { key: sl.t, value: sl.t, disabled: !ok }, sl.t, ok ? "" : " (penuh)");
    })), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: applyReschedule, style: btnGhost, disabled: !resSlot }, "Pindahkan"))) : null, msg ? /* @__PURE__ */ React.createElement(Notice, { kind: "ok" }, msg) : null, err ? /* @__PURE__ */ React.createElement(Notice, { kind: "error" }, err) : null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" } }, canAdvance ? /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => run(updateBookingStatus(b.id, canAdvance.to, ACTOR), "Status: " + statusLabel(canAdvance.to) + "."),
        style: btnPrimary(accent)
      },
      canAdvance.label
    ) : null, isUnassigned(b) && b.status !== "done" && b.status !== "cancelled" ? /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => run(autoAssignMechanics(b.id, ACTOR), "Mekanik dibagikan otomatis."), style: btnGhost }, "Tugaskan otomatis") : null, b.status === "confirmed" || b.status === "arrived" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: cancel, style: btnGhost }, "Batalkan\u2026"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: noShow, style: btnGhost }, "Tidak datang\u2026")) : null, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: archive, style: Object.assign({}, btnDanger, { marginLeft: "auto" }) }, "Arsipkan")), b.audit.length > 0 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setShowAudit(!showAudit),
        style: { alignSelf: "flex-start", minHeight: 44, padding: "0 4px", border: "none", background: "transparent", color: GRAY, fontSize: 12, fontWeight: 700, cursor: "pointer" }
      },
      showAudit ? "Sembunyikan riwayat" : "Riwayat perubahan (" + b.audit.length + ")"
    ), showAudit ? b.audit.slice(0, 12).map((a, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { fontSize: 12, color: GRAY, lineHeight: 1.5 } }, /* @__PURE__ */ React.createElement("b", { style: { color: INK } }, a.action), " \xB7 ", fmtDateID(a.at), " \xB7 ", a.actor, a.note ? " \xB7 " + a.note : "")) : null) : null);
  }
  function WalkInForm({ accent, onCreated }) {
    const [open, setOpen] = useState(false);
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("owner");
    const [ownerPhone, setOwnerPhone] = useState("");
    const [plate, setPlate] = useState("");
    const [model, setModel] = useState("");
    const [svcId, setSvcId] = useState(SERVICE_CATALOG[0].id);
    const [dayIdx, setDayIdx] = useState(0);
    const [slot, setSlot] = useState("");
    const [err, setErr] = useState("");
    const days = bookableDays();
    const reset = () => {
      setPhone("");
      setRole("owner");
      setOwnerPhone("");
      setPlate("");
      setModel("");
      setSvcId(SERVICE_CATALOG[0].id);
      setDayIdx(0);
      setSlot("");
      setErr("");
    };
    const submit = () => {
      const day = days[dayIdx] || days[0];
      const svc = SERVICE_CATALOG.find((x) => x.id === svcId) || SERVICE_CATALOG[0];
      if (normPhone(phone).length < 9) {
        setErr("Nomor HP pelanggan minimal 9 digit.");
        return;
      }
      if (role === "driver" && normPhone(ownerPhone).length < 9) {
        setErr("Nomor HP pemilik wajib untuk peran pengantar.");
        return;
      }
      if (!plate.trim()) {
        setErr("Plat nomor wajib diisi.");
        return;
      }
      if (!slot) {
        setErr("Pilih jam kedatangan.");
        return;
      }
      if (!slotOk(day.iso, slot, "", 1)) {
        setErr("Slot " + slot + " sudah penuh untuk tanggal itu.");
        return;
      }
      const booking = saveBooking({
        phone: phone.trim(),
        role,
        ownerPhone: role === "driver" ? ownerPhone.trim() : "",
        cars: [{ plate: plate.trim().toUpperCase(), model: model.trim(), svc: svc.name, mech: "", done: false }],
        note: "Walk-in didaftarkan admin",
        wait: "tunggu",
        dateISO: day.iso,
        dayFull: day.full,
        slot,
        mech: AUTO_MECH,
        remindOn: false,
        promoOn: false,
        source: "walkin",
        status: "arrived",
        actor: ACTOR
      });
      upsertVehicle(phone, { plate: plate.trim().toUpperCase(), model: model.trim() });
      reset();
      setOpen(false);
      onCreated("Walk-in " + booking.id + " ditambahkan (status Tiba).");
    };
    if (!open) {
      return /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setOpen(true), style: btnGhost }, "+ Daftarkan walk-in");
    }
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12, padding: 16, background: "#FFFFFF", border: "2px solid " + INK, borderRadius: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800 } }, "Pelanggan datang langsung (walk-in)"), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          setOpen(false);
          reset();
        },
        style: { border: "none", background: "transparent", color: GRAY, fontSize: 13, fontWeight: 700, cursor: "pointer" }
      },
      "Tutup"
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "wi-phone", style: { fontSize: 12, fontWeight: 700, color: GRAY } }, "Nomor WhatsApp"), /* @__PURE__ */ React.createElement("input", { id: "wi-phone", type: "tel", value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "08xx xxxx xxxx", style: inputBase })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "wi-plate", style: { fontSize: 12, fontWeight: 700, color: GRAY } }, "Plat nomor"), /* @__PURE__ */ React.createElement("input", { id: "wi-plate", type: "text", value: plate, onChange: (e) => setPlate(e.target.value.toUpperCase()), placeholder: "B 1234 XYZ", style: inputBase })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "wi-model", style: { fontSize: 12, fontWeight: 700, color: GRAY } }, "Tipe / tahun"), /* @__PURE__ */ React.createElement("input", { id: "wi-model", type: "text", value: model, onChange: (e) => setModel(e.target.value), placeholder: "Toyota Avanza 2018", style: inputBase })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "wi-svc", style: { fontSize: 12, fontWeight: 700, color: GRAY } }, "Servis"), /* @__PURE__ */ React.createElement("select", { id: "wi-svc", value: svcId, onChange: (e) => setSvcId(e.target.value), style: inputBase }, SERVICE_CATALOG.map((sv) => /* @__PURE__ */ React.createElement("option", { key: sv.id, value: sv.id }, sv.name)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "wi-day", style: { fontSize: 12, fontWeight: 700, color: GRAY } }, "Tanggal"), /* @__PURE__ */ React.createElement("select", { id: "wi-day", value: dayIdx, onChange: (e) => {
      setDayIdx(parseInt(e.target.value, 10));
      setSlot("");
    }, style: inputBase }, days.map((d, i) => /* @__PURE__ */ React.createElement("option", { key: d.iso, value: i }, d.full)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, /* @__PURE__ */ React.createElement("label", { htmlFor: "wi-slot", style: { fontSize: 12, fontWeight: 700, color: GRAY } }, "Jam"), /* @__PURE__ */ React.createElement("select", { id: "wi-slot", value: slot, onChange: (e) => setSlot(e.target.value), style: inputBase }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 pilih jam \u2014"), SLOT_TEMPLATE.map((sl) => {
      const ok = slotOk((days[dayIdx] || {}).iso, sl.t, "", 1);
      return /* @__PURE__ */ React.createElement("option", { key: sl.t, value: sl.t, disabled: !ok }, sl.t, ok ? "" : " (penuh)");
    })))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setRole("owner"),
        style: Object.assign({}, btnGhost, { border: "2px solid " + (role === "owner" ? INK : LINE) })
      },
      "Pemilik"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setRole("driver"),
        style: Object.assign({}, btnGhost, { border: "2px solid " + (role === "driver" ? INK : LINE) })
      },
      "Pengantar"
    ), role === "driver" ? /* @__PURE__ */ React.createElement("input", { type: "tel", value: ownerPhone, onChange: (e) => setOwnerPhone(e.target.value), placeholder: "WA pemilik", style: Object.assign({}, inputBase, { maxWidth: 200 }) }) : null), err ? /* @__PURE__ */ React.createElement(Notice, { kind: "error" }, err) : null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: submit, style: btnPrimary(accent) }, "Simpan walk-in"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      reset();
      setOpen(false);
    }, style: btnGhost }, "Batal")));
  }
  function Admin() {
    const accent = useAccent();
    const [bookings, setBookings] = useState(() => loadBookings());
    const [archived, setArchived] = useState(() => loadArchivedBookings());
    const [filter, setFilter] = useState("today");
    const [notice, setNotice] = useState("");
    const refresh = () => {
      setBookings(loadBookings());
      setArchived(loadArchivedBookings());
    };
    const today = todayISO();
    const todays = bookings.filter((b) => b.dateISO === today);
    const active = bookings.filter((b) => holdsSlot(b.status));
    const stats = {
      today: todays.filter((b) => holdsSlot(b.status)).length,
      waiting: bookings.filter((b) => b.status === "confirmed").length,
      working: bookings.filter((b) => b.status === "in_progress").length,
      unassigned: active.filter(isUnassigned).length
    };
    const filtered = (() => {
      if (filter === "today") return todays.slice().sort((a, b) => String(a.slot).localeCompare(String(b.slot)));
      if (filter === "archived") return archived;
      if (filter === "all") return bookings;
      return bookings.filter((b) => b.status === filter);
    })();
    const tabs = [
      { id: "today", label: "Hari ini (" + stats.today + ")" },
      { id: "all", label: "Semua (" + bookings.length + ")" },
      { id: "confirmed", label: "Menunggu tiba (" + stats.waiting + ")" },
      { id: "arrived", label: "Tiba (" + bookings.filter((b) => b.status === "arrived").length + ")" },
      { id: "in_progress", label: "Dikerjakan (" + bookings.filter((b) => b.status === "in_progress").length + ")" },
      { id: "done", label: "Selesai (" + bookings.filter((b) => b.status === "done").length + ")" },
      { id: "cancelled", label: "Dibatalkan (" + bookings.filter((b) => b.status === "cancelled").length + ")" },
      { id: "no_show", label: "Tidak datang (" + bookings.filter((b) => b.status === "no_show").length + ")" },
      { id: "archived", label: "Arsip (" + archived.length + ")" }
    ];
    const pill = (on) => ({
      minHeight: 44,
      padding: "0 14px",
      borderRadius: 22,
      border: "2px solid " + (on ? INK : LINE),
      background: on ? accent : "#FFFFFF",
      color: INK,
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer"
    });
    const hasSample = bookings.some((b) => b.sample);
    return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100dvh", background: BG, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK, boxSizing: "border-box" } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 920, margin: "0 auto", padding: "24px 20px", paddingBottom: "calc(48px + env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 44, height: 44, borderRadius: 12, background: accent, color: INK, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" } }, /* @__PURE__ */ React.createElement(WrenchIcon, null)), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800 } }, "[Nama Bengkel] \xB7 Panel Admin"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Operasional harian: check-in, mekanik, jadwal")), /* @__PURE__ */ React.createElement("a", { href: "mech.html", style: { fontSize: 13, fontWeight: 800, color: INK, textDecoration: "none" } }, "Portal mekanik"), /* @__PURE__ */ React.createElement("a", { href: "index.html", style: { fontSize: 13, fontWeight: 800, color: INK, textDecoration: "none" } }, "\u2190 Situs pelanggan")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(StatCard, { label: "Servis hari ini", value: stats.today, sub: dayInfo(today) ? dayInfo(today).fullLong : today, accent }), /* @__PURE__ */ React.createElement(StatCard, { label: "Menunggu tiba", value: stats.waiting }), /* @__PURE__ */ React.createElement(StatCard, { label: "Sedang dikerjakan", value: stats.working }), /* @__PURE__ */ React.createElement(StatCard, { label: "Mekanik belum lengkap", value: stats.unassigned })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" } }, /* @__PURE__ */ React.createElement(WalkInForm, { accent, onCreated: (text) => {
      setNotice(text);
      refresh();
    } }), hasSample ? /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      const r = clearSampleData();
      setNotice(r.removed + " data contoh dihapus.");
      refresh();
    }, style: btnGhost }, "Hapus data contoh") : /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      const r = seedSampleData();
      setNotice(r.created ? r.created + " data contoh dimuat (bertanda CONTOH)." : "Data contoh sudah ada.");
      refresh();
    }, style: btnGhost }, "Muat data contoh (demo)")), notice ? /* @__PURE__ */ React.createElement(Notice, { kind: "ok" }, notice) : null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, tabs.map((t) => /* @__PURE__ */ React.createElement("button", { key: t.id, type: "button", onClick: () => setFilter(t.id), style: pill(filter === t.id) }, t.label))), filtered.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 24px", background: "#FFFFFF", border: "1px dashed " + MUTED, borderRadius: 16, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 800 } }, filter === "archived" ? "Arsip masih kosong" : "Tidak ada booking di sini"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: GRAY, lineHeight: 1.6, maxWidth: 440 } }, "Booking dari ", /* @__PURE__ */ React.createElement("a", { href: "index.html", style: { fontWeight: 700 } }, "situs pelanggan"), " atau walk-in yang kamu daftarkan akan muncul di sini. Data contoh bisa dimuat untuk melihat tata letaknya.")) : filter === "archived" ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, filtered.map((b) => /* @__PURE__ */ React.createElement("div", { key: b.id, style: { background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 17, fontWeight: 800, letterSpacing: 1 } }, b.id), /* @__PURE__ */ React.createElement(StatusChip, { status: b.status }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: MUTED } }, b.dayFull, " \xB7 ", b.slot)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: MUTED } }, "Diarsipkan ", b.archivedAt ? fmtDateID(b.archivedAt) : "")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, b.phone, " \xB7 ", b.cars.map((c) => c.plate).join(", ")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      restoreBooking(b.id, ACTOR);
      setNotice(b.id + " dipulihkan dari arsip.");
      refresh();
    }, style: btnGhost }, "Pulihkan"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      if (!window.confirm("Hapus permanen " + b.id + "? Tindakan ini tidak bisa dibatalkan.")) return;
      const r = purgeBooking(b.id, ACTOR);
      setNotice(r.ok ? b.id + " dihapus permanen." : r.error);
      refresh();
    }, style: btnDanger }, "Hapus permanen"))))) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, filtered.map((b) => /* @__PURE__ */ React.createElement(BookingCard, { key: b.id, b, accent, onChange: () => {
      setNotice("");
      refresh();
    } }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: MUTED, textAlign: "center" } }, "Semua perubahan tercatat di riwayat booking (audit trail). Data tersimpan di browser ini (localStorage); untuk produksi, ganti lapisan data di ", /* @__PURE__ */ React.createElement("b", null, "booking.js"), " dengan API backend.")));
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(Admin, null));
})();
