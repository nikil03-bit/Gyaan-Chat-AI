# Project Codebase Snapshot

## Directory Structure
```text
Gyaan-chat/
    .gitignore
    docker-compose.yml
    Backend/
        requirements.txt
        test_import.py
        app/
            auth_utils.py
            db.py
            main.py
            models.py
            requirements.txt
            __init__.py
            api/
                analytics.py
                auth.py
                bot.py
                chat.py
                documents.py
                __init__.py
                routes/
                    auth.py
                    chat.py
                    documents.py
                    __init__.py
            core/
                config.py
                database.py
                security.py
                __init__.py
            models/
                bot.py
                chat_history.py
                chat_log.py
                helpers.py
                tenant.py
                user.py
                __init__.py
            schemas/
                auth.py
                chat.py
                __init__.py
            services/
                auth_service.py
                chat_service.py
                chunker.py
                document_service.py
                embeddings.py
                llm.py
                pdf_loader.py
                rag.py
                vector_store.py
                __init__.py
            static/
            utils/
                file_utils.py
                __init__.py
    Frontend/
        gyaanchat-frontend/
            .gitignore
            codebase.py
            eslint.config.js
            index.html
            package.json
            README.md
            tsconfig.app.json
            tsconfig.json
            tsconfig.node.json
            vite.config.ts
            public/
                vite.svg
            src/
                App.tsx
                index.css
                main.tsx
                api/
                    analytics.ts
                    auth.ts
                    bot.ts
                    chat.ts
                    client.ts
                    documents.ts
                    endpoints.ts
                    types.ts
                app/
                assets/
                    react.svg
                components/
                    ProtectedRoute.tsx
                    common/
                    layout/
                        AppLayout.tsx
                        Sidebar.tsx
                        Topbar.tsx
                    ui/
                        Skeleton.tsx
                context/
                    AuthContext.tsx
                contexts/
                    BotSettingsContext.tsx
                    ThemeContext.tsx
                    ToastContext.tsx
                features/
                    auth/
                        ProtectedRoute.tsx
                hooks/
                pages/
                    BotsPage.tsx
                    KnowledgePage.tsx
                    LogsPage.tsx
                    TestChatPage.tsx
                    app/
                        AnalyticsChartPage.tsx
                        AnalyticsPage.tsx
                        BotSettingsPage.tsx
                        BotsPage.tsx
                        ConversationsPage.tsx
                        DashboardHome.tsx
                        DocumentsPage.tsx
                        InstallPage.tsx
                        KnowledgePage.tsx
                        LogsPage.tsx
                        ProfilePage.tsx
                        SettingsPage.tsx
                        TestChatPage.tsx
                    public/
                        LandingPage.tsx
                        LoginPage.tsx
                        RegisterPage.tsx
                styles/
                    analytics.css
                    App.css
                    chat.css
                    documents.css
                    globals.css
                    install.css
                    layout.css
                    sidebar.css
                    testchat.css
                utils/
```

---

## File Contents

### File: docker-compose.yml
```yml
version: "3.9"

services:
  postgres:
    image: postgres:16
    container_name: gyaanchat_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: gyaanchat
      POSTGRES_USER: gyaanchat
      POSTGRES_PASSWORD: gyaanchat_password
    ports:
      - "5432:5432"
    volumes:
      - gyaanchat_pgdata:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4:8
    container_name: gyaanchat_pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@gyaanchat.local
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  gyaanchat_pgdata:


```

### File: Backend\test_import.py
```py
import traceback, sys
try:
    from app.main import app
    print("Backend imports OK!")
except Exception:
    with open("import_error.txt", "w") as f:
        traceback.print_exc(file=f)
    print("Error written to import_error.txt")

```

### File: Backend\app\auth_utils.py
```py
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "dev_secret_change_me")
JWT_ALG = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))  # 7 days

import bcrypt

def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    pwd_bytes = password.encode('utf-8')
    hash_bytes = password_hash.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hash_bytes)

def create_access_token(payload: dict) -> str:
    """Create a JWT access token with an expiration claim."""
    exp = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    to_encode = {**payload, "exp": exp}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALG)

def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except JWTError:
        raise ValueError("Invalid token")

# --- FastAPI dependency for protected routes ---

_bearer = HTTPBearer()

def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(_bearer),
):
    """
    FastAPI dependency: extracts the JWT from the Authorization header,
    validates it, and returns the decoded payload dict containing
    'sub' (user_id) and 'tenant_id'.
    """
    try:
        payload = decode_token(creds.credentials)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    user_id = payload.get("sub")
    tenant_id = payload.get("tenant_id")
    if not user_id or not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    return payload  # {"sub": user_id, "tenant_id": tenant_id, "exp": ...}


```

### File: Backend\app\db.py
```py
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Always load backend/.env explicitly
ENV_PATH = Path(__file__).resolve().parents[1] / ".env"  # backend/.env
load_dotenv(dotenv_path=ENV_PATH)

DATABASE_URL = os.getenv("DATABASE_URL")
print("USING DATABASE_URL =", DATABASE_URL)  # temporary debug

if not DATABASE_URL:
    raise RuntimeError(f"DATABASE_URL missing. Expected at: {ENV_PATH}")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


```

### File: Backend\app\main.py
```py
from fastapi import FastAPI, Request
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import os
import time
from .core.database import engine, Base
import app.models  # ensure all models are registered with Base.metadata
from .api.auth import router as auth_router
from app.api import documents, chat, bot, analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating DB tables...")
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="GyaanChat AI", lifespan=lifespan)

RAG_DISTANCE_THRESHOLD = float(os.getenv("RAG_DISTANCE_THRESHOLD", "0.5"))


# ── Logging middleware ────────────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    try:
        response = await call_next(request)
        return response
    finally:
        ms = int((time.time() - start) * 1000)
        print(f"{request.method} {request.url.path} -> {ms}ms")


# ── CORS ──────────────────────────────────────────────────────────────────────
# The widget endpoint (/chat/widget, /widget.js, /static/*) is PUBLIC — it must
# accept requests from ANY origin (customer websites). We use allow_origins=["*"]
# for the whole app. This is safe because:
#   - The dashboard API routes are protected by JWT, not by CORS origin checks.
#   - CORS is a browser-only mechanism; server-to-server calls are unaffected.
# If you need allow_credentials=True (for cookie auth), you cannot use "*" —
# but since we use Bearer tokens in Authorization headers, "*" is fine.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,   # must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(documents.router, prefix="/documents")
app.include_router(chat.router, prefix="/chat")
app.include_router(bot.router, prefix="/bot")
app.include_router(analytics.router, prefix="/analytics")


# ── Static files ──────────────────────────────────────────────────────────────
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Serve uploaded logos publicly (widget on tenant sites needs to load them)
logos_dir = os.path.join("uploads", "logos")
os.makedirs(logos_dir, exist_ok=True)
app.mount("/uploads/logos", StaticFiles(directory=logos_dir), name="logos")


@app.get("/widget.js")
async def serve_widget_js():
    widget_path = os.path.join(static_dir, "widget.js")
    if os.path.exists(widget_path):
        return FileResponse(widget_path, media_type="application/javascript")
    return {"error": "widget.js not found"}


@app.get("/")
def health_check():
    return {"status": "ok", "threshold": RAG_DISTANCE_THRESHOLD}

```

### File: Backend\app\models.py
```py
import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Boolean, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import Base

def _uuid():
    return str(uuid.uuid4())

class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="tenant")
    bots = relationship("Bot", back_populates="tenant")


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id"), nullable=False)

    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="users")


class Bot(Base):
    __tablename__ = "bots"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id"), nullable=False)

    name: Mapped[str] = mapped_column(String, default="GyaanChat Bot")
    greeting: Mapped[str] = mapped_column(Text, default="Hi! How can I help you?")
    fallback: Mapped[str] = mapped_column(Text, default="I couldn't find that in your documents.")
    theme_color: Mapped[str] = mapped_column(String, default="#3b82f6")
    temperature: Mapped[str] = mapped_column(String, default="0.2")
    logo_url: Mapped[str] = mapped_column(String, nullable=True, default=None)

    widget_key: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False, default=_uuid)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="bots")


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id"), nullable=False)
    bot_id: Mapped[str] = mapped_column(String, ForeignKey("bots.id"), nullable=True)
    session_id: Mapped[str] = mapped_column(String, nullable=True)
    
    sender: Mapped[str] = mapped_column(String, nullable=False) # "user" or "bot"
    message: Mapped[str] = mapped_column(Text, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ChatLog(Base):
    """Aggregated chat log for analytics — one row per Q&A pair."""
    __tablename__ = "chat_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id"), nullable=False)
    bot_id: Mapped[str] = mapped_column(String, ForeignKey("bots.id"), nullable=True)

    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    source_count: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)



```

### File: Backend\app\__init__.py
```py

```

### File: Backend\app\api\analytics.py
```py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models import ChatHistory, ChatLog, User
from app.auth_utils import get_current_user

router = APIRouter()

# --- Existing endpoints (kept for backward compatibility) ---

@router.get("/stats")
def get_stats(tenant_id: str, db: Session = Depends(get_db)):
    """Legacy stats endpoint — returns message/conversation/user counts."""
    total_messages = db.query(ChatHistory).filter(ChatHistory.tenant_id == tenant_id).count()
    
    total_conversations = db.query(func.count(func.distinct(ChatHistory.session_id))).filter(
        ChatHistory.tenant_id == tenant_id, 
        ChatHistory.session_id.isnot(None)
    ).scalar() or 0
    
    users_count = db.query(User).filter(User.tenant_id == tenant_id).count()

    return {
        "total_messages": total_messages,
        "total_conversations": total_conversations,
        "users": users_count
    }

@router.get("/questions")
def get_recent_questions(tenant_id: str, limit: int = 50, db: Session = Depends(get_db)):
    """Legacy recent questions endpoint."""
    questions = db.query(ChatHistory).filter(
        ChatHistory.tenant_id == tenant_id,
        ChatHistory.sender == "user"
    ).order_by(desc(ChatHistory.created_at)).limit(limit).all()
    
    return [
        {
            "id": q.id,
            "question": q.message,
            "created_at": q.created_at,
            "session_id": q.session_id
        }
        for q in questions
    ]

# --- New endpoints using ChatLog (Task 3c) ---

@router.get("/summary")
def get_summary(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns analytics summary for the current tenant:
    total_messages, total_documents, avg_sources, messages_today.
    """
    tenant_id = current_user["tenant_id"]

    total_messages = db.query(ChatLog).filter(ChatLog.tenant_id == tenant_id).count()

    # Count documents from status files (simple approach)
    import os, json
    status_dir = os.path.join("uploads", "status")
    total_documents = 0
    if os.path.isdir(status_dir):
        for fname in os.listdir(status_dir):
            if fname.endswith(".json"):
                try:
                    with open(os.path.join(status_dir, fname)) as f:
                        data = json.load(f)
                        if data.get("tenant_id") == tenant_id:
                            total_documents += 1
                except Exception:
                    pass

    avg_sources_result = db.query(func.avg(ChatLog.source_count)).filter(
        ChatLog.tenant_id == tenant_id
    ).scalar()
    avg_sources = round(float(avg_sources_result), 2) if avg_sources_result else 0.0

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    messages_today = db.query(ChatLog).filter(
        ChatLog.tenant_id == tenant_id,
        ChatLog.created_at >= today_start
    ).count()

    return {
        "total_messages": total_messages,
        "total_documents": total_documents,
        "avg_sources": avg_sources,
        "messages_today": messages_today,
    }

@router.get("/recent")
def get_recent(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns the last 20 ChatLog rows for analytics."""
    tenant_id = current_user["tenant_id"]

    logs = db.query(ChatLog).filter(
        ChatLog.tenant_id == tenant_id
    ).order_by(desc(ChatLog.created_at)).limit(20).all()

    return [
        {
            "question": log.question,
            "answer_preview": log.answer[:100] if log.answer else "",
            "source_count": log.source_count,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]


```

### File: Backend\app\api\auth.py
```py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional

from ..core.database import get_db
from ..models import User, Tenant, Bot
from ..auth_utils import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    website_name: str  # tenant name

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

@router.post("/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    """Register a new user, tenant, and bot."""
    print(f"ENTERED register: {data.email}")
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    tenant = Tenant(name=data.website_name)
    db.add(tenant)
    db.flush()  # get tenant.id

    user = User(
        tenant_id=tenant.id,
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)

    bot = Bot(tenant_id=tenant.id, name=f"{data.website_name} Bot")
    db.add(bot)

    db.commit()
    db.refresh(user)
    db.refresh(bot)

    token = create_access_token({"sub": user.id, "tenant_id": tenant.id})
    return {
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email},
        "tenant": {"id": tenant.id, "name": tenant.name},
        "bot": {"id": bot.id, "name": bot.name, "widget_key": bot.widget_key},
    }

@router.post("/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT token."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    if tenant and not tenant.is_active:
        raise HTTPException(status_code=403, detail="Tenant is suspended")

    bot = db.query(Bot).filter(Bot.tenant_id == user.tenant_id).first()

    token = create_access_token({"sub": user.id, "tenant_id": user.tenant_id})
    return {
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email},
        "tenant": {"id": user.tenant_id, "name": tenant.name if tenant else ""},
        "bot": {"id": bot.id if bot else None, "name": bot.name if bot else None, "widget_key": bot.widget_key if bot else None},
    }

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return the current user's profile information."""
    user = db.query(User).filter(User.id == current_user["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    return {
        "name": user.name,
        "email": user.email,
        "tenant_name": tenant.name if tenant else "",
    }

@router.patch("/profile")
def update_profile(data: ProfileUpdate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update the current user's profile (name, email, password)."""
    user = db.query(User).filter(User.id == current_user["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if data.name is not None:
        user.name = data.name
    if data.email is not None:
        existing = db.query(User).filter(User.email == data.email, User.id != user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = data.email
    if data.password is not None:
        user.password_hash = hash_password(data.password)
    
    db.commit()
    db.refresh(user)
    return {"name": user.name, "email": user.email}


```

### File: Backend\app\api\bot.py
```py
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


```

### File: Backend\app\api\chat.py
```py
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


```

### File: Backend\app\api\documents.py
```py
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
import uuid
import os
import json
import time

from app.services.chunker import chunk_text
from app.services.embeddings import embed_texts
from app.services.vector_store import get_collection

router = APIRouter()

UPLOAD_DIR = "uploads"
STATUS_DIR = os.path.join(UPLOAD_DIR, "status")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(STATUS_DIR, exist_ok=True)

# Allowed file types
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx", ".md", ".csv", ".html", ".htm"}
MAX_FILE_SIZE_MB = 50


def update_status(doc_id: str, status: str, tenant_id: str, filename: str, error: str = None):
    status_path = os.path.join(STATUS_DIR, f"{doc_id}.json")
    status_data = {
        "doc_id": doc_id,
        "tenant_id": tenant_id,
        "filename": filename,
        "status": status,
        "updated_at": time.time(),
        "error": error,
    }
    with open(status_path, "w") as f:
        json.dump(status_data, f)


def extract_text(file_path: str, filename: str) -> str:
    """Extract plain text from PDF, TXT, DOCX, MD, CSV, or HTML files."""
    ext = os.path.splitext(filename)[1].lower()

    # ── Plain text / Markdown (identical treatment) ───────────────────────────
    if ext in (".txt", ".md"):
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read().strip()

    # ── PDF ───────────────────────────────────────────────────────────────────
    if ext == ".pdf":
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip()
        except Exception as e:
            raise ValueError(f"Could not read PDF: {e}")

    # ── DOCX ──────────────────────────────────────────────────────────────────
    if ext == ".docx":
        try:
            from docx import Document
            doc = Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            return "\n".join(paragraphs).strip()
        except Exception as e:
            raise ValueError(f"Could not read DOCX: {e}")

    # ── CSV ───────────────────────────────────────────────────────────────────
    if ext == ".csv":
        import csv
        rows = []
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore", newline="") as f:
                reader = csv.reader(f)
                for row in reader:
                    line = " | ".join(cell.strip() for cell in row if cell.strip())
                    if line:
                        rows.append(line)
            return "\n".join(rows).strip()
        except Exception as e:
            raise ValueError(f"Could not read CSV: {e}")

    # ── HTML / HTM ────────────────────────────────────────────────────────────
    if ext in (".html", ".htm"):
        from html.parser import HTMLParser

        class _TextExtractor(HTMLParser):
            SKIP_TAGS = {"script", "style", "head", "meta", "link", "noscript"}

            def __init__(self):
                super().__init__()
                self._parts: list[str] = []
                self._skip = 0

            def handle_starttag(self, tag, attrs):
                if tag in self.SKIP_TAGS:
                    self._skip += 1

            def handle_endtag(self, tag):
                if tag in self.SKIP_TAGS and self._skip > 0:
                    self._skip -= 1

            def handle_data(self, data):
                if self._skip == 0:
                    text = data.strip()
                    if text:
                        self._parts.append(text)

        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                raw = f.read()
            parser = _TextExtractor()
            parser.feed(raw)
            return " ".join(parser._parts).strip()
        except Exception as e:
            raise ValueError(f"Could not read HTML: {e}")

    raise ValueError(f"Unsupported file type: '{ext}'. Supported: PDF, TXT, DOCX, MD, CSV, HTML")


def process_document_task(file_path: str, doc_id: str, tenant_id: str, filename: str, bot_id: str = "default"):
    try:
        update_status(doc_id, "processing", tenant_id, filename)

        # Step 1: Extract text
        text = extract_text(file_path, filename)

        if not text:
            raise ValueError(
                "No text could be extracted from this file. "
                "If it is a scanned/image-based PDF, PyPDF2 cannot read it. "
                "Supported formats: PDF (text-based), TXT, DOCX, MD, CSV, HTML."
            )

        # Step 2: Chunk
        chunks = chunk_text(text)
        if not chunks:
            raise ValueError("Document produced 0 text chunks after processing.")

        print(f"[{doc_id}] Extracted {len(text)} chars → {len(chunks)} chunks")

        # Step 3: Embed
        embeddings = embed_texts(chunks)

        # Step 4: Store in ChromaDB
        collection = get_collection(tenant_id)

        ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
        metadatas = [
            {
                "tenant_id": tenant_id,
                "doc_id": doc_id,
                "chunk_index": i,
                "filename": filename,
                "bot_id": bot_id,
            }
            for i in range(len(chunks))
        ]

        collection.add(
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids,
        )

        update_status(doc_id, "ready", tenant_id, filename)
        print(f"[{doc_id}] Done — {len(chunks)} chunks stored for tenant {tenant_id}")

    except Exception as e:
        error_msg = str(e)
        print(f"[{doc_id}] FAILED: {error_msg}")
        update_status(doc_id, "failed", tenant_id, filename, error=error_msg)


@router.post("/upload")
async def upload_document(
    tenant_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    bot_id: str = "default",
):
    # Validate file extension
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext or 'none'}'. Allowed: PDF, TXT, DOCX, MD, CSV, HTML."
        )

    # Read file content
    content = await file.read()

    # Validate file size
    size_mb = len(content) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Maximum allowed: {MAX_FILE_SIZE_MB} MB."
        )

    # Validate it's not empty
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Save to disk
    doc_id = str(uuid.uuid4())
    safe_filename = filename.replace(" ", "_")
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{safe_filename}")

    with open(file_path, "wb") as f:
        f.write(content)

    # Initialize status
    update_status(doc_id, "uploaded", tenant_id, filename)

    # Queue background processing
    background_tasks.add_task(
        process_document_task, file_path, doc_id, tenant_id, filename, bot_id
    )

    return {
        "message": "Processing started",
        "doc_id": doc_id,
        "tenant_id": tenant_id,
    }


@router.get("/status")
def get_doc_status(tenant_id: str, doc_id: str):
    status_path = os.path.join(STATUS_DIR, f"{doc_id}.json")
    if not os.path.exists(status_path):
        raise HTTPException(status_code=404, detail="Document status not found")

    with open(status_path, "r") as f:
        status_data = json.load(f)

    if status_data["tenant_id"] != tenant_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to document status")

    return status_data


@router.get("/list")
def list_documents(tenant_id: str):
    docs = []
    for fname in os.listdir(STATUS_DIR):
        if fname.endswith(".json"):
            try:
                with open(os.path.join(STATUS_DIR, fname), "r") as f:
                    data = json.load(f)
                if data.get("tenant_id") == tenant_id:
                    docs.append(data)
            except Exception:
                pass
    # Sort newest first
    docs.sort(key=lambda d: d.get("updated_at", 0), reverse=True)
    return docs


@router.delete("/delete")
def delete_document(tenant_id: str, doc_id: str):
    status_path = os.path.join(STATUS_DIR, f"{doc_id}.json")
    if not os.path.exists(status_path):
        raise HTTPException(status_code=404, detail="Document not found")

    with open(status_path, "r") as f:
        data = json.load(f)

    if data.get("tenant_id") != tenant_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Remove status file
    os.remove(status_path)

    # Remove from ChromaDB
    try:
        collection = get_collection(tenant_id)
        collection.delete(where={"doc_id": doc_id})
    except Exception as e:
        print(f"Warning: Could not delete from ChromaDB: {e}")

    # Remove original file
    filename = data.get("filename", "")
    if filename:
        safe_filename = filename.replace(" ", "_")
        file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{safe_filename}")
        if os.path.exists(file_path):
            os.remove(file_path)
        # Also try original name without safe replacement
        file_path2 = os.path.join(UPLOAD_DIR, f"{doc_id}_{filename}")
        if os.path.exists(file_path2):
            os.remove(file_path2)

    return {"message": "Document deleted successfully"}


```

