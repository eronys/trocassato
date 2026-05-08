# Instalação (VM Lubuntu 26.04 LTS)

Este guia instala e executa o MVP **localmente** dentro de uma VM Lubuntu 26.04 LTS.

## 1. Requisitos mínimos

- VM Lubuntu 26.04 LTS
- 2 vCPU, 4 GB RAM (recomendado 8 GB), 20 GB de disco
- Acesso à internet (para baixar dependências)

## 2. Pacotes do sistema

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ca-certificates build-essential python3 python3-venv python3-pip sqlitebrowser
```

## 3. Node.js (frontend)

Recomendado: instalar Node via `nvm` para evitar versões antigas do `apt`.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
\[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

nvm install 20
nvm use 20
node -v
npm -v
```

## 4. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO_GITHUB> trocasato
cd trocasato
```

## 5. Variáveis de ambiente

### 5.1 Frontend

```bash
cp .env.example .env
```

Deixe `VITE_API_BASE_URL` vazio (recomendado no DEV). Assim o frontend usa `/api` com proxy do Vite.

### 5.2 Backend

```bash
cp api/.env.example api/.env
```

Edite `api/.env` e defina:

- `AUTH_JWT_SECRET`: um segredo forte
- `ADMIN_PASSWORD=123` (MVP) ou preencha `ADMIN_PASSWORD_HASH`
- `DATABASE_PATH`: recomendado `./data/trocasato.db`

## 6. Backend (API)

Crie e ative venv e instale dependências:

```bash
python3 -m venv .venv
source .venv/bin/activate

python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Suba o backend:

```bash
python -m uvicorn api.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Teste:

```bash
curl http://127.0.0.1:8000/health
```

## 7. Frontend (Usuário + Admin)

Em outro terminal:

```bash
cd trocasato
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Abra:

- `http://127.0.0.1:5173/`

## 8. Console SQL (Admin)

O banco é SQLite. Para visualizar tabelas e fazer operações:

- Abra o **DB Browser for SQLite** (`sqlitebrowser`)
- Selecione o arquivo configurado em `DATABASE_PATH` (por padrão `api/data/trocasato.db`)

