from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
import uuid
import os
import json
import time

from app.services.chunker import chunk_text
from app.services.embeddings import embed_texts
from app.services.vector_store import get_collection

router = APIRouter()

UPLOAD_DIR = "uploads"
STATUS_DIR = os.path.join(UPLOAD_DIR, "status")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(STATUS_DIR, exist_ok=True)

# Allowed file types
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx", ".md", ".csv", ".html", ".htm"}
MAX_FILE_SIZE_MB = 50


def update_status(doc_id: str, status: str, tenant_id: str, filename: str, error: str = None):
    status_path = os.path.join(STATUS_DIR, f"{doc_id}.json")
    status_data = {
        "doc_id": doc_id,
        "tenant_id": tenant_id,
        "filename": filename,
        "status": status,
        "updated_at": time.time(),
        "error": error,
    }
    with open(status_path, "w") as f:
        json.dump(status_data, f)


def extract_text(file_path: str, filename: str) -> str:
    """Extract plain text from PDF, TXT, DOCX, MD, CSV, or HTML files."""
    ext = os.path.splitext(filename)[1].lower()

    # ── Plain text / Markdown (identical treatment) ───────────────────────────
    if ext in (".txt", ".md"):
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read().strip()

    # ── PDF ───────────────────────────────────────────────────────────────────
    if ext == ".pdf":
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip()
        except Exception as e:
            raise ValueError(f"Could not read PDF: {e}")

    # ── DOCX ──────────────────────────────────────────────────────────────────
    if ext == ".docx":
        try:
            from docx import Document
            doc = Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            return "\n".join(paragraphs).strip()
        except Exception as e:
            raise ValueError(f"Could not read DOCX: {e}")

    # ── CSV ───────────────────────────────────────────────────────────────────
    if ext == ".csv":
        import csv
        rows = []
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore", newline="") as f:
                reader = csv.reader(f)
                for row in reader:
                    line = " | ".join(cell.strip() for cell in row if cell.strip())
                    if line:
                        rows.append(line)
            return "\n".join(rows).strip()
        except Exception as e:
            raise ValueError(f"Could not read CSV: {e}")

    # ── HTML / HTM ────────────────────────────────────────────────────────────
    if ext in (".html", ".htm"):
        from html.parser import HTMLParser

        class _TextExtractor(HTMLParser):
            SKIP_TAGS = {"script", "style", "head", "meta", "link", "noscript"}

            def __init__(self):
                super().__init__()
                self._parts: list[str] = []
                self._skip = 0

            def handle_starttag(self, tag, attrs):
                if tag in self.SKIP_TAGS:
                    self._skip += 1

            def handle_endtag(self, tag):
                if tag in self.SKIP_TAGS and self._skip > 0:
                    self._skip -= 1

            def handle_data(self, data):
                if self._skip == 0:
                    text = data.strip()
                    if text:
                        self._parts.append(text)

        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                raw = f.read()
            parser = _TextExtractor()
            parser.feed(raw)
            return " ".join(parser._parts).strip()
        except Exception as e:
            raise ValueError(f"Could not read HTML: {e}")

    raise ValueError(f"Unsupported file type: '{ext}'. Supported: PDF, TXT, DOCX, MD, CSV, HTML")


