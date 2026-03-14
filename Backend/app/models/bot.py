from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .helpers import _uuid

class Bot(Base):
    __tablename__ = "bots"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id"), nullable=False)

    name: Mapped[str] = mapped_column(String, default="GyaanChat Bot")
    greeting: Mapped[str] = mapped_column(Text, default="Hi! How can I help you?")
    fallback: Mapped[str] = mapped_column(Text, default="I couldn’t find that in your documents.")
    theme_color: Mapped[str] = mapped_column(String, default="#3b82f6")
    temperature: Mapped[str] = mapped_column(String, default="0.2")

    widget_key: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False, default=_uuid)
    logo_url: Mapped[str] = mapped_column(String, nullable=True, default=None)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="bots")
