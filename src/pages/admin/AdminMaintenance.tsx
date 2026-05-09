import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { apiPost, type ApiError } from "@/utils/api";
import { useState } from "react";

export default function AdminMaintenance() {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (id: string, label: string) => {
    setMsg(null);
    setErr(null);
    if (!window.confirm(`Confirmar: ${label}? Esta ação é irreversível.`)) return;
    setBusy(id);
    try {
      await apiPost(`/admin/maintenance/${id}`, {});
      setMsg("Concluído.");
    } catch (e) {
      setErr((e as ApiError).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold">Administração</div>
      {msg ? <div className="text-xs text-zinc-400">{msg}</div> : null}
      {err ? <div className="text-sm text-red-400">{err}</div> : null}

      <Card>
        <div className="text-sm font-semibold">Limpeza do banco</div>
        <div className="mt-3 space-y-2">
          <Button
            variant="danger"
            disabled={busy === "clear-transactions"}
            onClick={() => run("clear-transactions", "Limpar todas as transações")}
          >
            Limpar transações
          </Button>
          <Button
            variant="danger"
            disabled={busy === "clear-transactions-items"}
            onClick={() => run("clear-transactions-items", "Limpar transações e negócios")}
          >
            Limpar transações e negócios
          </Button>
          <Button
            variant="danger"
            disabled={busy === "clear-all"}
            onClick={() => run("clear-all", "Limpar transações, negócios e usuários")}
          >
            Limpar transações, negócios e usuários
          </Button>
        </div>
        <div className="mt-3 text-xs text-zinc-500">
          Observação: convites/admins são mantidos. Use com cuidado.
        </div>
      </Card>
    </div>
  );
}

