import os

_client = None

def get_client():
    global _client
    if _client is None:
        import chromadb
        from chromadb.config import Settings
        persist_dir = os.getenv("CHROMA_PERSIST_DIR", "./chroma")
        print(f"Initializing ChromaDB client at: {persist_dir}")
        _client = chromadb.Client(
            Settings(persist_directory=persist_dir, anonymized_telemetry=False)
        )
    return _client

def get_collection(tenant_id: str):
    client = get_client()
    return client.get_or_create_collection(name=tenant_id)

