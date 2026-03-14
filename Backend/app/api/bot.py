from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import os, uuid, shutil
from app.core.database import get_db
from app.models import Bot

router = APIRouter()

LOGO_DIR = os.path.join("uploads", "logos")
os.makedirs(LOGO_DIR, exist_ok=True)

# ── Schemas ───────────────────────────────────────────────────────────────────

class BotSettingsUpdate(BaseModel):
    name: Optional[str] = None
    greeting: Optional[str] = None
    fallback: Optional[str] = None
    theme_color: Optional[str] = None
    temperature: Optional[str] = None
    logo_url: Optional[str] = None


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_or_create_bot(tenant_id: str, db: Session) -> Bot:
    bot = db.query(Bot).filter(Bot.tenant_id == tenant_id).first()
    if not bot:
        bot = Bot(tenant_id=tenant_id)
        db.add(bot)
        db.commit()
        db.refresh(bot)
    return bot


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/settings")
def get_bot_settings(tenant_id: str, db: Session = Depends(get_db)):
    return _get_or_create_bot(tenant_id, db)


@router.put("/settings")
def update_bot_settings(tenant_id: str, settings: BotSettingsUpdate, db: Session = Depends(get_db)):
    bot = _get_or_create_bot(tenant_id, db)
    for field, value in settings.model_dump(exclude_none=True).items():
        setattr(bot, field, value)
    db.commit()
    db.refresh(bot)
    return bot


@router.post("/logo")
async def upload_bot_logo(
    tenant_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a logo image and store its URL in the bot row."""
    # Validate image type
    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (PNG, JPG, SVG, etc.)")

    # Read and size-check (2 MB)
    content = await file.read()
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Logo must be under 2 MB.")

    # Save with a unique filename
    ext = os.path.splitext(file.filename or "logo.png")[1].lower() or ".png"
    filename = f"{tenant_id}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = os.path.join(LOGO_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(content)

    # Store URL in DB (served via /static/logos/<filename>)
    logo_url = f"/uploads/logos/{filename}"
    bot = _get_or_create_bot(tenant_id, db)
    bot.logo_url = logo_url
    db.commit()
    db.refresh(bot)

    return {"logo_url": logo_url}


@router.get("/widget-config")
def get_widget_config(widget_key: str, db: Session = Depends(get_db)):
    """
    Public endpoint — no auth required.
    Returns the bot's public configuration for the embeddable widget.
    """
    bot = db.query(Bot).filter(Bot.widget_key == widget_key).first()
    if not bot:
        return JSONResponse(status_code=404, content={"detail": "Widget key not found."})

    return {
        "name": bot.name or "GyaanChat Bot",
        "greeting": bot.greeting or "Hi! How can I help you?",
        "fallback": bot.fallback or "I couldn't find that in your documents.",
        "theme_color": bot.theme_color or "#3b82f6",
        "logo_url": bot.logo_url or None,
    }

