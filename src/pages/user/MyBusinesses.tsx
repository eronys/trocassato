import { useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useUserAuth } from "@/stores/useUserAuth";
import { apiPost, type ApiError } from "@/utils/api";

type NewItem = {
  title: string;
  description: string;
  price_brl_cents: number;
};

export default function MyBusinesses() {
  const auth = useUserAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceBrl, setPriceBrl] = useState("0");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canCreate = auth.user?.status === "APPROVED" && auth.user?.level !== "STAR_1";

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold">Cadastrar negócios</div>

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
                await apiPost("/api/items", body);
                setTitle("");
                setDescription("");
                setPriceBrl("0");
                setMsg("Negócio publicado.");
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
                Publicar negócio
              </Button>
              {msg ? <div className="text-xs text-zinc-400">{msg}</div> : null}
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

