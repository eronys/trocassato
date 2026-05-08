import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Card from "@/components/ui/Card";
import { useUserAuth } from "@/stores/useUserAuth";
import { apiGet, apiPost, type ApiError } from "@/utils/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type Transaction = {
  id: string;
  amount_sats: number;
  status: string;
  txid: string | null;
  created_at: string;
  confirmed_at: string | null;
};

type NewItem = {
  title: string;
  description: string;
  price_brl_cents: number;
};

export default function Profile() {
  const auth = useUserAuth();
  const loc = useLocation();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const highlight = (loc.state as { tx?: { id: string } } | null)?.tx?.id;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceBrl, setPriceBrl] = useState("0");
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const canCreate = auth.user?.status === "APPROVED" && (auth.user?.level === "STAR_2" || auth.user?.level === "STAR_3" || auth.user?.level === "STAR_4");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<Transaction[]>("/api/profile/transactions");
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

      <div className="text-sm font-semibold">Histórico</div>
      {error ? <div className="text-sm text-red-400">{error}</div> : null}
      <div className="space-y-2">
        {txs.map((t) => (
          <Card key={t.id} className={t.id === highlight ? "border-orange-500/40" : undefined}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-sm text-orange-300">{t.amount_sats} sats</div>
                <div className="mt-1 text-xs text-zinc-500">{new Date(t.created_at).toLocaleString("pt-BR")}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-500">Status</div>
                <div className="text-sm font-semibold">{t.status}</div>
              </div>
            </div>
            {t.txid ? <div className="mt-2 break-all font-mono text-xs text-zinc-500">txid: {t.txid}</div> : null}
          </Card>
        ))}
        {txs.length === 0 ? <div className="text-xs text-zinc-500">Sem transações.</div> : null}
      </div>

      <div className="pt-2 text-sm font-semibold">Meus negócios</div>
      <Card>
        {!canCreate ? (
          <div className="text-xs text-zinc-500">Para publicar negócios, você precisa estar aprovado e ser nível ⭐⭐ ou superior.</div>
        ) : (
          <form
            className="grid grid-cols-1 gap-3 md:grid-cols-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setCreateMsg(null);
              try {
                const cents = Math.max(1, Math.round(Number(priceBrl.replace(",", ".")) * 100));
                const body: NewItem = { title, description, price_brl_cents: cents };
                await apiPost("/api/items", body);
                setTitle("");
                setDescription("");
                setPriceBrl("0");
                setCreateMsg("Negócio publicado.");
              } catch (err) {
                const e2 = err as ApiError;
                setCreateMsg(e2.message);
              }
            }}
          >
            <div className="space-y-1 md:col-span-1">
              <div className="text-xs text-zinc-400">Título (máx 50)</div>
              <Input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 50))} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="text-xs text-zinc-400">Descrição (máx 200)</div>
              <Input value={description} onChange={(e) => setDescription(e.target.value.slice(0, 200))} />
            </div>
            <div className="space-y-1 md:col-span-1">
              <div className="text-xs text-zinc-400">Valor (BRL)</div>
              <Input value={priceBrl} onChange={(e) => setPriceBrl(e.target.value)} inputMode="decimal" />
            </div>
            <div className="md:col-span-2 flex items-end gap-2">
              <Button type="submit">Publicar negócio</Button>
              {createMsg ? <div className="text-xs text-zinc-400">{createMsg}</div> : null}
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
