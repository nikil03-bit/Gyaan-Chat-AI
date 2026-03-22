import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
    const { token, user } = useAuth();
    if (!token) return <Navigate to="/login" replace />;
    if (!user?.is_superadmin) return <Navigate to="/app" replace />;
    return <Outlet />;
}
