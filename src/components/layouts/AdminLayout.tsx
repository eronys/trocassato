import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

import Button from "@/components/ui/Button";
import { useAdminAuth } from "@/stores/useAdminAuth";
import { apiGet } from "@/utils/api";

export default function AdminLayout() {
  const isAuthed = useAdminAuth((s) => s.isAuthed);
  const setAuthed = useAdminAuth((s) => s.setAuthed);
  const logout = useAdminAuth((s) => s.logout);
  const nav = useNavigate();
  const loc = useLocation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await apiGet("/api/admin/auth/me");
        setAuthed(true);
      } catch {
        setAuthed(false);
        nav(`/admin/login?next=${encodeURIComponent(loc.pathname)}`, { replace: true });
      } finally {
        setReady(true);
      }
    })();
  }, [loc.pathname, nav, setAuthed]);

  if (!ready) {
    return <div className="min-h-screen bg-black" />;
  }

  if (!isAuthed) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-900 bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/admin" className="text-sm font-bold tracking-wide">
            TROCASSATO ADMIN
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm ${isActive ? "bg-zinc-900" : "hover:bg-zinc-950"}`
              }
            >
              Visão geral
            </NavLink>
            <NavLink
              to="/admin/pessoas-convites"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm ${isActive ? "bg-zinc-900" : "hover:bg-zinc-950"}`
              }
            >
              Pessoas & Convites
            </NavLink>
            <NavLink
              to="/admin/simulador"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm ${isActive ? "bg-zinc-900" : "hover:bg-zinc-950"}`
              }
            >
              Simulador
            </NavLink>
            <Button
              variant="ghost"
              onClick={async () => {
                await logout();
                nav("/admin/login", { replace: true });
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
