import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useAdminAuth } from "@/stores/useAdminAuth";

export default function AdminLogin() {
  const auth = useAdminAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = useMemo(() => params.get("next") || "/admin", [params]);

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <Card className="w-full">
          <div className="mb-4">
            <div className="text-sm font-bold tracking-wide">TROCASSATO ADMIN</div>
            <div className="mt-1 text-xs text-zinc-400">Acesso restrito ao portal administrativo.</div>
          </div>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await auth.login(username, password);
              if (ok) nav(next, { replace: true });
            }}
          >
            <div className="space-y-1">
              <div className="text-xs text-zinc-400">Usuário</div>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-zinc-400">Senha</div>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" />
            </div>
            {auth.error ? <div className="text-xs text-red-400">{auth.error}</div> : null}
            <Button type="submit" className="w-full" disabled={auth.loading}>
              Entrar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
