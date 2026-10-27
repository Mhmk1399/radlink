#!/bin/sh
set -eu

APP_INTERNAL_URL="${APP_INTERNAL_URL:-http://app:3000}"
CRON_SCHEDULE="${AUTO_PAGE_ASSIGNMENT_CRON_SCHEDULE:-0 0 * * *}"
USER_BULK_UPDATE_CRON_SCHEDULE="${USER_BULK_UPDATE_CRON_SCHEDULE:-* * * * *}"
SECRET="${RADLINK_CRON_SECRET:-${CRON_SECRET:-}}"

if [ -z "$SECRET" ]; then
  echo "[AUTO_24H_PAGE_ASSIGNMENT] RADLINK_CRON_SECRET or CRON_SECRET is required." >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  apk add --no-cache curl >/dev/null
fi

cat > /etc/crontabs/root <<EOF
$CRON_SCHEDULE curl -fsS -X POST -H "Authorization: Bearer $SECRET" "$APP_INTERNAL_URL/api/cron/auto-assign-pages"
$USER_BULK_UPDATE_CRON_SCHEDULE curl -fsS -X POST -H "Authorization: Bearer $SECRET" "$APP_INTERNAL_URL/api/cron/process-user-bulk-updates"
EOF

echo "[AUTO_24H_PAGE_ASSIGNMENT] cron scheduled: $CRON_SCHEDULE"
echo "[USER_BULK_UPDATE] cron scheduled: $USER_BULK_UPDATE_CRON_SCHEDULE"
exec crond -f -l 8
