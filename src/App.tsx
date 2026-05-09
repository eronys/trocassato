import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "@/components/layouts/AdminLayout";
import UserLayout from "@/components/layouts/UserLayout";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminPeopleInvites from "@/pages/admin/AdminPeopleInvites";
import AdminTransactions from "@/pages/admin/AdminTransactions";
import AdminMaintenance from "@/pages/admin/AdminMaintenance";
import Catalog from "@/pages/user/Catalog";
import HostNotifications from "@/pages/user/HostNotifications";
import InvitePeople from "@/pages/user/InvitePeople";
import ItemDetail from "@/pages/user/ItemDetail";
import MyBusinesses from "@/pages/user/MyBusinesses";
import OnboardingInvite from "@/pages/user/OnboardingInvite";
import Profile from "@/pages/user/Profile";
import UserLogin from "@/pages/user/UserLogin";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/catalogo" replace />} />

        <Route path="/login" element={<UserLogin />} />
        <Route path="/onboarding/:token" element={<OnboardingInvite />} />

        <Route element={<UserLayout />}>
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/negocio/:id" element={<ItemDetail />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/meus-negocios" element={<MyBusinesses />} />
          <Route path="/notificacoes" element={<HostNotifications />} />
          <Route path="/convidar" element={<InvitePeople />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/pessoas-convites" element={<AdminPeopleInvites />} />
          <Route path="/admin/transacoes" element={<AdminTransactions />} />
          <Route path="/admin/administracao" element={<AdminMaintenance />} />
        </Route>

        <Route path="*" element={<Navigate to="/catalogo" replace />} />
      </Routes>
    </Router>
  );
}
