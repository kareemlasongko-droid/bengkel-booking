#!/bin/bash
# ============================================================
# tunnel-watchdog.sh
# Menjalankan Cloudflare quick tunnel ke localhost:8000 dengan:
#  - keep-alive: ping lewat URL publik tiap 25 detik
#    (mencegah koneksi idle diputus jaringan sandbox)
#  - auto-restart: setelah 3 ping gagal beruntun, tunnel
#    di-restart dan URL baru ditulis ke PUBLIC_URL.txt
# ============================================================
cd /home/user/bengkel-booking || exit 1
LOG=tunnel.log
TUNNEL_PID=""
now() { date '+%H:%M:%S'; }

start_tunnel() {
  : > "$LOG"
  ./cloudflared tunnel --url http://localhost:8000 --no-autoupdate --protocol http2 >> "$LOG" 2>&1 &
  TUNNEL_PID=$!
  local url=""
  for _ in $(seq 1 45); do
    url=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG" | head -1)
    [ -n "$url" ] && break
    sleep 1
  done
  if [ -z "$url" ]; then
    echo "WATCHDOG $(now): GAGAL memuat URL tunnel — cek $LOG"
    return 1
  fi
  echo "$url" > PUBLIC_URL.txt
  echo "WATCHDOG $(now): tunnel baru → $url (pid $TUNNEL_PID)"
  local code=""
  for _ in $(seq 1 12); do
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$url/" 2>/dev/null)
    [ "$code" = "200" ] && break
    sleep 8
  done
  if [ "$code" = "200" ]; then
    echo "WATCHDOG $(now): terverifikasi HTTP 200 — siap digunakan"
  else
    echo "WATCHDOG $(now): WARNING — belum 200 setelah menunggu (HTTP $code), tetap dipantau"
  fi
  return 0
}

start_tunnel || { sleep 30; start_tunnel || exit 1; }

FAILS=0
while true; do
  sleep 25
  url=$(cat PUBLIC_URL.txt)
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$url/" 2>/dev/null)
  if [ "$code" = "200" ]; then
    if [ "$FAILS" -gt 0 ]; then
      echo "WATCHDOG $(now): pulih — HTTP 200 kembali normal"
    fi
    FAILS=0
  else
    FAILS=$((FAILS + 1))
    echo "WATCHDOG $(now): ping gagal (HTTP $code) — kegagalan $FAILS/3"
    if [ "$FAILS" -ge 3 ]; then
      echo "WATCHDOG $(now): me-restart tunnel..."
      kill "$TUNNEL_PID" 2>/dev/null
      wait "$TUNNEL_PID" 2>/dev/null
      if start_tunnel; then
        FAILS=0
      else
        sleep 30
      fi
    fi
  fi
done
