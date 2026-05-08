import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lock } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useUserAuth } from "@/stores/useUserAuth";
import { apiGet, apiPost, type ApiError } from "@/utils/api";

type BusinessItem = {
  id: string;
  title: string;
  description: string;
  price_brl_cents: number;
  price_sats: number;
  image_url: string | null;
  seller_user_id: string;
  created_at: string;
};

type Transaction = {
  id: string;
  status: string;
  txid: string | null;
};

export default function ItemDetail() {
  const { id } = useParams();
  const itemId = useMemo(() => id || "", [id]);
  const auth = useUserAuth();
  const nav = useNavigate();
  const [item, setItem] = useState<BusinessItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canBuy = auth.user?.status === "APPROVED";

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<BusinessItem>(`/api/items/${itemId}`);
        setItem(data);
      } catch (err) {
        const e = err as ApiError;
        setError(e.message);
      }
    })();
  }, [itemId]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <div className="text-sm font-semibold">{item?.title || "Carregando..."}</div>
          <div className="mt-2 text-sm text-zinc-400">{item?.description}</div>
        </Card>
      </div>
      <div>
        <Card className="sticky top-24">
          <div className="text-xs text-zinc-500">Você está pagando</div>
          <div className="mt-1 text-sm font-semibold text-zinc-100">Vendedor</div>
          <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="text-xs text-zinc-500">Valor</div>
            <div className="font-mono text-lg font-semibold text-orange-300">{item?.price_sats ?? "-"} sats</div>
          </div>
          <div className="mt-3 text-xs text-zinc-500">A TROCASSATO não é responsável pela comercialização.</div>
          {error ? <div className="mt-3 text-xs text-red-400">{error}</div> : null}
          <div className="mt-4">
            <Button
              className="w-full"
              disabled={!canBuy || loading || !item}
              onClick={async () => {
                if (!item) return;
                setLoading(true);
                setError(null);
                try {
                  const tx = await apiPost<Transaction>("/api/checkout/confirm", { business_item_id: item.id });
                  nav("/perfil", { replace: true, state: { tx } });
                } catch (err) {
                  const e = err as ApiError;
                  setError(e.message);
                } finally {
                  setLoading(false);
                }
              }}
            >
              {canBuy ? "Confirmar pagamento" : "Comprar bloqueado"}
            </Button>
            {!canBuy ? (
              <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                <Lock className="h-4 w-4" />
                Aguarde aprovação do anfitrião.
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
