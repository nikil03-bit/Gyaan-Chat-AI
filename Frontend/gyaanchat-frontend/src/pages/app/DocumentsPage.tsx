import { useState, useEffect, useRef } from "react";
import { Inbox, FileText, File, UploadCloud } from "lucide-react";
import { uploadDocument, getDocStatus, listDocuments, deleteDocument } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import type { DocItem } from "../../api/types";
import Skeleton from "../../components/ui/Skeleton";

export default function DocumentsPage() {
    const { tenant } = useAuth();
    const { showToast } = useToast();
    const tenantId = tenant?.id || localStorage.getItem("gyaanchat_tenant_id") || "";

    const [docs, setDocs] = useState<DocItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchDocs(); }, [tenantId]);

    // Status polling
    useEffect(() => {
        const active = docs.some((d) => d.status === "processing" || d.status === "uploaded");
        if (!active) return;
        const interval = setInterval(async () => {
            let changed = false;
            const updated = await Promise.all(docs.map(async (doc) => {
                if (doc.status === "processing" || doc.status === "uploaded") {
                    try {
                        const s = await getDocStatus(tenantId, doc.doc_id);
                        if (s.status !== doc.status) {
                            changed = true;
                            if (s.status === "ready") showToast(`"${s.filename}" is ready!`, "success");
                            if (s.status === "failed") showToast(`"${s.filename}" failed: ${s.error || "Unknown error"}`, "error");
                            return s;
                        }
                    } catch { /* ignore */ }
                }
                return doc;
            }));
            if (changed) setDocs(updated);
        }, 3000);
        return () => clearInterval(interval);
    }, [docs, tenantId]);

    async function fetchDocs() {
        try {
            setLoading(true);
            const data = await listDocuments(tenantId);
            setDocs(Array.isArray(data) ? data.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0)) : []);
        } catch { setDocs([]); }
        finally { setLoading(false); }
    }

    function handleFileDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        const allowed = [".pdf", ".txt", ".docx", ".md", ".csv", ".html", ".htm"];
        const ext = file?.name.includes(".") ? "." + file.name.split(".").pop()!.toLowerCase() : "";
        if (file && allowed.includes(ext)) {
            setSelectedFile(file);
        } else {
            showToast("Supported types: PDF, TXT, DOCX, MD, CSV, HTML", "error");
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        const allowed = [".pdf", ".txt", ".docx", ".md", ".csv", ".html", ".htm"];
        const ext = file?.name.includes(".") ? "." + file.name.split(".").pop()!.toLowerCase() : "";
        if (file && allowed.includes(ext)) {
            setSelectedFile(file);
        } else if (file) {
            showToast("Supported types: PDF, TXT, DOCX, MD, CSV, HTML", "error");
        }
    }

    async function handleUpload() {
        if (!selectedFile || uploading) return;
        setUploading(true);
        try {
            const res = await uploadDocument(tenantId, selectedFile);
            const newDoc: DocItem = { doc_id: res.doc_id, tenant_id: tenantId, filename: selectedFile.name, status: "uploaded", updated_at: Date.now() / 1000 };
            setDocs([newDoc, ...docs]);
            setSelectedFile(null);
            setModalOpen(false);
            showToast("Upload started! Processing in background.", "success");
        } catch (err: any) {
            showToast(err?.response?.data?.detail || "Upload failed.", "error");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    async function handleDelete(docId: string) {
        try {
            await deleteDocument(tenantId, docId);
            setDocs(docs.filter((d) => d.doc_id !== docId));
            showToast("Document deleted.", "success");
        } catch {
            setDocs(docs.filter((d) => d.doc_id !== docId));
            showToast("Document removed.", "info");
        }
        setConfirmDelete(null);
    }

    function formatTime(ts?: number) {
        if (!ts) return "—";
        return new Date(ts * 1000).toLocaleDateString([], { dateStyle: "medium" });
    }

    const statusBadge = (doc: DocItem) => {
        if (doc.status === "ready") return <span className="badge badge-success">✓ Ready</span>;
        if (doc.status === "failed") return (
            <span className="badge badge-danger" title={doc.error || "Processing failed"} style={{ cursor: "help" }}>
                ✕ Failed {doc.error ? "ⓘ" : ""}
            </span>
        );
        return <span className="badge badge-muted"><span className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} /> Processing</span>;
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Knowledge Base</h1>
                    <p className="page-subtitle">Upload documents to train your AI assistant</p>
                </div>
                <button className="btn-primary" onClick={() => setModalOpen(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Upload Document
                </button>
            </div>

            {/* Document list */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {loading ? (
                    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <Skeleton width="32px" height="32px" borderRadius="8px" />
                                <div style={{ flex: 1 }}>
                                    <Skeleton width="60%" height="14px" style={{ marginBottom: 6 }} />
                                    <Skeleton width="40%" height="12px" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : docs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><Inbox size={48} /></div>
                        <div className="empty-state-title">No documents yet</div>
                        <div className="empty-state-sub">Upload PDF, TXT, DOCX, MD, CSV, or HTML to train your assistant.</div>
                        <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => setModalOpen(true)}>Upload Now</button>
                    </div>
                ) : (
                    docs.map((doc) => (
                        <div key={doc.doc_id} className="doc-card">
                            <div className="doc-icon"><FileText size={20} /></div>
                            <div className="doc-info">
                                <div className="doc-name">{doc.filename || "Unnamed"}</div>
                                <div className="doc-meta">{formatTime(doc.updated_at)} · {doc.doc_id?.slice(0, 8)}...</div>
                            </div>
                            {statusBadge(doc)}
                            <div className="doc-actions">
                                {confirmDelete === doc.doc_id ? (
                                    <>
                                        <button className="btn-danger" style={{ padding: "6px 12px", fontSize: "0.75rem" }} onClick={() => handleDelete(doc.doc_id)}>Yes, delete</button>
                                        <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: "0.75rem" }} onClick={() => setConfirmDelete(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <button className="btn-ghost" style={{ padding: "6px 10px" }} title="Delete" onClick={() => setConfirmDelete(doc.doc_id)}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Upload Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
                    <div className="modal">
                        <h2 className="modal-title">Upload Document</h2>
                        <div
                            className={`drop-zone ${dragOver ? "drag-over" : ""}`}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleFileDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="drop-zone-icon"><UploadCloud size={40} /></div>
                            <div className="drop-zone-text">Drop file here</div>
                            <div className="drop-zone-sub">PDF, TXT, DOCX, MD, CSV, HTML · or click to browse</div>
                        </div>
                        <input ref={fileInputRef} type="file" accept=".pdf,.txt,.docx,.md,.csv,.html,.htm" style={{ display: "none" }} onChange={handleFileChange} />

                        {selectedFile && (
                            <div className="selected-file-row">
                                <File size={16} />
                                <span style={{ flex: 1, fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedFile.name}</span>
                                <span className="muted">{(selectedFile.size / 1024).toFixed(0)} KB</span>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button className="btn-ghost" onClick={() => { setModalOpen(false); setSelectedFile(null); }}>Cancel</button>
                            <button className="btn-primary" disabled={!selectedFile || uploading} onClick={handleUpload}>
                                {uploading ? <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Uploading...</> : "Upload"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

