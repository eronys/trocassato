# TROCASSATO (MVP)

Marketplace com “KYC social” por convite, focado em confiança por reputação e simulação de transações em Bitcoin na rede **regtest**.

## Componentes

- **Frontend (Usuário)**: aplicação web
- **Frontend (Admin)**: aplicação web
- **Backend (API)**: FastAPI + SQLite

## Conceitos rápidos

- **Convite**: uma pessoa só entra na rede se possuir um token de convite válido.
- **Status do usuário**:
  - `PENDING_APPROVAL`: aguardando aprovação do anfitrião
  - `APPROVED`: acesso liberado
  - `SUSPENDED`: acesso bloqueado
- **Nível (estrelas)**:
  - `STAR_1` (⭐): acesso limitado
  - `STAR_2` (⭐⭐): pode publicar negócios

## URLs (DEV)

- Frontend: `http://127.0.0.1:5173/`
- Backend: `http://127.0.0.1:8000/`
- Swagger (API): `http://127.0.0.1:8000/docs`

