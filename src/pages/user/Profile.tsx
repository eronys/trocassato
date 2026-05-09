import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import Card from "@/components/ui/Card";
import { useUserAuth } from "@/stores/useUserAuth";
import { apiGet, type ApiError } from "@/utils/api";

type Transaction = {
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

export default function Profile() {
  const auth = useUserAuth();
  const loc = useLocation();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const highlight = (loc.state as { tx?: { id: string } } | null)?.tx?.id;
  const uid = auth.user?.id;

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<Transaction[]>("/catalog");
        setTxs(data);
      } catch (err) {
        const e = err as ApiError;
        setError(e.message);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">{auth.user?.full_name}</div>
            <div className="mt-1 text-xs text-zinc-400">{auth.user?.email}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500">Nível</div>
            <div className="text-sm font-semibold text-orange-300">{auth.user?.level}</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-zinc-500">Status: {auth.user?.status}</div>
      </Card>

      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">Histórico</div>
        <Link to="/meus-negocios" className="text-xs text-orange-300 hover:underline">
          Gerenciar meus negócios
        </Link>
      </div>
      {error ? <div className="text-sm text-red-400">{error}</div> : null}
      <div className="space-y-2">
        {txs.map((t) => {
          const isBuyer = uid === t.buyer_user_id;
          const counterparty = isBuyer ? t.seller_full_name : t.buyer_full_name;
          const role = isBuyer ? "Compra" : "Venda";
          return (
            <Card key={t.id} className={t.id === highlight ? "border-orange-500/40" : undefined}>
              <div className="text-xs text-zinc-500">
                {role} · {t.business_item_title || "Negócio"}
              </div>
              <div className="mt-1 text-xs text-zinc-400">
                Contraparte: <span className="text-zinc-200">{counterparty || "—"}</span>
              </div>
              <div className="mt-3 flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-sm text-orange-300">{t.amount_sats} sats</div>
                  <div className="mt-1 text-xs text-zinc-500">{formatBrl(t.price_brl_cents)}</div>
                  <div className="mt-1 text-xs text-zinc-500">{new Date(t.created_at).toLocaleString("pt-BR")}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500">Status</div>
                  <div className="text-sm font-semibold">{statusLabel(t.status)}</div>
                </div>
              </div>
              {t.txid ? <div className="mt-2 break-all font-mono text-xs text-zinc-500">txid: {t.txid}</div> : null}
            </Card>
          );
        })}
        {txs.length === 0 ? <div className="text-xs text-zinc-500">Sem transações.</div> : null}
      </div>
    </div>
  );
}
