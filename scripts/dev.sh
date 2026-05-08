#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

if [[ ! -f ".env" ]]; then
  cp .env.example .env
fi

if [[ ! -f "api/.env" ]]; then
  cp api/.env.example api/.env
fi

python3 -m venv .venv
source .venv/bin/activate

python -m pip install --upgrade pip
python -m pip install -r requirements.txt

(python -m uvicorn api.app.main:app --host 0.0.0.0 --port 8000 --reload) &

npm install
npm run dev -- --host 0.0.0.0 --port 5173

