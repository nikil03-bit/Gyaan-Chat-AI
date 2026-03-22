import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

interface Analytics { totals: { tenants: number; users: number; bots: number; messages: number }; avg_messages_per_tenant: number; top_tenants: { tenant_name: string; messages: number }[]; daily_trend: { date: string; messages: number }[]; }

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    api.get("/admin/analytics", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Platform Analytics</h1>
        <p style={{ color: "var(--color-text-muted,#94a3b8)", marginTop: 4, fontSize: "0.875rem" }}>Insights into platform growth and engagement.</p>
      </div>
      {loading ? <p style={{ color: "var(--color-text-muted,#94a3b8)" }}>Loading…</p> : !data ? <p>Failed to load.</p> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 16, marginBottom: 28 }}>
            {[["Total Tenants", data.totals.tenants], ["Total Users", data.totals.users], ["Total Bots", data.totals.bots], ["Total Messages", data.totals.messages], ["Avg Msgs/Tenant", data.avg_messages_per_tenant]].map(([l, v]) => (
              <div key={l as string} style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, padding: "18px 22px" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted,#94a3b8)" }}>{l}</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: 6 }}>{Number(v).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted,#94a3b8)", marginBottom: 16 }}>Top Active Tenants</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.top_tenants.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#7c3aed20", color: "#a855f7", fontWeight: 700, fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, fontWeight: 600, fontSize: "0.875rem" }}>{t.tenant_name}</div>
                    <div style={{ fontWeight: 700, color: "#7c3aed" }}>{t.messages.toLocaleString()}</div>
                  </div>
                ))}
                {data.top_tenants.length === 0 && <p style={{ color: "var(--color-text-muted,#94a3b8)", fontSize: "0.875rem" }}>No data yet.</p>}
              </div>
            </div>
            <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted,#94a3b8)", marginBottom: 16 }}>Daily Trend (Last 7 Days)</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.daily_trend.slice(0, 7).map((d, i) => {
                  const max = Math.max(...data.daily_trend.map(x => x.messages), 1);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 80, fontSize: "0.72rem", color: "var(--color-text-muted,#94a3b8)", flexShrink: 0 }}>{d.date}</div>
                      <div style={{ flex: 1, height: 8, background: "var(--color-border,#2a2d3a)", borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", width: `${(d.messages / max) * 100}%`, background: "#7c3aed", borderRadius: 4 }} /></div>
                      <div style={{ width: 36, textAlign: "right", fontSize: "0.8rem", fontWeight: 600 }}>{d.messages}</div>
                    </div>
                  );
                })}
                {data.daily_trend.length === 0 && <p style={{ color: "var(--color-text-muted,#94a3b8)", fontSize: "0.875rem" }}>No activity yet.</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
