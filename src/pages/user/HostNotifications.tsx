import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { apiGet, apiPost, type ApiError } from "@/utils/api";

type PublicUser = {
  id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
};

export default function HostNotifications() {
  const [items, setItems] = useState<PublicUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const data = await apiGet<PublicUser[]>("/host/pending");
      setItems(data);
      setError(null);
    } catch (err) {
      const e = err as ApiError;
      setError(e.message);
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(() => {
      refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold">Solicitações de entrada</div>
      {error ? <div className="text-sm text-red-400">{error}</div> : null}
      <div className="space-y-2">
        {items.map((u) => (
          <Card key={u.id}>
            <div className="flex items-center justify-between gap-3">
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
                      await apiPost("/host/approve", { user_id: u.id, approve: false });
                      await refresh();
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
                      await apiPost("/host/approve", { user_id: u.id, approve: true });
                      await refresh();
                    } finally {
                      setLoadingId(null);
                    }
                  }}
                >
                  Aprovar
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {items.length === 0 ? <div className="text-xs text-zinc-500">Sem solicitações pendentes.</div> : null}
      </div>
    </div>
  );
}
