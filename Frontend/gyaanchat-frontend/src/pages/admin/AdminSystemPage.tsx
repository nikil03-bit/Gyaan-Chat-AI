import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

interface HealthItem { service: string; status: string; ok: boolean; }
interface Settings { platform_name: string; environment: string; jwt_expire_minutes: string; allowed_origins: string; }

export default function AdminSystemPage() {
  const [health, setHealth] = useState<HealthItem[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const hdr = { Authorization: `Bearer ${token}` };
    setLoading(true);
    Promise.all([api.get("/admin/system/health", { headers: hdr }), api.get("/admin/system/settings", { headers: hdr })])
      .then(([r1, r2]) => { setHealth(r1.data); setSettings(r2.data); }).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>System & Settings</h1>
        <p style={{ color: "var(--color-text-muted,#94a3b8)", marginTop: 4, fontSize: "0.875rem" }}>Monitor infrastructure health and platform configuration.</p>
      </div>
      {loading ? <p style={{ color: "var(--color-text-muted,#94a3b8)" }}>Loading…</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
          <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted,#94a3b8)", marginBottom: 20 }}>System Health</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {health.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 600 }}>{h.service}</div>
                  <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: h.ok ? "#10b98120" : "#ef444420", color: h.ok ? "#10b981" : "#ef4444" }}>{h.status}</span>
                </div>
              ))}
            </div>
          </div>
          {settings && (
            <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted,#94a3b8)", marginBottom: 20 }}>Platform Config</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[["Platform Name", settings.platform_name], ["Environment", settings.environment], ["JWT Expire (min)", settings.jwt_expire_minutes]].map(([l, v]) => (
                  <div key={l}><div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", color: "var(--color-text-muted,#94a3b8)", marginBottom: 4 }}>{l}</div><div style={{ fontFamily: "monospace", background: "var(--color-bg,#0f1117)", padding: "6px 12px", borderRadius: 6, fontSize: "0.875rem" }}>{v || "—"}</div></div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
