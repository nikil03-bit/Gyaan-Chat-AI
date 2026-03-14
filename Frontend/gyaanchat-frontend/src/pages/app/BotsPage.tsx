import { useState } from "react";

export default function BotsPage() {
  const [tenantId, setTenantId] = useState(localStorage.getItem("gyaanchat_tenant_id") || "tenantA");

  return (
    <div className="page">
      <header className="pageHeader">
        <div>
          <h1 className="pageTitle">Bots</h1>
          <p className="muted">For MVP, we use tenant_id as your bot context.</p>
        </div>
      </header>

      <div className="card">
        <div className="cardTitle">Set Tenant ID</div>

        <div className="row">
          <input
            className="input"
            style={{ width: 260 }}
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="tenant_id"
          />
          <button
            className="button"
            onClick={() => {
              localStorage.setItem("gyaanchat_tenant_id", tenantId);
              alert("Saved tenant_id!");
            }}
          >
            Save
          </button>
        </div>

        <p className="muted" style={{ marginTop: 10 }}>
          We’ll use this tenant_id in Knowledge Upload and Test Chat pages.
        </p>
      </div>
    </div>
  );
}
