from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
import re
from ..core.database import get_db
from ..models import Bot, ChatHistory, ChatLog

from app.services.llm import generate_answer
from app.services.embeddings import embed_texts
from app.services.vector_store import get_collection
from app.services.rag import build_prompt

router = APIRouter()

class ChatRequest(BaseModel):
    tenant_id: str
    question: str
    bot_id: Optional[str] = None
    session_id: Optional[str] = None

class WidgetChatRequest(BaseModel):
    widget_key: str
    visitor_id: str
    message: str


def save_interaction(db: Session, tenant_id: str, question: str, answer: str, bot_id: Optional[str] = None, session_id: Optional[str] = None):
    """Save a chat interaction to the ChatHistory table."""
    try:
        user_msg = ChatHistory(
            tenant_id=tenant_id,
            bot_id=bot_id,
            session_id=session_id,
            sender="user",
            message=question
        )
        bot_msg = ChatHistory(
            tenant_id=tenant_id,
            bot_id=bot_id,
            session_id=session_id,
            sender="bot",
            message=answer
        )
        db.add(user_msg)
        db.add(bot_msg)
        db.commit()
    except Exception as e:
        print(f"Failed to save chat history: {e}")


def save_chat_log(db: Session, tenant_id: str, question: str, answer: str, source_count: int = 0, bot_id: Optional[str] = None):
    """Save a ChatLog row for analytics — one row per Q&A pair."""
    try:
        log = ChatLog(
            tenant_id=tenant_id,
            bot_id=bot_id,
            question=question,
            answer=answer,
            source_count=source_count,
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"Failed to save chat log: {e}")


@router.post("/")
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    """RAG chat endpoint — handles greetings, small-talk, and document-based Q&A."""
    msg = req.question.strip()

    # Small-talk / greetings bypass (no RAG needed)
    if re.match(r"^(hi|hello|hey|hii|hola|good morning|good afternoon|good evening|howdy|greetings)\b", msg.lower()):
        answer = "Hello! 👋 I am your GyaanChat assistant. How can I help you today?"
        save_interaction(db, req.tenant_id, msg, answer, req.bot_id, req.session_id)
        return {"answer": answer, "sources": []}

    if re.match(r"^(thanks|thank you|thx|cool|great|awesome)\b", msg.lower()):
        answer = "You're welcome! 😊 Is there anything else I can help you with?"
        save_interaction(db, req.tenant_id, msg, answer, req.bot_id, req.session_id)
        return {"answer": answer, "sources": []}

    from app.main import RAG_DISTANCE_THRESHOLD

    collection = get_collection(req.tenant_id)
    if not collection:
        answer = "I don't have enough information to answer that yet."
        save_interaction(db, req.tenant_id, msg, answer, req.bot_id, req.session_id)
        save_chat_log(db, req.tenant_id, msg, answer, source_count=0, bot_id=req.bot_id)
        return {"answer": answer, "sources": []}

    query_embedding = embed_texts([req.question])[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=4
    )

    docs = results["documents"][0] if results["documents"] else []
    metadatas = results["metadatas"][0] if results["metadatas"] else []
    distances = results["distances"][0] if results["distances"] else []

    is_relevant = bool(distances and distances[0] < RAG_DISTANCE_THRESHOLD)

    if not docs or not is_relevant:
        answer = "I couldn't find this information in the provided documents."
        save_interaction(db, req.tenant_id, msg, answer, req.bot_id, req.session_id)
        save_chat_log(db, req.tenant_id, msg, answer, source_count=0, bot_id=req.bot_id)
        return {"answer": answer, "used_sources": False, "sources": []}

    prompt = build_prompt(docs, req.question)
    answer_text = generate_answer(prompt)

    sources = [
        {
            "doc_id": meta.get("doc_id"),
            "chunk_index": meta.get("chunk_index"),
            "filename": meta.get("filename"),
        }
        for meta in metadatas
    ]

    save_interaction(db, req.tenant_id, msg, answer_text, req.bot_id, req.session_id)
    save_chat_log(db, req.tenant_id, msg, answer_text, source_count=len(sources), bot_id=req.bot_id)

    return {"answer": answer_text, "used_sources": True, "sources": sources}


# ── Widget endpoint (PUBLIC — called from customer websites) ──────────────────

@router.options("/widget")
async def widget_options():
    """Explicit OPTIONS handler for the widget preflight.
    CORSMiddleware handles this automatically, but an explicit route
    ensures it appears in /docs and works even if middleware ordering changes."""
    return JSONResponse(
        content={},
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
        },
    )


@router.post("/widget")
def widget_chat(req: WidgetChatRequest, db: Session = Depends(get_db)):
    """Public widget chat endpoint — looks up bot by widget_key.
    Returns JSONResponse (not plain dict) so CORS headers survive on errors too."""
    bot = db.query(Bot).filter(Bot.widget_key == req.widget_key).first()
    if not bot:
        return JSONResponse(
            content={"detail": "Invalid widget key"},
            status_code=404,
        )

    chat_req = ChatRequest(
        tenant_id=bot.tenant_id,
        question=req.message,
        bot_id=bot.id,
        session_id=req.visitor_id,
    )
    # Call the internal chat handler and wrap result in JSONResponse
    result = chat(chat_req, db)
    # result is already a dict (plain return from chat())
    if isinstance(result, dict):
        return JSONResponse(content=result)
    return result

