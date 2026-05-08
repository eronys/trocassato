import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { apiPost, type ApiError } from "@/utils/api";

export default function OnboardingInvite() {
  const { token } = useParams();
  const inviteToken = useMemo(() => token || "", [token]);
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <Card className="w-full">
          <div className="mb-4">
            <div className="text-sm font-bold tracking-wide">Cadastro por convite</div>
            <div className="mt-1 text-xs text-zinc-400">Preencha seus dados e defina sua senha.</div>
          </div>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError(null);
              try {
                await apiPost("/api/onboarding/finish", {
                  invite_token: inviteToken,
                  full_name: fullName,
                  email,
                  cpf,
                  photo_url: photoUrl,
                  password,
                });
                nav("/login", { replace: true });
              } catch (err) {
                const apiErr = err as ApiError;
                setError(apiErr.message || "Falha no cadastro");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="space-y-1">
              <div className="text-xs text-zinc-400">Nome completo</div>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-zinc-400">E-mail</div>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-zinc-400">CPF (11 dígitos)</div>
              <Input value={cpf} onChange={(e) => setCpf(e.target.value.replace(/\D/g, "").slice(0, 11))} inputMode="numeric" />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-zinc-400">Foto (URL) (opcional)</div>
              <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-zinc-400">Senha</div>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
            </div>
            {error ? <div className="text-xs text-red-400">{error}</div> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              Finalizar cadastro
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
