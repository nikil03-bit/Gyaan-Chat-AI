import os
from app.utils.file_utils import update_status, get_status, list_tenant_documents, remove_status_file
from app.services.pdf_loader import extract_text_from_pdf
from app.services.chunker import chunk_text
from app.services.embeddings import embed_texts
from app.services.vector_store import get_collection

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def process_document_background(file_path: str, doc_id: str, tenant_id: str, filename: str, bot_id: str = "default"):
    try:
        update_status(doc_id, "processing", tenant_id, filename)
        
        text = extract_text_from_pdf(file_path)
        chunks = chunk_text(text)
        embeddings = embed_texts(chunks)

        collection = get_collection(tenant_id)

        ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
        metadatas = [
            {
                "tenant_id": tenant_id,
                "doc_id": doc_id,
                "chunk_index": i,
                "filename": filename,
                "bot_id": bot_id
            } for i in range(len(chunks))
        ]

        collection.add(
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        
        update_status(doc_id, "ready", tenant_id, filename)
    except Exception as e:
        update_status(doc_id, "failed", tenant_id, filename, error=str(e))

def process_document_deletion(tenant_id: str, doc_id: str, filename: str):
    # Remove from Chroma
    try:
        collection = get_collection(tenant_id)
        collection.delete(where={"doc_id": doc_id})
    except Exception as e:
        pass # Handle silently 
        
    # Remove the status file
    remove_status_file(doc_id)

    # Attempt to remove original file
    if filename:
        file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{filename}")
        if os.path.exists(file_path):
            os.remove(file_path)
