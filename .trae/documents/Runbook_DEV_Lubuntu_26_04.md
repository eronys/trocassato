# Runbook DEV — Lubuntu 26.04 LTS

Este runbook executa o MVP em uma única VM (frontend + backend + SQLite). O Bitcoin Core regtest fica opcional (simulação via admin funciona sem regtest).

## 1) Instalar dependências

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip git curl
```

Node.js (escolha uma forma e mantenha a VM apenas para DEV):

```bash
sudo apt install -y nodejs npm
```

Opcional (console de banco para admin):

```bash
sudo apt install -y sqlitebrowser
```

## 2) Backend

```bash
cd /caminho/para/trocasato
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r api/requirements.txt
cp api/.env.example api/.env
```

Edite `api/.env`:

- `AUTH_JWT_SECRET`: defina um segredo forte para DEV
- `DATABASE_PATH`: caminho do SQLite (ex.: `./data/trocasato.db`)
- Senha do admin (escolha 1):
  - `ADMIN_PASSWORD=123`
- Senha do admin (escolha 2):
  - Gere o hash: `python api/scripts/hash_password.py "sua-senha"`
  - Preencha `ADMIN_PASSWORD_HASH` com o hash gerado e deixe `ADMIN_PASSWORD` vazio

Suba a API:

```bash
uvicorn api.app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 3) Frontend

Em outro terminal:

```bash
cd /caminho/para/trocasato
cp .env.example .env
```

Edite `.env`:

- `VITE_API_BASE_URL=http://127.0.0.1:8000`

Suba o Vite:

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

## 4) Fluxo rápido (MVP)

1) Acesse `http://<ip-da-vm>:5173/admin/login`
2) Faça login com `admin` e a senha definida no `.env`
3) Em `Pessoas & Convites`, gere um convite e copie o link
4) Abra o link do convite (onboarding), finalize cadastro e defina senha
5) Faça login do usuário em `/login`
6) Use o admin para aprovar usuário e, se necessário, definir nível `STAR_2` para publicar itens
7) No perfil do usuário, publique um negócio e volte ao catálogo
8) No admin, use o `Simulador` para gerar transações e minerar blocos (confirmação lógica)
