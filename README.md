# TROCASSATO (MVP)

Marketplace com “KYC social” por convite, focado em confiança por reputação e simulação de fluxo (DEV) usando SQLite.

Este repositório contém:

- Código-fonte (frontend + backend)
- Documentação técnica e procedimentos de instalação
- Arquivos de configuração e exemplos de variáveis de ambiente

## Componentes

- Frontend (Usuário): rotas `/login`, `/catalogo`, `/negocio/:id`, `/perfil`, `/notificacoes`, `/convidar`, `/meus-negocios`
- Frontend (Admin): rotas `/admin/login`, `/admin`, `/admin/pessoas-convites`, `/admin/simulador`
- Backend (API): FastAPI + SQLite (arquivo `.db`) com autenticação por cookie `HttpOnly`. Integração modernizada com nós recentes do Bitcoin Core via RPC dicts (substituindo métodos obsoletos).

## Pré-requisitos

- Node.js 20+
- Python 3.10+
- Git
- (Opcional) DB Browser for SQLite para visualizar o banco

## Documentação (leitura e instalação)

- Visão geral: [docs/00_VISÃO_GERAL.md](docs/00_VISÃO_GERAL.md)
- Instalação Lubuntu 26.04: [docs/01_INSTALACAO_LUBUNTU_26_04.md](docs/01_INSTALACAO_LUBUNTU_26_04.md)
- Guia do usuário: [docs/02_GUIA_USUARIO.md](docs/02_GUIA_USUARIO.md)
- Guia do admin: [docs/03_GUIA_ADMIN.md](docs/03_GUIA_ADMIN.md)
- Troubleshooting: [docs/04_TROUBLESHOOTING.md](docs/04_TROUBLESHOOTING.md)
- Backup e restauração: [docs/05_BACKUP_RESTAURACAO.md](docs/05_BACKUP_RESTAURACAO.md)
- Segurança: [docs/06_SEGURANCA.md](docs/06_SEGURANCA.md)
- Versionamento GitHub: [docs/07_VERSIONAMENTO_GITHUB.md](docs/07_VERSIONAMENTO_GITHUB.md)

## Configuração do ambiente (DEV)

### 1) Frontend

Defina o proxy base apontando para o arquivo .env:

```bash
cp .env.example .env
```

Variáveis:

- `VITE_API_BASE_URL`:
  - `VITE_API_BASE_URL=/api` (recomendado): o frontend usa a rota proxy integrada do Vite para alcançar a API em `http://127.0.0.1:8000` sem erros 404 de catalog.
  - opcional: pode apontar para a API (ex.: `http://127.0.0.1:8000`)

### 2) Backend

Copie o exemplo:

```bash
cp api/.env.example api/.env
```

Variáveis:

- `APP_ENV`: `dev`
- `DATABASE_PATH`: caminho do SQLite (recomendado: `./data/trocasato.db`)
- `AUTH_JWT_SECRET`: obrigatório
- `AUTH_TOKEN_TTL_SECONDS`: opcional (default `86400`)
- `ADMIN_USERNAME`: default `admin`
- Senha do admin (escolha 1, mais simples no DEV): `ADMIN_PASSWORD=123`
- Senha do admin (escolha 2, recomendado): `ADMIN_PASSWORD_HASH=<hash>`

Para gerar `ADMIN_PASSWORD_HASH`:

```bash
python api/scripts/hash_password.py "sua-senha"
```

## Rodar (DEV)

Backend:

```bash
python -m pip install -r requirements.txt
python -m uvicorn api.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Frontend:

```bash
npm install
npm run dev
```

Atalhos:

- Linux: `bash scripts/dev.sh`
- Windows: `powershell -ExecutionPolicy Bypass -File scripts/dev.ps1`

URLs:

- Frontend: `http://127.0.0.1:5173/`
- Admin: `http://127.0.0.1:5173/admin/login`
- API health: `http://127.0.0.1:8000/health`
- Swagger: `http://127.0.0.1:8000/docs`

## Scripts úteis

- Build frontend: `npm run build`
- Rodar checks: `npm run check`
- Rodar testes backend: `python -m unittest discover -s api/tests`

## Deploy

Há arquivos de suporte para deploy em Vercel (frontend + backend serverless), mas SQLite em serverless é volátil. Para uso real, substitua por banco persistente.

## Qualidade

```bash
npm run check
npm run lint
npm test
python -m unittest discover -s api/tests
```

