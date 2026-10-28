(() => {
  const { useState } = React;
  const INK = "#12161C";
  const GRAY = "#5A6270";
  const LINE = "#DDE1E7";
  const MUTED = "#8791A0";
  const BG = "#F2F3F5";
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
  const WrenchIcon = () => /* @__PURE__ */ React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" }));
  const CheckIcon = () => /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M3 8.5l3.2 3L13 4.5", stroke: "currentColor", strokeWidth: "2.4", strokeLinecap: "round", strokeLinejoin: "round" }));
  function StatusChip({ status }) {
    const meta = BOOKING_STATUS[status] || { label: status, tone: "blue" };
    const t = TONE[meta.tone] || TONE.blue;
    return /* @__PURE__ */ React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: t.bg, color: t.fg, fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" } }, status === "done" ? /* @__PURE__ */ React.createElement(CheckIcon, null) : null, meta.label);
  }
  function StatCard({ label, value, sub }) {
    return /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 140px", minWidth: 130, background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 14, padding: "14px 16px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRAY, fontWeight: 700 } }, label), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 26, fontWeight: 800, marginTop: 2 } }, value), sub ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRAY, marginTop: 2 } }, sub) : null);
  }
  function BookingCard({ b, onAdvance, onCancel, onDelete, accent }) {
    const canAdvance = NEXT_ACTION[b.status];
    return /* @__PURE__ */ React.createElement("div", { style: { background: "#FFFFFF", border: "1px solid " + LINE, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 18, fontWeight: 800, letterSpacing: 1 } }, b.id), /* @__PURE__ */ React.createElement(StatusChip, { status: b.status })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: MUTED } }, fmtDateID(b.createdAt), " WIB")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRAY, fontWeight: 700 } }, "Jadwal"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700 } }, b.dayFull, " \xB7 ", b.slot), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, b.wait === "tunggu" ? "Menunggu di bengkel" : "Mobil ditinggal", " \xB7 Mekanik: ", b.mech)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: GRAY, fontWeight: 700 } }, "Kontak"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700 } }, b.role === "driver" ? "Pengantar" : "Pemilik", " \xB7 ", b.phone), b.ownerPhone ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Pemilik (persetujuan biaya): ", b.ownerPhone) : null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, b.remindOn ? "Pengingat servis: aktif" : "Pengingat servis: mati", " \xB7 ", b.promoOn ? "Promo: boleh" : "Promo: tidak"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, b.cars.map((c, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, background: BG, borderRadius: 10, padding: "8px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, fontWeight: 800 } }, c.plate), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: GRAY } }, " \xB7 ", c.model)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 700, textAlign: "right" } }, c.svc)))), b.note ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.5, color: GRAY, background: "#FFFFFF", border: "1px dashed " + MUTED, borderRadius: 10, padding: "8px 12px" } }, "Catatan: ", b.note) : null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, canAdvance ? /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => onAdvance(b.id, canAdvance.to),
        style: { height: 44, padding: "0 16px", borderRadius: 10, border: "none", background: accent, color: INK, fontSize: 14, fontWeight: 800, cursor: "pointer" }
      },
      canAdvance.label
    ) : null, b.status === "confirmed" || b.status === "arrived" ? /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => onCancel(b.id),
        style: { height: 44, padding: "0 16px", borderRadius: 10, border: "1.5px solid " + MUTED, background: "#FFFFFF", color: INK, fontSize: 14, fontWeight: 700, cursor: "pointer" }
      },
      "Batalkan"
    ) : null, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => onDelete(b.id),
        style: { height: 44, padding: "0 14px", marginLeft: "auto", borderRadius: 10, border: "1.5px solid " + LINE, background: "#FFFFFF", color: "#B42318", fontSize: 13, fontWeight: 700, cursor: "pointer" }
      },
      "Hapus"
    )));
  }
  function Admin() {
    const accent = useAccent();
    const [bookings, setBookings] = useState(() => loadBookings());
    const [filter, setFilter] = useState("all");
    const refresh = () => setBookings(loadBookings());
    const isToday = (b) => {
      const d = new Date(b.createdAt);
      const t = /* @__PURE__ */ new Date();
      return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
    };
    const stats = {
      today: bookings.filter(isToday).length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      in_progress: bookings.filter((b) => b.status === "in_progress").length,
      done: bookings.filter((b) => b.status === "done").length
    };
    const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
    const tabs = [
      { id: "all", label: "Semua (" + bookings.length + ")" },
      { id: "confirmed", label: "Konfirmasi (" + stats.confirmed + ")" },
      { id: "in_progress", label: "Dikerjakan (" + stats.in_progress + ")" },
      { id: "done", label: "Selesai (" + stats.done + ")" },
      { id: "cancelled", label: "Dibatalkan (" + bookings.filter((b) => b.status === "cancelled").length + ")" }
    ];
    return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: INK, boxSizing: "border-box" } }, /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 880, margin: "0 auto", padding: "24px 20px 48px", display: "flex", flexDirection: "column", gap: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 44, height: 44, borderRadius: 12, background: accent, color: INK, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" } }, /* @__PURE__ */ React.createElement(WrenchIcon, null)), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800 } }, "[Nama Bengkel] \xB7 Panel Admin"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: GRAY } }, "Kelola booking servis masuk")), /* @__PURE__ */ React.createElement("a", { href: "index.html", style: { fontSize: 13, fontWeight: 800, color: INK, textDecoration: "none" } }, "\u2190 Situs pelanggan")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(StatCard, { label: "Booking hari ini", value: stats.today }), /* @__PURE__ */ React.createElement(StatCard, { label: "Menunggu konfirmasi tiba", value: stats.confirmed }), /* @__PURE__ */ React.createElement(StatCard, { label: "Sedang dikerjakan", value: stats.in_progress }), /* @__PURE__ */ React.createElement(StatCard, { label: "Selesai", value: stats.done })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, tabs.map((t) => {
      const on = filter === t.id;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: t.id,
          type: "button",
          onClick: () => setFilter(t.id),
          style: { height: 40, padding: "0 14px", borderRadius: 20, border: "2px solid " + (on ? INK : LINE), background: on ? accent : "#FFFFFF", color: INK, fontSize: 13, fontWeight: 700, cursor: "pointer" }
        },
        t.label
      );
    })), filtered.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "48px 24px", background: "#FFFFFF", border: "1px dashed " + MUTED, borderRadius: 16, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 800 } }, "Belum ada booking di sini"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: GRAY, lineHeight: 1.6, maxWidth: 420 } }, "Booking yang pelanggan buat di situs pelanggan akan muncul otomatis di panel ini. Coba buat satu booking dari ", /* @__PURE__ */ React.createElement("a", { href: "index.html", style: { fontWeight: 700 } }, "situs pelanggan"), ", atau muat data contoh untuk melihat tata letaknya."), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          seedSampleBookings();
          refresh();
        },
        style: { height: 48, padding: "0 20px", borderRadius: 12, border: "none", background: accent, color: INK, fontSize: 14, fontWeight: 800, cursor: "pointer" }
      },
      "Muat data contoh"
    )) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } }, filtered.map((b) => /* @__PURE__ */ React.createElement(
      BookingCard,
      {
        key: b.id,
        b,
        accent,
        onAdvance: (id, to) => {
          updateBookingStatus(id, to);
          refresh();
        },
        onCancel: (id) => {
          if (confirm("Batalkan booking " + id + "?")) {
            updateBookingStatus(id, "cancelled");
            refresh();
          }
        },
        onDelete: (id) => {
          if (confirm("Hapus booking " + id + "? Tindakan ini tidak bisa dibatalkan.")) {
            deleteBooking(id);
            refresh();
          }
        }
      }
    ))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: MUTED, textAlign: "center" } }, "Data tersimpan di browser ini (localStorage). Untuk produksi, ganti lapisan data di ", /* @__PURE__ */ React.createElement("b", null, "booking.js"), " dengan API backend.")));
  }
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(Admin, null));
})();
