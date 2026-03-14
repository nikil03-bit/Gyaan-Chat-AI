export default function DashboardHome() {
  const stats = [
    { label: "Total Queries", value: "1,284" },
    { label: "Documents Uploaded", value: "12" },
    { label: "Avg Response Time", value: "1.4s" },
  ];

  const recentChats = [
    { id: 1, user: "Visitor #12", date: "2 mins ago", query: "How to reset password?" },
    { id: 2, user: "Visitor #05", date: "15 mins ago", query: "What is the return policy?" },
    { id: 3, user: "Visitor #09", date: "1 hour ago", query: "Pricing for enterprise" },
  ];

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Welcome back!</h1>
          <p className="page-subtitle">Here is what's happening with your AI assistant.</p>
        </div>
      </header>

      <div className="stat-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.0625rem", fontWeight: 600, marginBottom: 20 }}>Recent Queries</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Query</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentChats.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.user}</td>
                  <td>{c.query}</td>
                  <td className="muted">{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
