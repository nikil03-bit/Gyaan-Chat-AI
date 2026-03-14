import { useMemo, useState } from "react";
import { chatTenant } from "../api/endpoints";

type Msg = { role: "user" | "assistant"; text: string };

export default function TestChatPage() {
  const tenantId = useMemo(() => localStorage.getItem("gyaanchat_tenant_id") || "tenantA", []);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  async function send() {
    const q = input.trim();
    if (!q || busy) return;

    setError("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setBusy(true);

    try {
      const res = await chatTenant(tenantId, q);

      let extra = "";
      if (res.sources?.length) {
        extra =
          "\n\nSources:\n" +
          res.sources.map((s) => `- ${s.filename} (chunk ${s.chunk_index})`).join("\n");
      }

      setMsgs((m) => [...m, { role: "assistant", text: (res.answer || "") + extra }]);
    } catch (e: any) {
      setError(e?.message || "Chat request failed. Check backend is running.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <header className="pageHeader">
        <div>
          <h1 className="pageTitle">Test Chat</h1>
          <p className="muted">Ask questions from your uploaded PDF. Answers should include sources.</p>
        </div>
        <div className="mono">Tenant: {tenantId}</div>
      </header>

      <div className="card chatBox">
        <div className="chatMessages">
          {msgs.length === 0 && <div className="muted">Upload a PDF first, then ask something from it.</div>}

          {msgs.map((m, i) => (
            <div key={i} className={m.role === "user" ? "chatMsg user" : "chatMsg bot"}>
              <div className="chatRole">{m.role === "user" ? "You" : "Bot"}</div>
              <div className="chatText">{m.text}</div>
            </div>
          ))}
        </div>

        {error && <div className="alert" style={{ marginTop: 12 }}>{error}</div>}

        <div className="chatInputRow">
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a question..."
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="button" onClick={send} disabled={busy}>
            {busy ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

