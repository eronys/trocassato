import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

import Card from "@/components/ui/Card";
import { useUserAuth } from "@/stores/useUserAuth";
import { apiGet, type ApiError } from "@/utils/api";

type BusinessItem = {
  id: string;
  title: string;
  description: string;
  price_brl_cents: number;
  price_sats: number;
  image_url: string | null;
  seller_user_id: string;
  created_at: string;
  seller_full_name: string;
  seller_level: string;
  seller_stars: number;
};

function formatBrl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Stars({ n }: { n: number }) {
  return <span className="text-amber-400">{"⭐".repeat(Math.min(4, Math.max(1, n)))}</span>;
}

export default function Catalog() {
  const auth = useUserAuth();
  const [items, setItems] = useState<BusinessItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isPending = useMemo(() => auth.user?.status === "PENDING_APPROVAL", [auth.user?.status]);

  const refresh = async () => {
    try {
      const data = await apiGet<BusinessItem[]>("/catalog/items");
      setItems(data);
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
      {isPending ? (
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 px-4 py-3 text-sm">
          <div className="text-zinc-200">Seu acesso está sendo validado por seu anfitrião...</div>
          <div className="mt-1 text-xs text-zinc-500">Você pode navegar, mas não pode comprar até a aprovação.</div>
        </div>
      ) : null}

      {error ? <div className="text-sm text-red-400">{error}</div> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link key={item.id} to={`/negocio/${item.id}`} className="block">
            <Card className="h-full transition hover:border-zinc-700 hover:bg-zinc-950/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-100">{item.title}</div>
                  <div className="mt-1 line-clamp-2 text-xs text-zinc-400">{item.description}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    <span className="text-zinc-300">{item.seller_full_name}</span>
                    <Stars n={item.seller_stars} />
                    <span className="text-zinc-600">({item.seller_level})</span>
                  </div>
                </div>
                {isPending ? <Lock className="h-4 w-4 shrink-0 text-zinc-500" /> : null}
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-xs text-zinc-500">Preço</div>
                  <div className="font-mono text-sm text-orange-300">{item.price_sats} sats</div>
                </div>
                <div className="text-xs text-zinc-400">{formatBrl(item.price_brl_cents)}</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
