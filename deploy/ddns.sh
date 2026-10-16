#!/usr/bin/env bash
# Keeps the GoDaddy "A" record pointing at your home IP when the ISP changes it.
# Only needed if your IP is public but NOT static. Requires GoDaddy API access (test it first, see DEPLOYMENT.md).
# Config file /etc/kidztime-ddns.env (chmod 600):  GODADDY_KEY=...  GODADDY_SECRET=...  DOMAIN=kidztimeschool.com
set -euo pipefail
source /etc/kidztime-ddns.env
STATE="${STATE_FILE:-/var/tmp/kidztime-ddns.ip}"
IP="$(curl -fsS --max-time 15 https://api.ipify.org)"
[[ "$IP" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}$ ]] || { echo "Could not read public IP"; exit 1; }
[ "$IP" = "$(cat "$STATE" 2>/dev/null || true)" ] && exit 0
for NAME in @ www; do
  curl -fsS --max-time 20 -X PUT "https://api.godaddy.com/v1/domains/$DOMAIN/records/A/$NAME" \
    -H "Authorization: sso-key $GODADDY_KEY:$GODADDY_SECRET" -H "Content-Type: application/json" \
    -d "[{\"data\":\"$IP\",\"ttl\":600}]" >/dev/null
done
echo "$IP" > "$STATE"; echo "$(date -Is) DNS updated to $IP"
