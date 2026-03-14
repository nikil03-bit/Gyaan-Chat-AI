import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getBotSettings, updateBotSettings, uploadBotLogo, type BotSettings } from "../api/bot";
import { useAuth } from "../context/AuthContext";

interface BotSettingsContextValue {
    settings: BotSettings | null;
    loading: boolean;
    logoUrl: string | null;
    setLogoUrl: (url: string | null) => void;
    uploadLogo: (file: File) => Promise<void>;
    patchSettings: (patch: Partial<BotSettings>) => void;
    saveSettings: () => Promise<void>;
    saving: boolean;
}

const BotSettingsContext = createContext<BotSettingsContextValue | null>(null);

export function BotSettingsProvider({ children }: { children: ReactNode }) {
    const { tenant } = useAuth();
    const tenantId = tenant?.id || localStorage.getItem("gyaanchat_tenant_id") || "";

    const [settings, setSettings] = useState<BotSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!tenantId) { setLoading(false); return; }
        setLoading(true);
        getBotSettings(tenantId)
            .then(s => {
                setSettings(s);
                // If backend has a logo URL, use it (prepend API base if relative)
                if (s.logo_url) {
                    // s.logo_url is like "/uploads/logos/..." — we need full URL if frontend is on different port
                    // But for <img> src, a relative path works if served from same origin.
                    // Since dev is Vite (5173) and backend is 8000, we need full URL.
                    // Ideally `api.defaults.baseURL` or similar. 
                    // For now, let's assume valid URL or rely on proxy? 
                    // Actually, let's just prepend the API URL base.
                    const baseUrl = "http://127.0.0.1:8000";
                    setLogoUrl(s.logo_url.startsWith("http") ? s.logo_url : `${baseUrl}${s.logo_url}`);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [tenantId]);

    const patchSettings = useCallback((patch: Partial<BotSettings>) => {
        setSettings((prev) => prev ? { ...prev, ...patch } : prev);
    }, []);

    const uploadLogo = useCallback(async (file: File) => {
        if (!tenantId) return;
        const { logo_url } = await uploadBotLogo(tenantId, file);
        // Update state
        const baseUrl = "http://127.0.0.1:8000";
        setLogoUrl(`${baseUrl}${logo_url}`);
        // Also update settings object so it saves correctly if needed
        setSettings(prev => prev ? { ...prev, logo_url } : prev);
    }, [tenantId]);

    // Override setLogoUrl to clear it from settings if null passed
    const handleSetLogoUrl = useCallback((url: string | null) => {
        setLogoUrl(url);
        if (!url) {
            setSettings(prev => prev ? { ...prev, logo_url: null } : prev);
        }
    }, []);

    const saveSettings = useCallback(async () => {
        if (!settings || !tenantId) return;
        setSaving(true);
        try {
            const updated = await updateBotSettings(tenantId, {
                name: settings.name,
                greeting: settings.greeting,
                fallback: settings.fallback,
                theme_color: settings.theme_color,
                temperature: settings.temperature,
                logo_url: settings.logo_url, // persist the URL
            });
            setSettings(updated);
        } finally {
            setSaving(false);
        }
    }, [settings, tenantId]);

    return (
        <BotSettingsContext.Provider value={{
            settings, loading, logoUrl,
            setLogoUrl: handleSetLogoUrl,
            uploadLogo,
            patchSettings, saveSettings, saving
        }}>
            {children}
        </BotSettingsContext.Provider>
    );
}

export function useBotSettings() {
    const ctx = useContext(BotSettingsContext);
    if (!ctx) throw new Error("useBotSettings must be used inside BotSettingsProvider");
    return ctx;
}

