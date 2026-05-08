import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { apiGet, apiPost, type ApiError } from "@/utils/api";

type PublicUser = {
  id: string;
  full_name: string;
  email: string;
  status: string;
  level: string;
  invited_by_user_id: string | null;
  is_host: boolean;
  created_at: string;
};

type Graph = {
  nodes: PublicUser[];
  edges: [string, string][];
};

export default function AdminDashboard() {
  const [data, setData] = useState<Graph | null>(null);
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const g = await apiGet<Graph>("/api/admin/invite-graph");
        setData(g);
        const u = await apiGet<PublicUser[]>("/api/admin/users");
        setUsers(u);
      } catch (err) {
        const e = err as ApiError;
        setError(e.message);
      }
    })();
  }, []);

  const refreshUsers = async () => {
    const u = await apiGet<PublicUser[]>("/api/admin/users");
    setUsers(u);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold">Visão geral</div>
      {error ? <div className="text-sm text-red-400">{error}</div> : null}
      <Card>
        <div className="text-xs text-zinc-500">Usuários</div>
        <div className="mt-1 text-2xl font-semibold">{data?.nodes.length ?? "-"}</div>
      </Card>
      <Card>
        <div className="text-xs text-zinc-500">Relações de convite</div>
        <div className="mt-1 text-2xl font-semibold">{data?.edges.length ?? "-"}</div>
      </Card>

      <Card>
        <div className="text-sm font-semibold">Usuários (ações rápidas)</div>
        <div className="mt-3 space-y-2">
          {users.slice(0, 30).map((u) => (
            <div key={u.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold">{u.full_name}</div>
                  <div className="text-xs text-zinc-500">{u.email}</div>
                  <div className="mt-1 text-xs text-zinc-600">{u.status} • {u.level}{u.is_host ? " • host" : ""}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      await apiPost(`/api/admin/users/${u.id}/status`, { status: "APPROVED" });
                      await refreshUsers();
                    }}
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      await apiPost(`/api/admin/users/${u.id}/host`, { is_host: !u.is_host });
                      await refreshUsers();
                    }}
                  >
                    {u.is_host ? "Remover host" : "Tornar host"}
                  </Button>
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-black/30 px-3 py-2">
                    <div className="text-xs text-zinc-500">Nível</div>
                    <Input
                      className="h-8 w-28"
                      defaultValue={u.level}
                      onBlur={async (e) => {
                        const v = e.target.value.trim();
                        if (!v) return;
                        await apiPost(`/api/admin/users/${u.id}/level`, { level: v });
                        await refreshUsers();
                      }}
                    />
                  </div>
                  <Button
                    variant="danger"
                    onClick={async () => {
                      await apiPost("/api/admin/suspend", { user_id: u.id });
                      await refreshUsers();
                    }}
                  >
                    Suspender
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {users.length === 0 ? <div className="text-xs text-zinc-500">Sem usuários.</div> : null}
        </div>
      </Card>
    </div>
  );
}
