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
