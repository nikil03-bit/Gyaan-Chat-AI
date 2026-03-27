import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.vector_store import get_collection
from app.services.embeddings import embed_texts

def debug_rag(tenant_id="test_tenant", query="hello world"):
    collection = get_collection(tenant_id)
    if not collection:
        print("No collection found for tenant:", tenant_id)
        return

    query_embedding = embed_texts([query])[0]
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=4
    )
    
    docs = results["documents"][0] if results["documents"] else []
    metadatas = results["metadatas"][0] if results["metadatas"] else []
    distances = results["distances"][0] if results["distances"] else []

    print(f"Docs count: {len(docs)}")
    if distances:
        print(f"Top distance: {distances[0]}")
    else:
        print("No distances returned.")
    
    for i in range(len(docs)):
        print(f"Doc {i+1} Distance {distances[i]}: {docs[i][:100]}...")

if __name__ == "__main__":
    debug_rag(query="What is the capital of France?")
