_client = None

def get_client():
    global _client
    if _client is None:
        import chromadb
        from chromadb.config import Settings
        print("Initializing ChromaDB client...")
        _client = chromadb.Client(
            Settings(persist_directory="./chroma", anonymized_telemetry=False)
        )
    return _client

def get_collection(tenant_id: str):
    client = get_client()
    return client.get_or_create_collection(name=tenant_id)

