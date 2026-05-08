$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

if (!(Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
}

if (!(Test-Path "api\.env")) {
  Copy-Item "api\.env.example" "api\.env"
}

if (!(Test-Path ".venv")) {
  python -m venv .venv
}

& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt

Start-Process -WindowStyle Normal -FilePath "powershell" -ArgumentList "-NoProfile","-ExecutionPolicy","Bypass","-Command","cd '$root'; .\.venv\Scripts\python.exe -m uvicorn api.app.main:app --host 0.0.0.0 --port 8000 --reload"

npm install
npm run dev -- --host 0.0.0.0 --port 5173

