import os
import json
import time

STATUS_DIR = "uploads/status"
os.makedirs(STATUS_DIR, exist_ok=True)

def update_status(doc_id: str, status: str, tenant_id: str, filename: str, error: str = None):
    status_path = os.path.join(STATUS_DIR, f"{doc_id}.json")
    status_data = {
        "doc_id": doc_id,
        "tenant_id": tenant_id,
        "filename": filename,
        "status": status,
        "updated_at": time.time(),
        "error": error
    }
    with open(status_path, "w") as f:
        json.dump(status_data, f)

def get_status(doc_id: str):
    status_path = os.path.join(STATUS_DIR, f"{doc_id}.json")
    if not os.path.exists(status_path):
        return None
    with open(status_path, "r") as f:
        return json.load(f)

def list_tenant_documents(tenant_id: str):
    docs = []
    for filename in os.listdir(STATUS_DIR):
        if filename.endswith(".json"):
            with open(os.path.join(STATUS_DIR, filename), "r") as f:
                data = json.load(f)
                if data.get("tenant_id") == tenant_id:
                    docs.append(data)
    return docs

def remove_status_file(doc_id: str):
    status_path = os.path.join(STATUS_DIR, f"{doc_id}.json")
    if os.path.exists(status_path):
        os.remove(status_path)
