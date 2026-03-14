import { api } from "./client";

export interface AnalyticsStats {
    total_messages: number;
    total_conversations: number;
    users: number;
}

export interface QuestionLog {
    id: string;
    question: string;
    created_at: string;
    session_id?: string;
}

export async function getAnalyticsStats(tenantId: string): Promise<AnalyticsStats> {
    const { data } = await api.get(`/analytics/stats?tenant_id=${encodeURIComponent(tenantId)}`);
    return data;
}

export async function getRecentQuestions(tenantId: string): Promise<QuestionLog[]> {
    const { data } = await api.get(`/analytics/questions?tenant_id=${encodeURIComponent(tenantId)}`);
    return data;
}

