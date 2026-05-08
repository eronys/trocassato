import { useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { apiPost, type ApiError } from "@/utils/api";

type Invitation = {
  token: string;
};

export default function InvitePeople() {
  const [personName, setPersonName] = useState("");
  const [personEmail, setPersonEmail] = useState("");
  const [personCpf, setPersonCpf] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold">Convidar</div>
      <Card>
        <form
          className="grid grid-cols-1 gap-3 md:grid-cols-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            setLink(null);
            try {
              const inv = await apiPost<Invitation>("/api/host/invitations", {
                person_name: personName,
                person_email: personEmail,
                person_cpf: personCpf.length ? personCpf : null,
              });
              setLink(`${window.location.origin}/onboarding/${inv.token}`);
            } catch (err) {
              const e2 = err as ApiError;
              setError(e2.message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">Nome completo</div>
            <Input value={personName} onChange={(e) => setPersonName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">E-mail</div>
            <Input value={personEmail} onChange={(e) => setPersonEmail(e.target.value)} type="email" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">CPF (opcional)</div>
            <Input value={personCpf} onChange={(e) => setPersonCpf(e.target.value.replace(/\D/g, "").slice(0, 11))} />
          </div>
          <div className="md:col-span-3">
            {error ? <div className="mb-2 text-xs text-red-400">{error}</div> : null}
            <Button type="submit" disabled={loading}>
              Gerar convite
            </Button>
          </div>
        </form>
        {link ? (
          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="text-xs text-zinc-500">Link do convite</div>
            <div className="mt-1 break-all font-mono text-xs text-orange-300">{link}</div>
            <div className="mt-3">
              <Button
                variant="ghost"
                onClick={async () => {
                  await navigator.clipboard.writeText(link);
                }}
              >
                Copiar link
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
