from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
import json
from pydantic import BaseModel
from sqlalchemy.orm import Session
import re
from ..core.database import get_db
from ..models import Bot, ChatHistory, ChatLog

from app.services.llm import generate_answer, generate_answer_stream
from app.services.embeddings import embed_texts
from app.services.vector_store import get_collection
from app.services.rag import build_prompt, build_smalltalk_prompt

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

    # 1. Routing Layer: Small-talk / Greetings bypassing RAG
    # We check if the message is short (under ~8 words) and contains conversational keywords.
    words = msg.split()
    smalltalk_pattern = r"^(hi|hello|hey|hii|hola|good morning|good afternoon|good evening|howdy|greetings|how are you|how do you do|what's up|whats up|who are you|what are you called|do you know me|thanks|thank you|thx|cool|great|awesome)\b"
    
    is_smalltalk = False
    if len(words) <= 8 and re.match(smalltalk_pattern, msg.lower()):
        is_smalltalk = True

    if is_smalltalk:
        print("[DEBUG] Message identified as SMALL-TALK. Routing to chat LLM bypassing RAG.")
        prompt = build_smalltalk_prompt(msg)
        
        async def smalltalk_generator():
            yield f"data: {json.dumps({'type': 'sources', 'sources': []})}\n\n"
            full_answer = ""
            for chunk in generate_answer_stream(prompt):
                full_answer += chunk
                yield f"data: {json.dumps({'type': 'content', 'content': chunk})}\n\n"
            save_interaction(db, req.tenant_id, msg, full_answer, req.bot_id, req.session_id)
            save_chat_log(db, req.tenant_id, msg, full_answer, source_count=0, bot_id=req.bot_id)

        return StreamingResponse(smalltalk_generator(), media_type="text/event-stream")
    # 2. Strict RAG Path
    print("[DEBUG] Message identified as FACTUAL. Routing to strict RAG database.")
    from app.main import RAG_DISTANCE_THRESHOLD

    print(f"\n[DEBUG] --- Incoming Chat Request ---")
    print(f"[DEBUG] Tenant ID: {req.tenant_id}")
    print(f"[DEBUG] Question: {req.question}")

    collection = get_collection(req.tenant_id)
    if not collection:
        print("[DEBUG] No ChromaDB collection found for this tenant.")
        answer_text = "I don't know."
        
        async def missing_coll_generator():
            yield f"data: {json.dumps({'type': 'sources', 'sources': []})}\n\n"
            yield f"data: {json.dumps({'type': 'content', 'content': answer_text})}\n\n"
            save_interaction(db, req.tenant_id, msg, answer_text, req.bot_id, req.session_id)
            save_chat_log(db, req.tenant_id, msg, answer_text, source_count=0, bot_id=req.bot_id)
            
        return StreamingResponse(missing_coll_generator(), media_type="text/event-stream")
    query_embedding = embed_texts([req.question])[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=4
    )

    docs = results["documents"][0] if results["documents"] else []
    metadatas = results["metadatas"][0] if results["metadatas"] else []
    distances = results["distances"][0] if results["distances"] else []

    print(f"[DEBUG] Retrieved {len(docs)} chunks from ChromaDB.")
    for i, (doc, meta, dist) in enumerate(zip(docs, metadatas, distances)):
        print(f"  [{i}] DIST: {dist:.4f} | FILE: {meta.get('filename')} | TEXT: {doc[:100]}...")
    
    print(f"[DEBUG] Threshold is: {RAG_DISTANCE_THRESHOLD}")

    # Check if we have at least one document under the threshold
    is_relevant = bool(distances and distances[0] < RAG_DISTANCE_THRESHOLD)

    if not docs or not is_relevant:
        print("[DEBUG] Context REJECTED (no docs or all distances above threshold).")
        answer_text = "I don't know."
        
        async def no_docs_generator():
            yield f"data: {json.dumps({'type': 'sources', 'sources': []})}\n\n"
            yield f"data: {json.dumps({'type': 'content', 'content': answer_text})}\n\n"
            save_interaction(db, req.tenant_id, msg, answer_text, req.bot_id, req.session_id)
            save_chat_log(db, req.tenant_id, msg, answer_text, source_count=0, bot_id=req.bot_id)
            
        return StreamingResponse(no_docs_generator(), media_type="text/event-stream")
    print("[DEBUG] Context ACCEPTED.")
    filenames = [meta.get("filename") for meta in metadatas]
    print(f"[DEBUG] Matched chunks from files: {filenames}")

    prompt = build_prompt(docs, req.question)

    sources = [
        {
            "doc_id": meta.get("doc_id"),
            "chunk_index": meta.get("chunk_index"),
            "filename": meta.get("filename"),
        }
        for meta in metadatas
    ]

    async def rag_generator():
        yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"
        full_answer = ""
        for chunk in generate_answer_stream(prompt):
            full_answer += chunk
            yield f"data: {json.dumps({'type': 'content', 'content': chunk})}\n\n"
            
        save_interaction(db, req.tenant_id, msg, full_answer, req.bot_id, req.session_id)
        save_chat_log(db, req.tenant_id, msg, full_answer, source_count=len(sources), bot_id=req.bot_id)

    return StreamingResponse(rag_generator(), media_type="text/event-stream")


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

