import re
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.bot import Bot
from app.services.llm import generate_answer
from app.services.embeddings import embed_texts
from app.services.vector_store import get_collection
from app.services.rag import build_prompt

def process_chat(tenant_id: str, question: str):
    msg = question.strip()

    if re.match(r"^(hi|hello|hey|hii|hola|good morning|good afternoon|good evening|howdy|greetings)\b", msg.lower()):
        return {
            "answer": "Hello! 👋 I am your GyaanChat assistant. How can I help you today?",
            "sources": []
        }

    if re.match(r"^(thanks|thank you|thx|cool|great|awesome)\b", msg.lower()):
        return {
            "answer": "You're welcome! 😊 Is there anything else I can help you with?",
            "sources": []
        }

    collection = get_collection(tenant_id)
    query_embedding = embed_texts([question])[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=4
    )

    docs = results["documents"][0] if results["documents"] else []
    metadatas = results["metadatas"][0] if results["metadatas"] else []
    distances = results["distances"][0] if results["distances"] else []

    is_relevant = False
    if distances and distances[0] < settings.RAG_DISTANCE_THRESHOLD:
        is_relevant = True

    if not docs or not is_relevant:
        return {
            "answer": "I couldn’t find this information in the provided documents.",
            "used_sources": False,
            "sources": []
        }

    prompt = build_prompt(docs, question)
    answer = generate_answer(prompt)

    sources = []
    if metadatas:
        for meta in metadatas:
            sources.append({
                "doc_id": meta.get("doc_id"),
                "chunk_index": meta.get("chunk_index"),
                "filename": meta.get("filename")
            })

    return {
        "answer": answer,
        "used_sources": True,
        "sources": sources
    }

def process_widget_chat(widget_key: str, message: str, db: Session):
    bot = db.query(Bot).filter(Bot.widget_key == widget_key).first()
    if not bot:
        return {
            "answer": "Invalid widget key.",
            "used_sources": False,
            "sources": []
        }
    
    tenant_id = bot.tenant_id
    return process_chat(tenant_id, message)
