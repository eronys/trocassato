import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useUserAuth } from "@/stores/useUserAuth";

export default function UserLogin() {
  const auth = useUserAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = useMemo(() => params.get("next") || "/catalogo", [params]);

  useEffect(() => {
    document.title = "Trocassato Negócios";
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <Card className="w-full">
          <div className="mb-4">
            <div className="text-sm font-bold tracking-wide">TROCASSATO</div>
            <div className="mt-1 text-xs text-zinc-400">Acesse com e-mail e senha.</div>
          </div>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await auth.login(email, password);
              if (ok) nav(next, { replace: true });
            }}
          >
            <div className="space-y-1">
              <div className="text-xs text-zinc-400">E-mail</div>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-zinc-400">Senha</div>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" />
            </div>
            {auth.error ? <div className="text-xs text-red-400">{auth.error}</div> : null}
            <Button type="submit" className="w-full" disabled={auth.loading}>
              Entrar
            </Button>
            <div className="pt-2 text-xs text-zinc-500">
              Tem um convite? Use o link do convite para entrar no onboarding.
              <div className="mt-1">
                <Link className="text-orange-300 hover:text-orange-200" to="/onboarding/exemplo">
                  Abrir onboarding (exemplo)
                </Link>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
