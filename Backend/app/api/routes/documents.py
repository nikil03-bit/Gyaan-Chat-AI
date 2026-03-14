from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
import uuid
import os

from ...utils.file_utils import update_status, get_status, list_tenant_documents
from ...services.document_service import process_document_background, process_document_deletion, UPLOAD_DIR

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload")
async def upload_document(
    tenant_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    bot_id: str = "default"
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    doc_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{file.filename}")

    with open(file_path, "wb") as f:
        f.write(await file.read())

    update_status(doc_id, "uploaded", tenant_id, file.filename)
    background_tasks.add_task(process_document_background, file_path, doc_id, tenant_id, file.filename, bot_id)

    return {
        "message": "Processing started",
        "doc_id": doc_id,
        "tenant_id": tenant_id
    }

@router.get("/status")
def get_doc_status(tenant_id: str, doc_id: str):
    status_data = get_status(doc_id)
    if not status_data:
        raise HTTPException(status_code=404, detail="Document status not found")
    
    if status_data.get("tenant_id") != tenant_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to document status")
        
    return status_data

@router.get("/list")
def list_documents(tenant_id: str):
    return list_tenant_documents(tenant_id)

@router.delete("/delete")
def delete_document(tenant_id: str, doc_id: str):
    status_data = get_status(doc_id)
    if not status_data:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if status_data.get("tenant_id") != tenant_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    filename = status_data.get("filename")
    process_document_deletion(tenant_id, doc_id, filename)

    return {"message": "Document deleted successfully"}
