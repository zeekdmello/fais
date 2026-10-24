#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ -f .fais-node-path ]]; then export PATH="$(dirname "$(cat .fais-node-path)"):$PATH"; fi
echo 'Open http://127.0.0.1:4000 once Fais is ready. Keep this terminal open.'
npm start
