#!/bin/sh
set -eu

APP_INTERNAL_URL="${APP_INTERNAL_URL:-http://app:3000}"
CRON_SCHEDULE="${AUTO_PAGE_ASSIGNMENT_CRON_SCHEDULE:-0 0 * * *}"
SECRET="${RADLINK_CRON_SECRET:-${CRON_SECRET:-}}"

if [ -z "$SECRET" ]; then
  echo "[AUTO_24H_PAGE_ASSIGNMENT] RADLINK_CRON_SECRET or CRON_SECRET is required." >&2
  exit 1
fi

apk add --no-cache curl >/dev/null

cat > /etc/crontabs/root <<EOF
$CRON_SCHEDULE curl -fsS -X POST -H "Authorization: Bearer $SECRET" "$APP_INTERNAL_URL/api/cron/auto-assign-pages"
EOF

echo "[AUTO_24H_PAGE_ASSIGNMENT] cron scheduled: $CRON_SCHEDULE"
exec crond -f -l 8
