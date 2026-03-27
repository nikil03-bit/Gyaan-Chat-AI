import { api } from "./client";
import type { UploadResponse, DocStatusResponse, ChatResponse } from "./types";

export async function uploadDocument(tenantId: string, file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);

  // Do NOT set Content-Type manually — axios sets it automatically as
  // 'multipart/form-data; boundary=...' when the body is FormData.
  // Setting it manually strips the boundary and causes FastAPI to return 422.
  const { data } = await api.post(
    `/documents/upload?tenant_id=${encodeURIComponent(tenantId)}`,
    form
  );

  return data;
}

export async function getDocStatus(tenantId: string, docId: string): Promise<DocStatusResponse> {
  const { data } = await api.get(
    `/documents/status?tenant_id=${encodeURIComponent(tenantId)}&doc_id=${encodeURIComponent(docId)}`
  );
  return data;
}

export async function listDocuments(tenantId: string): Promise<DocStatusResponse[]> {
  const { data } = await api.get(`/documents/list?tenant_id=${encodeURIComponent(tenantId)}`);
  return data;
}

export async function deleteDocument(tenantId: string, docId: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/documents/delete?tenant_id=${encodeURIComponent(tenantId)}&doc_id=${encodeURIComponent(docId)}`);
  return data;
}

export async function chatTenant(tenantId: string, userText: string, options?: { temperature?: number }): Promise<ChatResponse> {
  const payload = { tenant_id: tenantId, question: userText, ...options };
  const { data } = await api.post("/chat/", payload);
  return data;
}

