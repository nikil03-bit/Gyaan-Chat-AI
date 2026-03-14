from pydantic import BaseModel

class ChatRequest(BaseModel):
    tenant_id: str
    question: str

class WidgetChatRequest(BaseModel):
    widget_key: str
    visitor_id: str
    message: str
