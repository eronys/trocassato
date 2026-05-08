# Guia do Admin

## 1. Login

1. Acesse `http://127.0.0.1:5173/admin/login`
2. Usuário: `admin`
3. Senha: definida em `api/.env` (`ADMIN_PASSWORD`) ou via `ADMIN_PASSWORD_HASH`

## 2. Pessoas & Convites

Objetivo: cadastrar pessoas, gerar convites e acompanhar uso.

1. Acesse `Admin` → **Pessoas & Convites**
2. Clique em **Cadastrar pessoa**
3. Preencha nome, e-mail e CPF (opcional)
4. Clique em **Gerar link** e copie o link

## 3. Aprovar usuários

Usuários entram como `PENDING_APPROVAL`.

1. Acesse `Admin` → painel principal
2. Localize o usuário
3. Aplique a aprovação

Regra (MVP): ao aprovar, o usuário é promovido automaticamente para `STAR_2`.

## 4. Suspensão

Use a suspensão para bloquear acesso (`SUSPENDED`) em caso de comportamento suspeito.

## 5. Simulador Regtest (transações + mineração)

Objetivo: gerar transações aleatórias para exercitar o fluxo do MVP.

1. Acesse `Admin` → **Simulador**
2. Defina quantidade de transações, faixa de valores, produtos e usuários
3. Gere transações
4. Mine blocos (regtest) para confirmar

## 6. Console SQL visual

Use o DB Browser for SQLite para:

- visualizar tabelas
- fazer SELECT/INSERT/UPDATE/DELETE

Abra o arquivo apontado por `DATABASE_PATH`.

