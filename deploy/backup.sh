#!/usr/bin/env bash
# Daily backup of the database and uploaded photos.
# Usage: deploy/backup.sh            (run from the project folder)
# Optional: BACKUP_EXTRA=/mnt/usb/kidztime deploy/backup.sh   (also copies to a USB drive)
set -euo pipefail
DATA="${DATA_DIR:-./data}"; OUT="${BACKUP_DIR:-./backups}"; KEEP_DAYS="${KEEP_DAYS:-30}"
STAMP="$(date +%Y%m%d-%H%M)"; TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"
# SQLite's own backup API gives a consistent copy even while the website is running.
python3 - "$DATA/kidztime.db" "$TMP/kidztime.db" <<'PY'
import sqlite3, sys
src = sqlite3.connect(sys.argv[1]); dst = sqlite3.connect(sys.argv[2]); src.backup(dst)
ok = dst.execute("PRAGMA integrity_check").fetchone()[0]
if ok != "ok": sys.exit("Backup failed integrity check: " + ok)
PY
[ -d "$DATA/media" ] && cp -r "$DATA/media" "$TMP/media" || mkdir -p "$TMP/media"
ARCHIVE="$OUT/kidztime-$STAMP.tar.gz"
tar -czf "$ARCHIVE" -C "$TMP" kidztime.db media
if [ -n "${BACKUP_EXTRA:-}" ]; then mkdir -p "$BACKUP_EXTRA" && cp "$ARCHIVE" "$BACKUP_EXTRA/"; fi
find "$OUT" -name 'kidztime-*.tar.gz' -mtime +"$KEEP_DAYS" -delete
[ -n "${BACKUP_EXTRA:-}" ] && find "$BACKUP_EXTRA" -name 'kidztime-*.tar.gz' -mtime +"$KEEP_DAYS" -delete || true
echo "$(date -Is) backup ok: $ARCHIVE"
