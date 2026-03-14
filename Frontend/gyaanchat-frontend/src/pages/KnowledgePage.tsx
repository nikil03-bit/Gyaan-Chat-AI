import { useState } from "react";
import { uploadDocument, getDocStatus } from "../api/endpoints";

export default function KnowledgePage() {
  const tenantId = localStorage.getItem("gyaanchat_tenant_id") || "tenantA";
  const [file, setFile] = useState<File | null>(null);
  const [docId, setDocId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function handleUpload() {
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    try {
      const res = await uploadDocument(tenantId, file);
      setDocId(res.doc_id);
      setStatus("uploaded");

      const interval = setInterval(async () => {
        const s = await getDocStatus(tenantId, res.doc_id);
        setStatus(s.status);
        if (s.status === "ready" || s.status === "failed") clearInterval(interval);
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Upload failed.");
    }
  }

  return (
    <div className="page">
      <h1>Knowledge Upload</h1>

      <div className="card">
        <p><b>Tenant:</b> {tenantId}</p>

        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button className="button" onClick={handleUpload}>Upload</button>

        {docId && <p>Doc ID: {docId}</p>}
        {status && <p>Status: <b>{status}</b></p>}
        {error && <div className="alert">{error}</div>}
      </div>
    </div>
  );
}

