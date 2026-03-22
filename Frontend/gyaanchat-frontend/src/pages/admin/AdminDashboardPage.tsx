import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

interface DashboardData {
  total_tenants: number; active_tenants: number; total_users: number; total_bots: number;
  total_messages: number; total_documents: number; failed_documents: number;
  recent_activity: { tenant_id: string; question: string; ts: string }[];
}

interface AnalyticsData {
  top_tenants: { tenant_name: string; messages: number }[];
  daily_trend: { date: string; messages: number }[];
}

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, padding: "20px 24px", borderLeft: color ? `3px solid ${color}` : undefined }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted,#94a3b8)" }}>{label}</div>
      <div style={{ fontSize: "1.875rem", fontWeight: 800, marginTop: 6, color: color || "var(--color-text,#e2e8f0)" }}>{value}</div>
      {sub && <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted,#94a3b8)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
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

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Platform Overview</h1>
        <p style={{ color: "var(--color-text-muted,#94a3b8)", marginTop: 4, fontSize: "0.875rem" }}>Real-time snapshot of your entire GyaanChat platform.</p>
      </div>
      {loading ? <p style={{ color: "var(--color-text-muted,#94a3b8)" }}>Loading…</p> : !data ? <p style={{ color: "#ef4444" }}>Failed to load.</p> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 32 }}>
            <StatCard label="Total Tenants"   value={data.total_tenants}   sub={`${data.active_tenants} active`} color="#7c3aed" />
            <StatCard label="Total Users"     value={data.total_users}     color="#2563eb" />
            <StatCard label="Total Bots"      value={data.total_bots}      color="#0891b2" />
            <StatCard label="Documents"       value={data.total_documents} sub={data.failed_documents > 0 ? `${data.failed_documents} failed` : undefined} color={data.failed_documents > 0 ? "#ef4444" : "#10b981"} />
            <StatCard label="Total Messages"  value={data.total_messages}  color="#f59e0b" />
          </div>
          <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted,#94a3b8)", marginBottom: 16 }}>Recent Activity</h2>
            {data.recent_activity.length === 0 ? <p style={{ color: "var(--color-text-muted,#94a3b8)", fontSize: "0.875rem" }}>No activity yet.</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead><tr style={{ borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
                  {["Tenant", "Last Query", "Time"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 12px 10px 0", color: "var(--color-text-muted,#94a3b8)", fontWeight: 600, fontSize: "0.75rem" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {data.recent_activity.map((a, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
                      <td style={{ padding: "8px 12px 8px 0", fontFamily: "monospace", fontSize: "0.72rem", color: "var(--color-text-muted,#94a3b8)" }}>{a.tenant_id.slice(0,8)}…</td>
                      <td style={{ padding: "8px 12px 8px 0" }}>{a.question}</td>
                      <td style={{ padding: "8px 0", fontSize: "0.72rem", color: "var(--color-text-muted,#94a3b8)" }}>{new Date(a.ts).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16, marginTop: 16 }}>
            <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted,#94a3b8)", marginBottom: 14 }}>Top Active Tenants</h2>
              {!analytics || analytics.top_tenants.length === 0 ? (
                <p style={{ color: "var(--color-text-muted,#94a3b8)", fontSize: "0.875rem" }}>No tenant analytics available yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {analytics.top_tenants.map((tenant, idx) => (
                    <div key={`${tenant.tenant_name}-${idx}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 20, height: 20, borderRadius: 999, background: "#7c3aed20", color: "#a855f7", fontSize: "0.72rem", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{idx + 1}</span>
                        <span style={{ fontWeight: 600, fontSize: "0.86rem" }}>{tenant.tenant_name}</span>
                      </div>
                      <span style={{ color: "var(--color-text-muted,#94a3b8)", fontSize: "0.78rem" }}>{tenant.messages} msgs</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted,#94a3b8)", marginBottom: 14 }}>Daily Trend</h2>
              {!analytics || analytics.daily_trend.length === 0 ? (
                <p style={{ color: "var(--color-text-muted,#94a3b8)", fontSize: "0.875rem" }}>No trend data available yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {analytics.daily_trend.slice(0, 7).map((d) => {
                    const maxMessages = Math.max(...analytics.daily_trend.map((row) => row.messages), 1);
                    const width = Math.max(6, Math.round((d.messages / maxMessages) * 100));
                    return (
                      <div key={d.date} style={{ display: "grid", gridTemplateColumns: "78px 1fr 52px", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted,#94a3b8)" }}>{d.date.slice(5)}</span>
                        <div style={{ height: 8, background: "#1f2430", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{ width: `${width}%`, height: "100%", background: "linear-gradient(90deg,#2563eb,#0ea5e9)", borderRadius: 999 }} />
                        </div>
                        <span style={{ textAlign: "right", fontSize: "0.72rem", color: "var(--color-text-muted,#94a3b8)" }}>{d.messages}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
