import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Bell, LogOut, Store, UserPlus, UserRound } from "lucide-react";

import Button from "@/components/ui/Button";
import { useUserAuth } from "@/stores/useUserAuth";

export default function UserLayout() {
  const user = useUserAuth((s) => s.user);
  const loading = useUserAuth((s) => s.loading);
  const refresh = useUserAuth((s) => s.refresh);
  const logout = useUserAuth((s) => s.logout);
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    document.title = "Trocassato Negócios";
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(() => {
      refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    if (!loading && !user) {
      nav(`/login?next=${encodeURIComponent(loc.pathname)}`, { replace: true });
    }
  }, [loading, user, loc.pathname, nav]);

  if (!user) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-900 bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/catalogo" className="text-2xl font-bold tracking-wide">
            TROCASSATO
          </Link>
          <div className="hidden flex-col items-center justify-center md:flex">
            <div className="text-sm font-semibold">{user.full_name}</div>
            <div className="text-xs text-amber-400">
              {"⭐".repeat(Math.min(4, Math.max(1, Number(user.level.split("_")[1]) || 1)))}
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <NavLink
              to="/catalogo"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm ${isActive ? "bg-zinc-900" : "hover:bg-zinc-950"}`
              }
            >
              Catálogo de negócios
            </NavLink>
            <NavLink
              to="/perfil"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm ${isActive ? "bg-zinc-900" : "hover:bg-zinc-950"}`
              }
            >
              <span className="inline-flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                Perfil
              </span>
            </NavLink>
            {user.status !== "PENDING_APPROVAL" ? (
              <>
                <NavLink
                  to="/convidar"
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2 text-sm ${isActive ? "bg-zinc-900" : "hover:bg-zinc-950"}`
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Convidar
                  </span>
                </NavLink>
                <NavLink
                  to="/meus-negocios"
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2 text-sm ${isActive ? "bg-zinc-900" : "hover:bg-zinc-950"}`
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Meus negócios
                  </span>
                </NavLink>
              </>
            ) : null}
            {user.is_host ? (
              <NavLink
                to="/notificacoes"
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm ${isActive ? "bg-zinc-900" : "hover:bg-zinc-950"}`
                }
              >
                <span className="inline-flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificações
                </span>
              </NavLink>
            ) : null}
            <Button
              variant="ghost"
              onClick={async () => {
                await logout();
                nav("/login", { replace: true });
              }}
            >
              <span className="inline-flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sair
              </span>
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
