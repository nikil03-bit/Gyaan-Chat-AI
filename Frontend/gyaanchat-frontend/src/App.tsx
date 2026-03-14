import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

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

export default function App() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={token ? <Navigate to="/app" replace /> : <LoginPage />} />
      <Route path="/register" element={token ? <Navigate to="/app" replace /> : <RegisterPage />} />

      {/* Protected App */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="test-chat" element={<TestChatPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="conversations" element={<ConversationsPage />} />
        <Route path="install" element={<InstallPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="bot-settings" element={<BotSettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

