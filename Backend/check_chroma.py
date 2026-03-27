import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.vector_store import get_client

client = get_client()
collections = client.list_collections()
print(f"Total collections (tenants): {len(collections)}")

for c in collections:
    print(f"Tenant '{c.name}' has {c.count()} chunks.")
