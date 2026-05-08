import { useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { apiGet, apiPost, type ApiError } from "@/utils/api";

type BusinessItem = {
  id: string;
  title: string;
  price_sats: number;
};

type SimResult = { ok: boolean; created: number };
type MineResult = { ok: boolean; blocks: number; confirmed: number };

export default function AdminSimulator() {
  const [items, setItems] = useState<BusinessItem[]>([]);
  const [txCount, setTxCount] = useState(10);
  const [minSats, setMinSats] = useState(1);
  const [maxSats, setMaxSats] = useState(50);
  const [blocks, setBlocks] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const selectedIds = useMemo(() => items.slice(0, 10).map((i) => i.id), [items]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<BusinessItem[]>("/api/catalog/items");
        setItems(data);
      } catch (err) {
        const e = err as ApiError;
        setError(e.message);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold">Simulador Regtest</div>
      {error ? <div className="text-sm text-red-400">{error}</div> : null}
      {msg ? <div className="text-sm text-zinc-300">{msg}</div> : null}

      <Card>
        <div className="text-sm font-semibold">Configuração</div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">Quantidade</div>
            <Input value={String(txCount)} onChange={(e) => setTxCount(Number(e.target.value || 0))} inputMode="numeric" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">Mín sats</div>
            <Input value={String(minSats)} onChange={(e) => setMinSats(Number(e.target.value || 0))} inputMode="numeric" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">Máx sats</div>
            <Input value={String(maxSats)} onChange={(e) => setMaxSats(Number(e.target.value || 0))} inputMode="numeric" />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-zinc-400">Blocos</div>
            <Input value={String(blocks)} onChange={(e) => setBlocks(Number(e.target.value || 0))} inputMode="numeric" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={async () => {
              setError(null);
              setMsg(null);
              try {
                const r = await apiPost<SimResult>("/api/admin/simulate/transactions", {
                  tx_count: txCount,
                  min_sats: minSats,
                  max_sats: maxSats,
                  product_ids: selectedIds,
                  user_ids: [],
                  allow_repeat: true,
                  respect_star_lock: true,
                });
                setMsg(`Transações geradas: ${r.created}`);
              } catch (err) {
                const e = err as ApiError;
                setError(e.message);
              }
            }}
          >
            Gerar transações
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              setError(null);
              setMsg(null);
              try {
                const r = await apiPost<MineResult>("/api/admin/simulate/mine", { blocks });
                setMsg(`Blocos minerados: ${r.blocks} | Confirmadas: ${r.confirmed}`);
              } catch (err) {
                const e = err as ApiError;
                setError(e.message);
              }
            }}
          >
            Minerar blocos
          </Button>
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold">Produtos (amostra)</div>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          {items.slice(0, 6).map((i) => (
            <div key={i.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2">
              <div className="text-sm font-semibold">{i.title}</div>
              <div className="font-mono text-xs text-orange-300">{i.price_sats} sats</div>
            </div>
          ))}
          {items.length === 0 ? <div className="text-xs text-zinc-500">Sem itens.</div> : null}
        </div>
      </Card>
    </div>
  );
}
