#!/bin/bash
set -euo pipefail

readonly PORT="${1:-8080}"

cd "$(dirname "${BASH_SOURCE[0]}")"
echo "SalahSync — http://localhost:${PORT}"
exec python3 -m http.server "${PORT}"
