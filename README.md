# TROCASSATO (MVP)

Marketplace com “KYC social” por convite, focado em confiança por reputação e simulação de fluxo em regtest.

Este repositório inclui documentação passo a passo para instalar e usar em uma **VM Lubuntu 26.04 LTS**.

## Componentes (DEV)

- Frontend (Usuário): rotas `/login`, `/catalogo`, `/negocio/:id`, `/perfil`, `/notificacoes`, `/convidar`
- Frontend (Admin): rotas `/admin/login`, `/admin`, `/admin/pessoas-convites`, `/admin/simulador`
- Backend (API): FastAPI + SQLite (arquivo `.db`) com autenticação por cookie `HttpOnly`

## Requisitos

- Node.js (para frontend)
- Python 3.10+ (para backend)

## Documentação (para leitura e instalação)

- Visão geral: [docs/00_VISÃO_GERAL.md](docs/00_VISÃO_GERAL.md)
- Instalação Lubuntu 26.04: [docs/01_INSTALACAO_LUBUNTU_26_04.md](docs/01_INSTALACAO_LUBUNTU_26_04.md)
- Guia do usuário: [docs/02_GUIA_USUARIO.md](docs/02_GUIA_USUARIO.md)
- Guia do admin: [docs/03_GUIA_ADMIN.md](docs/03_GUIA_ADMIN.md)
- Troubleshooting: [docs/04_TROUBLESHOOTING.md](docs/04_TROUBLESHOOTING.md)
- Backup e restauração: [docs/05_BACKUP_RESTAURACAO.md](docs/05_BACKUP_RESTAURACAO.md)
- Segurança: [docs/06_SEGURANCA.md](docs/06_SEGURANCA.md)
- Versionamento GitHub: [docs/07_VERSIONAMENTO_GITHUB.md](docs/07_VERSIONAMENTO_GITHUB.md)

## Configuração

- Frontend: copie `.env.example` para `.env`.
  - Se `VITE_API_BASE_URL` ficar vazio (recomendado no DEV), o frontend usa `/api` e o Vite faz proxy para `http://127.0.0.1:8000`.
- Backend: copie `api/.env.example` para `api/.env` e ajuste `AUTH_JWT_SECRET` e a senha do admin.

Senha do admin (escolha 1, mais simples no DEV):

- `ADMIN_PASSWORD=123`

Senha do admin (escolha 2, recomendado):

- use `ADMIN_PASSWORD_HASH`

Para gerar `ADMIN_PASSWORD_HASH`:

```bash
python api/scripts/hash_password.py "sua-senha"
```

## Rodar (DEV)

Backend:

```bash
python -m pip install -r api/requirements.txt
cd api
uvicorn api.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Frontend:

```bash
npm install
npm run dev
```

## Qualidade

```bash
npm run check
npm run lint
npm test
python -m unittest discover -s api/tests
```

## Documentos

Os requisitos, arquitetura e design estão em `.trae/documents/`.
