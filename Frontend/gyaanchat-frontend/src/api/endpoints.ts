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
  let answer = "";
  let sources: any[] = [];
  
  // Consume the stream silently to emulate the old synchronous behavior
  // while allowing the backend to keep the connection alive via SSE
  for await (const chunk of streamChatTenant(tenantId, userText, options)) {
    if (chunk.type === "sources") {
      sources = chunk.sources;
    } else if (chunk.type === "content") {
      answer += chunk.content;
    }
  }
  
  return { answer, sources, used_sources: sources.length > 0 };
}

export async function* streamChatTenant(tenantId: string, userText: string, options?: { temperature?: number }) {
  const payload = { tenant_id: tenantId, question: userText, ...options };
  // Use native fetch to be able to read the stream easily
  const baseURL = api.defaults.baseURL || import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
  
  const token = localStorage.getItem("gc_token");
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${baseURL}/chat/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Chat request failed: ${errText}`);
  }

  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    // Split the chunk by double newlines since it's SSE format
    const events = chunk.split("\n\n");
    for (const event of events) {
      if (event.startsWith("data: ")) {
        const jsonStr = event.substring(6).trim();
        if (!jsonStr) continue;
        try {
          const data = JSON.parse(jsonStr);
          yield data;
        } catch (e) {
          console.error("Failed to parse SSE JSON:", e, "String was:", jsonStr);
        }
      }
    }
  }
}

