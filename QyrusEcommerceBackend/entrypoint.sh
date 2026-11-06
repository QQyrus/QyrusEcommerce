#!/bin/sh
set -e

uvicorn app:app --host 0.0.0.0 --port "${PORT}" &
APP_PID=$!

# Wait for the app (and its startup table creation) to be ready before seeding.
python3 - <<PY
import time
import urllib.request

for _ in range(30):
    try:
        urllib.request.urlopen("http://localhost:${PORT}/get-product-categories/", timeout=2)
        break
    except Exception:
        time.sleep(2)
PY

python3 scripts/populate_db.py || echo "populate_db.py failed, continuing without seed data"

wait "$APP_PID"
