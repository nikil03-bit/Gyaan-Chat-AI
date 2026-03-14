import { api } from "./client";

export interface BotSettings {
    id: string;
    tenant_id: string;
    name: string;
    greeting: string;
    fallback: string;
    theme_color: string;
    temperature: string;
    widget_key: string;
    logo_url?: string | null;
}

export interface BotSettingsUpdate {
    name?: string;
    greeting?: string;
    fallback?: string;
    theme_color?: string;
    temperature?: string;
    logo_url?: string | null;
}

export async function getBotSettings(tenantId: string): Promise<BotSettings> {
    const { data } = await api.get(`/bot/settings?tenant_id=${encodeURIComponent(tenantId)}`);
    return data;
}

export async function updateBotSettings(tenantId: string, settings: BotSettingsUpdate): Promise<BotSettings> {
    const { data } = await api.put(`/bot/settings?tenant_id=${encodeURIComponent(tenantId)}`, settings);
    return data;
}

export async function uploadBotLogo(tenantId: string, file: File): Promise<{ logo_url: string }> {
    const form = new FormData();
    form.append("file", file);
    // Do NOT set Content-Type manually — axios sets multipart boundary automatically
    const { data } = await api.post(`/bot/logo?tenant_id=${encodeURIComponent(tenantId)}`, form);
    return data;
}