def process_document_task(file_path: str, doc_id: str, tenant_id: str, filename: str, bot_id: str = "default"):
    try:
        update_status(doc_id, "processing", tenant_id, filename)

        # Step 1: Extract text
        text = extract_text(file_path, filename)

        if not text:
            raise ValueError(
                "No text could be extracted from this file. "
                "If it is a scanned/image-based PDF, PyPDF2 cannot read it. "
                "Supported formats: PDF (text-based), TXT, DOCX, MD, CSV, HTML."
            )

        # Step 2: Chunk
        chunks = chunk_text(text)
        if not chunks:
            raise ValueError("Document produced 0 text chunks after processing.")

        print(f"[{doc_id}] Extracted {len(text)} chars → {len(chunks)} chunks")

        # Step 3: Embed
        embeddings = embed_texts(chunks)

        # Step 4: Store in ChromaDB
        collection = get_collection(tenant_id)

        ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
        metadatas = [
            {
                "tenant_id": tenant_id,
                "doc_id": doc_id,
                "chunk_index": i,
                "filename": filename,
                "bot_id": bot_id,
            }
            for i in range(len(chunks))
        ]

        collection.add(
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids,
        )

        update_status(doc_id, "ready", tenant_id, filename)
        print(f"[{doc_id}] Done — {len(chunks)} chunks stored for tenant {tenant_id}")

    except Exception as e:
        error_msg = str(e)
        print(f"[{doc_id}] FAILED: {error_msg}")
        update_status(doc_id, "failed", tenant_id, filename, error=error_msg)


@router.post("/upload")
async def upload_document(
    tenant_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    bot_id: str = "default",
):
    # Validate file extension
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext or 'none'}'. Allowed: PDF, TXT, DOCX, MD, CSV, HTML."
        )

    # Read file content
    content = await file.read()

    # Validate file size
    size_mb = len(content) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Maximum allowed: {MAX_FILE_SIZE_MB} MB."
        )

    # Validate it's not empty
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Save to disk
    doc_id = str(uuid.uuid4())
    safe_filename = filename.replace(" ", "_")
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{safe_filename}")

    with open(file_path, "wb") as f:
        f.write(content)

    # Initialize status
    update_status(doc_id, "uploaded", tenant_id, filename)

    # Queue background processing
    background_tasks.add_task(
        process_document_task, file_path, doc_id, tenant_id, filename, bot_id
    )

    return {
        "message": "Processing started",
        "doc_id": doc_id,
        "tenant_id": tenant_id,
    }


@router.get("/status")
def get_doc_status(tenant_id: str, doc_id: str):
    status_path = os.path.join(STATUS_DIR, f"{doc_id}.json")
    if not os.path.exists(status_path):
        raise HTTPException(status_code=404, detail="Document status not found")

    with open(status_path, "r") as f:
        status_data = json.load(f)

    if status_data["tenant_id"] != tenant_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to document status")

    return status_data


@router.get("/list")
def list_documents(tenant_id: str):
    docs = []
    for fname in os.listdir(STATUS_DIR):
        if fname.endswith(".json"):
            try:
                with open(os.path.join(STATUS_DIR, fname), "r") as f:
                    data = json.load(f)
                if data.get("tenant_id") == tenant_id:
                    docs.append(data)
            except Exception:
                pass
    # Sort newest first
    docs.sort(key=lambda d: d.get("updated_at", 0), reverse=True)
    return docs


@router.delete("/delete")
def delete_document(tenant_id: str, doc_id: str):
    status_path = os.path.join(STATUS_DIR, f"{doc_id}.json")
    if not os.path.exists(status_path):
        raise HTTPException(status_code=404, detail="Document not found")

    with open(status_path, "r") as f:
        data = json.load(f)

    if data.get("tenant_id") != tenant_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Remove status file
    os.remove(status_path)

    # Remove from ChromaDB
    try:
        collection = get_collection(tenant_id)
        collection.delete(where={"doc_id": doc_id})
    except Exception as e:
        print(f"Warning: Could not delete from ChromaDB: {e}")

    # Remove original file
    filename = data.get("filename", "")
    if filename:
        safe_filename = filename.replace(" ", "_")
        file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{safe_filename}")
        if os.path.exists(file_path):
            os.remove(file_path)
        # Also try original name without safe replacement
        file_path2 = os.path.join(UPLOAD_DIR, f"{doc_id}_{filename}")
        if os.path.exists(file_path2):
            os.remove(file_path2)

    return {"message": "Document deleted successfully"}