### File: Backend\app\api\__init__.py
```py

```

### File: Backend\app\api\routes\auth.py
```py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...schemas.auth import RegisterIn, LoginIn
from ...services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    return auth_service.register_user(data, db)

@router.post("/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    return auth_service.login_user(data, db)

```

### File: Backend\app\api\routes\chat.py
```py
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

```

### File: Backend\app\api\routes\documents.py
```py
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
import uuid
import os

from ...utils.file_utils import update_status, get_status, list_tenant_documents
from ...services.document_service import process_document_background, process_document_deletion, UPLOAD_DIR

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload")
async def upload_document(
    tenant_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    bot_id: str = "default"
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    doc_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{file.filename}")

    with open(file_path, "wb") as f:
        f.write(await file.read())

    update_status(doc_id, "uploaded", tenant_id, file.filename)
    background_tasks.add_task(process_document_background, file_path, doc_id, tenant_id, file.filename, bot_id)

    return {
        "message": "Processing started",
        "doc_id": doc_id,
        "tenant_id": tenant_id
    }

@router.get("/status")
def get_doc_status(tenant_id: str, doc_id: str):
    status_data = get_status(doc_id)
    if not status_data:
        raise HTTPException(status_code=404, detail="Document status not found")
    
    if status_data.get("tenant_id") != tenant_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to document status")
        
    return status_data

@router.get("/list")
def list_documents(tenant_id: str):
    return list_tenant_documents(tenant_id)

@router.delete("/delete")
def delete_document(tenant_id: str, doc_id: str):
    status_data = get_status(doc_id)
    if not status_data:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if status_data.get("tenant_id") != tenant_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    filename = status_data.get("filename")
    process_document_deletion(tenant_id, doc_id, filename)

    return {"message": "Document deleted successfully"}

```

### File: Backend\app\api\routes\__init__.py
```py
from . import auth, documents, chat

__all__ = ["auth", "documents", "chat"]

```

### File: Backend\app\core\config.py
```py
import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), "../../.env")
load_dotenv(dotenv_path=env_path)

class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/gyaanchat")
    JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-in-prod")
    JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440")) # 24 hours
    RAG_DISTANCE_THRESHOLD = float(os.getenv("RAG_DISTANCE_THRESHOLD", "1.2"))

settings = Settings()

```

### File: Backend\app\core\database.py
```py
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Always load backend/.env explicitly
# File lives at: Backend/app/core/database.py → parents[2] = Backend/
ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=ENV_PATH)

DATABASE_URL = os.getenv("DATABASE_URL")
print("USING DATABASE_URL =", DATABASE_URL)  # temporary debug

if not DATABASE_URL:
    raise RuntimeError(f"DATABASE_URL missing. Expected at: {ENV_PATH}")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

```

### File: Backend\app\core\security.py
```py
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from jose import jwt, JWTError

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "dev_secret_change_me")
JWT_ALG = "HS256"
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))  # 7 days

import bcrypt

def hash_password(password: str) -> str:
    # bcrypt expects bytes, and returns bytes
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    pwd_bytes = password.encode('utf-8')
    hash_bytes = password_hash.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hash_bytes)

def create_access_token(payload: dict) -> str:
    exp = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    to_encode = {**payload, "exp": exp}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALG)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except JWTError:
        raise ValueError("Invalid token")

```

### File: Backend\app\core\__init__.py
```py
from .database import engine, SessionLocal, Base, get_db
from .security import hash_password, verify_password, create_access_token, decode_token
from .config import settings

__all__ = [
    "engine", "SessionLocal", "Base", "get_db",
    "hash_password", "verify_password", "create_access_token", "decode_token",
    "settings",
]

```

### File: Backend\app\models\bot.py
```py
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

```

### File: Backend\app\models\chat_history.py
```py
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from .helpers import _uuid


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id"), nullable=False)
    bot_id: Mapped[str] = mapped_column(String, ForeignKey("bots.id"), nullable=True)
    session_id: Mapped[str] = mapped_column(String, nullable=True)

    sender: Mapped[str] = mapped_column(String, nullable=False)  # "user" or "bot"
    message: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

```

### File: Backend\app\models\chat_log.py
```py
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from .helpers import _uuid


class ChatLog(Base):
    """Aggregated chat log for analytics — one row per Q&A pair."""
    __tablename__ = "chat_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id"), nullable=False)
    bot_id: Mapped[str] = mapped_column(String, ForeignKey("bots.id"), nullable=True)

    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    source_count: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

```

### File: Backend\app\models\helpers.py
```py
import uuid

def _uuid() -> str:
    return str(uuid.uuid4())

```

### File: Backend\app\models\tenant.py
```py
from datetime import datetime
from sqlalchemy import String, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .helpers import _uuid

class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="tenant")
    bots = relationship("Bot", back_populates="tenant")

```

### File: Backend\app\models\user.py
```py
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from .helpers import _uuid

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    tenant_id: Mapped[str] = mapped_column(String, ForeignKey("tenants.id"), nullable=False)

    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="users")

```

### File: Backend\app\models\__init__.py
```py
from .helpers import _uuid
from .tenant import Tenant
from .user import User
from .bot import Bot
from .chat_history import ChatHistory
from .chat_log import ChatLog

__all__ = ["Tenant", "User", "Bot", "ChatHistory", "ChatLog", "_uuid"]

```

### File: Backend\app\schemas\auth.py
```py
from pydantic import BaseModel, EmailStr

class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    website_name: str  # tenant name

class LoginIn(BaseModel):
    email: EmailStr
    password: str

```

### File: Backend\app\schemas\chat.py
```py
from pydantic import BaseModel

class ChatRequest(BaseModel):
    tenant_id: str
    question: str

class WidgetChatRequest(BaseModel):
    widget_key: str
    visitor_id: str
    message: str

```

### File: Backend\app\schemas\__init__.py
```py
from .auth import RegisterIn, LoginIn
from .chat import ChatRequest, WidgetChatRequest

__all__ = ["RegisterIn", "LoginIn", "ChatRequest", "WidgetChatRequest"]

```

### File: Backend\app\services\auth_service.py
```py
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User
from app.models.tenant import Tenant
from app.models.bot import Bot
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.auth import RegisterIn, LoginIn

def register_user(data: RegisterIn, db: Session):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    tenant = Tenant(name=data.website_name)
    db.add(tenant)
    db.flush()

    user = User(
        tenant_id=tenant.id,
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)

    bot = Bot(tenant_id=tenant.id, name=f"{data.website_name} Bot")
    db.add(bot)

    db.commit()
    db.refresh(user)
    db.refresh(bot)

    token = create_access_token({"sub": user.id, "tenant_id": tenant.id})
    return {
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email},
        "tenant": {"id": tenant.id, "name": tenant.name},
        "bot": {"id": bot.id, "name": bot.name, "widget_key": bot.widget_key},
    }

def login_user(data: LoginIn, db: Session):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    if tenant and not tenant.is_active:
        raise HTTPException(status_code=403, detail="Tenant is suspended")

    bot = db.query(Bot).filter(Bot.tenant_id == user.tenant_id).first()

    token = create_access_token({"sub": user.id, "tenant_id": user.tenant_id})
    return {
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email},
        "tenant": {"id": user.tenant_id, "name": tenant.name if tenant else ""},
        "bot": {"id": bot.id if bot else None, "name": bot.name if bot else None, "widget_key": bot.widget_key if bot else None},
    }

```

### File: Backend\app\services\chat_service.py
```py
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

```

### File: Backend\app\services\chunker.py
```py
def chunk_text(text: str, chunk_size=1200, overlap=200):
    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start = end - overlap
        if start < 0:
            start = 0

    return chunks


```

### File: Backend\app\services\document_service.py
```py
import os
from app.utils.file_utils import update_status, get_status, list_tenant_documents, remove_status_file
from app.services.pdf_loader import extract_text_from_pdf
from app.services.chunker import chunk_text
from app.services.embeddings import embed_texts
from app.services.vector_store import get_collection

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def process_document_background(file_path: str, doc_id: str, tenant_id: str, filename: str, bot_id: str = "default"):
    try:
        update_status(doc_id, "processing", tenant_id, filename)
        
        text = extract_text_from_pdf(file_path)
        chunks = chunk_text(text)
        embeddings = embed_texts(chunks)

        collection = get_collection(tenant_id)

        ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
        metadatas = [
            {
                "tenant_id": tenant_id,
                "doc_id": doc_id,
                "chunk_index": i,
                "filename": filename,
                "bot_id": bot_id
            } for i in range(len(chunks))
        ]

        collection.add(
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        
        update_status(doc_id, "ready", tenant_id, filename)
    except Exception as e:
        update_status(doc_id, "failed", tenant_id, filename, error=str(e))

def process_document_deletion(tenant_id: str, doc_id: str, filename: str):
    # Remove from Chroma
    try:
        collection = get_collection(tenant_id)
        collection.delete(where={"doc_id": doc_id})
    except Exception as e:
        pass # Handle silently 
        
    # Remove the status file
    remove_status_file(doc_id)

    # Attempt to remove original file
    if filename:
        file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{filename}")
        if os.path.exists(file_path):
            os.remove(file_path)

```

### File: Backend\app\services\embeddings.py
```py
_model = None

def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        print("Loading SentenceTransformer model...")
        _model = SentenceTransformer("BAAI/bge-small-en", device="cpu")
    return _model

def embed_texts(texts: list[str]):
    model = get_model()
    return model.encode(texts, convert_to_numpy=True).tolist()


```

### File: Backend\app\services\llm.py
```py
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "mistral"

def generate_answer(prompt: str) -> str:
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.2
            }
        },
        timeout=120
    )

    response.raise_for_status()
    return response.json()["response"].strip()


```

### File: Backend\app\services\pdf_loader.py
```py
from PyPDF2 import PdfReader

def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text = ""

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"

    return text.strip()


```

### File: Backend\app\services\rag.py
```py
def build_prompt(context_chunks: list[str], question: str) -> str:
    # Limit context to max 6000 chars to keep token usage low and responses fast
    context = ""
    for chunk in context_chunks:
        if len(context) + len(chunk) > 6000:
            break
        context += chunk + "\n\n"
    
    context = context.strip()

    return f"""
You are a professional customer support assistant for this website.

Rules:
- Answer ONLY using the context below
- Be clear, concise, and professional
- Do not guess or add extra information
- If the answer is not in the context, reply:
  "I couldn’t find this information in the provided documents."

Context:
{context}

Question:
{question}

Answer:
""".strip()


```

### File: Backend\app\services\vector_store.py
```py
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


```

### File: Backend\app\services\__init__.py
```py
# Service modules are individually imported where needed
# Lazy imports prevent circular dependency issues

```

### File: Backend\app\utils\file_utils.py
```py
import os
import json
import time

STATUS_DIR = "uploads/status"
os.makedirs(STATUS_DIR, exist_ok=True)

def update_status(doc_id: str, status: str, tenant_id: str, filename: str, error: str = None):
    status_path = os.path.join(STATUS_DIR, f"{doc_id}.json")
    status_data = {
        "doc_id": doc_id,
        "tenant_id": tenant_id,
        "filename": filename,
        "status": status,
        "updated_at": time.time(),
        "error": error
    }
    with open(status_path, "w") as f:
        json.dump(status_data, f)

def get_status(doc_id: str):
    status_path = os.path.join(STATUS_DIR, f"{doc_id}.json")
    if not os.path.exists(status_path):
        return None
    with open(status_path, "r") as f:
        return json.load(f)

def list_tenant_documents(tenant_id: str):
    docs = []
    for filename in os.listdir(STATUS_DIR):
        if filename.endswith(".json"):
            with open(os.path.join(STATUS_DIR, filename), "r") as f:
                data = json.load(f)
                if data.get("tenant_id") == tenant_id:
                    docs.append(data)
    return docs

def remove_status_file(doc_id: str):
    status_path = os.path.join(STATUS_DIR, f"{doc_id}.json")
    if os.path.exists(status_path):
        os.remove(status_path)

```

### File: Backend\app\utils\__init__.py
```py
from .file_utils import (
    update_status, get_status, list_tenant_documents, remove_status_file, STATUS_DIR
)

__all__ = ["update_status", "get_status", "list_tenant_documents", "remove_status_file", "STATUS_DIR"]

```

### File: Frontend\gyaanchat-frontend\codebase.py
```py
import os

# Configuration: What to include and what to ignore
OUTPUT_FILE = "project_codebase.md"
IGNORE_DIRS = {'.git', 'node_modules', 'venv', '__pycache__', 'dist', 'build', 'chroma', 'uploads'}
IGNORE_FILES = {'.env', 'package-lock.json', 'project_codebase.md', '.DS_Store'}
ALLOWED_EXTENSIONS = {'.py', '.ts', '.tsx', '.json', '.yml', '.yaml', '.html', '.css'}

def generate_codebase(root_dir):
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("# Project Codebase Snapshot\n\n")
        
        # 1. Generate Directory Tree
        f.write("## Directory Structure\n```text\n")
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            level = root.replace(root_dir, '').count(os.sep)
            indent = ' ' * 4 * level
            f.write(f"{indent}{os.path.basename(root)}/\n")
            sub_indent = ' ' * 4 * (level + 1)
            for file in files:
                if file not in IGNORE_FILES:
                    f.write(f"{sub_indent}{file}\n")
        f.write("```\n\n---\n\n")

        # 2. Append File Contents
        f.write("## File Contents\n\n")
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            for file in files:
                if file in IGNORE_FILES:
                    continue
                
                file_ext = os.path.splitext(file)[1]
                if file_ext in ALLOWED_EXTENSIONS or file == "Dockerfile" or file == "docker-compose.yml":
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, root_dir)
                    
                    f.write(f"### File: {relative_path}\n")
                    f.write(f"```{file_ext.replace('.', '') if file_ext else 'text'}\n")
                    try:
                        with open(file_path, 'r', encoding='utf-8') as content_file:
                            f.write(content_file.read())
                    except Exception as e:
                        f.write(f"Error reading file: {e}")
                    f.write("\n```\n\n")

    print(f"Success! Codebase saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_codebase(os.getcwd())
```

### File: Frontend\gyaanchat-frontend\index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>gyaanchat-frontend</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>


```

### File: Frontend\gyaanchat-frontend\package.json
```json
{
  "name": "gyaanchat-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.13.5",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.13.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.48.0",
    "vite": "^8.0.0-beta.13"
  },
  "overrides": {
    "vite": "^8.0.0-beta.13"
  }
}


```

### File: Frontend\gyaanchat-frontend\tsconfig.app.json
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}


```

### File: Frontend\gyaanchat-frontend\tsconfig.json
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}


```

### File: Frontend\gyaanchat-frontend\tsconfig.node.json
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}


```

### File: Frontend\gyaanchat-frontend\vite.config.ts
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})


```

### File: Frontend\gyaanchat-frontend\src\App.tsx
```tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";

import DashboardPage from "./pages/app/AnalyticsPage";
import DocumentsPage from "./pages/app/DocumentsPage";
import TestChatPage from "./pages/app/TestChatPage";
import AnalyticsPage from "./pages/app/AnalyticsChartPage";
import ConversationsPage from "./pages/app/ConversationsPage";
import InstallPage from "./pages/app/InstallPage";
import SettingsPage from "./pages/app/SettingsPage";
import ProfilePage from "./pages/app/ProfilePage";
import BotSettingsPage from "./pages/app/BotSettingsPage";

export default function App() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={token ? <Navigate to="/app" replace /> : <LoginPage />} />
      <Route path="/register" element={token ? <Navigate to="/app" replace /> : <RegisterPage />} />

      {/* Protected App */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="test-chat" element={<TestChatPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="conversations" element={<ConversationsPage />} />
        <Route path="install" element={<InstallPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="bot-settings" element={<BotSettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


```

### File: Frontend\gyaanchat-frontend\src\index.css
```css


```

### File: Frontend\gyaanchat-frontend\src\main.tsx
```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import { BotSettingsProvider } from "./contexts/BotSettingsContext";
import App from "./App";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <BotSettingsProvider>
              <App />
            </BotSettingsProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);


```

