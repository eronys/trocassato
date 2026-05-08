# Segurança (práticas aplicadas no MVP)

## Autenticação

- Senhas são armazenadas como **hash** no banco.
- Sessão via cookie `HttpOnly`.

## Variáveis de ambiente

- Segredos e credenciais devem ficar apenas em `.env` local.
- O repositório inclui `.env.example` e `api/.env.example` sem valores sensíveis.

## Logs

- Evite registrar senhas, tokens e dados sensíveis.

## Ambientes

- Este repositório foi estruturado para DEV.
- Para produção, use banco persistente e TLS (HTTPS).

