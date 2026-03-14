import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthUser {
    id: string;
    name: string;
    email: string;
}

interface AuthTenant {
    id: string;
    name: string;
}

interface AuthBot {
    id: string;
    name: string;
    widget_key: string;
}

interface AuthState {
    token: string | null;
    user: AuthUser | null;
    tenant: AuthTenant | null;
    bot: AuthBot | null;
}

interface AuthContextValue extends AuthState {
    login: (data: { token: string; user: AuthUser; tenant: AuthTenant; bot: AuthBot }) => void;
    logout: () => void;
    updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const LS_KEYS = {
    token: "gc_token",
    user: "gc_user",
    tenant: "gc_tenant",
    bot: "gc_bot",
};

function readLS(): AuthState {
    try {
        const token = localStorage.getItem(LS_KEYS.token);
        if (!token) return { token: null, user: null, tenant: null, bot: null };

        // Validate token is not expired by decoding the JWT payload
        const parts = token.split(".");
        if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                // Token expired — clear everything
                Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(k));
                return { token: null, user: null, tenant: null, bot: null };
            }
        }

        const user = JSON.parse(localStorage.getItem(LS_KEYS.user) || "null");
        const tenant = JSON.parse(localStorage.getItem(LS_KEYS.tenant) || "null");
        const bot = JSON.parse(localStorage.getItem(LS_KEYS.bot) || "null");

        return { token, user, tenant, bot };
    } catch {
        return { token: null, user: null, tenant: null, bot: null };
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>(readLS);

    function login(data: { token: string; user: AuthUser; tenant: AuthTenant; bot: AuthBot }) {
        localStorage.setItem(LS_KEYS.token, data.token);
        localStorage.setItem(LS_KEYS.user, JSON.stringify(data.user));
        localStorage.setItem(LS_KEYS.tenant, JSON.stringify(data.tenant));
        localStorage.setItem(LS_KEYS.bot, JSON.stringify(data.bot));
        // Also store tenant_id and widget_key for backward compat
        localStorage.setItem("gyaanchat_tenant_id", data.tenant.id);
        localStorage.setItem("gyaanchat_widget_key", data.bot.widget_key || "");
        setState({ token: data.token, user: data.user, tenant: data.tenant, bot: data.bot });
    }

    function logout() {
        Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(k));
        localStorage.removeItem("gyaanchat_tenant_id");
        localStorage.removeItem("gyaanchat_widget_key");
        setState({ token: null, user: null, tenant: null, bot: null });
    }

    function updateUser(updates: Partial<AuthUser>) {
        setState((prev) => {
            const newUser = prev.user ? { ...prev.user, ...updates } : null;
            if (newUser) localStorage.setItem(LS_KEYS.user, JSON.stringify(newUser));
            return { ...prev, user: newUser };
        });
    }

    return (
        <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