### File: Frontend\gyaanchat-frontend\src\api\analytics.ts
```ts
import { api } from "./client";

export interface AnalyticsStats {
    total_messages: number;
    total_conversations: number;
    users: number;
}

export interface QuestionLog {
    id: string;
    question: string;
    created_at: string;
    session_id?: string;
}

export async function getAnalyticsStats(tenantId: string): Promise<AnalyticsStats> {
    const { data } = await api.get(`/analytics/stats?tenant_id=${encodeURIComponent(tenantId)}`);
    return data;
}

export async function getRecentQuestions(tenantId: string): Promise<QuestionLog[]> {
    const { data } = await api.get(`/analytics/questions?tenant_id=${encodeURIComponent(tenantId)}`);
    return data;
}


```

### File: Frontend\gyaanchat-frontend\src\api\auth.ts
```ts
import { api } from "./client";

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  website_name: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export async function register(payload: RegisterPayload) {
  const res = await api.post("/auth/register", payload);
  return res.data;
}

export async function login(payload: LoginPayload) {
  const res = await api.post("/auth/login", payload);
  return res.data;
}




```

### File: Frontend\gyaanchat-frontend\src\api\bot.ts
```ts
import { api } from "./client";

export interface BotSettings {
    id: string;
    tenant_id: string;
    name: string;
    greeting: string;
    fallback: string;
    theme_color: string;
    temperature: string;
    widget_key: string;
    logo_url?: string | null;
}

export interface BotSettingsUpdate {
    name?: string;
    greeting?: string;
    fallback?: string;
    theme_color?: string;
    temperature?: string;
    logo_url?: string | null;
}

export async function getBotSettings(tenantId: string): Promise<BotSettings> {
    const { data } = await api.get(`/bot/settings?tenant_id=${encodeURIComponent(tenantId)}`);
    return data;
}

export async function updateBotSettings(tenantId: string, settings: BotSettingsUpdate): Promise<BotSettings> {
    const { data } = await api.put(`/bot/settings?tenant_id=${encodeURIComponent(tenantId)}`, settings);
    return data;
}

export async function uploadBotLogo(tenantId: string, file: File): Promise<{ logo_url: string }> {
    const form = new FormData();
    form.append("file", file);
    // Do NOT set Content-Type manually — axios sets multipart boundary automatically
    const { data } = await api.post(`/bot/logo?tenant_id=${encodeURIComponent(tenantId)}`, form);
    return data;
}


```

### File: Frontend\gyaanchat-frontend\src\api\chat.ts
```ts


```

### File: Frontend\gyaanchat-frontend\src\api\client.ts
```ts
import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


```

### File: Frontend\gyaanchat-frontend\src\api\documents.ts
```ts


```

### File: Frontend\gyaanchat-frontend\src\api\endpoints.ts
```ts
import { api } from "./client";
import type { UploadResponse, DocStatusResponse, ChatResponse } from "./types";

export async function uploadDocument(tenantId: string, file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);

  // Do NOT set Content-Type manually — axios sets it automatically as
  // 'multipart/form-data; boundary=...' when the body is FormData.
  // Setting it manually strips the boundary and causes FastAPI to return 422.
  const { data } = await api.post(
    `/documents/upload?tenant_id=${encodeURIComponent(tenantId)}`,
    form
  );

  return data;
}

export async function getDocStatus(tenantId: string, docId: string): Promise<DocStatusResponse> {
  const { data } = await api.get(
    `/documents/status?tenant_id=${encodeURIComponent(tenantId)}&doc_id=${encodeURIComponent(docId)}`
  );
  return data;
}

export async function listDocuments(tenantId: string): Promise<DocStatusResponse[]> {
  const { data } = await api.get(`/documents/list?tenant_id=${encodeURIComponent(tenantId)}`);
  return data;
}

export async function deleteDocument(tenantId: string, docId: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/documents/delete?tenant_id=${encodeURIComponent(tenantId)}&doc_id=${encodeURIComponent(docId)}`);
  return data;
}

export async function chatTenant(tenantId: string, userText: string, options?: { temperature?: number }): Promise<ChatResponse> {
  // Support both common payload styles and include options if present
  const payload1 = { tenant_id: tenantId, question: userText, ...options };
  const payload2 = { tenant_id: tenantId, message: userText, ...options };

  try {
    const { data } = await api.post("/chat/", payload1);
    return data;
  } catch {
    const { data } = await api.post("/chat/", payload2);
    return data;
  }
}


```

### File: Frontend\gyaanchat-frontend\src\api\types.ts
```ts
export type UploadResponse = {
  message: string;
  tenant_id: string;
  doc_id: string;
};

export type DocStatusResponse = {
  tenant_id: string;
  doc_id: string;
  status: "uploaded" | "processing" | "ready" | "failed";
  filename?: string;
  updated_at?: number;
  error?: string;
};

export type DocItem = DocStatusResponse;

export type ChatResponse = {
  answer: string;
  used_sources?: boolean;
  sources?: Array<{
    doc_id: string;
    chunk_index: number;
    filename: string;
  }>;
  conversation_id?: string;
};


```

### File: Frontend\gyaanchat-frontend\src\components\ProtectedRoute.tsx
```tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}


```

### File: Frontend\gyaanchat-frontend\src\components\layout\AppLayout.tsx
```tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}


```

### File: Frontend\gyaanchat-frontend\src\components\layout\Sidebar.tsx
```tsx
import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface NavItemDef {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItemDef[] = [
  {
    to: "/app",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: "/app/documents",
    label: "Knowledge Base",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    to: "/app/bot-settings",
    label: "Bot Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M8 12h8M12 8v8" />
        <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" opacity="0.3" />
      </svg>
    ),
  },
  {
    to: "/app/test-chat",
    label: "Chat Preview",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    to: "/app/analytics",
    label: "Analytics",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    to: "/app/conversations",
    label: "Conversations",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2v4l-4-4H9a2 2 0 0 1-2-2v-1" />
        <path d="M15 4H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2v4l4-4h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
      </svg>
    ),
  },
  {
    to: "/app/install",
    label: "Deployment",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    to: "/app/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${open ? "open" : ""}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">G</div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">GyaanChat</span>
            <span className="sidebar-brand-sub">AI Platform</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app"}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer" ref={popoverRef}>
          {popoverOpen && (
            <div className="user-popover">
              <button
                className="popover-item"
                onClick={() => { setPopoverOpen(false); navigate("/app/profile"); onClose(); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profile
              </button>
              <button className="popover-item danger" onClick={handleLogout}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          )}

          <div className="sidebar-user" onClick={() => setPopoverOpen((v) => !v)}>
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name || "User"}</div>
              <div className="user-email">{user?.email || ""}</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.4, flexShrink: 0 }}>
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </div>
        </div>
      </aside>
    </>
  );
}


```

### File: Frontend\gyaanchat-frontend\src\components\layout\Topbar.tsx
```tsx
import { useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

const PAGE_TITLES: Record<string, string> = {
  "/app": "Dashboard",
  "/app/documents": "Knowledge Base",
  "/app/bot-settings": "Bot Settings",
  "/app/test-chat": "Chat Preview",
  "/app/analytics": "Analytics",
  "/app/conversations": "Conversations",
  "/app/install": "Deployment",
  "/app/settings": "Settings",
  "/app/profile": "Profile",
};

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || "Dashboard";

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Hamburger — visible on mobile */}
        <button className="icon-btn hamburger" onClick={onMenuClick} aria-label="Open menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="topbar-title">{title}</span>
      </div>

      <div className="topbar-right">
        {/* Theme toggle */}
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme" title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}>
          {theme === "light" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>

        {/* Notification bell (decorative) */}
        <button className="icon-btn" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
      </div>
    </header>
  );
}


```

### File: Frontend\gyaanchat-frontend\src\components\ui\Skeleton.tsx
```tsx
interface SkeletonProps {
    width?: string;
    height?: string;
    borderRadius?: string;
    style?: React.CSSProperties;
}

export default function Skeleton({
    width = "100%",
    height = "16px",
    borderRadius,
    style,
}: SkeletonProps) {
    return (
        <div
            className="skeleton"
            style={{
                width,
                height,
                borderRadius,
                flexShrink: 0,
                ...style,
            }}
        />
    );
}


```

### File: Frontend\gyaanchat-frontend\src\context\AuthContext.tsx
```tsx
import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthUser {
    id: string;
    name: string;
    email: string;
}

interface AuthTenant {
    id: string;
    name: string;
}

interface AuthBot {
    id: string;
    name: string;
    widget_key: string;
}

interface AuthState {
    token: string | null;
    user: AuthUser | null;
    tenant: AuthTenant | null;
    bot: AuthBot | null;
}

interface AuthContextValue extends AuthState {
    login: (data: { token: string; user: AuthUser; tenant: AuthTenant; bot: AuthBot }) => void;
    logout: () => void;
    updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const LS_KEYS = {
    token: "gc_token",
    user: "gc_user",
    tenant: "gc_tenant",
    bot: "gc_bot",
};

function readLS(): AuthState {
    try {
        const token = localStorage.getItem(LS_KEYS.token);
        if (!token) return { token: null, user: null, tenant: null, bot: null };

        // Validate token is not expired by decoding the JWT payload
        const parts = token.split(".");
        if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                // Token expired — clear everything
                Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(k));
                return { token: null, user: null, tenant: null, bot: null };
            }
        }

        const user = JSON.parse(localStorage.getItem(LS_KEYS.user) || "null");
        const tenant = JSON.parse(localStorage.getItem(LS_KEYS.tenant) || "null");
        const bot = JSON.parse(localStorage.getItem(LS_KEYS.bot) || "null");

        return { token, user, tenant, bot };
    } catch {
        return { token: null, user: null, tenant: null, bot: null };
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>(readLS);

    function login(data: { token: string; user: AuthUser; tenant: AuthTenant; bot: AuthBot }) {
        localStorage.setItem(LS_KEYS.token, data.token);
        localStorage.setItem(LS_KEYS.user, JSON.stringify(data.user));
        localStorage.setItem(LS_KEYS.tenant, JSON.stringify(data.tenant));
        localStorage.setItem(LS_KEYS.bot, JSON.stringify(data.bot));
        // Also store tenant_id and widget_key for backward compat
        localStorage.setItem("gyaanchat_tenant_id", data.tenant.id);
        localStorage.setItem("gyaanchat_widget_key", data.bot.widget_key || "");
        setState({ token: data.token, user: data.user, tenant: data.tenant, bot: data.bot });
    }

    function logout() {
        Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(k));
        localStorage.removeItem("gyaanchat_tenant_id");
        localStorage.removeItem("gyaanchat_widget_key");
        setState({ token: null, user: null, tenant: null, bot: null });
    }

    function updateUser(updates: Partial<AuthUser>) {
        setState((prev) => {
            const newUser = prev.user ? { ...prev.user, ...updates } : null;
            if (newUser) localStorage.setItem(LS_KEYS.user, JSON.stringify(newUser));
            return { ...prev, user: newUser };
        });
    }

    return (
        <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}


```

### File: Frontend\gyaanchat-frontend\src\contexts\BotSettingsContext.tsx
```tsx
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getBotSettings, updateBotSettings, uploadBotLogo, type BotSettings } from "../api/bot";
import { useAuth } from "../context/AuthContext";

interface BotSettingsContextValue {
    settings: BotSettings | null;
    loading: boolean;
    logoUrl: string | null;
    setLogoUrl: (url: string | null) => void;
    uploadLogo: (file: File) => Promise<void>;
    patchSettings: (patch: Partial<BotSettings>) => void;
    saveSettings: () => Promise<void>;
    saving: boolean;
}

const BotSettingsContext = createContext<BotSettingsContextValue | null>(null);

export function BotSettingsProvider({ children }: { children: ReactNode }) {
    const { tenant } = useAuth();
    const tenantId = tenant?.id || localStorage.getItem("gyaanchat_tenant_id") || "";

    const [settings, setSettings] = useState<BotSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!tenantId) { setLoading(false); return; }
        setLoading(true);
        getBotSettings(tenantId)
            .then(s => {
                setSettings(s);
                // If backend has a logo URL, use it (prepend API base if relative)
                if (s.logo_url) {
                    // s.logo_url is like "/uploads/logos/..." — we need full URL if frontend is on different port
                    // But for <img> src, a relative path works if served from same origin.
                    // Since dev is Vite (5173) and backend is 8000, we need full URL.
                    // Ideally `api.defaults.baseURL` or similar. 
                    // For now, let's assume valid URL or rely on proxy? 
                    // Actually, let's just prepend the API URL base.
                    const baseUrl = "http://127.0.0.1:8000";
                    setLogoUrl(s.logo_url.startsWith("http") ? s.logo_url : `${baseUrl}${s.logo_url}`);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [tenantId]);

    const patchSettings = useCallback((patch: Partial<BotSettings>) => {
        setSettings((prev) => prev ? { ...prev, ...patch } : prev);
    }, []);

    const uploadLogo = useCallback(async (file: File) => {
        if (!tenantId) return;
        const { logo_url } = await uploadBotLogo(tenantId, file);
        // Update state
        const baseUrl = "http://127.0.0.1:8000";
        setLogoUrl(`${baseUrl}${logo_url}`);
        // Also update settings object so it saves correctly if needed
        setSettings(prev => prev ? { ...prev, logo_url } : prev);
    }, [tenantId]);

    // Override setLogoUrl to clear it from settings if null passed
    const handleSetLogoUrl = useCallback((url: string | null) => {
        setLogoUrl(url);
        if (!url) {
            setSettings(prev => prev ? { ...prev, logo_url: null } : prev);
        }
    }, []);

    const saveSettings = useCallback(async () => {
        if (!settings || !tenantId) return;
        setSaving(true);
        try {
            const updated = await updateBotSettings(tenantId, {
                name: settings.name,
                greeting: settings.greeting,
                fallback: settings.fallback,
                theme_color: settings.theme_color,
                temperature: settings.temperature,
                logo_url: settings.logo_url, // persist the URL
            });
            setSettings(updated);
        } finally {
            setSaving(false);
        }
    }, [settings, tenantId]);

    return (
        <BotSettingsContext.Provider value={{
            settings, loading, logoUrl,
            setLogoUrl: handleSetLogoUrl,
            uploadLogo,
            patchSettings, saveSettings, saving
        }}>
            {children}
        </BotSettingsContext.Provider>
    );
}

export function useBotSettings() {
    const ctx = useContext(BotSettingsContext);
    if (!ctx) throw new Error("useBotSettings must be used inside BotSettingsProvider");
    return ctx;
}


```

### File: Frontend\gyaanchat-frontend\src\contexts\ThemeContext.tsx
```tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem("gc_theme") as Theme) || "light";
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("gc_theme", theme);
    }, [theme]);

    function toggleTheme() {
        setTheme((t) => (t === "light" ? "dark" : "light"));
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
}


