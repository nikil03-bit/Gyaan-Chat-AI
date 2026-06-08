import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Building2, MessageSquare, FileText, Bot, Users, BarChart2 } from "lucide-react";

interface DashboardData {
  total_tenants: number; active_tenants: number; total_users: number; total_bots: number;
  total_messages: number; total_documents: number; failed_documents: number;
  recent_activity: { tenant_id: string; question: string; ts: string }[];
}

interface AnalyticsData {
  top_tenants: { tenant_name: string; messages: number }[];
  daily_trend: { date: string; messages: number }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      api.get("/admin/dashboard", { headers }),
      api.get("/admin/analytics", { headers }),
    ])
      .then(([dashboardRes, analyticsRes]) => {
        setData(dashboardRes.data);
        setAnalytics(analyticsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const STATS = data ? [
    { label: "Total Tenants",    value: data.total_tenants,   sub: `${data.active_tenants} active`,   icon: <Building2 size={20} />,    accent: "#7c3aed" },
    { label: "Total Users",      value: data.total_users,     sub: undefined,                          icon: <Users size={20} />,        accent: "#2563eb" },
    { label: "Total Bots",       value: data.total_bots,      sub: undefined,                          icon: <Bot size={20} />,          accent: "#0891b2" },
    { label: "Total Messages",   value: data.total_messages,  sub: undefined,                          icon: <MessageSquare size={20} />,accent: "#f59e0b" },
    { label: "Documents",        value: data.total_documents, sub: data.failed_documents > 0 ? `${data.failed_documents} failed` : undefined, icon: <FileText size={20} />, accent: data.failed_documents > 0 ? "#ef4444" : "#10b981" },
  ] : [];

  return (
    <div className="page">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart2 size={24} style={{ color: "var(--color-accent)" }} />
            Platform Overview
          </h1>
          <p className="page-subtitle">Real-time snapshot of your entire GyaanChat platform.</p>
        </div>
      </div>

      {loading ? (
        <div className="stat-grid">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ height: 14, width: "50%", marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 36, width: "60%" }} />
            </div>
          ))}
        </div>
      ) : !data ? (
        <div className="empty-state">
          <div className="empty-state-title">Failed to load dashboard.</div>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="stat-grid">
            {STATS.map((s) => (
              <div key={s.label} className="stat-card" style={{ borderLeft: `3px solid ${s.accent}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div className="stat-label">{s.label}</div>
                  <div style={{ color: s.accent, opacity: 0.8 }}>{s.icon}</div>
                </div>
                <div className="stat-value">{s.value.toLocaleString()}</div>
                {s.sub && <div className="stat-sub">{s.sub}</div>}
              </div>
            ))}
          </div>

          {/* Two-column section */}
          <div className="charts-grid">
            {/* Top Tenants */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Top Active Tenants</h2>
              </div>
              <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                {!analytics || analytics.top_tenants.length === 0 ? (
                  <div className="empty-state" style={{ padding: "24px 0" }}>
                    <div className="empty-state-icon"><Building2 size={36} /></div>
                    <div className="empty-state-sub">No tenant analytics available yet.</div>
                  </div>
                ) : analytics.top_tenants.map((tenant, idx) => (
                  <div key={`${tenant.tenant_name}-${idx}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, paddingBottom: 12, borderBottom: "1px solid var(--color-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--color-accent)22", color: "var(--color-accent)", fontSize: "0.72rem", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{idx + 1}</span>
                      <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{tenant.tenant_name}</span>
                    </div>
                    <span className="badge badge-muted">{tenant.messages} msgs</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Trend */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)" }}>
                <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Daily Message Trend</h2>
              </div>
              <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                {!analytics || analytics.daily_trend.length === 0 ? (
                  <div className="empty-state" style={{ padding: "24px 0" }}>
                    <div className="empty-state-icon"><BarChart2 size={36} /></div>
                    <div className="empty-state-sub">No trend data available yet.</div>
                  </div>
                ) : analytics.daily_trend.slice(0, 7).map((d) => {
                  const maxMessages = Math.max(...analytics.daily_trend.map((row) => row.messages), 1);
                  const width = Math.max(4, Math.round((d.messages / maxMessages) * 100));
                  return (
                    <div key={d.date} style={{ display: "grid", gridTemplateColumns: "72px 1fr 48px", alignItems: "center", gap: 12 }}>
                      <span className="muted" style={{ fontSize: "0.72rem" }}>{d.date.slice(5)}</span>
                      <div style={{ height: 8, background: "var(--color-bg-input)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ width: `${width}%`, height: "100%", background: "linear-gradient(90deg,var(--color-accent),#0ea5e9)", borderRadius: 999, transition: "width 0.4s ease" }} />
                      </div>
                      <span className="muted" style={{ textAlign: "right", fontSize: "0.72rem" }}>{d.messages}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
