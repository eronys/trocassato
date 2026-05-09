import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { apiGet, apiPost, type ApiError } from "@/utils/api";

type Invitation = {
  id: string;
  token: string;
  person_name: string;
  person_email: string;
  person_cpf: string | null;
  status: string;
  created_at: string;
  used_at: string | null;
};

export default function InvitePeople() {
  const [personName, setPersonName] = useState("");
  const [personEmail, setPersonEmail] = useState("");
  const [items, setItems] = useState<Invitation[]>([]);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const refresh = async () => {
    const invs = await apiGet<Invitation[]>("/invites/invitations");
    setItems(invs);
    const pend = await apiGet<{ id: string; full_name: string; email: string }[]>("/invites/pending");
    setPending(pend);
  };

  useEffect(() => {
    document.title = "Trocassato Negócios";
  }, []);

  useEffect(() => {
    refresh().catch(() => null);
    const interval = setInterval(() => {
      refresh().catch(() => null);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold">Convidar para o Trocassato</div>
      <Card>
        <form
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            setLink(null);
            try {
              const inv = await apiPost<Invitation>("/invites/invitations", {
                person_name: personName,
                person_email: personEmail,
                person_cpf: null,
              });
              setLink(`${window.location.origin}/onboarding/${inv.token}`);
              setPersonName("");
              setPersonEmail("");
              await refresh();
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
          <div className="md:col-span-2">
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

      <Card>
        <div className="text-sm font-semibold">Convites gerados</div>
        <div className="mt-3 space-y-2">
          {items.map((i) => {
            const used = i.status !== "CREATED" || !!i.used_at;
            const link2 = `${window.location.origin}/onboarding/${i.token}`;
            return (
              <div key={i.id} className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold">{i.person_name}</div>
                  <div className="text-xs text-zinc-500">{i.person_email}</div>
                  <div className="mt-2 break-all font-mono text-xs text-orange-300">{link2}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-xs text-zinc-500">{i.status}</div>
                    <div className="text-xs text-zinc-600">{new Date(i.created_at).toLocaleString("pt-BR")}</div>
                  </div>
                  <Button
                    variant="ghost"
                    disabled={used}
                    onClick={async () => {
                      await navigator.clipboard.writeText(link2);
                    }}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
            );
          })}
          {items.length === 0 ? <div className="text-xs text-zinc-500">Sem convites.</div> : null}
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold">Solicitações pendentes</div>
        {error ? <div className="mt-2 text-xs text-red-400">{error}</div> : null}
        <div className="mt-3 space-y-2">
          {pending.map((u) => (
            <div key={u.id} className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold">{u.full_name}</div>
                <div className="text-xs text-zinc-500">{u.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  disabled={loadingId === u.id}
                  onClick={async () => {
                    setLoadingId(u.id);
                    try {
                      await apiPost("/invites/approve", { user_id: u.id, approve: false });
                      await refresh();
                    } catch (err) {
                      setError((err as ApiError).message);
                    } finally {
                      setLoadingId(null);
                    }
                  }}
                >
                  Recusar
                </Button>
                <Button
                  disabled={loadingId === u.id}
                  onClick={async () => {
                    setLoadingId(u.id);
                    try {
                      await apiPost("/invites/approve", { user_id: u.id, approve: true });
                      await refresh();
                    } catch (err) {
                      setError((err as ApiError).message);
                    } finally {
                      setLoadingId(null);
                    }
                  }}
                >
                  Aprovar
                </Button>
              </div>
            </div>
          ))}
          {pending.length === 0 ? <div className="text-xs text-zinc-500">Sem solicitações pendentes.</div> : null}
        </div>
      </Card>
    </div>
  );
}
