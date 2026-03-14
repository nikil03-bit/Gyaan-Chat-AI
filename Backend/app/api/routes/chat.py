from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...schemas.chat import ChatRequest, WidgetChatRequest
from ...services import chat_service

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/")
def chat(req: ChatRequest):
    return chat_service.process_chat(req.tenant_id, req.question)

@router.post("/widget")
def widget_chat(req: WidgetChatRequest, db: Session = Depends(get_db)):
    return chat_service.process_widget_chat(req.widget_key, req.message, db)
