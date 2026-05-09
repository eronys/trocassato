import { useCallback, useEffect, useMemo, useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { apiGet, apiPost, type ApiError } from "@/utils/api";

type Tx = {
  id: string;
  buyer_user_id: string;
  seller_user_id: string;
  business_item_id: string;
  amount_sats: number;
  status: string;
  txid: string | null;
  created_at: string;
  confirmed_at: string | null;
  buyer_full_name: string | null;
  seller_full_name: string | null;
  business_item_title: string | null;
  price_brl_cents: number | null;
};

function statusLabel(s: string): string {
  switch (s) {
    case "BROADCAST":
      return "Em andamento";
    case "CONFIRMED":
      return "Concluída";
    case "CANCELLED":
      return "Cancelada";
    default:
      return s;
  }
}

function formatBrl(cents: number | null) {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AdminTransactions() {
  const [items, setItems] = useState<Tx[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const query = useMemo(() => (filter ? `?status=${encodeURIComponent(filter)}` : ""), [filter]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiGet<Tx[]>(`/admin/transactions${query}`);
      setItems(data);
    } catch (err) {
      setError((err as ApiError).message);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold">Transações</div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500">Status:</span>
        {[
          { v: "", l: "Todos" },
          { v: "BROADCAST", l: "Em andamento" },
          { v: "CONFIRMED", l: "Concluídas" },
          { v: "CANCELLED", l: "Canceladas" },
        ].map((o) => (
          <Button
            key={o.v || "all"}
            variant={filter === o.v ? "primary" : "ghost"}
            className="text-xs"
            onClick={() => setFilter(o.v)}
          >
            {o.l}
          </Button>
        ))}
      </div>
      {error ? <div className="text-sm text-red-400">{error}</div> : null}

      <div className="space-y-3">
        {items.map((t) => (
          <Card key={t.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <div className="text-xs text-zinc-500">Negócio</div>
                <div className="text-sm font-semibold text-zinc-100">{t.business_item_title || "—"}</div>
                <div className="text-xs text-zinc-500">
                  Comprador: <span className="text-zinc-300">{t.buyer_full_name || t.buyer_user_id}</span>
                </div>
                <div className="text-xs text-zinc-500">
                  Vendedor: <span className="text-zinc-300">{t.seller_full_name || t.seller_user_id}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-500">Valor</div>
                <div className="font-mono text-sm text-orange-300">{t.amount_sats} sats</div>
                <div className="text-xs text-zinc-400">{formatBrl(t.price_brl_cents)}</div>
                <div className="mt-2 text-xs text-zinc-500">Status</div>
                <div className="text-sm font-semibold">{statusLabel(t.status)}</div>
                <div className="mt-1 text-xs text-zinc-500">{new Date(t.created_at).toLocaleString("pt-BR")}</div>
                {t.txid ? <div className="mt-2 max-w-xs break-all font-mono text-[10px] text-zinc-500">{t.txid}</div> : null}
              </div>
            </div>
            {t.status === "BROADCAST" ? (
              <div className="mt-3 border-t border-zinc-900 pt-3">
                <Button
                  variant="ghost"
                  className="text-xs text-red-400"
                  disabled={busy === t.id}
                  onClick={async () => {
                    setBusy(t.id);
                    try {
                      await apiPost(`/admin/transactions/${t.id}/cancel`, {});
                      await load();
                    } catch (err) {
                      setError((err as ApiError).message);
                    } finally {
                      setBusy(null);
                    }
                  }}
                >
                  Marcar como cancelada
                </Button>
              </div>
            ) : null}
          </Card>
        ))}
        {items.length === 0 ? <div className="text-xs text-zinc-500">Nenhuma transação.</div> : null}
      </div>
    </div>
  );
}
