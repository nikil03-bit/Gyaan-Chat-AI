export type UploadResponse = {
  message: string;
  tenant_id: string;
  doc_id: string;
};

export type DocStatusResponse = {
  tenant_id: string;
  doc_id: string;
  status: "uploaded" | "processing" | "ready" | "failed";
  filename?: string;
  updated_at?: number;
  error?: string;
};

export type DocItem = DocStatusResponse;

export type ChatResponse = {
  answer: string;
  used_sources?: boolean;
  sources?: Array<{
    doc_id: string;
    chunk_index: number;
    filename: string;
  }>;
  conversation_id?: string;
};