```

### File: Frontend\gyaanchat-frontend\src\contexts\ToastContext.tsx
```tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type ToastType = "success" | "error" | "info";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "info") => {
        const id = ++nextId;
        setToasts((prev) => {
            const next = [...prev, { id, message, type }];
            // Max 3 toasts
            return next.slice(-3);
        });
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast-item toast-${t.type}`}>
                        <span>
                            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
                        </span>
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}


```

### File: Frontend\gyaanchat-frontend\src\features\auth\ProtectedRoute.tsx
```tsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("gc_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

```

### File: Frontend\gyaanchat-frontend\src\pages\BotsPage.tsx
```tsx
import { useState } from "react";

export default function BotsPage() {
  const [tenantId, setTenantId] = useState(localStorage.getItem("gyaanchat_tenant_id") || "tenantA");

  return (
    <div className="page">
      <header className="pageHeader">
        <div>
          <h1 className="pageTitle">Bots</h1>
          <p className="muted">For MVP, we use tenant_id as your bot context.</p>
        </div>
      </header>

      <div className="card">
        <div className="cardTitle">Set Tenant ID</div>

        <div className="row">
          <input
            className="input"
            style={{ width: 260 }}
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="tenant_id"
          />
          <button
            className="button"
            onClick={() => {
              localStorage.setItem("gyaanchat_tenant_id", tenantId);
              alert("Saved tenant_id!");
            }}
          >
            Save
          </button>
        </div>

        <p className="muted" style={{ marginTop: 10 }}>
          We’ll use this tenant_id in Knowledge Upload and Test Chat pages.
        </p>
      </div>
    </div>
  );
}


```

### File: Frontend\gyaanchat-frontend\src\pages\KnowledgePage.tsx
```tsx
import { useState } from "react";
import { uploadDocument, getDocStatus } from "../api/endpoints";

export default function KnowledgePage() {
  const tenantId = localStorage.getItem("gyaanchat_tenant_id") || "tenantA";
  const [file, setFile] = useState<File | null>(null);
  const [docId, setDocId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function handleUpload() {
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    try {
      const res = await uploadDocument(tenantId, file);
      setDocId(res.doc_id);
      setStatus("uploaded");

      const interval = setInterval(async () => {
        const s = await getDocStatus(tenantId, res.doc_id);
        setStatus(s.status);
        if (s.status === "ready" || s.status === "failed") clearInterval(interval);
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Upload failed.");
    }
  }

  return (
    <div className="page">
      <h1>Knowledge Upload</h1>

      <div className="card">
        <p><b>Tenant:</b> {tenantId}</p>

        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button className="button" onClick={handleUpload}>Upload</button>

        {docId && <p>Doc ID: {docId}</p>}
        {status && <p>Status: <b>{status}</b></p>}
        {error && <div className="alert">{error}</div>}
      </div>
    </div>
  );
}


```

### File: Frontend\gyaanchat-frontend\src\pages\LogsPage.tsx
```tsx
export default function LogsPage() {
  return (
    <div className="page">
      <header className="pageHeader">
        <div>
          <h1 className="pageTitle">Logs</h1>
          <p className="muted">We’ll connect logs after chat works end-to-end.</p>
        </div>
      </header>

      <div className="card">
        <div className="muted">Coming soon.</div>
      </div>
    </div>
  );
}


```

### File: Frontend\gyaanchat-frontend\src\pages\TestChatPage.tsx
```tsx
import { useMemo, useState } from "react";
import { chatTenant } from "../api/endpoints";

type Msg = { role: "user" | "assistant"; text: string };

export default function TestChatPage() {
  const tenantId = useMemo(() => localStorage.getItem("gyaanchat_tenant_id") || "tenantA", []);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  async function send() {
    const q = input.trim();
    if (!q || busy) return;

    setError("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setBusy(true);

    try {
      const res = await chatTenant(tenantId, q);

      let extra = "";
      if (res.sources?.length) {
        extra =
          "\n\nSources:\n" +
          res.sources.map((s) => `- ${s.filename} (chunk ${s.chunk_index})`).join("\n");
      }

      setMsgs((m) => [...m, { role: "assistant", text: (res.answer || "") + extra }]);
    } catch (e: any) {
      setError(e?.message || "Chat request failed. Check backend is running.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <header className="pageHeader">
        <div>
          <h1 className="pageTitle">Test Chat</h1>
          <p className="muted">Ask questions from your uploaded PDF. Answers should include sources.</p>
        </div>
        <div className="mono">Tenant: {tenantId}</div>
      </header>

      <div className="card chatBox">
        <div className="chatMessages">
          {msgs.length === 0 && <div className="muted">Upload a PDF first, then ask something from it.</div>}

          {msgs.map((m, i) => (
            <div key={i} className={m.role === "user" ? "chatMsg user" : "chatMsg bot"}>
              <div className="chatRole">{m.role === "user" ? "You" : "Bot"}</div>
              <div className="chatText">{m.text}</div>
            </div>
          ))}
        </div>

        {error && <div className="alert" style={{ marginTop: 12 }}>{error}</div>}

        <div className="chatInputRow">
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a question..."
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="button" onClick={send} disabled={busy}>
            {busy ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}


```

### File: Frontend\gyaanchat-frontend\src\pages\app\AnalyticsChartPage.tsx
```tsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import Skeleton from "../../components/ui/Skeleton";

interface Summary {
    total_messages: number;
    total_documents: number;
    avg_sources: number;
    messages_today: number;
}

interface RecentLog {
    question: string;
    answer_preview: string;
    source_count: number;
    created_at: string;
}

function timeAgo(iso: string) {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// Simple bar chart using CSS (no recharts needed)
function MiniBarChart({ data, label }: { data: number[]; label: string }) {
    const max = Math.max(...data, 1);
    return (
        <div>
            <div className="chart-title">{label}</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
                {data.map((v, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div
                            style={{
                                width: "100%",
                                height: `${(v / max) * 80}px`,
                                background: "var(--color-accent)",
                                borderRadius: "4px 4px 0 0",
                                opacity: 0.85,
                                minHeight: v > 0 ? 4 : 0,
                                transition: "height 0.4s ease",
                            }}
                        />
                        <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>{v}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Simple area chart using SVG
function MiniAreaChart({ data, label }: { data: number[]; label: string }) {
    const max = Math.max(...data, 1);
    const w = 400, h = 100;
    const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - (v / max) * (h - 10) }));
    const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const area = `${path} L${w},${h} L0,${h} Z`;

    return (
        <div>
            <div className="chart-title">{label}</div>
            <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 100 }}>
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={area} fill="url(#areaGrad)" />
                <path d={path} fill="none" stroke="var(--color-accent)" strokeWidth="2" />
                {pts.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--color-accent)" />
                ))}
            </svg>
        </div>
    );
}

const PAGE_SIZE = 10;

export default function AnalyticsPage() {
    const { tenant } = useAuth();
    const tenantId = tenant?.id || localStorage.getItem("gyaanchat_tenant_id") || "";

    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [logs, setLogs] = useState<RecentLog[]>([]);
    const [page, setPage] = useState(0);

    useEffect(() => {
        if (!tenantId) return;
        Promise.all([
            api.get("/analytics/summary").catch(() => api.get(`/analytics/stats?tenant_id=${tenantId}`)),
            api.get("/analytics/recent").catch(() => api.get(`/analytics/questions?tenant_id=${tenantId}`)),
        ])
            .then(([sRes, rRes]) => {
                const s = sRes.data;
                setSummary({ total_messages: s.total_messages ?? 0, total_documents: s.total_documents ?? 0, avg_sources: s.avg_sources ?? 0, messages_today: s.messages_today ?? 0 });
                const raw = rRes.data;
                if (Array.isArray(raw)) {
                    setLogs(raw.map((l: any) => ({ question: l.question || l.message || "", answer_preview: l.answer_preview || "", source_count: l.source_count ?? 0, created_at: l.created_at || "" })));
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [tenantId]);

    const STATS = [
        { label: "Total Messages", value: summary?.total_messages ?? 0 },
        { label: "Documents", value: summary?.total_documents ?? 0 },
        { label: "Messages Today", value: summary?.messages_today ?? 0 },
        { label: "Avg Sources / Answer", value: summary?.avg_sources ?? 0 },
    ];

    // Generate sparkline data from logs (messages per day, last 7 days)
    const sparkData = (() => {
        const counts = Array(7).fill(0);
        logs.forEach((l) => {
            if (!l.created_at) return;
            const daysAgo = Math.floor((Date.now() - new Date(l.created_at).getTime()) / 86400000);
            if (daysAgo >= 0 && daysAgo < 7) counts[6 - daysAgo]++;
        });
        return counts;
    })();

    const sourceData = (() => {
        const buckets = [0, 0, 0, 0, 0]; // 0,1,2,3,4+ sources
        logs.forEach((l) => { const idx = Math.min(l.source_count, 4); buckets[idx]++; });
        return buckets;
    })();

    const pageCount = Math.ceil(logs.length / PAGE_SIZE);
    const pageLogs = logs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Analytics</h1>
                    <p className="page-subtitle">Insights into your bot's performance</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stat-grid">
                {STATS.map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-label">{s.label}</div>
                        {loading ? <Skeleton width="60%" height="36px" style={{ marginTop: 4 }} /> : (
                            <div className="stat-value">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</div>
                        )}
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="chart-card">
                    {loading ? <Skeleton height="120px" /> : <MiniAreaChart data={sparkData} label="Messages — Last 7 Days" />}
                </div>
                <div className="chart-card">
                    {loading ? <Skeleton height="120px" /> : <MiniBarChart data={sourceData} label="Sources per Answer (0–4+)" />}
                </div>
            </div>

            {/* Conversation Log Table */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)" }}>
                    <h2 style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Conversation Log</h2>
                </div>
                {loading ? (
                    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height="20px" />)}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📊</div>
                        <div className="empty-state-title">No data yet</div>
                        <div className="empty-state-sub">Conversations will appear here once users start chatting.</div>
                    </div>
                ) : (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Question</th>
                                    <th>Answer Preview</th>
                                    <th style={{ textAlign: "right" }}>Sources</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageLogs.map((log, i) => (
                                    <tr key={i}>
                                        <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.question}</td>
                                        <td style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="muted">{log.answer_preview || "—"}</td>
                                        <td style={{ textAlign: "right" }}><span className="badge badge-muted">{log.source_count}</span></td>
                                        <td className="muted">{timeAgo(log.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {pageCount > 1 && (
                            <div className="pagination">
                                <span className="pagination-info">
                                    {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, logs.length)} of {logs.length}
                                </span>
                                <div className="pagination-btns">
                                    <button className="btn-ghost" style={{ padding: "6px 12px" }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
                                    <button className="btn-ghost" style={{ padding: "6px 12px" }} disabled={page >= pageCount - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}


```

### File: Frontend\gyaanchat-frontend\src\pages\app\AnalyticsPage.tsx
```tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import Skeleton from "../../components/ui/Skeleton";

interface Summary {
    total_messages: number;
    total_documents: number;
    avg_sources: number;
    messages_today: number;
}

interface RecentLog {
    question: string;
    answer_preview: string;
    source_count: number;
    created_at: string;
}

function timeAgo(iso: string) {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
    const { user, tenant, bot } = useAuth();
    const navigate = useNavigate();
    const tenantId = tenant?.id || localStorage.getItem("gyaanchat_tenant_id") || "";

    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [recent, setRecent] = useState<RecentLog[]>([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!tenantId) return;
        Promise.all([
            api.get("/analytics/summary").catch(() => api.get(`/analytics/stats?tenant_id=${tenantId}`)),
            api.get("/analytics/recent").catch(() => api.get(`/analytics/questions?tenant_id=${tenantId}`)),
        ])
            .then(([sRes, rRes]) => {
                const s = sRes.data;
                setSummary({ total_messages: s.total_messages ?? 0, total_documents: s.total_documents ?? 0, avg_sources: s.avg_sources ?? 0, messages_today: s.messages_today ?? 0 });
                const logs = rRes.data;
                if (Array.isArray(logs)) {
                    setRecent(logs.map((l: any) => ({ question: l.question || l.message || "", answer_preview: l.answer_preview || "", source_count: l.source_count ?? 0, created_at: l.created_at || "" })));
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [tenantId]);

    function copyWidgetKey() {
        if (bot?.widget_key) {
            navigator.clipboard.writeText(bot.widget_key);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    }

    const STATS = [
        { label: "Total Messages", value: summary?.total_messages ?? 0 },
        { label: "Documents", value: summary?.total_documents ?? 0 },
        { label: "Messages Today", value: summary?.messages_today ?? 0 },
        { label: "Avg Sources / Answer", value: summary?.avg_sources ?? 0 },
    ];

    return (
        <div className="page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Welcome back, {user?.name?.split(" ")[0] || "there"} 👋</h1>
                    <p className="page-subtitle">Manage your AI chatbot platform</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stat-grid">
                {STATS.map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-label">{s.label}</div>
                        {loading ? (
                            <Skeleton width="60%" height="36px" style={{ marginTop: 4 }} />
                        ) : (
                            <div className="stat-value">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</div>
                        )}
                    </div>
                ))}
            </div>

            {/* Two-column: Recent + Quick Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20, marginBottom: 20 }}>
                {/* Recent Conversations */}
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border)" }}>
                        <h2 style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Recent Conversations</h2>
                    </div>
                    {loading ? (
                        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                            {[1, 2, 3].map((i) => <Skeleton key={i} height="20px" />)}
                        </div>
                    ) : recent.length === 0 ? (
                        <div className="empty-state" style={{ padding: "40px 24px" }}>
                            <div className="empty-state-icon">💬</div>
                            <div className="empty-state-title">No conversations yet</div>
                            <div className="empty-state-sub">Start testing your bot to see history here.</div>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Question</th>
                                    <th style={{ textAlign: "right" }}>Sources</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.slice(0, 8).map((log, i) => (
                                    <tr key={i}>
                                        <td style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {log.question}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <span className="badge badge-muted">{log.source_count}</span>
                                        </td>
                                        <td className="muted">{timeAgo(log.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Quick Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="card">
                        <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: 16 }}>Quick Actions</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {[
                                { label: "Upload Document", icon: "📄", to: "/app/documents" },
                                { label: "Test Your Bot", icon: "💬", to: "/app/test-chat" },
                                { label: "Get Embed Code", icon: "🚀", to: "/app/install" },
                            ].map((a) => (
                                <button
                                    key={a.to}
                                    className="btn-ghost"
                                    style={{ justifyContent: "flex-start", gap: 10, padding: "10px 14px" }}
                                    onClick={() => navigate(a.to)}
                                >
                                    <span>{a.icon}</span> {a.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bot Status */}
                    <div className="card">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <h2 style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Bot Status</h2>
                            <span className="badge badge-success">● Active</span>
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: 8 }}>
                            <strong style={{ color: "var(--color-text-primary)" }}>{bot?.name || "Your Bot"}</strong>
                        </div>
                        {bot?.widget_key && (
                            <div>
                                <div className="label">Widget Key</div>
                                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    <code className="mono" style={{ flex: 1, background: "var(--color-bg-input)", padding: "6px 10px", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {bot.widget_key}
                                    </code>
                                    <button className="btn-ghost" style={{ padding: "6px 10px", fontSize: "0.75rem" }} onClick={copyWidgetKey}>
                                        {copied ? "✓" : "Copy"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


```

### File: Frontend\gyaanchat-frontend\src\pages\app\BotSettingsPage.tsx
```tsx
import { useRef } from "react";
import { useToast } from "../../contexts/ToastContext";
import { useBotSettings } from "../../contexts/BotSettingsContext";

const COLOR_PRESETS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#0ea5e9", "#14b8a6"];

export default function BotSettingsPage() {
    const { showToast } = useToast();
    const { settings, loading, logoUrl, setLogoUrl, uploadLogo, patchSettings, saveSettings, saving } = useBotSettings();
    const logoInputRef = useRef<HTMLInputElement>(null);

    async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { showToast("Please select an image file.", "error"); return; }
        if (file.size > 2 * 1024 * 1024) { showToast("Logo must be under 2 MB.", "error"); return; }

        try {
            await uploadLogo(file);
            showToast("Logo uploaded!", "success");
        } catch {
            showToast("Failed to upload logo.", "error");
        }
    }

    async function handleSave() {
        try {
            await saveSettings();
            showToast("Bot settings saved!", "success");
        } catch {
            showToast("Failed to save settings.", "error");
        }
    }

    const color = settings?.theme_color || "#3b82f6";
    const botName = settings?.name || "GyaanChat Bot";

    if (loading) return (
        <div className="page">
            <div className="page-header"><h1 className="page-title">Bot Settings</h1></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
                <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 48, background: "var(--color-border)", borderRadius: "var(--radius-sm)", opacity: 0.5 }} />)}
                </div>
            </div>
        </div>
    );

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Bot Settings</h1>
                    <p className="page-subtitle">Customize your chatbot — changes reflect live in Chat Preview</p>
                </div>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Saving…</> : "Save Changes"}
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

                {/* ── Left: Form ─────────────────────────────────────────── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Identity card */}
                    <div className="card">
                        <h3 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: 18 }}>Identity</h3>

                        {/* Logo */}
                        <div className="form-group">
                            <label className="label">Bot Logo</label>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <div
                                    onClick={() => logoInputRef.current?.click()}
                                    style={{
                                        width: 68, height: 68, borderRadius: "50%",
                                        background: logoUrl ? "transparent" : `linear-gradient(135deg, ${color}, ${color}99)`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        overflow: "hidden", flexShrink: 0, cursor: "pointer",
                                        border: `2px solid ${color}44`,
                                        boxShadow: `0 0 0 4px ${color}18`,
                                        transition: "box-shadow 0.2s",
                                    }}
                                >
                                    {logoUrl
                                        ? <img src={logoUrl} alt="Bot logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        : <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                                    }
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    <button className="btn-ghost" style={{ padding: "6px 14px", fontSize: "0.8rem" }} onClick={() => logoInputRef.current?.click()}>
                                        {logoUrl ? "Change Logo" : "Upload Logo"}
                                    </button>
                                    {logoUrl && (
                                        <button className="btn-ghost" style={{ padding: "6px 14px", fontSize: "0.8rem", color: "var(--color-danger)" }} onClick={() => setLogoUrl(null)}>
                                            Remove
                                        </button>
                                    )}
                                    <span className="muted" style={{ fontSize: "0.73rem" }}>PNG, JPG, SVG · max 2 MB</span>
                                </div>
                                <input ref={logoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Bot Name</label>
                            <input className="input" value={settings?.name || ""} onChange={e => patchSettings({ name: e.target.value })} placeholder="GyaanChat Bot" />
                        </div>
                    </div>

                    {/* Behaviour card */}
                    <div className="card">
                        <h3 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: 18 }}>Behaviour</h3>

                        <div className="form-group">
                            <label className="label">Greeting Message</label>
                            <textarea className="input" value={settings?.greeting || ""} onChange={e => patchSettings({ greeting: e.target.value })} rows={2} placeholder="Hi! How can I help you today?" />
                            <span className="muted" style={{ fontSize: "0.73rem" }}>Shown when a visitor opens the widget</span>
                        </div>

                        <div className="form-group">
                            <label className="label">Fallback Message</label>
                            <textarea className="input" value={settings?.fallback || ""} onChange={e => patchSettings({ fallback: e.target.value })} rows={2} placeholder="I couldn't find that in your documents." />
                            <span className="muted" style={{ fontSize: "0.73rem" }}>Shown when no relevant answer is found</span>
                        </div>

                        <div className="form-group">
                            <label className="label">Response Style</label>
                            <select className="input" value={settings?.temperature || "0.2"} onChange={e => patchSettings({ temperature: e.target.value })}>
                                <option value="0.0">Precise — strictly factual</option>
                                <option value="0.2">Balanced — recommended</option>
                                <option value="0.5">Conversational — more natural</option>
                                <option value="0.7">Creative — varied responses</option>
                                <option value="1.0">Very Creative — maximum variation</option>
                            </select>
                        </div>
                    </div>

                    {/* Appearance card */}
                    <div className="card">
                        <h3 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: 18 }}>Appearance</h3>
                        <div className="form-group">
                            <label className="label">Theme Color</label>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <input type="color" value={color} onChange={e => patchSettings({ theme_color: e.target.value })}
                                    style={{ width: 44, height: 40, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", background: "none", padding: 2 }} />
                                <input className="input" value={color} onChange={e => patchSettings({ theme_color: e.target.value })} placeholder="#3b82f6" style={{ flex: 1, fontFamily: "monospace" }} />
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                                {COLOR_PRESETS.map(c => (
                                    <button key={c} onClick={() => patchSettings({ theme_color: c })} title={c}
                                        style={{
                                            width: 30, height: 30, borderRadius: "50%", background: c, border: "none",
                                            cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
                                            outline: color === c ? `3px solid ${c}` : "none", outlineOffset: 3,
                                            boxShadow: color === c ? `0 0 0 5px ${c}22` : "none",
                                            transform: color === c ? "scale(1.15)" : "scale(1)",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right: Live Preview ─────────────────────────────────── */}
                <div style={{ position: "sticky", top: 24 }}>
                    {/* Live badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 0 3px #10b98133" }} />
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Live Preview</span>
                    </div>

                    <div className="card" style={{ padding: 0, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                        {/* Widget header */}
                        <div style={{
                            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                            padding: "16px 18px",
                            display: "flex", alignItems: "center", gap: 12,
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: "50%",
                                background: "rgba(255,255,255,0.2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                overflow: "hidden", flexShrink: 0,
                                border: "2px solid rgba(255,255,255,0.4)",
                            }}>
                                {logoUrl
                                    ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                                }
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>{botName}</div>
                                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 4 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                                    Online
                                </div>
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </div>

                        {/* Messages */}
                        <div style={{ padding: 16, minHeight: 240, display: "flex", flexDirection: "column", gap: 10, background: "var(--color-bg)" }}>
                            {/* Greeting bubble */}
                            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                                    background: logoUrl ? "transparent" : `linear-gradient(135deg, ${color}, ${color}99)`,
                                    overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    {logoUrl
                                        ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                                    }
                                </div>
                                <div style={{
                                    maxWidth: "78%", padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
                                    background: "var(--color-bg-card)", color: "var(--color-text)",
                                    fontSize: "0.82rem", lineHeight: 1.5,
                                    border: "1px solid var(--color-border)",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                                }}>
                                    {settings?.greeting || "Hi! How can I help you today?"}
                                </div>
                            </div>

                            {/* Sample user message */}
                            <div style={{
                                alignSelf: "flex-end", maxWidth: "78%", padding: "10px 14px", borderRadius: "16px 16px 4px 16px",
                                background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: "#fff",
                                fontSize: "0.82rem", lineHeight: 1.5, boxShadow: `0 2px 8px ${color}44`
                            }}>
                                What can you help me with?
                            </div>

                            {/* Fallback bubble */}
                            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                                    background: logoUrl ? "transparent" : `linear-gradient(135deg, ${color}, ${color}99)`,
                                    overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    {logoUrl
                                        ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                                    }
                                </div>
                                <div style={{
                                    maxWidth: "78%", padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
                                    background: "var(--color-bg-card)", color: "var(--color-text)",
                                    fontSize: "0.82rem", lineHeight: 1.5,
                                    border: "1px solid var(--color-border)",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                                }}>
                                    {settings?.fallback || "I couldn't find that in your documents."}
                                </div>
                            </div>
                        </div>

                        {/* Input bar */}
                        <div style={{ display: "flex", gap: 8, padding: "12px 14px", borderTop: "1px solid var(--color-border)", background: "var(--color-bg-card)" }}>
                            <div style={{ flex: 1, padding: "9px 13px", border: "1px solid var(--color-border)", borderRadius: 10, fontSize: "0.8rem", color: "var(--color-text-muted)", background: "var(--color-bg)" }}>
                                Type a message…
                            </div>
                            <button style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", boxShadow: `0 2px 8px ${color}44` }}>
                                Send
                            </button>
                        </div>

                        {/* Footer note */}
                        <div style={{ padding: "8px 14px", background: "var(--color-bg)", borderTop: "1px solid var(--color-border)", textAlign: "center" }}>
                            <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>✦ Updates live as you edit · Go to <strong>Chat Preview</strong> to test for real</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


```

### File: Frontend\gyaanchat-frontend\src\pages\app\BotsPage.tsx
```tsx
import { useState } from "react";

export default function BotsPage() {
  const [tenantId, setTenantId] = useState(localStorage.getItem("gyaanchat_tenant_id") || "tenantA");

  return (
    <div className="page">
      <header className="pageHeader">
        <div>
          <h1 className="pageTitle">Bots</h1>
          <p className="muted">For MVP, we use tenant_id as your bot context.</p>
        </div>
      </header>

      <div className="card">
        <div className="cardTitle">Set Tenant ID</div>

        <div className="row">
          <input
            className="input"
            style={{ width: 260 }}
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="tenant_id"
          />
          <button
            className="button"
            onClick={() => {
              localStorage.setItem("gyaanchat_tenant_id", tenantId);
              alert("Saved tenant_id!");
            }}
          >
            Save
          </button>
        </div>

        <p className="muted" style={{ marginTop: 10 }}>
          We’ll use this tenant_id in Knowledge Upload and Test Chat pages.
        </p>
      </div>
    </div>
  );
}

```

### File: Frontend\gyaanchat-frontend\src\pages\app\ConversationsPage.tsx
```tsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";
import Skeleton from "../../components/ui/Skeleton";

interface Log {
    question: string;
    answer: string;
    source_count: number;
    created_at: string;
}

function timeAgo(iso: string) {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function ConversationsPage() {
    const { tenant } = useAuth();
    const tenantId = tenant?.id || localStorage.getItem("gyaanchat_tenant_id") || "";
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!tenantId) return;
        api.get("/analytics/recent")
            .catch(() => api.get(`/analytics/questions?tenant_id=${tenantId}`))
            .then((res) => {
                const raw = res.data;
                if (Array.isArray(raw)) {
                    setLogs(raw.map((l: any) => ({
                        question: l.question || l.message || "",
                        answer: l.answer || l.answer_preview || "",
                        source_count: l.source_count ?? 0,
                        created_at: l.created_at || "",
                    })));
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [tenantId]);

    const filtered = logs.filter((l) =>
        !search || l.question.toLowerCase().includes(search.toLowerCase()) || l.answer.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Conversations</h1>
                    <p className="page-subtitle">Browse all chat interactions with your bot</p>
                </div>
                <input
                    className="input"
                    style={{ maxWidth: 280 }}
                    placeholder="Search conversations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {loading ? (
                    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height="20px" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">💬</div>
                        <div className="empty-state-title">{search ? "No results found" : "No conversations yet"}</div>
                        <div className="empty-state-sub">{search ? "Try a different search term." : "Start testing your bot to see conversations here."}</div>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Question</th>
                                <th style={{ textAlign: "right" }}>Sources</th>
                                <th>Time</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((log, i) => (
                                <>
                                    <tr
                                        key={`row-${i}`}
                                        className="conv-row"
                                        onClick={() => setExpanded(expanded === i ? null : i)}
                                    >
                                        <td className="muted" style={{ width: 40 }}>{i + 1}</td>
                                        <td style={{ maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {log.question}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <span className="badge badge-muted">{log.source_count}</span>
                                        </td>
                                        <td className="muted">{timeAgo(log.created_at)}</td>
                                        <td style={{ textAlign: "right" }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: expanded === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", opacity: 0.5 }}>
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </td>
                                    </tr>
                                    {expanded === i && (
                                        <tr key={`exp-${i}`} className="conv-expanded">
                                            <td colSpan={5}>
                                                <div className="conv-expanded-content">
                                                    <div style={{ marginBottom: 12 }}>
                                                        <div className="label">Question</div>
                                                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-primary)" }}>{log.question}</div>
                                                    </div>
                                                    <div>
                                                        <div className="label">Answer</div>
                                                        <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                                                            {log.answer || "No answer recorded."}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}


```

### File: Frontend\gyaanchat-frontend\src\pages\app\DashboardHome.tsx
```tsx
export default function DashboardHome() {
  const stats = [
    { label: "Total Queries", value: "1,284" },
    { label: "Documents Uploaded", value: "12" },
    { label: "Avg Response Time", value: "1.4s" },
  ];

  const recentChats = [
    { id: 1, user: "Visitor #12", date: "2 mins ago", query: "How to reset password?" },
    { id: 2, user: "Visitor #05", date: "15 mins ago", query: "What is the return policy?" },
    { id: 3, user: "Visitor #09", date: "1 hour ago", query: "Pricing for enterprise" },
  ];

  return (
    <div className="page">
      <header className="pageHeader">
        <div>
          <h1 className="pageTitle">Welcome back!</h1>
          <p className="muted">Here is what's happening with your AI assistant.</p>
        </div>
      </header>

      <div className="statGrid">
        {stats.map((s, i) => (
          <div key={i} className="statCard">
            <div className="statLabel">{s.label}</div>
            <div className="statValue">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.1rem", marginBottom: 16 }}>Recent Queries</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "12px 0", fontSize: "0.875rem", color: "#64748b" }}>Visitor</th>
                <th style={{ padding: "12px 0", fontSize: "0.875rem", color: "#64748b" }}>Query</th>
                <th style={{ padding: "12px 0", fontSize: "0.875rem", color: "#64748b" }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentChats.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 0", fontSize: "0.875rem", fontWeight: 500 }}>{c.user}</td>
                  <td style={{ padding: "12px 0", fontSize: "0.875rem" }}>{c.query}</td>
                  <td style={{ padding: "12px 0", fontSize: "0.875rem", color: "#64748b" }}>{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


```

### File: Frontend\gyaanchat-frontend\src\pages\app\DocumentsPage.tsx
```tsx
import { useState, useEffect, useRef } from "react";
import { uploadDocument, getDocStatus, listDocuments, deleteDocument } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import type { DocItem } from "../../api/types";
import Skeleton from "../../components/ui/Skeleton";

export default function DocumentsPage() {
    const { tenant } = useAuth();
    const { showToast } = useToast();
    const tenantId = tenant?.id || localStorage.getItem("gyaanchat_tenant_id") || "";

    const [docs, setDocs] = useState<DocItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchDocs(); }, [tenantId]);

    // Status polling
    useEffect(() => {
        const active = docs.some((d) => d.status === "processing" || d.status === "uploaded");
        if (!active) return;
        const interval = setInterval(async () => {
            let changed = false;
            const updated = await Promise.all(docs.map(async (doc) => {
                if (doc.status === "processing" || doc.status === "uploaded") {
                    try {
                        const s = await getDocStatus(tenantId, doc.doc_id);
                        if (s.status !== doc.status) {
                            changed = true;
                            if (s.status === "ready") showToast(`"${s.filename}" is ready!`, "success");
                            if (s.status === "failed") showToast(`"${s.filename}" failed: ${s.error || "Unknown error"}`, "error");
                            return s;
                        }
                    } catch { /* ignore */ }
                }
                return doc;
            }));
            if (changed) setDocs(updated);
        }, 3000);
        return () => clearInterval(interval);
    }, [docs, tenantId]);

    async function fetchDocs() {
        try {
            setLoading(true);
            const data = await listDocuments(tenantId);
            setDocs(Array.isArray(data) ? data.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0)) : []);
        } catch { setDocs([]); }
        finally { setLoading(false); }
    }

    function handleFileDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        const allowed = [".pdf", ".txt", ".docx", ".md", ".csv", ".html", ".htm"];
        const ext = file?.name.includes(".") ? "." + file.name.split(".").pop()!.toLowerCase() : "";
        if (file && allowed.includes(ext)) {
            setSelectedFile(file);
        } else {
            showToast("Supported types: PDF, TXT, DOCX, MD, CSV, HTML", "error");
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        const allowed = [".pdf", ".txt", ".docx", ".md", ".csv", ".html", ".htm"];
        const ext = file?.name.includes(".") ? "." + file.name.split(".").pop()!.toLowerCase() : "";
        if (file && allowed.includes(ext)) {
            setSelectedFile(file);
        } else if (file) {
            showToast("Supported types: PDF, TXT, DOCX, MD, CSV, HTML", "error");
        }
    }

    async function handleUpload() {
        if (!selectedFile || uploading) return;
        setUploading(true);
        try {
            const res = await uploadDocument(tenantId, selectedFile);
            const newDoc: DocItem = { doc_id: res.doc_id, tenant_id: tenantId, filename: selectedFile.name, status: "uploaded", updated_at: Date.now() / 1000 };
            setDocs([newDoc, ...docs]);
            setSelectedFile(null);
            setModalOpen(false);
            showToast("Upload started! Processing in background.", "success");
        } catch (err: any) {
            showToast(err?.response?.data?.detail || "Upload failed.", "error");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    async function handleDelete(docId: string) {
        try {
            await deleteDocument(tenantId, docId);
            setDocs(docs.filter((d) => d.doc_id !== docId));
            showToast("Document deleted.", "success");
        } catch {
            setDocs(docs.filter((d) => d.doc_id !== docId));
            showToast("Document removed.", "info");
        }
        setConfirmDelete(null);
    }

    function formatTime(ts?: number) {
        if (!ts) return "—";
        return new Date(ts * 1000).toLocaleDateString([], { dateStyle: "medium" });
    }

    const statusBadge = (doc: DocItem) => {
        if (doc.status === "ready") return <span className="badge badge-success">✓ Ready</span>;
        if (doc.status === "failed") return (
            <span className="badge badge-danger" title={doc.error || "Processing failed"} style={{ cursor: "help" }}>
                ✕ Failed {doc.error ? "ⓘ" : ""}
            </span>
        );
        return <span className="badge badge-muted"><span className="spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }} /> Processing</span>;
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Knowledge Base</h1>
                    <p className="page-subtitle">Upload documents to train your AI assistant</p>
                </div>
                <button className="btn-primary" onClick={() => setModalOpen(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Upload Document
                </button>
            </div>

            {/* Document list */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {loading ? (
                    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <Skeleton width="32px" height="32px" borderRadius="8px" />
                                <div style={{ flex: 1 }}>
                                    <Skeleton width="60%" height="14px" style={{ marginBottom: 6 }} />
                                    <Skeleton width="40%" height="12px" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : docs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <div className="empty-state-title">No documents yet</div>
                        <div className="empty-state-sub">Upload PDF, TXT, DOCX, MD, CSV, or HTML to train your assistant.</div>
                        <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => setModalOpen(true)}>Upload Now</button>
                    </div>
                ) : (
                    docs.map((doc) => (
                        <div key={doc.doc_id} className="doc-card">
                            <div className="doc-icon">📄</div>
                            <div className="doc-info">
                                <div className="doc-name">{doc.filename || "Unnamed"}</div>
                                <div className="doc-meta">{formatTime(doc.updated_at)} · {doc.doc_id?.slice(0, 8)}...</div>
                            </div>
                            {statusBadge(doc)}
                            <div className="doc-actions">
                                {confirmDelete === doc.doc_id ? (
                                    <>
                                        <button className="btn-danger" style={{ padding: "6px 12px", fontSize: "0.75rem" }} onClick={() => handleDelete(doc.doc_id)}>Yes, delete</button>
                                        <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: "0.75rem" }} onClick={() => setConfirmDelete(null)}>Cancel</button>
                                    </>
                                ) : (
                                    <button className="btn-ghost" style={{ padding: "6px 10px" }} title="Delete" onClick={() => setConfirmDelete(doc.doc_id)}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Upload Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
                    <div className="modal">
                        <h2 className="modal-title">Upload Document</h2>
                        <div
                            className={`drop-zone ${dragOver ? "drag-over" : ""}`}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleFileDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="drop-zone-icon">📁</div>
                            <div className="drop-zone-text">Drop file here</div>
                            <div className="drop-zone-sub">PDF, TXT, DOCX, MD, CSV, HTML · or click to browse</div>
                        </div>
                        <input ref={fileInputRef} type="file" accept=".pdf,.txt,.docx,.md,.csv,.html,.htm" style={{ display: "none" }} onChange={handleFileChange} />

                        {selectedFile && (
                            <div className="selected-file-row">
                                <span>📄</span>
                                <span style={{ flex: 1, fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedFile.name}</span>
                                <span className="muted">{(selectedFile.size / 1024).toFixed(0)} KB</span>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button className="btn-ghost" onClick={() => { setModalOpen(false); setSelectedFile(null); }}>Cancel</button>
                            <button className="btn-primary" disabled={!selectedFile || uploading} onClick={handleUpload}>
                                {uploading ? <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Uploading...</> : "Upload"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


```

### File: Frontend\gyaanchat-frontend\src\pages\app\InstallPage.tsx
```tsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../contexts/ToastContext";

type Tab = "script" | "react" | "iframe";

export default function InstallPage() {
    const { bot } = useAuth();
    const { showToast } = useToast();
    const widgetKey = bot?.widget_key || "YOUR_WIDGET_KEY";
    const [tab, setTab] = useState<Tab>("script");

    const SNIPPETS: Record<Tab, string> = {
        script: `<!-- Add before </body> -->
<script>
  window.GyaanChatConfig = {
    widgetKey: "${widgetKey}",
    apiBase: "http://localhost:8000"
  };
</script>
<script src="http://localhost:8000/widget.js" defer></script>`,
        react: `// Install: npm install @gyaanchat/widget
import { GyaanChatWidget } from "@gyaanchat/widget";

export default function App() {
  return (
    <>
      {/* Your app */}
      <GyaanChatWidget
        widgetKey="${widgetKey}"
        apiBase="http://localhost:8000"
      />
    </>
  );
}`,
        iframe: `<!-- Embed as an iframe -->
<iframe
  src="http://localhost:8000/chat-embed?key=${widgetKey}"
  width="400"
  height="600"
  frameborder="0"
  allow="clipboard-write"
  style="border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.15);"
></iframe>`,
    };

    function copy(text: string) {
        navigator.clipboard.writeText(text);
        showToast("Copied to clipboard!", "success");
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Deployment</h1>
                    <p className="page-subtitle">Embed your AI chatbot on any website</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20 }}>
                {/* Left: Code snippets */}
                <div>
                    {/* Widget Key */}
                    <div className="card" style={{ marginBottom: 20 }}>
                        <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: 12 }}>Your Widget Key</h2>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <code className="mono" style={{ flex: 1, background: "var(--color-bg-input)", padding: "10px 14px", borderRadius: "var(--radius-md)", fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {widgetKey}
                            </code>
                            <button className="btn-ghost" style={{ flexShrink: 0 }} onClick={() => copy(widgetKey)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                Copy
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                        <div className="tabs" style={{ padding: "0 20px", marginBottom: 0, borderBottom: "1px solid var(--color-border)" }}>
                            {(["script", "react", "iframe"] as Tab[]).map((t) => (
                                <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                                    {t === "script" ? "🏷 Script Tag" : t === "react" ? "⚛️ React" : "🖼 iFrame"}
                                </button>
                            ))}
                        </div>
                        <div style={{ padding: 20 }}>
                            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                                <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: "0.75rem" }} onClick={() => copy(SNIPPETS[tab])}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                    Copy Code
                                </button>
                            </div>
                            <pre className="code-block">{SNIPPETS[tab]}</pre>
                        </div>
                    </div>
                </div>

                {/* Right: Preview + Steps */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Widget Preview */}
                    <div className="card">
                        <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: 16 }}>Widget Preview</h2>
                        <div className="install-preview">
                            <div className="widget-preview-panel">
                                <div className="widget-preview-header">💬 AI Assistant</div>
                                <div className="widget-preview-msgs">
                                    <div className="widget-preview-msg bot">Hi! How can I help you today?</div>
                                    <div className="widget-preview-msg user">What are your hours?</div>
                                    <div className="widget-preview-msg bot">We're open 24/7 — I'm always here!</div>
                                </div>
                            </div>
                            <div className="widget-preview-btn">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="card">
                        <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: 16 }}>Quick Setup</h2>
                        {[
                            { n: "1", text: "Copy your widget key above" },
                            { n: "2", text: "Choose your integration method (Script / React / iFrame)" },
                            { n: "3", text: "Paste the code snippet into your website" },
                            { n: "4", text: "The chat button will appear on your site" },
                        ].map((step) => (
                            <div key={step.n} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                                <div style={{ width: 24, height: 24, background: "var(--color-accent)", color: "var(--color-accent-fg)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                                    {step.n}
                                </div>
                                <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", paddingTop: 3 }}>{step.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


```

### File: Frontend\gyaanchat-frontend\src\pages\app\KnowledgePage.tsx
```tsx
import { useState } from "react";
import { uploadDocument, getDocStatus } from "../../api/endpoints";

export default function KnowledgePage() {
  const tenantId = localStorage.getItem("gyaanchat_tenant_id") || "tenantA";
  const [file, setFile] = useState<File | null>(null);
  const [docId, setDocId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function handleUpload() {
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    try {
      const res = await uploadDocument(tenantId, file);
      setDocId(res.doc_id);
      setStatus("uploaded");

      const interval = setInterval(async () => {
        const s = await getDocStatus(tenantId, res.doc_id);
        setStatus(s.status);
        if (s.status === "ready" || s.status === "failed") clearInterval(interval);
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Upload failed.");
    }
  }

  return (
    <div className="page">
      <h1>Knowledge Upload</h1>

      <div className="card">
        <p><b>Tenant:</b> {tenantId}</p>

        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button className="button" onClick={handleUpload}>Upload</button>

        {docId && <p>Doc ID: {docId}</p>}
        {status && <p>Status: <b>{status}</b></p>}
        {error && <div className="alert">{error}</div>}
      </div>
    </div>
  );
}

```

### File: Frontend\gyaanchat-frontend\src\pages\app\LogsPage.tsx
```tsx
export default function LogsPage() {
  return (
    <div className="page">
      <header className="pageHeader">
        <div>
          <h1 className="pageTitle">Logs</h1>
          <p className="muted">We’ll connect logs after chat works end-to-end.</p>
        </div>
      </header>

      <div className="card">
        <div className="muted">Coming soon.</div>
      </div>
    </div>
  );
}

```

### File: Frontend\gyaanchat-frontend\src\pages\app\ProfilePage.tsx
```tsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { api } from "../../api/client";

export default function ProfilePage() {
    const { user, tenant, updateUser } = useAuth();
    const { showToast } = useToast();

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [saving, setSaving] = useState(false);

    const [showPw, setShowPw] = useState(false);
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [pwSaving, setPwSaving] = useState(false);

    const initials = name
        ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    useEffect(() => {
        api.get("/auth/me").then((res) => {
            setName(res.data.name || "");
            setEmail(res.data.email || "");
        }).catch(() => { });
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.patch("/auth/profile", { name, email });
            updateUser({ name: data.name, email: data.email });
            showToast("Profile updated!", "success");
        } catch (err: any) {
            showToast(err?.response?.data?.detail || "Failed to update profile.", "error");
        } finally {
            setSaving(false);
        }
    }

    async function handlePasswordChange(e: React.FormEvent) {
        e.preventDefault();
        if (newPw !== confirmPw) { showToast("Passwords don't match.", "error"); return; }
        if (newPw.length < 6) { showToast("Password must be at least 6 characters.", "error"); return; }
        setPwSaving(true);
        try {
            await api.patch("/auth/profile", { current_password: currentPw, new_password: newPw });
            showToast("Password changed!", "success");
            setCurrentPw(""); setNewPw(""); setConfirmPw(""); setShowPw(false);
        } catch (err: any) {
            showToast(err?.response?.data?.detail || "Failed to change password.", "error");
        } finally {
            setPwSaving(false);
        }
    }

    return (
        <div className="page" style={{ maxWidth: 680 }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Profile</h1>
                    <p className="page-subtitle">Manage your personal information</p>
                </div>
            </div>

            {/* Avatar + Name */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="profile-avatar-section">
                    <div className="profile-avatar">{initials}</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: "1.125rem" }}>{name || "User"}</div>
                        <div className="muted">{email}</div>
                        {tenant && <div className="muted" style={{ marginTop: 2 }}>Org: {tenant.name}</div>}
                    </div>
                </div>

                <hr className="divider" />

                <form onSubmit={handleSave}>
                    <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: 16 }}>Personal Information</h2>
                    <div className="form-group">
                        <label className="label">Full Name</label>
                        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div className="form-group">
                        <label className="label">Email Address</label>
                        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                    <button className="btn-primary" type="submit" disabled={saving}>
                        {saving ? <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Saving...</> : "Save Changes"}
                    </button>
                </form>
            </div>

            {/* Password Change */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setShowPw((v) => !v)}>
                    <h2 style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Change Password</h2>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showPw ? "rotate(180deg)" : "none", transition: "transform 0.2s", opacity: 0.5 }}>
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
                {showPw && (
                    <form onSubmit={handlePasswordChange} style={{ marginTop: 16 }}>
                        <div className="form-group">
                            <label className="label">Current Password</label>
                            <input className="input" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Current password" />
                        </div>
                        <div className="form-group">
                            <label className="label">New Password</label>
                            <input className="input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min 6 characters" />
                        </div>
                        <div className="form-group">
                            <label className="label">Confirm New Password</label>
                            <input className="input" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
                        </div>
                        <button className="btn-primary" type="submit" disabled={pwSaving}>
                            {pwSaving ? <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Updating...</> : "Update Password"}
                        </button>
                    </form>
                )}
            </div>

            {/* Danger Zone */}
            <div className="danger-zone">
                <div className="danger-zone-title">⚠ Danger Zone</div>
                <div className="danger-zone-desc">Permanently delete your account and all associated data. This cannot be undone.</div>
                <button className="btn-danger" onClick={() => showToast("Account deletion is not available in this version.", "info")}>
                    Delete Account
                </button>
            </div>
        </div>
    );
}


```

### File: Frontend\gyaanchat-frontend\src\pages\app\SettingsPage.tsx
```tsx
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function SettingsPage() {
    const { tenant } = useAuth();
    const { showToast } = useToast();
    const { theme, toggleTheme } = useTheme();
    const tenantId = tenant?.id || localStorage.getItem("gyaanchat_tenant_id") || "";

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your appearance and account preferences</p>
                </div>
            </div>

            <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Appearance */}
                <div className="card">
                    <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: 20 }}>Appearance</h2>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--color-border)" }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>Dark Mode</div>
                            <div className="muted" style={{ fontSize: "0.8rem", marginTop: 2 }}>Switch between light and dark interface</div>
                        </div>
                        {/* Toggle switch */}
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle dark mode"
                            style={{
                                width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
                                background: theme === "dark" ? "var(--color-accent)" : "var(--color-border-strong)",
                                position: "relative", transition: "background 0.2s", flexShrink: 0,
                            }}
                        >
                            <div style={{
                                width: 20, height: 20, borderRadius: "50%", background: "white",
                                position: "absolute", top: 3, transition: "left 0.2s",
                                left: theme === "dark" ? 25 : 3,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                            }} />
                        </button>
                    </div>

                    <div style={{ padding: "14px 0" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: 6 }}>Current Theme</div>
                        <span className="badge badge-muted">{theme === "dark" ? "🌙 Dark" : "☀️ Light"}</span>
                    </div>
                </div>

                {/* Account */}
                <div className="card">
                    <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: 16 }}>Account</h2>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {[
                            { label: "Tenant ID", value: tenantId || "—" },
                            { label: "Plan", value: "Free" },
                        ].map((item) => (
                            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--color-border)" }}>
                                <span className="muted" style={{ fontSize: "0.875rem" }}>{item.label}</span>
                                <span style={{ fontWeight: 500, fontSize: "0.875rem", fontFamily: item.label === "Tenant ID" ? "monospace" : "inherit", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="danger-zone">
                    <div className="danger-zone-title">⚠ Danger Zone</div>
                    <div className="danger-zone-desc">
                        Deleting your account will permanently remove all your data, documents, and bot configuration. This action cannot be undone.
                    </div>
                    <button
                        className="btn-danger"
                        onClick={() => showToast("Account deletion is not available in this version.", "info")}
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}


```

### File: Frontend\gyaanchat-frontend\src\pages\app\TestChatPage.tsx
```tsx
import { useMemo, useState, useRef, useEffect } from "react";
import { chatTenant } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useBotSettings } from "../../contexts/BotSettingsContext";
import { useNavigate } from "react-router-dom";

type Msg = {
    role: "user" | "assistant";
    text: string;
    sources?: Array<{ doc_id: string; chunk_index: number; filename: string }>;
};

export default function TestChatPage() {
    const { tenant } = useAuth();
    const navigate = useNavigate();
    const tenantId = useMemo(() => tenant?.id || localStorage.getItem("gyaanchat_tenant_id"), [tenant]);
    const { settings, loading: settingsLoading, logoUrl } = useBotSettings();

    const [input, setInput] = useState("");
    const [msgs, setMsgs] = useState<Msg[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Set greeting as first message when settings load
    useEffect(() => {
        if (settings?.greeting) {
            setMsgs([{ role: "assistant", text: settings.greeting }]);
        }
    }, [settings?.greeting]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [msgs, busy]);

    async function send() {
        if (!tenantId) return;
        const q = input.trim();
        if (!q || busy) return;
        setError("");
        setMsgs(m => [...m, { role: "user", text: q }]);
        setInput("");
        setBusy(true);
        try {
            const res = await chatTenant(tenantId, q);
            let answer = res.answer || "I'm not sure how to answer that.";
            if (settings?.fallback && (answer.includes("couldn't find") || answer.includes("I don't know"))) {
                answer = settings.fallback;
            }
            setMsgs(m => [...m, { role: "assistant", text: answer, sources: res.sources }]);
        } catch (e: any) {
            setError(e?.message || "Chat request failed. Is the backend running?");
        } finally {
            setBusy(false);
        }
    }

    const color = settings?.theme_color || "#3b82f6";
    const botName = settings?.name || "AI Assistant";

    if (!tenantId) return (
        <div className="page">
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
                <h3>Tenant not found</h3>
                <p className="muted">Please login again to access the chat.</p>
            </div>
        </div>
    );

    return (
        <div className="page" style={{ height: "calc(100vh - var(--topbar-height))", display: "flex", flexDirection: "column", paddingBottom: 0 }}>
            <div className="page-header" style={{ marginBottom: 20 }}>
                <div>
                    <h1 className="page-title">Chat Preview</h1>
                    <p className="page-subtitle">Live test of your AI assistant — reflects your Bot Settings</p>
                </div>
                <button className="btn-ghost" style={{ fontSize: "0.82rem" }} onClick={() => navigate("/app/bot-settings")}>
                    ⚙ Edit Bot Settings
                </button>
            </div>

            <div className="chat-layout" style={{ flex: 1, minHeight: 0 }}>

                {/* Left: Bot Config Panel */}
                <div className="card" style={{ overflow: "auto" }}>
                    <h2 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-muted)", marginBottom: 16 }}>
                        Bot Config
                    </h2>

                    {/* Bot avatar + name */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "14px", borderRadius: "var(--radius)", background: `${color}12`, border: `1px solid ${color}30` }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                            background: logoUrl ? "transparent" : `linear-gradient(135deg, ${color}, ${color}99)`,
                            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                            border: `2px solid ${color}44`,
                        }}>
                            {logoUrl
                                ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                            }
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{botName}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                                <span className="muted" style={{ fontSize: "0.72rem" }}>Online</span>
                            </div>
                        </div>
                    </div>

                    {settingsLoading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 14, background: "var(--color-border)", borderRadius: 4, opacity: 0.5 }} />)}
                        </div>
                    ) : settings ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {[
                                { label: "Temperature", value: settings.temperature || "0.2" },
                                { label: "Greeting", value: settings.greeting?.slice(0, 55) + (settings.greeting?.length > 55 ? "…" : "") },
                                { label: "Fallback", value: settings.fallback?.slice(0, 55) + (settings.fallback?.length > 55 ? "…" : "") },
                            ].map(item => (
                                <div key={item.label}>
                                    <div className="label" style={{ marginBottom: 3 }}>{item.label}</div>
                                    <div style={{ fontSize: "0.82rem", color: "var(--color-text)" }}>{item.value || "—"}</div>
                                </div>
                            ))}
                            <div>
                                <div className="label" style={{ marginBottom: 6 }}>Theme Color</div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: color, border: "2px solid var(--color-border)", boxShadow: `0 0 0 3px ${color}33` }} />
                                    <span style={{ fontSize: "0.82rem", fontFamily: "monospace" }}>{color}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="muted">Could not load settings.</p>
                    )}

                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
                        <button className="btn-ghost" style={{ width: "100%", fontSize: "0.8rem", justifyContent: "center" }} onClick={() => navigate("/app/bot-settings")}>
                            ✏ Edit in Bot Settings
                        </button>
                    </div>
                </div>

                {/* Right: Chat Window */}
                <div className="chat-window" style={{ display: "flex", flexDirection: "column" }}>
                    {/* Chat header */}
                    <div className="chat-header" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, borderRadius: "var(--radius) var(--radius) 0 0" }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: logoUrl ? "transparent" : "rgba(255,255,255,0.2)",
                            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                            border: "2px solid rgba(255,255,255,0.35)", flexShrink: 0,
                        }}>
                            {logoUrl
                                ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                            }
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#fff" }}>{botName}</div>
                            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: 4 }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                                Online · Test Mode
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages" ref={scrollRef} style={{ flex: 1 }}>
                        {msgs.length === 0 && !busy && (
                            <div style={{ textAlign: "center", padding: "40px 0" }} className="muted">
                                No messages yet. Ask something about your documents!
                            </div>
                        )}
                        {msgs.map((m, i) => (
                            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-end", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                                {m.role === "assistant" && (
                                    <div style={{
                                        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                                        background: logoUrl ? "transparent" : `linear-gradient(135deg, ${color}, ${color}99)`,
                                        overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                        {logoUrl
                                            ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            : <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                                        }
                                    </div>
                                )}
                                <div style={{
                                    maxWidth: "72%", padding: "10px 14px",
                                    borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                    background: m.role === "user"
                                        ? `linear-gradient(135deg, ${color}, ${color}cc)`
                                        : "var(--color-bg-card)",
                                    color: m.role === "user" ? "#fff" : "var(--color-text)",
                                    fontSize: "0.875rem", lineHeight: 1.55,
                                    border: m.role === "bot" ? "1px solid var(--color-border)" : "none",
                                    boxShadow: m.role === "user" ? `0 2px 8px ${color}44` : "0 1px 4px rgba(0,0,0,0.06)",
                                }}>
                                    <div style={{ fontSize: "0.68rem", fontWeight: 600, opacity: 0.65, marginBottom: 4 }}>
                                        {m.role === "user" ? "You" : botName}
                                    </div>
                                    {m.text}
                                    {m.sources && m.sources.length > 0 && (
                                        <div className="chat-sources" style={{ marginTop: 8 }}>
                                            {m.sources.map((s, idx) => (
                                                <span key={idx} className="source-chip">{s.filename || `Doc ${s.doc_id?.slice(0, 4)}…`}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {busy && (
                            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                                <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${color}, ${color}99)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                                </div>
                                <div className="chat-bubble bot" style={{ padding: "12px 16px" }}>
                                    <div className="typing-dots"><span /><span /><span /></div>
                                </div>
                            </div>
                        )}
                        {error && <div className="alert alert-error">{error}</div>}
                    </div>

                    {/* Input bar */}
                    <div className="chat-input-bar">
                        <input
                            className="input"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Type your message..."
                            onKeyDown={e => e.key === "Enter" && send()}
                            disabled={busy}
                            style={{ margin: 0 }}
                        />
                        <button
                            onClick={send}
                            disabled={busy || !input.trim()}
                            style={{
                                flexShrink: 0, border: "none", borderRadius: "var(--radius-sm)",
                                padding: "0 18px", height: 40, cursor: "pointer", fontWeight: 700,
                                fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6,
                                background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                                color: "#fff", boxShadow: `0 2px 8px ${color}44`,
                                opacity: busy || !input.trim() ? 0.5 : 1,
                                transition: "opacity 0.15s",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                            {busy ? "…" : "Send"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


```

### File: Frontend\gyaanchat-frontend\src\pages\public\LandingPage.tsx
```tsx
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div>
            {/* ── Navbar ── */}
            <nav className="landing-nav">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="sidebar-logo" style={{ width: 28, height: 28, fontSize: "0.875rem" }}>G</div>
                    <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)" }}>GyaanChat</span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn-ghost" onClick={() => navigate("/login")}>Login</button>
                    <button className="btn-primary" onClick={() => navigate("/register")}>Get Started</button>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section style={{ background: "var(--color-bg)", padding: "0 24px" }}>
                <div className="landing-hero">
                    <h1 className="hero-title">
                        Build AI Chatbots<br />Trained on Your Docs
                    </h1>
                    <p className="hero-sub">
                        Upload your documents. Get a smart chatbot in minutes.<br />Embed it anywhere — no code required.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary" style={{ padding: "12px 28px", fontSize: "1rem" }} onClick={() => navigate("/register")}>
                            Start for Free →
                        </button>
                        <button className="btn-ghost" style={{ padding: "12px 28px", fontSize: "1rem" }} onClick={() => {
                            document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                        }}>
                            See How It Works
                        </button>
                    </div>

                    {/* Mock browser window */}
                    <div className="mock-browser">
                        <div className="mock-browser-bar">
                            <div className="mock-dot" style={{ background: "#ff5f57" }} />
                            <div className="mock-dot" style={{ background: "#febc2e" }} />
                            <div className="mock-dot" style={{ background: "#28c840" }} />
                            <span style={{ marginLeft: 8, fontSize: "0.75rem", color: "var(--color-text-muted)" }}>chat.yoursite.com</span>
                        </div>
                        <div className="mock-chat">
                            <div className="mock-msg bot">👋 Hi! I'm your AI assistant. Ask me anything about our products.</div>
                            <div className="mock-msg user">What's your return policy?</div>
                            <div className="mock-msg bot">Our return policy allows returns within 30 days of purchase. Items must be in original condition. You can initiate a return from your account dashboard.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="features-section">
                <h2 className="section-title">Everything you need</h2>
                <p className="section-sub">A complete platform for building and deploying AI chatbots</p>
                <div className="features-grid">
                    {[
                        { icon: "📄", title: "Document Training", desc: "Upload PDFs and text files. Your bot learns from your content instantly." },
                        { icon: "🧠", title: "RAG-Powered Answers", desc: "Retrieval-augmented generation ensures accurate, grounded responses." },
                        { icon: "🌐", title: "Easy Embedding", desc: "One script tag. Works on any website, framework, or platform." },
                        { icon: "📊", title: "Usage Analytics", desc: "Track conversations, popular questions, and engagement metrics." },
                        { icon: "🎨", title: "Custom Branding", desc: "Match your brand with custom colors, names, and greeting messages." },
                        { icon: "🔒", title: "Isolated Per Tenant", desc: "Each account gets its own isolated knowledge base and bot instance." },
                    ].map((f) => (
                        <div key={f.title} className="feature-card">
                            <div className="feature-icon">{f.icon}</div>
                            <div className="feature-title">{f.title}</div>
                            <div className="feature-desc">{f.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="how-section" id="how-it-works">
                <h2 className="section-title">How it works</h2>
                <p className="section-sub">Get your AI chatbot live in three simple steps</p>
                <div className="how-steps">
                    {[
                        { n: "1", title: "Upload Docs", desc: "Add your PDFs, FAQs, or any text documents to your knowledge base." },
                        { n: "2", title: "Bot Gets Trained", desc: "GyaanChat processes and indexes your content using AI embeddings." },
                        { n: "3", title: "Embed & Go Live", desc: "Copy one script tag and paste it into your website. Done." },
                    ].map((step, i) => (
                        <div key={step.n} className="how-step">
                            <div className="how-step-num">{step.n}</div>
                            {i < 2 && <div className="how-connector" />}
                            <div className="how-step-title">{step.title}</div>
                            <div className="how-step-desc">{step.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cta-section">
                <h2 className="cta-title">Ready to get started?</h2>
                <p className="cta-sub">Join hundreds of teams using GyaanChat to power their support.</p>
                <button className="cta-btn" onClick={() => navigate("/register")}>
                    Create your chatbot for free
                </button>
            </section>

            {/* ── Footer ── */}
            <footer className="landing-footer">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="sidebar-logo" style={{ width: 24, height: 24, fontSize: "0.75rem" }}>G</div>
                    <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>© 2025 GyaanChat</span>
                </div>
                <div style={{ display: "flex", gap: 20 }}>
                    {["Privacy", "Terms", "GitHub"].map((l) => (
                        <span key={l} style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", cursor: "pointer" }}>{l}</span>
                    ))}
                </div>
            </footer>
        </div>
    );
}


```

### File: Frontend\gyaanchat-frontend\src\pages\public\LoginPage.tsx
```tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data);
      navigate("/app", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      {/* Left decorative panel */}
      <div className="auth-left">
        <div className="auth-left-logo">
          <div className="auth-left-logo-mark">G</div>
          <span style={{ fontWeight: 700, fontSize: "1.125rem" }}>GyaanChat</span>
        </div>
        <h2 className="auth-left-tagline">Your AI chatbot,<br />trained on your docs.</h2>
        <p className="auth-left-sub">
          Upload documents, configure your bot, and embed it anywhere — all from one dashboard.
        </p>
        <div className="auth-testimonial">
          <p className="auth-testimonial-text">
            "GyaanChat cut our support tickets by 40% in the first month. Setup took less than an hour."
          </p>
          <p className="auth-testimonial-author">— Priya S., Product Manager</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div className="auth-form-card">
          <h1 className="auth-form-title">Welcome back</h1>
          <p className="auth-form-sub">Sign in to your GyaanChat dashboard</p>

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label className="label">Email address</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label className="label" style={{ margin: 0 }}>Password</label>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", cursor: "pointer" }}>Forgot password?</span>
              </div>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", padding: "11px", fontSize: "0.9375rem", marginTop: 4 }}>
              {loading ? (
                <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Signing in...</>
              ) : "Sign In"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}


```

### File: Frontend\gyaanchat-frontend\src\pages\public\RegisterPage.tsx
```tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/client";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [websiteName, setWebsiteName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (!name || !email || !password || !websiteName) { setError("Please fill in all fields."); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
        setLoading(true);
        try {
            const { data } = await api.post("/auth/register", { name, email, password, website_name: websiteName });
            login(data);
            navigate("/app", { replace: true });
        } catch (err: any) {
            setError(err?.response?.data?.detail || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-shell">
            {/* Left decorative panel */}
            <div className="auth-left">
                <div className="auth-left-logo">
                    <div className="auth-left-logo-mark">G</div>
                    <span style={{ fontWeight: 700, fontSize: "1.125rem" }}>GyaanChat</span>
                </div>
                <h2 className="auth-left-tagline">Start building your<br />AI chatbot today.</h2>
                <p className="auth-left-sub">
                    Free to start. No credit card required. Your bot will be live in minutes.
                </p>
                <div className="auth-testimonial">
                    <p className="auth-testimonial-text">
                        "We replaced our entire FAQ page with a GyaanChat bot. Users love it."
                    </p>
                    <p className="auth-testimonial-author">— Rahul M., CTO</p>
                </div>
            </div>

            {/* Right form panel */}
            <div className="auth-right">
                <div className="auth-form-card">
                    <h1 className="auth-form-title">Create your account</h1>
                    <p className="auth-form-sub">Get your AI chatbot up and running in minutes</p>

                    <form onSubmit={onSubmit}>
                        <div className="form-group">
                            <label className="label">Full Name</label>
                            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" autoComplete="name" />
                        </div>

                        <div className="form-group">
                            <label className="label">Organization / Website Name</label>
                            <input className="input" value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} placeholder="My Company" />
                        </div>

                        <div className="form-group">
                            <label className="label">Email address</label>
                            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                        </div>

                        <div className="form-group">
                            <label className="label">Password</label>
                            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" autoComplete="new-password" />
                        </div>

                        {error && <div className="alert alert-error">{error}</div>}

                        <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", padding: "11px", fontSize: "0.9375rem", marginTop: 4 }}>
                            {loading ? (
                                <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Creating account...</>
                            ) : "Create Account →"}
                        </button>
                    </form>

                    <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                        Already have an account?{" "}
                        <Link to="/login" className="auth-link">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}


```

### File: Frontend\gyaanchat-frontend\src\styles\analytics.css
```css
.analyticsContainer {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.analyticsHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.filterSelect {
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    font-size: 0.875rem;
    color: #1e293b;
    cursor: pointer;
    outline: none;
}

.analyticsStatGrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
}

.statCard {
    background: white;
    border: 1px solid #e7e7ee;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.statLabel {
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 8px;
    font-weight: 500;
}

.statValue {
    font-size: 1.75rem;
    font-weight: 700;
    color: #0f172a;
    display: flex;
    align-items: baseline;
    gap: 8px;
}

.statDelta {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
}

.statDelta.up {
    color: #10b981;
    background: #f0fdf4;
}

/* Charts */
.chartContainer {
    background: white;
    border: 1px solid #e7e7ee;
    border-radius: 12px;
    padding: 24px;
    min-height: 350px;
}

.chartTitle {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 24px;
    color: #0f172a;
}

.barChart {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    height: 200px;
    padding-top: 20px;
    gap: 8px;
}

.barGroup {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    height: 100%;
    justify-content: flex-end;
}

.bar {
    width: 100%;
    background: #3b82f6;
    border-radius: 4px 4px 0 0;
    transition: height 0.3s ease, background 0.2s;
    position: relative;
    min-height: 2px;
}

.bar:hover {
    background: #2563eb;
}

.bar:hover::after {
    content: attr(data-value);
    position: absolute;
    top: -24px;
    left: 50%;
    transform: translateX(-50%);
    background: #0f172a;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
}

.barLabel {
    font-size: 0.75rem;
    color: #94a3b8;
    white-space: nowrap;
}

/* Tables */
.analyticsGrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
    gap: 24px;
}

.analyticsTable {
    width: 100%;
    border-collapse: collapse;
}

.analyticsTable th {
    text-align: left;
    padding: 12px 16px;
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
    border-bottom: 1px solid #f1f5f9;
}

.analyticsTable td {
    padding: 14px 16px;
    font-size: 0.875rem;
    color: #1e293b;
    border-bottom: 1px solid #f1f5f9;
}

.analyticsTable tr:last-child td {
    border-bottom: none;
}

.badge {
    padding: 4px 8px;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
}

.badge-success {
    background: #f0fdf4;
    color: #166534;
}

.badge-warning {
    background: #fffbeb;
    color: #92400e;
}

.badge-danger {
    background: #fef2f2;
    color: #991b1b;
}

.notice {
    background: #fffbeb;
    border: 1px solid #fef3c7;
    color: #92400e;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
}

@media (max-width: 768px) {
    .analyticsGrid {
        grid-template-columns: 1fr;
    }
}

```

### File: Frontend\gyaanchat-frontend\src\styles\App.css
```css
.appShell {
  display: flex;
  min-height: 100vh;
  background: #f6f7fb;
  color: #111;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

.appMain {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: white;
  border-bottom: 1px solid #e7e7ee;
}

.topbarTitle {
  font-weight: 600;
}

.topbarMeta {
  font-size: 12px;
  opacity: 0.75;
}

.appContent {
  padding: 16px;
}


```

### File: Frontend\gyaanchat-frontend\src\styles\chat.css
```css
.chatPage {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 112px);
    /* Adjust for topbar and padding */
    position: relative;
}

.chatContainer {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 100px;
    /* Space for fixed input */
}

.chatBubble {
    max-width: 80%;
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 0.95rem;
    line-height: 1.5;
    position: relative;
    word-wrap: break-word;
}

.userBubble {
    align-self: flex-end;
    background: #0f172a;
    color: white;
    border-bottom-right-radius: 2px;
}

.assistantBubble {
    align-self: flex-start;
    background: white;
    color: #1e293b;
    border: 1px solid #e2e8f0;
    border-bottom-left-radius: 2px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.chatRole {
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 4px;
    opacity: 0.8;
}

.assistantBubble .chatRole {
    color: #64748b;
}

.userBubble .chatRole {
    color: rgba(255, 255, 255, 0.7);
    text-align: right;
}

.sourcesSection {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid #f1f5f9;
    font-size: 0.8rem;
}

.sourceTitle {
    font-weight: 600;
    color: #64748b;
    margin-bottom: 6px;
    display: block;
}

.sourceLink {
    display: inline-block;
    background: #f8fafc;
    padding: 4px 8px;
    border-radius: 4px;
    color: #475569;
    border: 1px solid #e2e8f0;
    margin-right: 6px;
    margin-bottom: 6px;
    text-decoration: none;
}

.chatInputWrapper {
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background: white;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
    display: flex;
    gap: 12px;
}

.typingIndicator {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
    background: #f8fafc;
    border-radius: 12px;
    width: fit-content;
    align-self: flex-start;
    border: 1px solid #e2e8f0;
}

.dot {
    width: 6px;
    height: 6px;
    background: #94a3b8;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(2) {
    animation-delay: 0.2s;
}

.dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: scale(0);
    }

    40% {
        transform: scale(1);
    }
}

```

### File: Frontend\gyaanchat-frontend\src\styles\documents.css
```css
.docsContainer {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.uploadCard {
    background: white;
    border: 1px solid #e7e7ee;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.dropZone {
    border: 2px dashed #e2e8f0;
    border-radius: 12px;
    padding: 32px;
    text-align: center;
    transition: all 0.2s;
    cursor: pointer;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    items-center: center;
    gap: 12px;
}

.dropZone:hover {
    border-color: #3b82f6;
    background: #eff6ff;
}

.fileInputLabel {
    display: inline-block;
    padding: 10px 20px;
    background: #0f172a;
    color: white;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.2s;
}

.fileInputLabel:hover {
    background: #1e293b;
}

.selectedFile {
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: #f1f5f9;
    border-radius: 8px;
    font-size: 0.875rem;
}

.progressBar {
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    margin-top: 16px;
    overflow: hidden;
}

.progressFill {
    height: 100%;
    background: #3b82f6;
    transition: width 0.4s ease-out;
}

/* Table Style */
.docsTable {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
}

.docsTable th {
    text-align: left;
    padding: 16px;
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #64748b;
    font-weight: 600;
    border-bottom: 1px solid #e2e8f0;
}

.docsTable td {
    padding: 16px;
    font-size: 0.875rem;
    color: #1e293b;
    border-bottom: 1px solid #f1f5f9;
}

.docsTable tr:hover {
    background: #f8fafc;
}

/* Badges */
.badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
}

.badge-processing {
    background: #fefce8;
    color: #854d0e;
    border: 1px solid #fef08a;
}

.badge-ready {
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
}

.badge-failed {
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;
}

.spinner {
    width: 12px;
    height: 12px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.deleteBtn {
    background: none;
    border: none;
    color: #ef4444;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.deleteBtn:hover {
    background: #fef2f2;
}

.emptyState {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    gap: 12px;
}

.emptyIcon {
    font-size: 48px;
    margin-bottom: 8px;
}

```

### File: Frontend\gyaanchat-frontend\src\styles\globals.css
```css
/* ============================================================
   GyaanChat Design System — globals.css
   All CSS variables, resets, utilities, and animations
   ============================================================ */

/* ── Variables ── */
:root {
    --color-bg: #f9fafb;
    --color-bg-card: #ffffff;
    --color-bg-sidebar: #ffffff;
    --color-bg-input: #f3f4f6;
    --color-border: #e5e7eb;
    --color-border-strong: #d1d5db;

    --color-text-primary: #111827;
    --color-text-secondary: #6b7280;
    --color-text-muted: #9ca3af;
    --color-text-inverse: #ffffff;

    --color-accent: #111827;
    --color-accent-hover: #1f2937;
    --color-accent-fg: #ffffff;

    --color-danger: #dc2626;
    --color-danger-bg: #fef2f2;
    --color-success: #16a34a;
    --color-success-bg: #f0fdf4;
    --color-warning: #d97706;

    --sidebar-width: 260px;
    --topbar-height: 64px;

    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --radius-full: 9999px;

    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.12);

    --transition: 0.2s ease;
}

html.dark {
    --color-bg: #0a0a0a;
    --color-bg-card: #141414;
    --color-bg-sidebar: #111111;
    --color-bg-input: #1f1f1f;
    --color-border: #2a2a2a;
    --color-border-strong: #3a3a3a;

    --color-text-primary: #f5f5f5;
    --color-text-secondary: #a0a0a0;
    --color-text-muted: #6b6b6b;
    --color-text-inverse: #000000;

    --color-accent: #f5f5f5;
    --color-accent-hover: #e0e0e0;
    --color-accent-fg: #000000;

    --color-danger: #f87171;
    --color-danger-bg: #1a0a0a;
    --color-success: #4ade80;
    --color-success-bg: #0a1a0a;
}

/* ── Reset ── */
*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    background: var(--color-bg);
    color: var(--color-text-primary);
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background var(--transition), color var(--transition);
}

a {
    color: inherit;
    text-decoration: none;
}

button {
    font-family: inherit;
}

input,
textarea,
select {
    font-family: inherit;
}

img {
    max-width: 100%;
}

/* ── Utility: Cards ── */
.card {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-sm);
    transition: background var(--transition), border-color var(--transition);
}

/* ── Utility: Buttons ── */
.btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--color-accent);
    color: var(--color-accent-fg);
    border: none;
    padding: 9px 18px;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: background var(--transition), opacity var(--transition);
    white-space: nowrap;
}

.btn-primary:hover:not(:disabled) {
    background: var(--color-accent-hover);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: transparent;
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
    padding: 9px 18px;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition);
    white-space: nowrap;
}

.btn-ghost:hover:not(:disabled) {
    background: var(--color-bg-input);
}

.btn-ghost:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-danger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--color-danger);
    color: white;
    border: none;
    padding: 9px 18px;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity var(--transition);
}

.btn-danger:hover:not(:disabled) {
    opacity: 0.85;
}

.btn-danger:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* ── Utility: Inputs ── */
.input {
    width: 100%;
    background: var(--color-bg-input);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 9px 12px;
    font-size: 0.875rem;
    color: var(--color-text-primary);
    outline: none;
    transition: border-color var(--transition), background var(--transition);
}

.input:focus {
    border-color: var(--color-accent);
    background: var(--color-bg-card);
}

.input::placeholder {
    color: var(--color-text-muted);
}

textarea.input {
    resize: vertical;
    min-height: 80px;
}

/* ── Utility: Badges ── */
.badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 600;
}

.badge-success {
    background: var(--color-success-bg);
    color: var(--color-success);
}

.badge-danger {
    background: var(--color-danger-bg);
    color: var(--color-danger);
}

.badge-muted {
    background: var(--color-bg-input);
    color: var(--color-text-secondary);
}

.badge-warning {
    background: #fffbeb;
    color: var(--color-warning);
}

/* ── Utility: Labels ── */
.label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    margin-bottom: 6px;
    letter-spacing: 0.01em;
}

/* ── Utility: Muted text ── */
.muted {
    color: var(--color-text-muted);
    font-size: 0.8125rem;
}

/* ── Utility: Divider ── */
.divider {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: 20px 0;
}

/* ── Utility: Mono ── */
.mono {
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 0.8125rem;
}

/* ── Page Layout ── */
.page {
    padding: 32px;
    max-width: 1200px;
    animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(4px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28px;
    gap: 16px;
    flex-wrap: wrap;
}

.page-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-primary);
    line-height: 1.2;
}

.page-subtitle {
    color: var(--color-text-muted);
    font-size: 0.875rem;
    margin-top: 4px;
}

/* ── Stat Cards Grid ── */
.stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
}

.stat-card {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 20px 24px;
    box-shadow: var(--shadow-sm);
}

.stat-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
}

.stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-text-primary);
    line-height: 1;
}

.stat-sub {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-top: 6px;
}

/* ── Tables ── */
.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table th {
    text-align: left;
    padding: 12px 16px;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-input);
}

.data-table td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--color-border);
    font-size: 0.875rem;
    color: var(--color-text-primary);
    vertical-align: middle;
}

.data-table tbody tr:last-child td {
    border-bottom: none;
}

.data-table tbody tr:hover td {
    background: var(--color-bg-input);
}

/* ── Skeleton Loader ── */
.skeleton {
    background: linear-gradient(90deg,
            var(--color-bg-input) 25%,
            var(--color-border) 50%,
            var(--color-bg-input) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--radius-md);
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

/* ── Toast ── */
.toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
}

.toast-item {
    padding: 12px 16px;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: var(--shadow-lg);
    animation: slideIn 0.2s ease;
    pointer-events: all;
    min-width: 260px;
    max-width: 380px;
    display: flex;
    align-items: center;
    gap: 10px;
}

@keyframes slideIn {
    from {
        transform: translateX(110%);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }

    to {
        transform: translateX(110%);
        opacity: 0;
    }
}

.toast-item.exiting {
    animation: slideOut 0.2s ease forwards;
}

.toast-success {
    background: var(--color-success-bg);
    color: var(--color-success);
    border: 1px solid var(--color-success);
}

.toast-error {
    background: var(--color-danger-bg);
    color: var(--color-danger);
    border: 1px solid var(--color-danger);
}

.toast-info {
    background: var(--color-bg-card);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
}

/* ── Spinner ── */
.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
    flex-shrink: 0;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* ── Tabs ── */
.tabs {
    display: flex;
    gap: 2px;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 24px;
}

.tab-btn {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    padding: 10px 16px;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition);
    margin-bottom: -1px;
}

.tab-btn:hover {
    color: var(--color-text-primary);
}

.tab-btn.active {
    color: var(--color-text-primary);
    border-bottom-color: var(--color-accent);
    font-weight: 600;
}

/* ── Code Block ── */
.code-block {
    background: #0d0d0d;
    color: #e5e7eb;
    border-radius: var(--radius-md);
    padding: 16px 20px;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 0.8125rem;
    line-height: 1.7;
    overflow-x: auto;
    white-space: pre;
    position: relative;
}

/* ── Empty State ── */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
    text-align: center;
    gap: 12px;
}

.empty-state-icon {
    font-size: 3rem;
    line-height: 1;
}

.empty-state-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary);
}

.empty-state-sub {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    max-width: 320px;
}

/* ── Form Group ── */
.form-group {
    margin-bottom: 18px;
}

/* ── Alert ── */
.alert {
    padding: 12px 16px;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 16px;
}

.alert-error {
    background: var(--color-danger-bg);
    color: var(--color-danger);
    border: 1px solid var(--color-danger);
}

.alert-success {
    background: var(--color-success-bg);
    color: var(--color-success);
    border: 1px solid var(--color-success);
}

/* ── Typing dots ── */
.typing-dots {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 12px 16px;
}

.typing-dots span {
    width: 7px;
    height: 7px;
    background: var(--color-text-muted);
    border-radius: 50%;
    animation: bounce 1.2s infinite;
}

.typing-dots span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes bounce {

    0%,
    60%,
    100% {
        transform: translateY(0);
    }

    30% {
        transform: translateY(-6px);
    }
}

/* ── App Shell ── */
.app-shell {
    display: flex;
    height: 100vh;
    overflow: hidden;
}

.app-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
}

.app-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
}

/* ── Sidebar ── */
.sidebar {
    width: var(--sidebar-width);
    background: var(--color-bg-sidebar);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    transition: background var(--transition), border-color var(--transition);
    z-index: 100;
}

.sidebar-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 16px;
    border-bottom: 1px solid var(--color-border);
}

.sidebar-logo {
    width: 32px;
    height: 32px;
    background: var(--color-accent);
    color: var(--color-accent-fg);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 800;
    flex-shrink: 0;
}

.sidebar-brand-text {
    display: flex;
    flex-direction: column;
}

.sidebar-brand-name {
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--color-text-primary);
    line-height: 1.2;
}

.sidebar-brand-sub {
    font-size: 0.6875rem;
    color: var(--color-text-muted);
    font-weight: 500;
}

.sidebar-nav {
    flex: 1;
    padding: 12px 8px;
    overflow-y: auto;
}

.nav-section-label {
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 8px 10px 4px;
    margin-top: 8px;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition);
    border-left: 2px solid transparent;
    text-decoration: none;
    margin-bottom: 2px;
}

.nav-item:hover {
    background: var(--color-bg-input);
    color: var(--color-text-primary);
}

.nav-item.active {
    background: var(--color-bg-input);
    color: var(--color-text-primary);
    font-weight: 600;
    border-left-color: var(--color-accent);
}

.nav-item svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    opacity: 0.7;
}

.nav-item.active svg,
.nav-item:hover svg {
    opacity: 1;
}

.sidebar-footer {
    padding: 12px 8px;
    border-top: 1px solid var(--color-border);
    position: relative;
}

.sidebar-user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background var(--transition);
}

.sidebar-user:hover {
    background: var(--color-bg-input);
}

.user-avatar {
    width: 32px;
    height: 32px;
    background: var(--color-accent);
    color: var(--color-accent-fg);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    flex-shrink: 0;
}

.user-info {
    flex: 1;
    min-width: 0;
}

.user-name {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-email {
    font-size: 0.6875rem;
    color: var(--color-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-popover {
    position: absolute;
    bottom: calc(100% + 4px);
    left: 8px;
    right: 8px;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    z-index: 200;
}

.popover-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    font-size: 0.875rem;
    color: var(--color-text-primary);
    cursor: pointer;
    transition: background var(--transition);
    background: none;
    border: none;
    width: 100%;
    text-align: left;
}

.popover-item:hover {
    background: var(--color-bg-input);
}

.popover-item.danger {
    color: var(--color-danger);
}

/* ── Topbar ── */
.topbar {
    height: var(--topbar-height);
    background: var(--color-bg-card);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    flex-shrink: 0;
    transition: background var(--transition), border-color var(--transition);
}

.topbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.topbar-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
}

.topbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
}

.icon-btn {
    width: 36px;
    height: 36px;
    background: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: all var(--transition);
}

.icon-btn:hover {
    background: var(--color-bg-input);
    color: var(--color-text-primary);
}

.icon-btn svg {
    width: 16px;
    height: 16px;
}

/* ── Hamburger ── */
.hamburger {
    display: none;
}

/* ── Mobile Overlay ── */
.sidebar-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 99;
}

/* ── Responsive ── */
@media (max-width: 768px) {
    .hamburger {
        display: flex;
    }

    .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        transform: translateX(-100%);
        transition: transform 0.25s ease;
        z-index: 100;
    }

    .sidebar.open {
        transform: translateX(0);
    }

    .sidebar-overlay.open {
        display: block;
    }

    .app-shell {
        flex-direction: column;
    }

    .page {
        padding: 20px 16px;
    }

    .stat-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }
}

@media (max-width: 480px) {
    .stat-grid {
        grid-template-columns: 1fr;
    }
}

/* ── Landing Page ── */
.landing-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--color-bg-card);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 48px;
    height: 64px;
}

.landing-hero {
    text-align: center;
    padding: 100px 24px 80px;
    max-width: 760px;
    margin: 0 auto;
}

.hero-title {
    font-size: 3rem;
    font-weight: 800;
    line-height: 1.15;
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
    margin-bottom: 20px;
}

.hero-sub {
    font-size: 1.125rem;
    color: var(--color-text-secondary);
    margin-bottom: 36px;
    line-height: 1.6;
}

.hero-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 56px;
}

.mock-browser {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    max-width: 600px;
    margin: 0 auto;
    text-align: left;
}

.mock-browser-bar {
    background: var(--color-bg-input);
    border-bottom: 1px solid var(--color-border);
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.mock-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.mock-chat {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.mock-msg {
    max-width: 75%;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 0.875rem;
    line-height: 1.4;
}

.mock-msg.bot {
    background: var(--color-bg-input);
    color: var(--color-text-primary);
    align-self: flex-start;
    border-bottom-left-radius: 4px;
}

.mock-msg.user {
    background: #111827;
    color: #fff;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
}

html.dark .mock-msg.user {
    background: #f5f5f5;
    color: #000;
}

.features-section {
    padding: 80px 48px;
    background: var(--color-bg-input);
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    max-width: 1000px;
    margin: 40px auto 0;
}

.feature-card {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 24px;
    transition: box-shadow var(--transition), transform var(--transition);
}

.feature-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.feature-icon {
    font-size: 1.75rem;
    margin-bottom: 12px;
}

.feature-title {
    font-size: 0.9375rem;
    font-weight: 700;
    margin-bottom: 6px;
    color: var(--color-text-primary);
}

.feature-desc {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
}

.how-section {
    padding: 80px 48px;
    text-align: center;
}

.how-steps {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 0;
    max-width: 800px;
    margin: 48px auto 0;
    position: relative;
}

.how-step {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    position: relative;
}

.how-step-num {
    width: 44px;
    height: 44px;
    background: var(--color-accent);
    color: var(--color-accent-fg);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 700;
    position: relative;
    z-index: 1;
}

.how-connector {
    position: absolute;
    top: 22px;
    left: calc(50% + 22px);
    right: calc(-50% + 22px);
    height: 1px;
    border-top: 2px dashed var(--color-border-strong);
}

.how-step-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-text-primary);
}

.how-step-desc {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    text-align: center;
}

.cta-section {
    background: var(--color-accent);
    color: var(--color-accent-fg);
    padding: 80px 48px;
    text-align: center;
}

.cta-title {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 12px;
}

.cta-sub {
    font-size: 1rem;
    opacity: 0.75;
    margin-bottom: 32px;
}

.cta-btn {
    background: var(--color-accent-fg);
    color: var(--color-accent);
    border: none;
    padding: 12px 28px;
    border-radius: var(--radius-md);
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: opacity var(--transition);
}

.cta-btn:hover {
    opacity: 0.9;
}

.landing-footer {
    background: var(--color-bg-card);
    border-top: 1px solid var(--color-border);
    padding: 24px 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
}

.section-title {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--color-text-primary);
    text-align: center;
    letter-spacing: -0.01em;
}

.section-sub {
    font-size: 1rem;
    color: var(--color-text-secondary);
    text-align: center;
    margin-top: 8px;
}

/* ── Auth Pages ── */
.auth-shell {
    display: flex;
    min-height: 100vh;
}

.auth-left {
    flex: 1;
    background: #111827;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 48px;
    color: #fff;
}

html.dark .auth-left {
    background: #0a0a0a;
    border-right: 1px solid var(--color-border);
}

.auth-left-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 48px;
}

.auth-left-logo-mark {
    width: 40px;
    height: 40px;
    background: #fff;
    color: #111827;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 800;
}

.auth-left-tagline {
    font-size: 1.75rem;
    font-weight: 800;
    line-height: 1.3;
    margin-bottom: 16px;
}

.auth-left-sub {
    font-size: 0.9375rem;
    opacity: 0.65;
    line-height: 1.6;
    margin-bottom: 48px;
}

.auth-testimonial {
    border-left: 3px solid rgba(255, 255, 255, 0.3);
    padding-left: 16px;
}

.auth-testimonial-text {
    font-size: 0.9375rem;
    opacity: 0.8;
    font-style: italic;
    line-height: 1.6;
    margin-bottom: 8px;
}

.auth-testimonial-author {
    font-size: 0.8125rem;
    opacity: 0.5;
    font-weight: 600;
}

.auth-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    background: var(--color-bg);
}

.auth-form-card {
    width: 100%;
    max-width: 420px;
}

.auth-form-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 6px;
}

.auth-form-sub {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: 28px;
}

.auth-link {
    color: var(--color-text-primary);
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 2px;
}

@media (max-width: 768px) {
    .auth-left {
        display: none;
    }

    .auth-right {
        flex: 1;
    }

    .features-grid {
        grid-template-columns: 1fr;
    }

    .how-steps {
        flex-direction: column;
        align-items: center;
    }

    .how-connector {
        display: none;
    }

    .landing-nav {
        padding: 0 20px;
    }

    .features-section,
    .how-section,
    .cta-section {
        padding: 60px 20px;
    }
}

/* ── Chat Page ── */
.chat-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;
    height: calc(100vh - var(--topbar-height) - 64px);
}

.chat-window {
    display: flex;
    flex-direction: column;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.chat-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--color-bg-card);
}

.online-dot {
    width: 8px;
    height: 8px;
    background: var(--color-success);
    border-radius: 50%;
    flex-shrink: 0;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.chat-bubble {
    max-width: 80%;
    padding: 10px 14px;
    border-radius: 14px;
    font-size: 0.875rem;
    line-height: 1.5;
    word-break: break-word;
}

.chat-bubble.bot {
    background: var(--color-bg-input);
    color: var(--color-text-primary);
    align-self: flex-start;
    border-bottom-left-radius: 4px;
}

.chat-bubble.user {
    background: var(--color-accent);
    color: var(--color-accent-fg);
    align-self: flex-end;
    border-bottom-right-radius: 4px;
}

.chat-bubble-role {
    font-size: 0.6875rem;
    font-weight: 700;
    opacity: 0.6;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.chat-sources {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

html.dark .chat-sources {
    border-top-color: rgba(255, 255, 255, 0.08);
}

.source-chip {
    font-size: 0.6875rem;
    background: rgba(0, 0, 0, 0.08);
    padding: 2px 8px;
    border-radius: var(--radius-full);
    color: inherit;
    opacity: 0.75;
}

html.dark .source-chip {
    background: rgba(255, 255, 255, 0.1);
}

.chat-input-bar {
    padding: 12px 16px;
    border-top: 1px solid var(--color-border);
    display: flex;
    gap: 8px;
    background: var(--color-bg-card);
}

@media (max-width: 768px) {
    .chat-layout {
        grid-template-columns: 1fr;
        height: auto;
    }
}

/* ── Documents Page ── */
.doc-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--color-border);
    transition: background var(--transition);
}

.doc-card:last-child {
    border-bottom: none;
}

.doc-card:hover {
    background: var(--color-bg-input);
}

.doc-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.doc-info {
    flex: 1;
    min-width: 0;
}

.doc-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.doc-meta {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-top: 2px;
}

.doc-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

/* ── Upload Modal ── */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    animation: fadeIn 0.15s ease;
}

.modal {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 28px;
    width: 100%;
    max-width: 480px;
    box-shadow: var(--shadow-lg);
}

.modal-title {
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 20px;
    color: var(--color-text-primary);
}

.drop-zone {
    border: 2px dashed var(--color-border-strong);
    border-radius: var(--radius-lg);
    padding: 40px 24px;
    text-align: center;
    cursor: pointer;
    transition: all var(--transition);
    background: var(--color-bg-input);
}

.drop-zone:hover,
.drop-zone.drag-over {
    border-color: var(--color-accent);
    background: var(--color-bg-card);
}

.drop-zone-icon {
    font-size: 2.5rem;
    margin-bottom: 12px;
}

.drop-zone-text {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 4px;
}

.drop-zone-sub {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
}

.selected-file-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: var(--color-bg-input);
    border-radius: var(--radius-md);
    margin-top: 12px;
}

.modal-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    justify-content: flex-end;
}

/* ── Settings Tabs ── */
.settings-layout {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 24px;
}

.settings-nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.settings-nav-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    cursor: pointer;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    transition: all var(--transition);
}

.settings-nav-item:hover {
    background: var(--color-bg-input);
    color: var(--color-text-primary);
}

.settings-nav-item.active {
    background: var(--color-bg-input);
    color: var(--color-text-primary);
    font-weight: 600;
}

.danger-zone {
    border: 1px solid var(--color-danger);
    border-radius: var(--radius-lg);
    padding: 20px 24px;
    margin-top: 24px;
}

.danger-zone-title {
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--color-danger);
    margin-bottom: 6px;
}

.danger-zone-desc {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    margin-bottom: 16px;
}

/* ── Profile ── */
.profile-avatar-section {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 28px;
}

.profile-avatar {
    width: 64px;
    height: 64px;
    background: var(--color-accent);
    color: var(--color-accent-fg);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    flex-shrink: 0;
}

/* ── Analytics Charts ── */
.charts-grid {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 20px;
    margin-bottom: 24px;
}

.chart-card {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 20px 24px;
}

.chart-title {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 20px;
}

.pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-top: 1px solid var(--color-border);
}

.pagination-info {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
}

.pagination-btns {
    display: flex;
    gap: 6px;
}

@media (max-width: 768px) {
    .charts-grid {
        grid-template-columns: 1fr;
    }

    .settings-layout {
        grid-template-columns: 1fr;
    }
}

/* ── Conversations ── */
.conv-row {
    cursor: pointer;
    transition: background var(--transition);
}

.conv-row:hover td {
    background: var(--color-bg-input);
}

.conv-expanded {
    background: var(--color-bg-input);
}

.conv-expanded-content {
    padding: 16px 20px;
    border-top: 1px solid var(--color-border);
}

/* ── Install Page ── */
.install-preview {
    position: relative;
    background: var(--color-bg-input);
    border-radius: var(--radius-lg);
    padding: 40px;
    min-height: 200px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
}

.widget-preview-btn {
    width: 52px;
    height: 52px;
    background: #3b82f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
}

.widget-preview-panel {
    position: absolute;
    bottom: 80px;
    right: 40px;
    width: 280px;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: 14px;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
}

.widget-preview-header {
    background: #3b82f6;
    color: white;
    padding: 12px 16px;
    font-size: 0.875rem;
    font-weight: 600;
}

.widget-preview-msgs {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.widget-preview-msg {
    padding: 8px 12px;
    border-radius: 10px;
    font-size: 0.8125rem;
}

.widget-preview-msg.bot {
    background: var(--color-bg-input);
    align-self: flex-start;
}

.widget-preview-msg.user {
    background: #3b82f6;
    color: white;
    align-self: flex-end;
}

```

### File: Frontend\gyaanchat-frontend\src\styles\install.css
```css
.installContainer {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.installSection {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.copyGroup {
    display: flex;
    gap: 8px;
    align-items: center;
}

.copyInput {
    flex: 1;
    background: #f1f5f9;
    font-weight: 600;
    color: #475569;
    border-color: #e2e8f0;
}

.copyFeedback {
    font-size: 0.75rem;
    color: #10b981;
    font-weight: 600;
    opacity: 0;
    transition: opacity 0.2s;
}

.copyFeedback.show {
    opacity: 1;
}

.codeBlockWrapper {
    position: relative;
    background: #0f172a;
    border-radius: 12px;
    padding: 20px;
    margin-top: 8px;
    border: 1px solid #1e293b;
}

.codeBlock {
    margin: 0;
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 0.875rem;
    color: #e2e8f0;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
}

.copySnippetBtn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.copySnippetBtn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.instructionList {
    margin: 0;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.instructionItem {
    font-size: 0.95rem;
    color: #1e293b;
}

.tabGroup {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: #f1f5f9;
    border-radius: 8px;
    width: fit-content;
    margin-bottom: 16px;
}

.tabBtn {
    padding: 8px 16px;
    border: none;
    background: transparent;
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
}

.tabBtn.active {
    background: white;
    color: #0f172a;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.previewContainer {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed #e2e8f0;
    border-radius: 12px;
    color: #94a3b8;
    font-style: italic;
    font-size: 0.875rem;
}

.errorMessage {
    background: #fef2f2;
    border: 1px solid #fee2e2;
    color: #dc2626;
    padding: 16px;
    border-radius: 8px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
}

```

### File: Frontend\gyaanchat-frontend\src\styles\layout.css
```css
.appLayout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #f8fafc;
  overflow: hidden;
}

.appMain {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  height: 64px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.topbarTitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.topbarMeta {
  font-size: 0.875rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
}

.appContent {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f8fafc;
}

.maxWidthContainer {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.pageHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.pageTitle {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.muted {
  color: #64748b;
  font-size: 0.875rem;
}

/* Card Styles */
.card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 24px;
}

.statGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.statCard {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.statLabel {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.statValue {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
}

/* Auth Pages */
.centerPage {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}

.formCard {
  width: 100%;
  max-width: 400px;
}

.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 6px;
  margin-top: 16px;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.button {
  width: 100%;
  background: #0f172a;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 24px;
  transition: background 0.2s;
}

.button:hover {
  background: #1e293b;
}

.button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.alert {
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  color: #b91c1c;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-top: 12px;
}


```

### File: Frontend\gyaanchat-frontend\src\styles\sidebar.css
```css
.sidebar {
  width: 260px;
  background: #0f172a;
  color: white;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.brand {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-radius: 12px;
  background: rgba(255,255,255,0.06);
}

.brandLogo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255,255,255,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.brandName { font-weight: 700; }
.brandSub { font-size: 12px; opacity: 0.8; }

.nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.navLink {
  padding: 10px 12px;
  border-radius: 10px;
  color: rgba(255,255,255,0.88);
  text-decoration: none;
}

.navLink:hover {
  background: rgba(255,255,255,0.08);
}

.navLink.active {
  background: rgba(255,255,255,0.14);
  color: white;
}


```

### File: Frontend\gyaanchat-frontend\src\styles\testchat.css
```css
/* src/styles/testchat.css */

.previewPanel {
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    padding: 10px 20px;
    font-size: 0.9rem;
    color: #495057;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.previewHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-weight: 500;
    user-select: none;
}

.previewContent {
    margin-top: 8px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    padding-bottom: 8px;
    animation: slideDown 0.2s ease-out;
}

.previewItem {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.previewLabel {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #adb5bd;
}

.previewValue {
    font-weight: 500;
    color: #212529;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.colorSample {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 6px;
    border: 1px solid rgba(0, 0, 0, 0.1);
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Enhancements to existing chat elements for theming */
.chatBubble.assistantBubble {
    background-color: #f1f3f5;
    color: #212529;
}

```

