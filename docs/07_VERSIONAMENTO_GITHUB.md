# Versionamento no GitHub (recomendação)

## Estrutura de branches

- `main`: estável, pronto para release
- `develop`: desenvolvimento contínuo
- `feature/<nome-curto>`: novas funcionalidades
- `hotfix/<nome-curto>`: correções urgentes

## Convenção de tags e releases

Use SemVer:

- `vMAJOR.MINOR.PATCH` (ex.: `v1.0.0`)

Critério:

- `PATCH`: correções
- `MINOR`: funcionalidade nova compatível
- `MAJOR`: quebra de compatibilidade

## Checklist antes de publicar

1. Rodar testes:
   - `npm run check`
   - `npm test`
   - `python -m unittest discover -s api/tests`
2. Conferir se não há `.env`/`.db` no commit
3. Atualizar `README.md` e arquivos em `docs/` quando necessário

## Modelo simples de commits

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `chore: ...`

