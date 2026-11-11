#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
java -jar feiyi-guide.jar &
PID=$!
sleep 12
(open http://localhost:8081 2>/dev/null || xdg-open http://localhost:8081 2>/dev/null || true)
wait $PID
