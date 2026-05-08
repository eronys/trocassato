# Troubleshooting

## 1) "Failed to fetch" ao logar

Causa mais comum: o frontend não consegue acessar a API.

Checklist:

1. Backend está rodando?
   - `curl http://127.0.0.1:8000/health` deve retornar `{ "ok": true }`
2. Frontend está rodando?
   - `http://127.0.0.1:5173/` deve abrir
3. Porta 8000/5173 está liberada na VM?
4. Se você acessar por IP da VM (rede), use o mesmo host para tudo.

No DEV deste projeto, o recomendado é deixar `VITE_API_BASE_URL` vazio no `.env` e usar o proxy do Vite.

## 2) Admin loga e volta para login

Isso costuma indicar cookie não persistindo (host diferente) ou backend não disponível.

- Verifique se o backend está no ar.
- Teste a API diretamente:

```bash
curl -i -X POST http://127.0.0.1:8000/api/admin/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"123"}'
```

## 3) Usuário aprovado mas nível não atualiza

Atualize a página e faça logout/login.

Regra do MVP: ao aprovar, o usuário deve ir para `STAR_2`.

## 4) Banco de dados

Se houver erro de permissão/criação do SQLite:

- garanta que o diretório do `DATABASE_PATH` existe
- garanta que o processo tem permissão de escrita

