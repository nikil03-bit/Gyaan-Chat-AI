import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AppLayout from "./components/layout/AppLayout";
import AdminLayout from "./components/layout/AdminLayout";

import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";

import DashboardPage from "./pages/app/AnalyticsPage";
import DocumentsPage from "./pages/app/DocumentsPage";
import TestChatPage from "./pages/app/TestChatPage";
import AnalyticsPage from "./pages/app/AnalyticsChartPage";
import ConversationsPage from "./pages/app/ConversationsPage";
import InstallPage from "./pages/app/InstallPage";
import SettingsPage from "./pages/app/SettingsPage";
import ProfilePage from "./pages/app/ProfilePage";
import BotSettingsPage from "./pages/app/BotSettingsPage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminTenantsPage from "./pages/admin/AdminTenantsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminBotsPage from "./pages/admin/AdminBotsPage";
import AdminDocumentsPage from "./pages/admin/AdminDocumentsPage";
import AdminSystemPage from "./pages/admin/AdminSystemPage";

export default function App() {
  const { token, user } = useAuth();
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={token ? <Navigate to={user?.is_superadmin ? "/admin/dashboard" : "/app"} replace /> : <LoginPage />} />
      <Route path="/register" element={token ? <Navigate to="/app" replace /> : <RegisterPage />} />

      {/* Protected Tenant App */}
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="documents"     element={<DocumentsPage />} />
        <Route path="test-chat"     element={<TestChatPage />} />
        <Route path="analytics"     element={<AnalyticsPage />} />
        <Route path="conversations" element={<ConversationsPage />} />
        <Route path="install"       element={<InstallPage />} />
        <Route path="settings"      element={<SettingsPage />} />
        <Route path="bot-settings"  element={<BotSettingsPage />} />
        <Route path="profile"       element={<ProfilePage />} />
      </Route>

      {/* Super Admin Panel */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<AdminDashboardPage />} />
          <Route path="tenants"       element={<AdminTenantsPage />} />
          <Route path="users"         element={<AdminUsersPage />} />
          <Route path="bots"          element={<AdminBotsPage />} />
          <Route path="documents"     element={<AdminDocumentsPage />} />
          <Route path="system"        element={<AdminSystemPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
