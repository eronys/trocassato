import { useEffect, useMemo, useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useUserAuth } from "@/stores/useUserAuth";
import { apiDelete, apiGet, apiPost, apiPut, type ApiError } from "@/utils/api";

type NewItem = {
  title: string;
  description: string;
  price_brl_cents: number;
  image_url?: string | null;
};

export default function MyBusinesses() {
  const auth = useUserAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceBrl, setPriceBrl] = useState("0");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<
    { id: string; title: string; description: string; price_brl_cents: number; price_sats: number; created_at: string }[]
  >([]);
  const [editId, setEditId] = useState<string | null>(null);

  const canCreate = auth.user?.status === "APPROVED" && auth.user?.level !== "STAR_1";
  const canEdit = canCreate;

  const refresh = async () => {
    const data = await apiGet<typeof items>("/catalog/my/items");
    setItems(data);
  };

  useEffect(() => {
    refresh().catch(() => null);
    const interval = setInterval(() => {
      refresh().catch(() => null);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const currentEdit = useMemo(() => items.find((i) => i.id === editId) || null, [items, editId]);

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold">Meus negócios</div>

      <Card>
        {!canCreate ? (
          <div className="text-xs text-zinc-500">
            Para publicar negócios, você precisa estar aprovado e ser nível ⭐⭐ ou superior. Se necessário, peça ao admin para ajustar seu nível.
          </div>
        ) : (
          <form
            className="grid grid-cols-1 gap-3 md:grid-cols-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setMsg(null);
              setLoading(true);
              try {
                const cents = Math.max(1, Math.round(Number(priceBrl.replace(",", ".")) * 100));
                const body: NewItem = { title, description, price_brl_cents: cents };
                if (editId) {
                  await apiPut(`/catalog/items/${editId}`, body);
                } else {
                  await apiPost("/catalog/items", body);
                }
                setTitle("");
                setDescription("");
                setPriceBrl("0");
                setEditId(null);
                setMsg(editId ? "Negócio atualizado." : "Negócio publicado.");
                await refresh();
              } catch (err) {
                const e2 = err as ApiError;
                setMsg(e2.message);
              } finally {
                setLoading(false);
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
            <div className="flex items-end gap-2 md:col-span-2">
              <Button type="submit" disabled={loading}>
                {editId ? "Salvar alterações" : "Publicar negócio"}
              </Button>
              {editId ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditId(null);
                    setTitle("");
                    setDescription("");
                    setPriceBrl("0");
                    setMsg(null);
                  }}
                >
                  Cancelar edição
                </Button>
              ) : null}
              {msg ? <div className="text-xs text-zinc-400">{msg}</div> : null}
            </div>
          </form>
        )}
      </Card>

      <Card>
        <div className="text-sm font-semibold">Listagem</div>
        <div className="mt-3 space-y-2">
          {items.map((i) => (
            <div key={i.id} className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold">{i.title}</div>
                <div className="mt-1 text-xs text-zinc-500">{i.description}</div>
                <div className="mt-2 text-xs text-zinc-600">{new Date(i.created_at).toLocaleString("pt-BR")}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-right">
                  <div className="text-xs text-zinc-500">Preço</div>
                  <div className="font-mono text-sm text-orange-300">{i.price_sats} sats</div>
                  <div className="text-xs text-zinc-400">
                    {(i.price_brl_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  disabled={!canEdit}
                  onClick={() => {
                    setEditId(i.id);
                    setTitle(i.title);
                    setDescription(i.description);
                    setPriceBrl(String((i.price_brl_cents / 100).toFixed(2)).replace(".", ","));
                    setMsg(null);
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  disabled={!canEdit}
                  onClick={async () => {
                    if (!window.confirm("Excluir este negócio?")) return;
                    try {
                      await apiDelete(`/catalog/items/${i.id}`);
                      await refresh();
                    } catch (err) {
                      setMsg((err as ApiError).message);
                    }
                  }}
                >
                  Excluir
                </Button>
              </div>
            </div>
          ))}
          {items.length === 0 ? <div className="text-xs text-zinc-500">Sem negócios.</div> : null}
        </div>
      </Card>
    </div>
  );
}

