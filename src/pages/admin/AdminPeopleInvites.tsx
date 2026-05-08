import { useEffect, useMemo, useState } from "react";

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
  invited_by_user_id: string | null;
  created_at: string;
  used_at: string | null;
};

export default function AdminPeopleInvites() {
  const [items, setItems] = useState<Invitation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [personName, setPersonName] = useState("");
  const [personEmail, setPersonEmail] = useState("");
  const [personCpf, setPersonCpf] = useState("");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => `${i.person_name} ${i.person_email} ${i.person_cpf || ""}`.toLowerCase().includes(q));
  }, [items, query]);

  const refresh = async () => {
    try {
      const data = await apiGet<Invitation[]>("/api/admin/invitations");
      setItems(data);
      setError(null);
    } catch (err) {
      const e = err as ApiError;
      setError(e.message);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">Pessoas & Convites</div>
        <div className="w-64">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome/email/cpf" />
        </div>
      </div>

      <Card>
        <div className="text-sm font-semibold">Cadastrar pessoa</div>
        <form
          className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await apiPost("/api/admin/invitations", {
                person_name: personName,
                person_email: personEmail,
                person_cpf: personCpf.length ? personCpf : null,
                invited_by_user_id: null,
              });
              setPersonName("");
              setPersonEmail("");
              setPersonCpf("");
              await refresh();
            } catch (err) {
              const e2 = err as ApiError;
              setError(e2.message);
            }
          }}
        >
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">Nome</div>
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
            <Button type="submit">Cadastrar pessoa</Button>
          </div>
        </form>
      </Card>

      {error ? <div className="text-sm text-red-400">{error}</div> : null}

      <Card>
        <div className="text-sm font-semibold">Convites</div>
        <div className="mt-3 space-y-2">
          {filtered.map((i) => {
            const link = `${window.location.origin}/onboarding/${i.token}`;
            return (
              <div key={i.id} className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold">{i.person_name}</div>
                  <div className="text-xs text-zinc-500">{i.person_email}</div>
                  <div className="mt-2 break-all font-mono text-xs text-orange-300">{link}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-xs text-zinc-500">{i.status}</div>
                    <div className="text-xs text-zinc-600">{new Date(i.created_at).toLocaleString("pt-BR")}</div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      await navigator.clipboard.writeText(link);
                    }}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 ? <div className="text-xs text-zinc-500">Sem convites.</div> : null}
        </div>
      </Card>
    </div>
  );
}
