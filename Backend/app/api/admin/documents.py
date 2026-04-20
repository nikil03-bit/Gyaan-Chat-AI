from fastapi import APIRouter, Depends
from datetime import datetime
from app.api.admin.deps import verify_admin
import os, json

router = APIRouter(prefix="/documents")

@router.get("")
def list_documents(_: dict = Depends(verify_admin)):
    docs = []
    try:
        from app.api.documents import STATUS_DIR
        if os.path.exists(STATUS_DIR):
            for fname in os.listdir(STATUS_DIR):
                if fname.endswith(".json"):
                    try:
                        with open(os.path.join(STATUS_DIR, fname)) as f:
                            d = json.load(f)
                        docs.append({
                            "doc_id":    d.get("doc_id"),
                            "filename":  d.get("filename"),
                            "tenant_id": d.get("tenant_id"),
                            "status":    d.get("status"),
                            "error":     d.get("error"),
                            "updated_at": datetime.fromtimestamp(d.get("updated_at", 0)).isoformat(),
                        })
                    except Exception:
                        pass
    except Exception:
        pass
    docs.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
    return docs

@router.get("/{doc_id}/download")
def download_document(doc_id: str, _: dict = Depends(verify_admin)):
    from app.api.documents import STATUS_DIR, UPLOAD_DIR
    from fastapi.responses import FileResponse
    from fastapi import HTTPException
    
    status_path = os.path.join(STATUS_DIR, f"{doc_id}.json")
    if not os.path.exists(status_path):
         raise HTTPException(status_code=404, detail="Document not found")
         
    with open(status_path) as f:
         d = json.load(f)
         
    fname = d.get("filename", "document.pdf")
    safe_fname = fname.replace(" ", "_")
    
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{safe_fname}")
    if not os.path.exists(file_path):
         file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{fname}")
         if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found on disk")
            
    return FileResponse(file_path, filename=fname)
