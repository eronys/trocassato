# Backup e Restauração

O MVP usa SQLite (um arquivo `.db`). Isso torna o backup simples.

## Backup

1. Pare o backend (recomendado para consistência):

```bash
pkill -f uvicorn || true
```

2. Copie o arquivo do banco configurado em `DATABASE_PATH`.

Exemplo (default):

```bash
cp api/data/trocasato.db backups/trocasato_$(date +%F).db
```

## Restauração

1. Pare o backend.
2. Substitua o arquivo do banco pelo backup.

```bash
cp backups/trocasato_2026-05-08.db api/data/trocasato.db
```

3. Suba o backend novamente.

## Observações

- Não versionar arquivos `.db` no GitHub.
- Para inspeção manual, use o DB Browser for SQLite.

