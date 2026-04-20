# Project Codebase Snapshot

## Directory Structure
```text
Gyaan_ChatAI/
    .gitignore
    codebase.py
    docker-compose.yml
    Backend/
        requirements.txt
        app/
            auth_utils.py
            db.py
            main.py
            requirements.txt
            __init__.py
            api/
                analytics.py
                auth.py
                bot.py
                chat.py
                documents.py
                __init__.py
                admin/
                    analytics.py
                    bots.py
                    conversations.py
                    dashboard.py
                    deps.py
                    documents.py
                    system.py
                    tenants.py
                    users.py
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
                chunker.py
                document_service.py
                embeddings.py
                llm.py
                pdf_loader.py
                rag.py
                vector_store.py
                __init__.py
            static/
                widget-embedded.js
                widget.js
            utils/
                email.py
                file_utils.py
                __init__.py
    Frontend/
        gyaanchat-frontend/
            .gitignore
            eslint.config.js
            index.html
            package.json
            README.md
            tsconfig.app.json
            tsconfig.json
            tsconfig.node.json
            vite.config.ts
            public/
                gyaanchatlogo.png
                vite.svg
                docs-images/
                    analytics.png
                    bot-settings.png
                    conversations.png
                    dashboard.png
                    documents.png
                    install.png
                    test-chat.png
            src/
                App.tsx
                docs.d.ts
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
                assets/
                    gyaanchatlogo.png
                    react.svg
                components/
                    AdminRoute.tsx
                    ProtectedRoute.tsx
                    docs/
                        DocsMarkdown.tsx
                        DocsSidebar.tsx
                        DocsTOC.tsx
                    layout/
                        AdminLayout.tsx
                        AppLayout.tsx
                        DocsLayout.tsx
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
                    docs/
                        contentProvider.ts
                        docs-config.ts
                        content/
                            analytics-conversations.md
                            customizing-your-bot.md
                            embedding-on-website.md
                            getting-started.md
                            testing-your-bot.md
                            uploading-documents.md
                            user-guide.md
                pages/
                    BotsPage.tsx
                    KnowledgePage.tsx
                    LogsPage.tsx
                    TestChatPage.tsx
                    admin/
                        AdminAnalyticsPage.tsx
                        AdminBotsPage.tsx
                        AdminConversationsPage.tsx
                        AdminDashboardPage.tsx
                        AdminDocumentsPage.tsx
                        AdminSystemPage.tsx
                        AdminTenantsPage.tsx
                        AdminUsersPage.tsx
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
                        DocsPage.tsx
                        LandingPage.tsx
                        LoginPage.tsx
                        RegisterPage.tsx
                styles/
                    analytics.css
                    App.css
                    chat.css
                    docs.css
                    documents.css
                    globals.css
                    install.css
                    layout.css
                    sidebar.css
                    testchat.css
```

---

## File Contents

### File: codebase.py
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
      PGADMIN_DEFAULT_EMAIL: admin@gyaanchat.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    depends_on:
      - postgres

  ollama:
    image: ollama/ollama:latest
    container_name: gyaanchat_ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - gyaanchat_ollama_models:/root/.ollama
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    dns:
      - 8.8.8.8
      - 8.8.4.4

volumes:
  gyaanchat_pgdata:
  gyaanchat_ollama_models:

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
from fastapi.responses import FileResponse, JSONResponse, HTMLResponse
import os
import time
from .core.database import engine, Base
import app.models  # ensure all models are registered with Base.metadata
from .api.auth import router as auth_router
from app.api import documents, chat, bot, analytics
from app.api.admin import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating DB tables...")
    Base.metadata.create_all(bind=engine)
    
    # Pre-load heavy models on startup to prevent cold-start delays
    from app.services.embeddings import get_model
    from app.services.vector_store import get_client
    get_model()   # Pre-loads SentenceTransformer
    get_client()  # Pre-loads ChromaDB Client
    
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
app.include_router(admin_router)


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


@app.get("/widget-embedded.js")
async def serve_widget_embedded_js():
    widget_path = os.path.join(static_dir, "widget-embedded.js")
    if os.path.exists(widget_path):
        return FileResponse(widget_path, media_type="application/javascript")
    return {"error": "widget-embedded.js not found"}


@app.get("/chat-embed")
async def serve_chat_embed(key: str):
    """
    Serve the embeddable chat iframe page.
    Accessed via: http://localhost:8000/chat-embed?key=WIDGET_KEY
    """
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GyaanChat Widget</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        html, body {{
            width: 100%;
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            background: white;
        }}
        #chat-widget {{
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
        }}
    </style>
</head>
<body>
    <div id="chat-widget"></div>
    <script>
        // Configure the widget
        window.GyaanChatConfig = {{
            widgetKey: "{key}",
            apiBase: window.location.origin,
            container: "#chat-widget",
            embedded: true
        }};
    </script>
    <script src="/widget-embedded.js" defer></script>
</body>
</html>"""
    return HTMLResponse(content=html_content)



@app.get("/")
def health_check():
    return {"status": "ok", "threshold": RAG_DISTANCE_THRESHOLD}

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
import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional

from ..core.database import get_db
from ..models.user import User
from ..models.tenant import Tenant
from ..models.bot import Bot
from ..auth_utils import hash_password, verify_password, create_access_token, get_current_user
from ..utils.email import send_verification_email, send_reset_password_email

router = APIRouter(prefix="/auth", tags=["auth"])

class ForgotPasswordIn(BaseModel):
    email: EmailStr

class ResetPasswordIn(BaseModel):
    email: EmailStr
    code: str
    new_password: str

class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    website_name: str  # tenant name

class VerifyEmailIn(BaseModel):
    email: EmailStr
    code: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

@router.post("/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    """Register a new user, tenant, and bot, and send a verification email."""
    print(f"ENTERED register: {data.email}")
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        if not existing.is_verified:
            # If not verified, just regenerate code and resend
            code = str(random.randint(100000, 999999))
            existing.verification_code = code
            db.commit()
            send_verification_email(data.email, code)
            return {"verification_required": True, "message": "Verification code resent"}
        raise HTTPException(status_code=400, detail="Email already registered")

    tenant = Tenant(name=data.website_name)
    db.add(tenant)
    db.flush()  # get tenant.id

    code = str(random.randint(100000, 999999))

    user = User(
        tenant_id=tenant.id,
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        is_verified=False,
        verification_code=code
    )
    db.add(user)

    bot = Bot(tenant_id=tenant.id, name=f"{data.website_name} Bot")
    db.add(bot)

    db.commit()
    db.refresh(user)

    # Send OTP
    send_verification_email(data.email, code)

    return {"verification_required": True, "message": "Please check your email for the verification code"}

@router.post("/verify-email")
def verify_email(data: VerifyEmailIn, db: Session = Depends(get_db)):
    """Verify the user's email using the OTP."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email is already verified")
    if user.verification_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    # Mark as verified
    user.is_verified = True
    user.verification_code = None
    db.commit()

    # Now automatically log them in just like the old register endpoint
    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    bot = db.query(Bot).filter(Bot.tenant_id == user.tenant_id).first()
    
    token = create_access_token({"sub": user.id, "tenant_id": tenant.id})
    return {
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email, "is_superadmin": user.is_superadmin},
        "tenant": {"id": tenant.id, "name": tenant.name},
        "bot": {"id": bot.id, "name": bot.name, "widget_key": bot.widget_key},
    }

@router.post("/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT token."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified. Please verify your email first.")

    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    if tenant and not tenant.is_active:
        raise HTTPException(status_code=403, detail="Tenant is suspended")

    bot = db.query(Bot).filter(Bot.tenant_id == user.tenant_id).first()

    token = create_access_token({"sub": user.id, "tenant_id": user.tenant_id, "is_superadmin": user.is_superadmin})
    return {
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email, "is_superadmin": user.is_superadmin},
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


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordIn, db: Session = Depends(get_db)):
    """Generate a password reset OTP and email it to the user."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # Prevent email enumeration by returning a generic success message
        return {"message": "If an account exists, a reset email was sent."}
    
    code = str(random.randint(100000, 999999))
    user.reset_code = code
    user.reset_code_expires = datetime.utcnow() + timedelta(minutes=15)
    db.commit()
    
    send_reset_password_email(user.email, code)
    return {"message": "If an account exists, a reset email was sent."}

@router.post("/reset-password")
def reset_password(data: ResetPasswordIn, db: Session = Depends(get_db)):
    """Verify the OTP and securely update the user's password."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid request")
        
    if not user.reset_code or user.reset_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid or missing verification code")
        
    if not user.reset_code_expires or datetime.utcnow() > user.reset_code_expires:
        raise HTTPException(status_code=400, detail="Reset code has expired")
        
    # Valid code - update the password
    user.password_hash = hash_password(data.new_password)
    user.reset_code = None
    user.reset_code_expires = None
    db.commit()
    
    return {"message": "Password successfully reset"}


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

    history_str = ""
    if req.session_id:
        recent_history = db.query(ChatHistory).filter(
            ChatHistory.tenant_id == req.tenant_id,
            ChatHistory.session_id == req.session_id
        ).order_by(ChatHistory.created_at.desc()).limit(6).all()
        
        if recent_history:
            for hist in reversed(recent_history):
                role = "Customer" if hist.sender == "user" else "Assistant"
                history_str += f"{role}: {hist.message}\n"

    # 1. Routing Layer: Small-talk / Greetings bypassing RAG
    # We check if the message is short (under ~8 words) and contains conversational keywords.
    words = msg.split()
    smalltalk_pattern = r"^(hi|hello|hey|hii|hola|good morning|good afternoon|good evening|howdy|greetings|how are you|how do you do|what's up|whats up|who are you|what are you called|do you know me|thanks|thank you|thx|cool|great|awesome)\b"
    
    is_smalltalk = False
    if len(words) <= 8 and re.match(smalltalk_pattern, msg.lower()):
        is_smalltalk = True

    if is_smalltalk:
        print("[DEBUG] Message identified as SMALL-TALK. Routing to chat LLM bypassing RAG.")
        prompt = build_smalltalk_prompt(msg, history_str)
        
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

    # Override threshold for higher precision if needed (or use env)
    # Based on logs, good matches are ~0.3-0.45. 
    EFFECTIVE_THRESHOLD = 0.55 

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

    # Increasing search depth to 8 for better coverage across diverse topics
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=8
    )

    all_docs = results["documents"][0] if results["documents"] else []
    all_metadatas = results["metadatas"][0] if results["metadatas"] else []
    all_distances = results["distances"][0] if results["distances"] else []

    print(f"[DEBUG] Retrieved {len(all_docs)} candidate chunks from ChromaDB.")
    
    # INDIVIDUAL FILTERING: Only keep chunks that are truly relevant
    filtered_docs = []
    filtered_metadatas = []
    
    for i, (doc, meta, dist) in enumerate(zip(all_docs, all_metadatas, all_distances)):
        is_match = dist < EFFECTIVE_THRESHOLD
        status = "ACCEPTED" if is_match else "REJECTED"
        print(f"  [{i}] DIST: {dist:.4f} | {status} | FILE: {meta.get('filename')} | TEXT: {doc[:60]}...")
        
        if is_match:
            filtered_docs.append(doc)
            filtered_metadatas.append(meta)

    if not filtered_docs:
        print("[DEBUG] Context REJECTED (no chunks passed threshold).")
        answer_text = "I'm sorry, I don't have the exact answer to that right now. Please reach out to our human support team."
        
        async def no_docs_generator():
            yield f"data: {json.dumps({'type': 'sources', 'sources': []})}\n\n"
            yield f"data: {json.dumps({'type': 'content', 'content': answer_text})}\n\n"
            save_interaction(db, req.tenant_id, msg, answer_text, req.bot_id, req.session_id)
            save_chat_log(db, req.tenant_id, msg, answer_text, source_count=0, bot_id=req.bot_id)
            
        return StreamingResponse(no_docs_generator(), media_type="text/event-stream")

    print(f"[DEBUG] Context ACCEPTED with {len(filtered_docs)} relevant chunks.")
    filenames = sorted(list(set([meta.get("filename") for meta in filtered_metadatas])))
    print(f"[DEBUG] Matched files: {filenames}")

    prompt = build_prompt(filtered_docs, req.question, history_str)

    unique_sources = []
    seen_files = set()
    for meta in filtered_metadatas:
        filename = meta.get("filename")
        if filename not in seen_files:
            seen_files.add(filename)
            unique_sources.append({
                "doc_id": meta.get("doc_id"),
                "chunk_index": meta.get("chunk_index"),
                "filename": filename,
            })
    
    sources = unique_sources

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

### File: Backend\app\api\admin\analytics.py
```py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.core.database import get_db
from app.models import User, Tenant, Bot, ChatLog
from app.api.admin.deps import verify_admin
from collections import defaultdict

router = APIRouter(prefix="/analytics")

@router.get("")
def get_analytics(db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    total_tenants  = db.query(Tenant).count()
    total_users    = db.query(User).count()
    total_bots     = db.query(Bot).count()
    total_messages = db.query(ChatLog).count()
    avg_msgs = round(total_messages / total_tenants, 1) if total_tenants else 0

    top_tenants_q = (
        db.query(ChatLog.tenant_id, func.count(ChatLog.id).label("msg_count"))
        .group_by(ChatLog.tenant_id).order_by(desc("msg_count")).limit(5).all()
    )
    top_tenants = []
    for tenant_id, msg_count in top_tenants_q:
        t = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        top_tenants.append({"tenant_name": t.name if t else "—", "messages": msg_count})

    recent_logs = db.query(ChatLog).order_by(desc(ChatLog.created_at)).limit(200).all()
    daily: dict = defaultdict(int)
    for log in recent_logs:
        day = log.created_at.strftime("%Y-%m-%d") if log.created_at else "unknown"
        daily[day] += 1
    daily_trend = [{"date": k, "messages": v} for k, v in sorted(daily.items(), reverse=True)][:14]

    return {
        "totals": {"tenants": total_tenants, "users": total_users, "bots": total_bots, "messages": total_messages},
        "avg_messages_per_tenant": avg_msgs,
        "top_tenants": top_tenants,
        "daily_trend": daily_trend,
    }

```

### File: Backend\app\api\admin\bots.py
```py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models import Bot, Tenant, ChatLog
from app.api.admin.deps import verify_admin

router = APIRouter(prefix="/bots")

@router.get("")
def list_bots(db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    bots = db.query(Bot).order_by(desc(Bot.created_at)).all()
    result = []
    for b in bots:
        tenant = db.query(Tenant).filter(Tenant.id == b.tenant_id).first()
        msgs   = db.query(ChatLog).filter(ChatLog.bot_id == b.id).count()
        result.append({
            "id": b.id, "name": b.name,
            "tenant_id": b.tenant_id, "tenant_name": tenant.name if tenant else "—",
            "theme_color": b.theme_color, "temperature": b.temperature,
            "widget_key": b.widget_key, "messages": msgs,
            "created_at": b.created_at.isoformat() if b.created_at else None,
        })
    return result

```

### File: Backend\app\api\admin\conversations.py
```py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.core.database import get_db
from app.models import ChatLog, Tenant
from app.api.admin.deps import verify_admin

router = APIRouter(prefix="/conversations")

@router.get("")
def list_conversations(limit: int = 50, db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    rows = db.query(ChatLog).order_by(desc(ChatLog.created_at)).limit(limit).all()
    result = []
    for r in rows:
        tenant = db.query(Tenant).filter(Tenant.id == r.tenant_id).first()
        result.append({
            "id": r.id, "tenant_id": r.tenant_id,
            "tenant_name": tenant.name if tenant else "—",
            "bot_id": r.bot_id, "source_count": r.source_count,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    return result

@router.get("/summary")
def conversations_summary(db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    rows = (
        db.query(ChatLog.tenant_id, func.count(ChatLog.id).label("count"))
        .group_by(ChatLog.tenant_id)
        .order_by(desc("count"))
        .all()
    )
    result = []
    for tenant_id, count in rows:
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        result.append({"tenant_id": tenant_id, "tenant_name": tenant.name if tenant else "—", "messages": count})
    return result

```

### File: Backend\app\api\admin\dashboard.py
```py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User, Tenant, Bot, ChatLog
from app.api.admin.deps import verify_admin
import os, json

router = APIRouter()

def _count_docs(status_filter=None):
    try:
        from app.api.documents import STATUS_DIR
        count = 0
        if os.path.exists(STATUS_DIR):
            for f in os.listdir(STATUS_DIR):
                if f.endswith(".json"):
                    try:
                        data = json.load(open(os.path.join(STATUS_DIR, f)))
                        if status_filter is None or data.get("status") == status_filter:
                            count += 1
                    except Exception:
                        pass
        return count
    except Exception:
        return 0

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    total_tenants  = db.query(Tenant).count()
    active_tenants = db.query(Tenant).filter(Tenant.is_active == True).count()
    total_users    = db.query(User).count()
    total_bots     = db.query(Bot).count()
    total_messages = db.query(ChatLog).count()
    total_docs     = _count_docs()
    failed_docs    = _count_docs("failed")

    recent = db.query(ChatLog).order_by(ChatLog.created_at.desc()).limit(5).all()
    recent_activity = [
        {"tenant_id": r.tenant_id, "question": r.question[:80], "ts": r.created_at.isoformat()}
        for r in recent
    ]
    return {
        "total_tenants":  total_tenants, "active_tenants": active_tenants,
        "total_users":    total_users,    "total_bots":     total_bots,
        "total_messages": total_messages, "total_documents": total_docs,
        "failed_documents": failed_docs,  "recent_activity": recent_activity,
    }

```

### File: Backend\app\api\admin\deps.py
```py
from fastapi import Depends, HTTPException
from app.auth_utils import get_current_user

def verify_admin(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_superadmin"):
        raise HTTPException(status_code=403, detail="Forbidden: Super-admin access required.")
    return current_user

```

### File: Backend\app\api\admin\documents.py
```py
from fastapi import APIRouter, Depends
from datetime import datetime
from app.api.admin.deps import verify_admin
import os, json

router = APIRouter(prefix="/documents")

@router.get("")
def list_documents(_: dict = Depends(verify_admin)):
    docs = []
    try:
        from app.api.documents import STATUS_DIR
        if os.path.exists(STATUS_DIR):
            for fname in os.listdir(STATUS_DIR):
                if fname.endswith(".json"):
                    try:
                        with open(os.path.join(STATUS_DIR, fname)) as f:
                            d = json.load(f)
                        docs.append({
                            "doc_id":    d.get("doc_id"),
                            "filename":  d.get("filename"),
                            "tenant_id": d.get("tenant_id"),
                            "status":    d.get("status"),
                            "error":     d.get("error"),
                            "updated_at": datetime.fromtimestamp(d.get("updated_at", 0)).isoformat(),
                        })
                    except Exception:
                        pass
    except Exception:
        pass
    docs.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
    return docs

```

### File: Backend\app\api\admin\system.py
```py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.api.admin.deps import verify_admin
import os, requests as req

router = APIRouter(prefix="/system")

@router.get("/health")
def system_health(db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    health = []
    try:
        db.execute(text("SELECT 1"))
        health.append({"service": "PostgreSQL", "status": "Connected", "ok": True})
    except Exception as e:
        health.append({"service": "PostgreSQL", "status": f"Error: {e}", "ok": False})

    health.append({"service": "Backend API", "status": "Healthy", "ok": True})

    try:
        from app.services.vector_store import _client as chroma_client
        chroma_client.heartbeat()
        health.append({"service": "ChromaDB", "status": "Connected", "ok": True})
    except Exception as e:
        health.append({"service": "ChromaDB", "status": f"Error: {e}", "ok": False})

    try:
        OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        r = req.get(f"{OLLAMA_URL}/api/tags", timeout=3)
        health.append({"service": "Ollama", "status": "Running" if r.status_code == 200 else f"HTTP {r.status_code}", "ok": r.status_code == 200})
    except Exception:
        health.append({"service": "Ollama", "status": "Unreachable", "ok": False})

    return health

@router.get("/settings")
def get_settings(_: dict = Depends(verify_admin)):
    return {
        "platform_name": os.getenv("PLATFORM_NAME", "GyaanChat"),
        "environment": os.getenv("APP_ENV", "development"),
        "jwt_expire_minutes": os.getenv("JWT_EXPIRE_MINUTES", "10080"),
        "allowed_origins": os.getenv("ALLOWED_ORIGINS", ""),
    }

```

### File: Backend\app\api\admin\tenants.py
```py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models import User, Tenant, Bot, ChatLog, ChatHistory
from app.api.admin.deps import verify_admin

router = APIRouter(prefix="/tenants")

@router.get("")
def list_tenants(db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    tenants = db.query(Tenant).order_by(desc(Tenant.created_at)).all()
    result = []
    for t in tenants:
        owner = db.query(User).filter(User.tenant_id == t.id).order_by(User.created_at).first()
        bots   = db.query(Bot).filter(Bot.tenant_id == t.id).count()
        msgs   = db.query(ChatLog).filter(ChatLog.tenant_id == t.id).count()
        users  = db.query(User).filter(User.tenant_id == t.id).count()
        result.append({
            "id": t.id, "name": t.name,
            "owner_email": owner.email if owner else "—",
            "owner_name":  owner.name  if owner else "—",
            "is_active":   t.is_active,
            "bots": bots, "messages": msgs, "users": users,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        })
    return result

@router.patch("/{tenant_id}/status")
def toggle_tenant(tenant_id: str, db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    t = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not t: raise HTTPException(404, "Tenant not found")
    t.is_active = not t.is_active
    db.commit()
    return {"id": t.id, "is_active": t.is_active}

@router.delete("/{tenant_id}")
def delete_tenant(tenant_id: str, db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    t = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not t: raise HTTPException(404, "Tenant not found")
    db.query(ChatHistory).filter(ChatHistory.tenant_id == tenant_id).delete()
    db.query(ChatLog).filter(ChatLog.tenant_id == tenant_id).delete()
    db.query(Bot).filter(Bot.tenant_id == tenant_id).delete()
    db.query(User).filter(User.tenant_id == tenant_id).delete()
    db.delete(t)
    db.commit()
    return {"detail": "Tenant deleted"}

```

### File: Backend\app\api\admin\users.py
```py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models import User, Tenant, ChatLog
from app.api.admin.deps import verify_admin

router = APIRouter(prefix="/users")

@router.get("")
def list_users(db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    users = db.query(User).order_by(desc(User.created_at)).all()
    result = []
    for u in users:
        tenant = db.query(Tenant).filter(Tenant.id == u.tenant_id).first()
        msgs   = db.query(ChatLog).filter(ChatLog.tenant_id == u.tenant_id).count()
        result.append({
            "id": u.id, "name": u.name, "email": u.email,
            "is_superadmin": u.is_superadmin,
            "tenant_id": u.tenant_id,
            "tenant_name": tenant.name if tenant else "—",
            "tenant_active": tenant.is_active if tenant else False,
            "messages": msgs,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        })
    return result

@router.patch("/{user_id}/role")
def toggle_user_role(user_id: str, db: Session = Depends(get_db), current_admin: dict = Depends(verify_admin)):
    if user_id == current_admin.get("sub"):
        raise HTTPException(400, "Cannot change your own role.")
    
    u = db.query(User).filter(User.id == user_id).first()
    if not u: raise HTTPException(404, "User not found")
    
    u.is_superadmin = not u.is_superadmin
    db.commit()
    return {"id": u.id, "is_superadmin": u.is_superadmin}

@router.delete("/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db), current_admin: dict = Depends(verify_admin)):
    if user_id == current_admin.get("sub"):
        raise HTTPException(400, "Cannot delete yourself.")
        
    u = db.query(User).filter(User.id == user_id).first()
    if not u: raise HTTPException(404, "User not found")
    db.delete(u)
    db.commit()
    return {"detail": "User deleted"}

```

### File: Backend\app\api\admin\__init__.py
```py
from fastapi import APIRouter
from . import dashboard, tenants, users, bots, documents, conversations, analytics, system

router = APIRouter(prefix="/admin", tags=["admin"])
router.include_router(dashboard.router)
router.include_router(tenants.router)
router.include_router(users.router)
router.include_router(bots.router)
router.include_router(documents.router)
router.include_router(conversations.router)
router.include_router(analytics.router)
router.include_router(system.router)

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
    
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

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
from sqlalchemy import String, DateTime, ForeignKey, Boolean
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
    is_superadmin: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Email verification fields
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verification_code: Mapped[str] = mapped_column(String, nullable=True)

    # Password Reset fields
    reset_code: Mapped[str] = mapped_column(String, nullable=True)
    reset_code_expires: Mapped[datetime] = mapped_column(DateTime, nullable=True)

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

    token = create_access_token({"sub": user.id, "tenant_id": user.tenant_id, "is_superadmin": user.is_superadmin})
    return {
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email, "is_superadmin": user.is_superadmin},
        "tenant": {"id": user.tenant_id, "name": tenant.name if tenant else ""},
        "bot": {"id": bot.id if bot else None, "name": bot.name if bot else None, "widget_key": bot.widget_key if bot else None},
    }

```

### File: Backend\app\services\chunker.py
```py
def chunk_text(text: str, chunk_size=1000, overlap=150):
    """
    Hybrid Paragraph + Size Chunker.
    Splits by paragraphs (double-newlines) first, then ensures chunks 
    don't exceed chunk_size while maintaining semantic cohesion.
    """
    # 1. Split into coarse paragraphs
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = ""

    for p in paragraphs:
        p = p.strip()
        if not p:
            continue

        # If adding this paragraph exceeds limit...
        if len(current_chunk) + len(p) > chunk_size:
            # Save existing chunk if it's not empty
            if current_chunk:
                chunks.append(current_chunk.strip())
            
            # Start new chunk with overlap from previous if possible
            overlap_text = current_chunk[-overlap:] if len(current_chunk) > overlap else ""
            current_chunk = overlap_text + "\n\n" + p if overlap_text else p
            
            # If a SINGLE paragraph is strictly too large, we must force-split it
            while len(current_chunk) > chunk_size:
                chunks.append(current_chunk[:chunk_size].strip())
                current_chunk = current_chunk[chunk_size - overlap:]
        else:
            # Append paragraph to current chunk
            if current_chunk:
                current_chunk += "\n\n" + p
            else:
                current_chunk = p

    # Append the last chunk
    if current_chunk:
        chunks.append(current_chunk.strip())

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
        print(f"\n[DEBUG] --- Starting processing for doc_id: {doc_id} ---")
        print(f"[DEBUG] File saved at: {file_path}")
        update_status(doc_id, "processing", tenant_id, filename)
        
        text = extract_text_from_pdf(file_path)
        if not text:
            raise ValueError("Extraction returned empty text. File might be scanned/image-only or corrupted.")
        print(f"[DEBUG] Extracted text length: {len(text)} chars")

        chunks = chunk_text(text)
        print(f"[DEBUG] Number of chunks created: {len(chunks)}")
        
        embeddings = embed_texts(chunks)
        print(f"[DEBUG] Number of embeddings created: {len(embeddings)}")

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
        print(f"[DEBUG] Successfully stored {len(chunks)} chunks in ChromaDB")
        print(f"[DEBUG] --- Finished processing doc_id: {doc_id} ---\n")
        
        update_status(doc_id, "ready", tenant_id, filename)
    except Exception as e:
        print(f"[ERROR] Failed to process doc_id {doc_id}: {e}")
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
import torch

_model = None

def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        # Check for CUDA (GPU) or fallback to CPU
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading SentenceTransformer model ('BAAI/bge-small-en') on {device}...")
        _model = SentenceTransformer("BAAI/bge-small-en", device=device)
    return _model

def embed_texts(texts: list[str]):
    model = get_model()
    return model.encode(texts, convert_to_numpy=True).tolist()


```

### File: Backend\app\services\llm.py
```py
import requests
import os
import json
from fastapi import HTTPException

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_URL = f"{OLLAMA_BASE_URL}/api/generate"
MODEL = os.getenv("OLLAMA_MODEL", "mistral")


def generate_answer(prompt: str) -> str:
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False,
                "keep_alive": -1,
                "options": {
                    "temperature": 0.2
                }
            },
            timeout=300
        )
        response.raise_for_status()
        return response.json()["response"].strip()
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to connect to Ollama. Is the model '{MODEL}' available? Error: {str(e)}"
        )

def generate_answer_stream(prompt: str):
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": True,
                "keep_alive": -1,
                "options": {
                    "temperature": 0.2
                }
            },
            stream=True,
            timeout=300
        )
        response.raise_for_status()
        
        for line in response.iter_lines():
            if line:
                decoded = line.decode('utf-8')
                resp_json = json.loads(decoded)
                if "response" in resp_json:
                    yield resp_json["response"]
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to connect to Ollama. Is the model '{MODEL}' available? Error: {str(e)}"
        )


```

### File: Backend\app\services\pdf_loader.py
```py
from PyPDF2 import PdfReader

def extract_text_from_pdf(file_path: str) -> str:
    try:
        reader = PdfReader(file_path)
        text = ""

        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                page_text = page_text.replace("■", "₹")
                text += page_text + "\n"

        extracted_text = text.strip()
        print(f"[DEBUG] PDF Extracted {len(extracted_text)} chars from {file_path}")
        return extracted_text
    except Exception as e:
        print(f"[ERROR] PDF Extraction failed for {file_path}: {e}")
        return ""


```

### File: Backend\app\services\rag.py
```py
def build_prompt(context_chunks: list[str], question: str, history_str: str = "") -> str:
    # Limit context to 3000 chars to keep token usage manageable and responses fast
    context = ""
    for chunk in context_chunks:
        chunk = chunk.replace("■", "₹")
        if len(context) + len(chunk) > 3000:
            break
        context += chunk + "\n\n"

    context = context.strip()

    return f"""You are an exceptional, friendly, and professional Customer Care Support Chatbot representing the company.
Your primary goal is to assist the customer rapidly and accurately, relying entirely on your internal knowledge base.

STRICT BEHAVIOR GUIDELINES:
1. CUSTOMER SUPPORT TONE: Speak directly to the user as a helpful support agent. Always be polite, warm, and professional.
2. DO NOT MENTION DOCUMENTATION: NEVER use phrases like "according to the document", "based on the information provided", "the uploaded file mentions", or "the text states". Treat the knowledge provided as your own internal memory.
3. CONVERSATIONAL YET CONCISE: Write naturally and conversationally, using short paragraphs for normal responses. However, if you are listing structured data (such as contact branches, features, or step-by-step instructions), you MUST use a clean bulleted list.
   Example of structured data:
   - **Phone:** 123-456-7890
   - **Email:** care@company.com
4. HIGHLIGHTING: Highlight key terms, phone numbers, emails, and important entity names with **bold text**.
5. OFF-TOPIC STRICT REFUSAL: Do not guess or draw on outside knowledge. If the customer asks about topics completely unrelated to this company or its products (e.g., general baking recipes, celebrities, general facts), STRICTLY REFUSE by saying exactly: "I'm sorry, but I can only answer questions related to our company's products and services."
6. MISSING INFO: If the query is related to the company but the answer cannot be confidently found in your internal knowledge base, say: "I'm sorry, I don't have the exact answer to that right now. Please reach out to our human support team."
7. NO SIGNATURES: Do not include ANY sign-offs, signatures, or placeholders like "[Your Name]" or "[Your Friendly Support Agent]". End the response naturally.
8. NO REPETITIVE GREETINGS: Do not start your response with greetings (like "Hello", "Hi there", or "I'm delighted to help") unless the user explicitly greets you first. Jump straight into answering their question naturally.
9. STRICT GROUNDING: You MUST rely entirely on the literal text in the Hidden Internal Knowledge Base. Do NOT invent policies or assume personal details like the user's location. Do NOT mix or confuse numbers (e.g. shipping prices, return days). If a specific fact is not explicitly stated, you MUST say you don't know.

--- Previous Conversation ---
{history_str}

--- Hidden Internal Knowledge Base ---
{context}

--- Customer Message ---
{question}

IMPORTANT: If the exact answer is NOT written in the Hidden Internal Knowledge Base, you MUST reply with exactly: "I'm sorry, I don't have the exact answer to that right now. Please reach out to our human support team."

--- Your Reply ---""".strip()


def build_smalltalk_prompt(question: str, history_str: str = "") -> str:
    return f"""You are a friendly, helpful, and professional AI assistant for this company.
The customer is making casual conversation. Respond warmly, naturally, and briefly (1-2 sentences).
If appropriate, gently offer to help them with any questions they might have.

--- Previous Conversation ---
{history_str}

Customer: {question}

Assistant:""".strip()

```

### File: Backend\app\services\vector_store.py
```py
import os

_client = None

def get_client():
    global _client
    if _client is None:
        import chromadb
        persist_dir = os.getenv("CHROMA_PERSIST_DIR", "./chroma")
        print(f"Initializing ChromaDB client at: {persist_dir}")
        _client = chromadb.PersistentClient(path=persist_dir)
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

### File: Backend\app\utils\email.py
```py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..core.config import settings

def send_verification_email(to_email: str, code: str):
    """Send an OTP code to the provided email address via SMTP."""
    
    server = settings.SMTP_SERVER
    port = settings.SMTP_PORT
    username = settings.SMTP_USERNAME
    password = settings.SMTP_PASSWORD
    
    # If no credentials, we can just print it (useful for local testing before setup)
    if not username or not password:
        print(f"==================================================")
        print(f"MOCK EMAIL TO: {to_email}")
        print(f"Verification Code: {code}")
        print(f"==================================================")
        return

    subject = "Verify your GyaanChat Account"
    body = f"""
    <html>
      <body>
        <h2>Welcome to GyaanChat!</h2>
        <p>Please enter the following verification code to complete your registration:</p>
        <h1 style="font-size: 32px; letter-spacing: 4px;">{code}</h1>
        <p>If you did not request this, please ignore this email.</p>
      </body>
    </html>
    """

    msg = MIMEMultipart()
    msg['From'] = username
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

    try:
        with smtplib.SMTP(server, port) as smtp:
            smtp.starttls()
            smtp.login(username, password)
            smtp.send_message(msg)
    except Exception as e:
        print(f"Failed to send email: {e}")
        # In a real app we might want to log this or raise an exception

def send_reset_password_email(to_email: str, code: str):
    """Send a password reset code to the provided email address via SMTP."""
    
    server = settings.SMTP_SERVER
    port = settings.SMTP_PORT
    username = settings.SMTP_USERNAME
    password = settings.SMTP_PASSWORD
    
    # If no credentials, just print it (useful for local testing before setup)
    if not username or not password:
        print(f"==================================================")
        print(f"MOCK PASSWORD RESET TO: {to_email}")
        print(f"Reset Code: {code}")
        print(f"==================================================")
        return

    subject = "Reset Your GyaanChat Password"
    body = f"""
    <html>
      <body>
        <h2>Password Reset Request</h2>
        <p>You requested to reset your GyaanChat password. Enter this code to proceed:</p>
        <h1 style="font-size: 32px; letter-spacing: 4px;">{code}</h1>
        <p>This code will expire securely in 15 minutes.</p>
        <p>If you did not request a password reset, please safely ignore this email.</p>
      </body>
    </html>
    """

    msg = MIMEMultipart()
    msg['From'] = username
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

    try:
        with smtplib.SMTP(server, port) as smtp:
            smtp.starttls()
            smtp.login(username, password)
            smtp.send_message(msg)
    except Exception as e:
        print(f"Failed to send reset email: {e}")

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

### File: Frontend\gyaanchat-frontend\index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/gyaanchatlogo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GyaanChat</title>
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
    "lucide-react": "^0.577.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-markdown": "^10.1.0",
    "react-router-dom": "^7.13.0",
    "rehype-slug": "^6.0.0",
    "remark-gfm": "^4.0.1"
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
import AdminRoute from "./components/AdminRoute";
import AppLayout from "./components/layout/AppLayout";
import AdminLayout from "./components/layout/AdminLayout";

import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import DocsPage from "./pages/public/DocsPage";

import DashboardPage from "./pages/app/AnalyticsPage";
import DocumentsPage from "./pages/app/DocumentsPage";
import TestChatPage from "./pages/app/TestChatPage";
import AnalyticsPage from "./pages/app/AnalyticsChartPage";
import ConversationsPage from "./pages/app/ConversationsPage";
import InstallPage from "./pages/app/InstallPage";
import SettingsPage from "./pages/app/SettingsPage";
import ProfilePage from "./pages/app/ProfilePage";
import BotSettingsPage from "./pages/app/BotSettingsPage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminTenantsPage from "./pages/admin/AdminTenantsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminBotsPage from "./pages/admin/AdminBotsPage";
import AdminDocumentsPage from "./pages/admin/AdminDocumentsPage";
import AdminSystemPage from "./pages/admin/AdminSystemPage";

export default function App() {
  const { token, user } = useAuth();
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={token ? <Navigate to={user?.is_superadmin ? "/admin/dashboard" : "/app"} replace /> : <LoginPage />} />
      <Route path="/register" element={token ? <Navigate to="/app" replace /> : <RegisterPage />} />
      <Route path="/docs" element={<Navigate to="/docs/getting-started" replace />} />
      <Route path="/docs/:slug" element={<DocsPage />} />

      {/* Protected Tenant App */}
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="documents"     element={<DocumentsPage />} />
        <Route path="test-chat"     element={<TestChatPage />} />
        <Route path="analytics"     element={<AnalyticsPage />} />
        <Route path="conversations" element={<ConversationsPage />} />
        <Route path="install"       element={<InstallPage />} />
        <Route path="settings"      element={<SettingsPage />} />
        <Route path="bot-settings"  element={<BotSettingsPage />} />
        <Route path="profile"       element={<ProfilePage />} />
      </Route>

      {/* Super Admin Panel */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<AdminDashboardPage />} />
          <Route path="tenants"       element={<AdminTenantsPage />} />
          <Route path="users"         element={<AdminUsersPage />} />
          <Route path="bots"          element={<AdminBotsPage />} />
          <Route path="documents"     element={<AdminDocumentsPage />} />
          <Route path="system"        element={<AdminSystemPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

```

### File: Frontend\gyaanchat-frontend\src\docs.d.ts
```ts
declare module '*.md?raw' {
  const content: string;
  export default content;
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
  let answer = "";
  let sources: any[] = [];
  
  // Consume the stream silently to emulate the old synchronous behavior
  // while allowing the backend to keep the connection alive via SSE
  for await (const chunk of streamChatTenant(tenantId, userText, options)) {
    if (chunk.type === "sources") {
      sources = chunk.sources;
    } else if (chunk.type === "content") {
      answer += chunk.content;
    }
  }
  
  return { answer, sources, used_sources: sources.length > 0 };
}

export async function* streamChatTenant(tenantId: string, userText: string, options?: { temperature?: number }) {
  const payload = { tenant_id: tenantId, question: userText, ...options };
  // Use native fetch to be able to read the stream easily
  const baseURL = api.defaults.baseURL || import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
  
  const token = localStorage.getItem("gc_token");
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${baseURL}/chat/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Chat request failed: ${errText}`);
  }

  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    // Split the chunk by double newlines since it's SSE format
    const events = chunk.split("\n\n");
    for (const event of events) {
      if (event.startsWith("data: ")) {
        const jsonStr = event.substring(6).trim();
        if (!jsonStr) continue;
        try {
          const data = JSON.parse(jsonStr);
          yield data;
        } catch (e) {
          console.error("Failed to parse SSE JSON:", e, "String was:", jsonStr);
        }
      }
    }
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

### File: Frontend\gyaanchat-frontend\src\components\AdminRoute.tsx
```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
    const { token, user } = useAuth();
    if (!token) return <Navigate to="/login" replace />;
    if (!user?.is_superadmin) return <Navigate to="/app" replace />;
    return <Outlet />;
}

```

### File: Frontend\gyaanchat-frontend\src\components\ProtectedRoute.tsx
```tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/" replace />;
  return children;
}


```

### File: Frontend\gyaanchat-frontend\src\components\docs\DocsMarkdown.tsx
```tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { Lightbulb, Info, AlertTriangle, AlertOctagon } from 'lucide-react';
import type { ReactNode } from 'react';

interface DocsMarkdownProps {
  content: string;
}

// Custom blockquote to handle [!TIP], [!NOTE], [!WARNING], [!CAUTION]
function CalloutBlock({ children }: { children: ReactNode }) {
  const text = extractText(children);
  const firstLine = text.trimStart();

  if (firstLine.startsWith('[!TIP]')) {
    return (
      <div className="docs-callout docs-callout-tip">
        <div className="docs-callout-header">
          <Lightbulb size={15} />
          <span>Tip</span>
        </div>
        <div className="docs-callout-body">{stripCalloutTag(children, '[!TIP]')}</div>
      </div>
    );
  }
  if (firstLine.startsWith('[!NOTE]')) {
    return (
      <div className="docs-callout docs-callout-note">
        <div className="docs-callout-header">
          <Info size={15} />
          <span>Note</span>
        </div>
        <div className="docs-callout-body">{stripCalloutTag(children, '[!NOTE]')}</div>
      </div>
    );
  }
  if (firstLine.startsWith('[!WARNING]')) {
    return (
      <div className="docs-callout docs-callout-warning">
        <div className="docs-callout-header">
          <AlertTriangle size={15} />
          <span>Warning</span>
        </div>
        <div className="docs-callout-body">{stripCalloutTag(children, '[!WARNING]')}</div>
      </div>
    );
  }
  if (firstLine.startsWith('[!CAUTION]')) {
    return (
      <div className="docs-callout docs-callout-caution">
        <div className="docs-callout-header">
          <AlertOctagon size={15} />
          <span>Caution</span>
        </div>
        <div className="docs-callout-body">{stripCalloutTag(children, '[!CAUTION]')}</div>
      </div>
    );
  }
  return <blockquote className="docs-blockquote">{children}</blockquote>;
}

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in (node as object)) {
    return extractText((node as { props: { children: ReactNode } }).props.children);
  }
  return '';
}

function stripCalloutTag(children: ReactNode, tag: string): ReactNode {
  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (i === 0 && typeof child === 'object' && child !== null && 'props' in child) {
        const p = child as { type: string; props: { children: ReactNode } };
        if (p.type === 'p') {
          const text = extractText(p.props.children);
          const cleaned = text.replace(tag, '').trim();
          return <p key={i}>{cleaned}</p>;
        }
      }
      return child;
    });
  }
  return children;
}

export default function DocsMarkdown({ content }: DocsMarkdownProps) {
  return (
    <div className="docs-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          blockquote: ({ children }) => <CalloutBlock>{children}</CalloutBlock>,
          img: ({ node: _node, ...props }) => (
            props.src === 'placeholder' ? (
              <div className="docs-image-placeholder">
                [ Screenshot: {props.alt} ]
              </div>
            ) : (
              <img {...props} loading="lazy" className="docs-img" />
            )
          ),
          a: ({ node: _node, ...props }) => {
            const isExternal = props.href?.startsWith('http');
            return (
              <a
                {...props}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
              />
            );
          },
          table: ({ node: _node, ...props }) => (
            <div className="docs-table-wrap">
              <table {...props} />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

```

### File: Frontend\gyaanchat-frontend\src\components\docs\DocsSidebar.tsx
```tsx
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { docsConfig } from '../../features/docs/docs-config';
import { ArrowLeft } from 'lucide-react';
import myLogo from '../../assets/gyaanchatlogo.png';

interface DocsSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function DocsSidebar({ isOpen, setIsOpen }: DocsSidebarProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile overlay — reuses the exact same class as the main sidebar */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand — identical to main Sidebar.tsx */}
        <Link to="/" className="sidebar-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src={myLogo} alt="GyaanChat Logo" className="sidebar-logo" />
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">GyaanChat</span>
            <span className="sidebar-brand-sub">Documentation</span>
          </div>
        </Link>

        {/* Back to app */}
        <nav className="sidebar-nav">
          <button
            className="nav-item"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 8 }}
            onClick={() => { navigate(-1); setIsOpen(false); }}
          >
            <ArrowLeft size={18} strokeWidth={2} style={{ flexShrink: 0, opacity: 0.7 }} />
            Back
          </button>

          {docsConfig.map((category, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <div className="nav-section-label">{category.title}</div>
              {category.items.map((item) => {
                const Icon = item.Icon;
                return (
                  <NavLink
                    key={item.slug}
                    to={`/docs/${item.slug}`}
                    end
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon size={18} strokeWidth={2} />
                    {item.title}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

```

### File: Frontend\gyaanchat-frontend\src\components\docs\DocsTOC.tsx
```tsx
import { useEffect, useRef, useState } from 'react';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface DocsTOCProps {
  content: string;
}

export default function DocsTOC({ content }: DocsTOCProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const regex = /^(##|###)\s+(.+)$/gm;
    let match;
    const items: TOCItem[] = [];

    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      const id = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');
      items.push({ id, title, level });
    }

    setHeadings(items);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-60px 0px -70% 0px', threshold: 0 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="docs-toc">
      <div className="docs-toc-title">On this page</div>
      <ul className="docs-toc-list">
        {headings.map((h) => (
          <li
            key={h.id}
            className={`docs-toc-item ${activeId === h.id ? 'active' : ''}`}
            style={{ paddingLeft: (h.level - 2) * 14 }}
          >
            <a
              href={`#${h.id}`}
              className={`docs-toc-link ${activeId === h.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActiveId(h.id);
              }}
            >
              {h.title}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

```

### File: Frontend\gyaanchat-frontend\src\components\layout\AdminLayout.tsx
```tsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bot, Building2, FileText, LayoutDashboard, Settings, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { to: "/admin/dashboard",      icon: LayoutDashboard, label: "Dashboard"     },
  { to: "/admin/tenants",        icon: Building2,       label: "Tenants"       },
  { to: "/admin/users",          icon: Users,           label: "Users"         },
  { to: "/admin/bots",           icon: Bot,             label: "Bots"          },
  { to: "/admin/documents",      icon: FileText,        label: "Documents"     },
  { to: "/admin/system",         icon: Settings,        label: "System"        },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() { logout(); navigate("/", { replace: true }); }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg, #0f1117)" }}>
      <aside style={{
        width: 220, flexShrink: 0,
        background: "var(--color-bg-card, #1a1d27)",
        borderRight: "1px solid var(--color-border, #2a2d3a)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--color-border, #2a2d3a)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1rem", flexShrink: 0 }}>G</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>GyaanChat</div>
            <div style={{ fontSize: "0.65rem", background: "#7c3aed20", color: "#a855f7", padding: "1px 6px", borderRadius: 4, display: "inline-block", marginTop: 2 }}>Super Admin</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 12px", borderRadius: 8, fontSize: "0.85rem", fontWeight: 500,
              textDecoration: "none",
              color: isActive ? "#a855f7" : "var(--color-text, #e2e8f0)",
              background: isActive ? "#7c3aed18" : "transparent",
              transition: "all 0.15s",
            })}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <n.icon size={16} strokeWidth={2.1} />
              </span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--color-border, #2a2d3a)" }}>
          <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted, #94a3b8)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
          <button onClick={handleLogout} style={{ width: "100%", background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 6, padding: "5px 10px", fontSize: "0.78rem", cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>
        <Outlet />
      </main>
    </div>
  );
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

### File: Frontend\gyaanchat-frontend\src\components\layout\DocsLayout.tsx
```tsx
import React, { useState, useEffect } from 'react';
import DocsSidebar from '../docs/DocsSidebar';
import { useLocation } from 'react-router-dom';
import '../../styles/docs.css';

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <DocsSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="app-main">
        {/* Topbar — matches main app exactly */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-btn hamburger"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className="topbar-title">Documentation</span>
          </div>
          <div className="topbar-right" />
        </header>

        <div className="app-content">
          <div className="docs-content-container">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

```

### File: Frontend\gyaanchat-frontend\src\components\layout\Sidebar.tsx
```tsx
import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Bot,
  MessageSquare,
  BarChart3,
  MessagesSquare,
  Code2,
  Settings,
  User,
  LogOut,
  ChevronUp,
} from "lucide-react";
import myLogo from "../../assets/gyaanchatlogo.png";

interface NavItemDef {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItemDef[] = [
  {
    to: "/app",
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    to: "/app/documents",
    label: "Knowledge Base",
    icon: <FileText size={20} />,
  },
  {
    to: "/app/bot-settings",
    label: "Bot Settings",
    icon: <Bot size={20} />,
  },
  {
    to: "/app/test-chat",
    label: "Chat Preview",
    icon: <MessageSquare size={20} />,
  },
  {
    to: "/app/analytics",
    label: "Analytics",
    icon: <BarChart3 size={20} />,
  },
  {
    to: "/app/conversations",
    label: "Conversations",
    icon: <MessagesSquare size={20} />,
  },
  {
    to: "/app/install",
    label: "Deployment",
    icon: <Code2 size={20} />,
  },
  {
    to: "/app/settings",
    label: "Settings",
    icon: <Settings size={20} />,
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
    navigate("/", { replace: true });
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
        <Link to="/" className="sidebar-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src={myLogo} alt="GyaanChat Logo" className="sidebar-logo" />
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">GyaanChat</span>
            <span className="sidebar-brand-sub">AI Platform</span>
          </div>
        </Link>

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
                onClick={() => {
                  setPopoverOpen(false);
                  navigate("/app/profile");
                  onClose();
                }}
              >
                <User size={14} />
                Profile
              </button>
              <button className="popover-item danger" onClick={handleLogout}>
                <LogOut size={14} />
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
            <ChevronUp size={12} style={{ opacity: 0.4, flexShrink: 0 }} />
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
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || "Dashboard";

  return (
    <header className="topbar">
      <div className="topbar-left">
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
    is_superadmin?: boolean;
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
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
    theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() =>
        window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    );

    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");

        function apply(dark: boolean) {
            const t: Theme = dark ? "dark" : "light";
            setTheme(t);
            document.documentElement.classList.toggle("dark", dark);
        }

        // Apply on mount
        apply(mq.matches);

        // Follow system changes
        const handler = (e: MediaQueryListEvent) => apply(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme }}>
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

### File: Frontend\gyaanchat-frontend\src\features\docs\contentProvider.ts
```ts
import gettingStarted from './content/getting-started.md?raw';
import uploadingDocuments from './content/uploading-documents.md?raw';
import customizingYourBot from './content/customizing-your-bot.md?raw';
import testingYourBot from './content/testing-your-bot.md?raw';
import embeddingOnWebsite from './content/embedding-on-website.md?raw';
import analyticsConversations from './content/analytics-conversations.md?raw';

const contentMap: Record<string, string> = {
  'getting-started': gettingStarted,
  'uploading-documents': uploadingDocuments,
  'customizing-your-bot': customizingYourBot,
  'testing-your-bot': testingYourBot,
  'embedding-on-website': embeddingOnWebsite,
  'analytics-conversations': analyticsConversations,
};

export const getContentForSlug = (slug: string): string => {
  return contentMap[slug] || '';
};

```

### File: Frontend\gyaanchat-frontend\src\features\docs\docs-config.ts
```ts
import type { LucideIcon } from 'lucide-react';
import {
  Rocket,
  FileText,
  Paintbrush,
  MessageSquare,
  Globe,
  BarChart2,
} from 'lucide-react';

export interface DocItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  Icon: LucideIcon;
  readTime: string;
}

export interface DocCategory {
  title: string;
  items: DocItem[];
}

export const docsConfig: DocCategory[] = [
  {
    title: 'Getting Started',
    items: [
      {
        id: 'getting-started',
        title: 'Getting Started',
        slug: 'getting-started',
        description: 'A quick overview of GyaanChat and how to get your account ready.',
        Icon: Rocket,
        readTime: '3 min read',
      },
    ],
  },
  {
    title: 'User Guides',
    items: [
      {
        id: 'uploading-documents',
        title: 'Uploading Documents',
        slug: 'uploading-documents',
        description: "Learn how to upload files and build your bot's knowledge base.",
        Icon: FileText,
        readTime: '4 min read',
      },
      {
        id: 'customizing-your-bot',
        title: 'Customizing Your Bot',
        slug: 'customizing-your-bot',
        description: "Change your bot's name, personality, colors, and logo.",
        Icon: Paintbrush,
        readTime: '5 min read',
      },
      {
        id: 'testing-your-bot',
        title: 'Testing Your Bot',
        slug: 'testing-your-bot',
        description: 'Preview and test your bot before sharing it with the world.',
        Icon: MessageSquare,
        readTime: '3 min read',
      },
      {
        id: 'embedding-on-website',
        title: 'Embedding on Your Website',
        slug: 'embedding-on-website',
        description: 'Add the GyaanChat widget to any website in minutes.',
        Icon: Globe,
        readTime: '5 min read',
      },
      {
        id: 'analytics-conversations',
        title: 'Analytics & Conversations',
        slug: 'analytics-conversations',
        description: 'Track usage, view chat history, and understand your users.',
        Icon: BarChart2,
        readTime: '4 min read',
      },
    ],
  },
];

export const allDocItems: DocItem[] = docsConfig.flatMap((c) => c.items);

export const getDocBySlug = (slug: string): DocItem | undefined =>
  allDocItems.find((item) => item.slug === slug);

export const getAdjacentDocs = (slug: string): { prev: DocItem | null; next: DocItem | null } => {
  const index = allDocItems.findIndex((item) => item.slug === slug);
  return {
    prev: index > 0 ? allDocItems[index - 1] : null,
    next: index < allDocItems.length - 1 ? allDocItems[index + 1] : null,
  };
};

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

### File: Frontend\gyaanchat-frontend\src\pages\admin\AdminAnalyticsPage.tsx
```tsx
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

interface Analytics { totals: { tenants: number; users: number; bots: number; messages: number }; avg_messages_per_tenant: number; top_tenants: { tenant_name: string; messages: number }[]; daily_trend: { date: string; messages: number }[]; }

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    api.get("/admin/analytics", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Platform Analytics</h1>
        <p style={{ color: "var(--color-text-muted,#94a3b8)", marginTop: 4, fontSize: "0.875rem" }}>Insights into platform growth and engagement.</p>
      </div>
      {loading ? <p style={{ color: "var(--color-text-muted,#94a3b8)" }}>Loading…</p> : !data ? <p>Failed to load.</p> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 16, marginBottom: 28 }}>
            {[["Total Tenants", data.totals.tenants], ["Total Users", data.totals.users], ["Total Bots", data.totals.bots], ["Total Messages", data.totals.messages], ["Avg Msgs/Tenant", data.avg_messages_per_tenant]].map(([l, v]) => (
              <div key={l as string} style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, padding: "18px 22px" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted,#94a3b8)" }}>{l}</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: 6 }}>{Number(v).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted,#94a3b8)", marginBottom: 16 }}>Top Active Tenants</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.top_tenants.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#7c3aed20", color: "#a855f7", fontWeight: 700, fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, fontWeight: 600, fontSize: "0.875rem" }}>{t.tenant_name}</div>
                    <div style={{ fontWeight: 700, color: "#7c3aed" }}>{t.messages.toLocaleString()}</div>
                  </div>
                ))}
                {data.top_tenants.length === 0 && <p style={{ color: "var(--color-text-muted,#94a3b8)", fontSize: "0.875rem" }}>No data yet.</p>}
              </div>
            </div>
            <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted,#94a3b8)", marginBottom: 16 }}>Daily Trend (Last 7 Days)</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.daily_trend.slice(0, 7).map((d, i) => {
                  const max = Math.max(...data.daily_trend.map(x => x.messages), 1);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 80, fontSize: "0.72rem", color: "var(--color-text-muted,#94a3b8)", flexShrink: 0 }}>{d.date}</div>
                      <div style={{ flex: 1, height: 8, background: "var(--color-border,#2a2d3a)", borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", width: `${(d.messages / max) * 100}%`, background: "#7c3aed", borderRadius: 4 }} /></div>
                      <div style={{ width: 36, textAlign: "right", fontSize: "0.8rem", fontWeight: 600 }}>{d.messages}</div>
                    </div>
                  );
                })}
                {data.daily_trend.length === 0 && <p style={{ color: "var(--color-text-muted,#94a3b8)", fontSize: "0.875rem" }}>No activity yet.</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

```

### File: Frontend\gyaanchat-frontend\src\pages\admin\AdminBotsPage.tsx
```tsx
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

interface Bot { id: string; name: string; tenant_name: string; theme_color: string; temperature: string; messages: number; created_at: string; }

export default function AdminBotsPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    api.get("/admin/bots", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setBots(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const filtered = bots.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.tenant_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div><h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Bot Management</h1><p style={{ color: "var(--color-text-muted,#94a3b8)", marginTop: 4, fontSize: "0.875rem" }}>All deployed bots across the platform.</p></div>
        <input className="input" placeholder="Search bots…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 240, margin: 0 }} />
      </div>
      <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, overflow: "hidden" }}>
        {loading ? <p style={{ padding: 24, color: "var(--color-text-muted,#94a3b8)" }}>Loading…</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead style={{ background: "var(--color-bg,#0f1117)", borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
              <tr>{["Bot Name","Tenant","Theme","Temperature","Messages","Created"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", color: "var(--color-text-muted,#94a3b8)" }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} style={{ borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{b.name}</td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-muted,#94a3b8)" }}>{b.tenant_name}</td>
                  <td style={{ padding: "10px 14px" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 14, height: 14, borderRadius: "50%", background: b.theme_color, border: "2px solid var(--color-border,#2a2d3a)" }} /><span style={{ fontFamily: "monospace", fontSize: "0.72rem" }}>{b.theme_color}</span></div></td>
                  <td style={{ padding: "10px 14px" }}>{b.temperature}</td>
                  <td style={{ padding: "10px 14px" }}>{b.messages}</td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-muted,#94a3b8)", fontSize: "0.72rem" }}>{b.created_at ? new Date(b.created_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted,#94a3b8)" }}>No bots found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

```

### File: Frontend\gyaanchat-frontend\src\pages\admin\AdminConversationsPage.tsx
```tsx
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

interface ConvRow { id: string; tenant_name: string; bot_id: string; source_count: number; created_at: string; }
interface Summary { tenant_name: string; messages: number; }

export default function AdminConversationsPage() {
  const [rows, setRows] = useState<ConvRow[]>([]);
  const [summary, setSummary] = useState<Summary[]>([]);
  const [tab, setTab] = useState<"summary" | "recent">("summary");
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const hdr = { Authorization: `Bearer ${token}` };
    setLoading(true);
    Promise.all([api.get("/admin/conversations", { headers: hdr }), api.get("/admin/conversations/summary", { headers: hdr })])
      .then(([r1, r2]) => { setRows(r1.data); setSummary(r2.data); }).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Conversations & Usage</h1>
        <p style={{ color: "var(--color-text-muted,#94a3b8)", marginTop: 4, fontSize: "0.875rem" }}>Platform-wide chat activity. Raw message text is hidden to protect tenant privacy.</p>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["summary", "recent"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 16px", borderRadius: 8, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", border: "1px solid var(--color-border,#2a2d3a)", background: tab === t ? "#7c3aed" : "transparent", color: tab === t ? "#fff" : "var(--color-text,#e2e8f0)" }}>{t === "summary" ? "By Tenant" : "Recent Events"}</button>
        ))}
      </div>
      {loading ? <p style={{ color: "var(--color-text-muted,#94a3b8)" }}>Loading…</p> : (
        <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            {tab === "summary" ? (
              <>
                <thead style={{ background: "var(--color-bg,#0f1117)", borderBottom: "1px solid var(--color-border,#2a2d3a)" }}><tr>{["Tenant","Total Messages"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", color: "var(--color-text-muted,#94a3b8)" }}>{h}</th>)}</tr></thead>
                <tbody>{summary.map((s, i) => (<tr key={i} style={{ borderBottom: "1px solid var(--color-border,#2a2d3a)" }}><td style={{ padding: "10px 14px", fontWeight: 600 }}>{s.tenant_name}</td><td style={{ padding: "10px 14px" }}>{s.messages.toLocaleString()}</td></tr>))}{summary.length === 0 && <tr><td colSpan={2} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted,#94a3b8)" }}>No data.</td></tr>}</tbody>
              </>
            ) : (
              <>
                <thead style={{ background: "var(--color-bg,#0f1117)", borderBottom: "1px solid var(--color-border,#2a2d3a)" }}><tr>{["Tenant","Bot","Sources","Time"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", color: "var(--color-text-muted,#94a3b8)" }}>{h}</th>)}</tr></thead>
                <tbody>{rows.map(r => (<tr key={r.id} style={{ borderBottom: "1px solid var(--color-border,#2a2d3a)" }}><td style={{ padding: "10px 14px", fontWeight: 600 }}>{r.tenant_name}</td><td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: "0.72rem", color: "var(--color-text-muted,#94a3b8)" }}>{r.bot_id?.slice(0,8)}…</td><td style={{ padding: "10px 14px" }}>{r.source_count}</td><td style={{ padding: "10px 14px", color: "var(--color-text-muted,#94a3b8)", fontSize: "0.72rem" }}>{r.created_at ? new Date(r.created_at).toLocaleString() : "—"}</td></tr>))}{rows.length === 0 && <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted,#94a3b8)" }}>No events.</td></tr>}</tbody>
              </>
            )}
          </table>
        </div>
      )}
    </div>
  );
}

```

### File: Frontend\gyaanchat-frontend\src\pages\admin\AdminDashboardPage.tsx
```tsx
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

interface DashboardData {
  total_tenants: number; active_tenants: number; total_users: number; total_bots: number;
  total_messages: number; total_documents: number; failed_documents: number;
  recent_activity: { tenant_id: string; question: string; ts: string }[];
}

interface AnalyticsData {
  top_tenants: { tenant_name: string; messages: number }[];
  daily_trend: { date: string; messages: number }[];
}

function StatCard({ label, value, sub, color }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, padding: "20px 24px", borderLeft: color ? `3px solid ${color}` : undefined }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted,#94a3b8)" }}>{label}</div>
      <div style={{ fontSize: "1.875rem", fontWeight: 800, marginTop: 6, color: color || "var(--color-text,#e2e8f0)" }}>{value}</div>
      {sub && <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted,#94a3b8)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      api.get("/admin/dashboard", { headers }),
      api.get("/admin/analytics", { headers }),
    ])
      .then(([dashboardRes, analyticsRes]) => {
        setData(dashboardRes.data);
        setAnalytics(analyticsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Platform Overview</h1>
        <p style={{ color: "var(--color-text-muted,#94a3b8)", marginTop: 4, fontSize: "0.875rem" }}>Real-time snapshot of your entire GyaanChat platform.</p>
      </div>
      {loading ? <p style={{ color: "var(--color-text-muted,#94a3b8)" }}>Loading…</p> : !data ? <p style={{ color: "#ef4444" }}>Failed to load.</p> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 32 }}>
            <StatCard label="Total Tenants"   value={data.total_tenants}   sub={`${data.active_tenants} active`} color="#7c3aed" />
            <StatCard label="Total Users"     value={data.total_users}     color="#2563eb" />
            <StatCard label="Total Bots"      value={data.total_bots}      color="#0891b2" />
            <StatCard label="Documents"       value={data.total_documents} sub={data.failed_documents > 0 ? `${data.failed_documents} failed` : undefined} color={data.failed_documents > 0 ? "#ef4444" : "#10b981"} />
            <StatCard label="Total Messages"  value={data.total_messages}  color="#f59e0b" />
          </div>
          <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted,#94a3b8)", marginBottom: 16 }}>Recent Activity</h2>
            {data.recent_activity.length === 0 ? <p style={{ color: "var(--color-text-muted,#94a3b8)", fontSize: "0.875rem" }}>No activity yet.</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead><tr style={{ borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
                  {["Tenant", "Last Query", "Time"].map(h => <th key={h} style={{ textAlign: "left", padding: "6px 12px 10px 0", color: "var(--color-text-muted,#94a3b8)", fontWeight: 600, fontSize: "0.75rem" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {data.recent_activity.map((a, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
                      <td style={{ padding: "8px 12px 8px 0", fontFamily: "monospace", fontSize: "0.72rem", color: "var(--color-text-muted,#94a3b8)" }}>{a.tenant_id.slice(0,8)}…</td>
                      <td style={{ padding: "8px 12px 8px 0" }}>{a.question}</td>
                      <td style={{ padding: "8px 0", fontSize: "0.72rem", color: "var(--color-text-muted,#94a3b8)" }}>{new Date(a.ts).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16, marginTop: 16 }}>
            <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted,#94a3b8)", marginBottom: 14 }}>Top Active Tenants</h2>
              {!analytics || analytics.top_tenants.length === 0 ? (
                <p style={{ color: "var(--color-text-muted,#94a3b8)", fontSize: "0.875rem" }}>No tenant analytics available yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {analytics.top_tenants.map((tenant, idx) => (
                    <div key={`${tenant.tenant_name}-${idx}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 20, height: 20, borderRadius: 999, background: "#7c3aed20", color: "#a855f7", fontSize: "0.72rem", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{idx + 1}</span>
                        <span style={{ fontWeight: 600, fontSize: "0.86rem" }}>{tenant.tenant_name}</span>
                      </div>
                      <span style={{ color: "var(--color-text-muted,#94a3b8)", fontSize: "0.78rem" }}>{tenant.messages} msgs</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted,#94a3b8)", marginBottom: 14 }}>Daily Trend</h2>
              {!analytics || analytics.daily_trend.length === 0 ? (
                <p style={{ color: "var(--color-text-muted,#94a3b8)", fontSize: "0.875rem" }}>No trend data available yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {analytics.daily_trend.slice(0, 7).map((d) => {
                    const maxMessages = Math.max(...analytics.daily_trend.map((row) => row.messages), 1);
                    const width = Math.max(6, Math.round((d.messages / maxMessages) * 100));
                    return (
                      <div key={d.date} style={{ display: "grid", gridTemplateColumns: "78px 1fr 52px", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted,#94a3b8)" }}>{d.date.slice(5)}</span>
                        <div style={{ height: 8, background: "#1f2430", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{ width: `${width}%`, height: "100%", background: "linear-gradient(90deg,#2563eb,#0ea5e9)", borderRadius: 999 }} />
                        </div>
                        <span style={{ textAlign: "right", fontSize: "0.72rem", color: "var(--color-text-muted,#94a3b8)" }}>{d.messages}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

```

### File: Frontend\gyaanchat-frontend\src\pages\admin\AdminDocumentsPage.tsx
```tsx
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

interface Doc { doc_id: string; filename: string; tenant_id: string; status: string; error?: string; updated_at: string; }
const SC: Record<string, string> = { completed: "#10b981", processing: "#f59e0b", failed: "#ef4444" };

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    api.get("/admin/documents", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setDocs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const filtered = docs.filter(d => (d.filename || "").toLowerCase().includes(search.toLowerCase()) || d.status.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div><h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Document Management</h1><p style={{ color: "var(--color-text-muted,#94a3b8)", marginTop: 4, fontSize: "0.875rem" }}>Monitor document processing jobs across all tenants.</p></div>
        <input className="input" placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 240, margin: 0 }} />
      </div>
      <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, overflow: "hidden" }}>
        {loading ? <p style={{ padding: 24, color: "var(--color-text-muted,#94a3b8)" }}>Loading…</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead style={{ background: "var(--color-bg,#0f1117)", borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
              <tr>{["Filename","Tenant","Status","Error","Updated"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", color: "var(--color-text-muted,#94a3b8)" }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.doc_id} style={{ borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{d.filename || "—"}</td>
                  <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: "0.72rem", color: "var(--color-text-muted,#94a3b8)" }}>{d.tenant_id?.slice(0,8)}…</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: `${SC[d.status] || "#888"}20`, color: SC[d.status] || "#888" }}>{d.status}</span></td>
                  <td style={{ padding: "10px 14px", color: "#ef4444", fontSize: "0.72rem" }}>{d.error || "—"}</td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-muted,#94a3b8)", fontSize: "0.72rem" }}>{d.updated_at ? new Date(d.updated_at).toLocaleString() : "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted,#94a3b8)" }}>No documents found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

```

### File: Frontend\gyaanchat-frontend\src\pages\admin\AdminSystemPage.tsx
```tsx
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

interface HealthItem { service: string; status: string; ok: boolean; }
interface Settings { platform_name: string; environment: string; jwt_expire_minutes: string; allowed_origins: string; }

export default function AdminSystemPage() {
  const [health, setHealth] = useState<HealthItem[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const hdr = { Authorization: `Bearer ${token}` };
    setLoading(true);
    Promise.all([api.get("/admin/system/health", { headers: hdr }), api.get("/admin/system/settings", { headers: hdr })])
      .then(([r1, r2]) => { setHealth(r1.data); setSettings(r2.data); }).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>System & Settings</h1>
        <p style={{ color: "var(--color-text-muted,#94a3b8)", marginTop: 4, fontSize: "0.875rem" }}>Monitor infrastructure health and platform configuration.</p>
      </div>
      {loading ? <p style={{ color: "var(--color-text-muted,#94a3b8)" }}>Loading…</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
          <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted,#94a3b8)", marginBottom: 20 }}>System Health</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {health.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 600 }}>{h.service}</div>
                  <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: h.ok ? "#10b98120" : "#ef444420", color: h.ok ? "#10b981" : "#ef4444" }}>{h.status}</span>
                </div>
              ))}
            </div>
          </div>
          {settings && (
            <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted,#94a3b8)", marginBottom: 20 }}>Platform Config</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[["Platform Name", settings.platform_name], ["Environment", settings.environment], ["JWT Expire (min)", settings.jwt_expire_minutes]].map(([l, v]) => (
                  <div key={l}><div style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", color: "var(--color-text-muted,#94a3b8)", marginBottom: 4 }}>{l}</div><div style={{ fontFamily: "monospace", background: "var(--color-bg,#0f1117)", padding: "6px 12px", borderRadius: 6, fontSize: "0.875rem" }}>{v || "—"}</div></div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

```

### File: Frontend\gyaanchat-frontend\src\pages\admin\AdminTenantsPage.tsx
```tsx
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

interface Tenant { id: string; name: string; owner_email: string; is_active: boolean; bots: number; messages: number; users: number; created_at: string; }

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const h = { Authorization: `Bearer ${token}` };

  function load() {
    setLoading(true);
    api.get("/admin/tenants", { headers: h }).then(r => setTenants(r.data)).catch(console.error).finally(() => setLoading(false));
  }
  useEffect(load, [token]);

  async function toggleStatus(id: string) { await api.patch(`/admin/tenants/${id}/status`, {}, { headers: h }); load(); }
  async function del(id: string) { if (!confirm("Delete tenant and ALL their data?")) return; await api.delete(`/admin/tenants/${id}`, { headers: h }); load(); }

  const filtered = tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.owner_email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div><h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Tenant Management</h1><p style={{ color: "var(--color-text-muted,#94a3b8)", marginTop: 4, fontSize: "0.875rem" }}>Manage all organizations on the platform.</p></div>
        <input className="input" placeholder="Search tenants…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 240, margin: 0 }} />
      </div>
      <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, overflow: "hidden" }}>
        {loading ? <p style={{ padding: 24, color: "var(--color-text-muted,#94a3b8)" }}>Loading…</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead style={{ background: "var(--color-bg,#0f1117)", borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
              <tr>{["Name","Owner","Users","Bots","Messages","Status","Created","Actions"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", color: "var(--color-text-muted,#94a3b8)" }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{t.name}</td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-muted,#94a3b8)", fontSize: "0.8rem" }}>{t.owner_email}</td>
                  <td style={{ padding: "10px 14px" }}>{t.users}</td>
                  <td style={{ padding: "10px 14px" }}>{t.bots}</td>
                  <td style={{ padding: "10px 14px" }}>{t.messages}</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: t.is_active ? "#10b98120" : "#ef444420", color: t.is_active ? "#10b981" : "#ef4444" }}>{t.is_active ? "Active" : "Suspended"}</span></td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-muted,#94a3b8)", fontSize: "0.72rem" }}>{t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => toggleStatus(t.id)} style={{ fontSize: "0.72rem", padding: "4px 10px", background: "transparent", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 6, cursor: "pointer", color: "var(--color-text,#e2e8f0)" }}>{t.is_active ? "Suspend" : "Activate"}</button>
                      <button onClick={() => del(t.id)} style={{ fontSize: "0.72rem", padding: "4px 10px", background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 6, cursor: "pointer" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted,#94a3b8)" }}>No tenants found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

```

### File: Frontend\gyaanchat-frontend\src\pages\admin\AdminUsersPage.tsx
```tsx
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

interface User { id: string; name: string; email: string; is_superadmin: boolean; tenant_name: string; tenant_active: boolean; messages: number; created_at: string; }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { token, user: currentUser } = useAuth();
  const h = { Authorization: `Bearer ${token}` };

  function load() {
    setLoading(true);
    api.get("/admin/users", { headers: h })
      .then(r => setUsers(r.data)).catch(console.error).finally(() => setLoading(false));
  }
  useEffect(load, [token]);

  async function toggleRole(id: string) {
    if (!confirm("Are you sure you want to change this user's role?")) return;
    await api.patch(`/admin/users/${id}/role`, {}, { headers: h });
    load();
  }

  async function del(id: string) {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    await api.delete(`/admin/users/${id}`, { headers: h });
    load();
  }

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.tenant_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div><h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>User Management</h1><p style={{ color: "var(--color-text-muted,#94a3b8)", marginTop: 4, fontSize: "0.875rem" }}>All users across the platform.</p></div>
        <input className="input" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 240, margin: 0 }} />
      </div>
      <div style={{ background: "var(--color-bg-card,#1a1d27)", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 12, overflow: "hidden" }}>
        {loading ? <p style={{ padding: 24, color: "var(--color-text-muted,#94a3b8)" }}>Loading…</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead style={{ background: "var(--color-bg,#0f1117)", borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
              <tr>{["Name","Email","Role","Tenant","Status","Messages","Joined","Actions"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", color: "var(--color-text-muted,#94a3b8)" }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--color-border,#2a2d3a)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-muted,#94a3b8)", fontSize: "0.8rem" }}>{u.email}</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: u.is_superadmin ? "#7c3aed20" : "#2563eb15", color: u.is_superadmin ? "#a855f7" : "#2563eb" }}>{u.is_superadmin ? "Super Admin" : "Tenant User"}</span></td>
                  <td style={{ padding: "10px 14px" }}>{u.tenant_name}</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600, background: u.tenant_active ? "#10b98120" : "#ef444420", color: u.tenant_active ? "#10b981" : "#ef4444" }}>{u.tenant_active ? "Active" : "Suspended"}</span></td>
                  <td style={{ padding: "10px 14px" }}>{u.messages}</td>
                  <td style={{ padding: "10px 14px", color: "var(--color-text-muted,#94a3b8)", fontSize: "0.72rem" }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                  <td style={{ padding: "10px 14px" }}>
                    {currentUser?.id !== u.id && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => toggleRole(u.id)} style={{ fontSize: "0.72rem", padding: "4px 10px", background: "transparent", border: "1px solid var(--color-border,#2a2d3a)", borderRadius: 6, cursor: "pointer", color: "var(--color-text,#e2e8f0)" }}>
                          {u.is_superadmin ? "Demote" : "Promote"}
                        </button>
                        <button onClick={() => del(u.id)} style={{ fontSize: "0.72rem", padding: "4px 10px", background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 6, cursor: "pointer" }}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted,#94a3b8)" }}>No users found.</td></tr>}
            </tbody>
          </table>
        )}
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
import { MessageSquare, FileText, Rocket, Check, Sparkles } from "lucide-react";
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
                    <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        Welcome back, {user?.name?.split(" ")[0] || "there"}
                        <Sparkles size={24} className="text-primary" style={{ color: "var(--color-primary)" }} />
                    </h1>
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
            <div className="charts-grid">
                {/* Recent Conversations */}
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--color-border)" }}>
                        <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Recent Conversations</h2>
                    </div>
                    {loading ? (
                        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                            {[1, 2, 3].map((i) => <Skeleton key={i} height="20px" />)}
                        </div>
                    ) : recent.length === 0 ? (
                        <div className="empty-state" style={{ padding: "40px 24px" }}>
                            <div className="empty-state-icon"><MessageSquare size={44} /></div>
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
                        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 16 }}>Quick Actions</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {[
                                { label: "Upload Document", icon: <FileText size={16} />, to: "/app/documents" },
                                { label: "Test Your Bot", icon: <MessageSquare size={16} />, to: "/app/test-chat" },
                                { label: "Get Embed Code", icon: <Rocket size={16} />, to: "/app/install" },
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
                            <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Bot Status</h2>
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
                                        {copied ? <Check size={14} /> : "Copy"}
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
import { Sparkles } from "lucide-react";
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
                        <div className="page" style={{ padding: "8px 14px", background: "var(--color-bg)", borderTop: "1px solid var(--color-border)", textAlign: "center" }}>
                            <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                                <Sparkles size={10} />
                                <span>Updates live as you edit · Go to <strong>Chat Preview</strong> to test for real</span>
                            </span>
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
import { MessageSquare, ChevronDown } from "lucide-react";
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
                        <div className="empty-state-icon"><MessageSquare size={48} /></div>
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
                                            <ChevronDown size={14} style={{ transform: expanded === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", opacity: 0.5 }} />
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
      <header className="page-header">
        <div>
          <h1 className="page-title">Welcome back!</h1>
          <p className="page-subtitle">Here is what's happening with your AI assistant.</p>
        </div>
      </header>

      <div className="stat-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.0625rem", fontWeight: 600, marginBottom: 20 }}>Recent Queries</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Query</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentChats.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.user}</td>
                  <td>{c.query}</td>
                  <td className="muted">{c.date}</td>
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
import { Inbox, FileText, File, UploadCloud } from "lucide-react";
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
                        <div className="empty-state-icon"><Inbox size={48} /></div>
                        <div className="empty-state-title">No documents yet</div>
                        <div className="empty-state-sub">Upload PDF, TXT, DOCX, MD, CSV, or HTML to train your assistant.</div>
                        <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => setModalOpen(true)}>Upload Now</button>
                    </div>
                ) : (
                    docs.map((doc) => (
                        <div key={doc.doc_id} className="doc-card">
                            <div className="doc-icon"><FileText size={20} /></div>
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
                            <div className="drop-zone-icon"><UploadCloud size={40} /></div>
                            <div className="drop-zone-text">Drop file here</div>
                            <div className="drop-zone-sub">PDF, TXT, DOCX, MD, CSV, HTML · or click to browse</div>
                        </div>
                        <input ref={fileInputRef} type="file" accept=".pdf,.txt,.docx,.md,.csv,.html,.htm" style={{ display: "none" }} onChange={handleFileChange} />

                        {selectedFile && (
                            <div className="selected-file-row">
                                <File size={16} />
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
import { Tag, Code, Frame, MessageSquare, Copy } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { API_BASE } from "../../api/client";

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
        apiBase: "${API_BASE}"
  };
</script>
<script src="${API_BASE}/widget.js" defer></script>`,
        react: `// Install: npm install @gyaanchat/widget
import { GyaanChatWidget } from "@gyaanchat/widget";

export default function App() {
  return (
    <>
      {/* Your app */}
      <GyaanChatWidget
        widgetKey="${widgetKey}"
                apiBase="${API_BASE}"
      />
    </>
  );
}`,
        iframe: `<!-- Embed as an iframe -->
<iframe
    src="${API_BASE}/chat-embed?key=${widgetKey}"
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
                                <Copy size={14} />
                                Copy
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                        <div className="tabs" style={{ padding: "0 20px", marginBottom: 0, borderBottom: "1px solid var(--color-border)" }}>
                            {(["script", "react", "iframe"] as Tab[]).map((t) => (
                                <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                                    {t === "script" ? <><Tag size={14} /> Script Tag</> : t === "react" ? <><Code size={14} /> React</> : <><Frame size={14} /> iFrame</>}
                                </button>
                            ))}
                        </div>
                        <div style={{ padding: 20 }}>
                            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                                <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: "0.75rem" }} onClick={() => copy(SNIPPETS[tab])}>
                                    <Copy size={12} />
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
                                <div className="widget-preview-header"><MessageSquare size={14} fill="currentColor" /> AI Assistant</div>
                                <div className="widget-preview-msgs">
                                    <div className="widget-preview-msg bot">Hi! How can I help you today?</div>
                                    <div className="widget-preview-msg user">What are your hours?</div>
                                    <div className="widget-preview-msg bot">We're open 24/7 — I'm always here!</div>
                                </div>
                            </div>
                            <div className="widget-preview-btn">
                                <MessageSquare size={22} fill="white" stroke="white" />
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
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../contexts/ToastContext";

export default function SettingsPage() {
    const { user, tenant, updateUser } = useAuth();
    const { showToast } = useToast();

    const [name, setName] = useState(user?.name || "");
    const [email] = useState(user?.email || "");
    const [workspace, setWorkspace] = useState(tenant?.name || "");
    const [savingProfile, setSavingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    const [confirmDelete, setConfirmDelete] = useState(false);

    async function handleSaveProfile(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) { showToast("Name cannot be empty.", "error"); return; }
        setSavingProfile(true);
        try {
            updateUser({ name: name.trim() });
            showToast("Profile updated.", "success");
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast("Please fill in all password fields.", "error"); return;
        }
        if (newPassword !== confirmPassword) {
            showToast("New passwords do not match.", "error"); return;
        }
        if (newPassword.length < 8) {
            showToast("New password must be at least 8 characters.", "error"); return;
        }
        setSavingPassword(true);
        try {
            await new Promise((r) => setTimeout(r, 600));
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            showToast("Password changed successfully.", "success");
        } finally {
            setSavingPassword(false);
        }
    }

    function handleDeleteAccount() {
        showToast("Account deletion is not available in this version.", "info");
        setConfirmDelete(false);
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your account and security preferences</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

                {/* ── Profile & Account ── */}
                <div className="card">
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 24 }}>Profile & Account</h2>
                    <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        <div>
                            <label className="label">Name</label>
                            <input
                                className="input"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                            />
                        </div>
                        <div>
                            <label className="label">Email</label>
                            <input
                                className="input"
                                type="email"
                                value={email}
                                readOnly
                                style={{ opacity: 0.6, cursor: "not-allowed" }}
                            />
                        </div>
                        <div>
                            <label className="label">Workspace name</label>
                            <input
                                className="input"
                                type="text"
                                value={workspace}
                                onChange={(e) => setWorkspace(e.target.value)}
                                placeholder="Your workspace name"
                            />
                        </div>
                        <div style={{ paddingTop: 4 }}>
                            <button className="btn-primary" type="submit" disabled={savingProfile}>
                                {savingProfile
                                    ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Saving...</>
                                    : "Save changes"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ── Security ── */}
                <div className="card">
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 24 }}>Security</h2>

                    <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        <div>
                            <label className="label">Current password</label>
                            <input
                                className="input"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                autoComplete="current-password"
                            />
                        </div>
                        <div>
                            <label className="label">New password</label>
                            <input
                                className="input"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="At least 8 characters"
                                autoComplete="new-password"
                            />
                        </div>
                        <div>
                            <label className="label">Confirm new password</label>
                            <input
                                className="input"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat new password"
                                autoComplete="new-password"
                            />
                        </div>
                        <div style={{ paddingTop: 4 }}>
                            <button className="btn-primary" type="submit" disabled={savingPassword}>
                                {savingPassword
                                    ? <><span className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} /> Updating...</>
                                    : "Change password"}
                            </button>
                        </div>
                    </form>

                    <hr className="divider" style={{ margin: "28px 0" }} />

                    <div>
                        <div style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: 6 }}>Delete account</div>
                        <p className="muted" style={{ marginBottom: 16 }}>
                            Permanently remove your account and all associated data. This cannot be undone.
                        </p>
                        {!confirmDelete ? (
                            <button
                                className="btn-ghost"
                                style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }}
                                onClick={() => setConfirmDelete(true)}
                            >
                                Delete account
                            </button>
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span className="muted" style={{ fontSize: "0.875rem" }}>Are you sure?</span>
                                <button className="btn-danger" onClick={handleDeleteAccount}>Yes, delete</button>
                                <button className="btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

```

### File: Frontend\gyaanchat-frontend\src\pages\app\TestChatPage.tsx
```tsx
import { useMemo, useState, useRef, useEffect } from "react";
import { Settings, Edit2, MessageSquare, Send, Loader2 } from "lucide-react";
import { chatTenant } from "../../api/endpoints";
import { useAuth } from "../../context/AuthContext";
import { useBotSettings } from "../../contexts/BotSettingsContext";
import { useNavigate } from "react-router-dom";

const renderMessageText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
    });
};

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
                <button className="btn-ghost" style={{ fontSize: "0.82rem", gap: 6 }} onClick={() => navigate("/app/bot-settings")}>
                    <Settings size={14} />
                    Edit Bot Settings
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
                                : <MessageSquare size={22} fill="white" />
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
                        <button className="btn-ghost" style={{ width: "100%", fontSize: "0.8rem", justifyContent: "center", gap: 6 }} onClick={() => navigate("/app/bot-settings")}>
                            <Edit2 size={13} />
                            Edit in Bot Settings
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
                                : <MessageSquare size={18} fill="white" stroke="white" />
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
                                            : <MessageSquare size={14} fill="white" stroke="white" />
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
                                    border: m.role === "assistant" ? "1px solid var(--color-border)" : "none",
                                    boxShadow: m.role === "user" ? `0 2px 8px ${color}44` : "0 1px 4px rgba(0,0,0,0.06)",
                                }}>
                                    <div style={{ fontSize: "0.68rem", fontWeight: 600, opacity: 0.65, marginBottom: 4 }}>
                                        {m.role === "user" ? "You" : botName}
                                    </div>
                                    <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                        {renderMessageText(m.text)}
                                    </div>
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
                                    <MessageSquare size={14} fill="white" stroke="white" />
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
                            {busy ? <Loader2 size={16} className="spinner" /> : <Send size={16} />}
                            {busy ? "Thinking" : "Send"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


```

### File: Frontend\gyaanchat-frontend\src\pages\public\DocsPage.tsx
```tsx
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import DocsMarkdown from '../../components/docs/DocsMarkdown';
import DocsTOC from '../../components/docs/DocsTOC';
import { getContentForSlug } from '../../features/docs/contentProvider';
import { getDocBySlug, getAdjacentDocs } from '../../features/docs/docs-config';
import DocsLayout from '../../components/layout/DocsLayout';
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react';

export default function DocsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  if (!slug) {
    return <Navigate to="/docs/getting-started" replace />;
  }

  const docInfo = getDocBySlug(slug);
  const content = getContentForSlug(slug);
  const { prev, next } = getAdjacentDocs(slug);

  if (!docInfo || !content) {
    return (
      <DocsLayout>
        <div className="docs-not-found">
          <div className="docs-not-found-icon">404</div>
          <h2 className="docs-not-found-title">Page not found</h2>
          <p className="docs-not-found-sub">
            The article you're looking for doesn't exist or may have been moved.
          </p>
          <button className="docs-not-found-btn" onClick={() => navigate('/docs/getting-started')}>
            Go to Getting Started
          </button>
        </div>
      </DocsLayout>
    );
  }

  const Icon = docInfo.Icon;

  return (
    <DocsLayout>
      <div className="docs-page-layout">
        <div className="docs-page-content">
          {/* Article hero */}
          <div className="docs-article-hero">
            <div className="docs-article-icon-wrap">
              <Icon size={22} strokeWidth={1.75} />
            </div>
            <div className="docs-article-meta">
              <span className="docs-article-readtime">
                <Clock size={13} />
                {docInfo.readTime}
              </span>
              <p className="docs-article-desc">{docInfo.description}</p>
            </div>
          </div>

          {/* Main article content */}
          <DocsMarkdown content={content} />

          {/* Prev / Next navigation */}
          <div className="docs-pagination">
            {prev ? (
              <button
                className="docs-pagination-card docs-pagination-prev"
                onClick={() => navigate(`/docs/${prev.slug}`)}
              >
                <div className="docs-pagination-dir">
                  <ArrowLeft size={14} />
                  <span>Previous</span>
                </div>
                <div className="docs-pagination-title">{prev.title}</div>
              </button>
            ) : (
              <div />
            )}

            {next ? (
              <button
                className="docs-pagination-card docs-pagination-next"
                onClick={() => navigate(`/docs/${next.slug}`)}
              >
                <div className="docs-pagination-dir">
                  <span>Next</span>
                  <ArrowRight size={14} />
                </div>
                <div className="docs-pagination-title">{next.title}</div>
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* Right TOC */}
        <DocsTOC content={content} />
      </div>
    </DocsLayout>
  );
}

```

### File: Frontend\gyaanchat-frontend\src\pages\public\LandingPage.tsx
```tsx
import { useNavigate } from "react-router-dom";
import myLogo from "../../assets/gyaanchatlogo.png";
export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div>
            {/* ── Navbar ── */}
            <nav className="landing-nav">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={myLogo} alt="Logo" style={{ width: 44, height: 44, objectFit: "contain" }} />
                    <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)" }}>GyaanChat</span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn-ghost" onClick={() => navigate("/docs")}>Docs</button>
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
                        Upload your documents. Get a smart chatbot in minutes.<br />Embed it anywhere no code required.
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
                    <img src={myLogo} alt="Logo" style={{ width: 32, height: 32, objectFit: "contain" }} />
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
import myLogo from "../../assets/gyaanchatlogo.png";

export default function LoginPage() {
  const [view, setView] = useState<"login" | "forgot" | "reset">("login");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data);
      if (data.user?.is_superadmin) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/app", { replace: true });
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  async function onForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!email) { setError("Please enter your email address."); return; }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setView("reset");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to request password reset.");
    } finally {
      setLoading(false);
    }
  }

  async function onResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!resetCode || !newPassword) { setError("Please enter the code and a new password."); return; }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, code: resetCode, new_password: newPassword });
      setView("login");
      setPassword("");
      setSuccessMsg("Password successfully reset! You can now log in.");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      {/* Left decorative panel */}
      <div className="auth-left">
        <div className="auth-left-logo">
          <img src={myLogo} alt="Logo" className="auth-left-logo-mark" style={{ objectFit: "contain" }} />
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
          {view === "login" && (
            <>
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
                    <span 
                        onClick={() => setView("forgot")}
                        style={{ fontSize: "0.75rem", color: "var(--color-primary)", cursor: "pointer", fontWeight: 500 }}
                    >
                        Forgot password?
                    </span>
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
                {successMsg && <div className="alert alert-success" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "12px", borderRadius: "8px", fontSize: "0.875rem", marginBottom: "16px" }}>{successMsg}</div>}

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
            </>
          )}

          {view === "forgot" && (
            <>
              <h1 className="auth-form-title">Reset Password</h1>
              <p className="auth-form-sub">Enter your email address to receive a verification code.</p>

              <form onSubmit={onForgotPassword}>
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

                {error && <div className="alert alert-error">{error}</div>}

                <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", padding: "11px", fontSize: "0.9375rem", marginTop: 4 }}>
                  {loading ? (
                    <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Sending...</>
                  ) : "Send Reset Code"}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                <span onClick={() => { setView("login"); setError(null); }} className="auth-link" style={{ cursor: "pointer" }}>← Back to login</span>
              </p>
            </>
          )}

          {view === "reset" && (
            <>
              <h1 className="auth-form-title">Enter Reset Code</h1>
              <p className="auth-form-sub">We sent a 6-digit code to <strong>{email}</strong></p>

              <form onSubmit={onResetPassword}>
                <div className="form-group">
                  <label className="label">Reset Code</label>
                  <input
                    className="input"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    style={{ fontSize: "1.5rem", letterSpacing: "4px", textAlign: "center", padding: "12px" }}
                  />
                </div>

                <div className="form-group">
                  <label className="label">New Password</label>
                  <input
                    className="input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                  />
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", padding: "11px", fontSize: "0.9375rem", marginTop: 4 }}>
                  {loading ? (
                    <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Resetting...</>
                  ) : "Reset Password"}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                Didn't receive the code?{" "}
                <button type="button" onClick={onForgotPassword} className="auth-link" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "inherit" }}>
                    Resend code
                </button>
              </p>
            </>
          )}
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
import myLogo from "../../assets/gyaanchatlogo.png";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [websiteName, setWebsiteName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    // OTP State
    const [isVerifying, setIsVerifying] = useState(false);
    const [otp, setOtp] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (!name || !email || !password || !confirmPassword || !websiteName) { setError("Please fill in all fields."); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
        if (password !== confirmPassword) { setError("Passwords do not match."); return; }
        setLoading(true);
        try {
            const { data } = await api.post("/auth/register", { name, email, password, website_name: websiteName });
            if (data.verification_required) {
                setIsVerifying(true);
            } else {
                login(data);
                navigate("/app", { replace: true });
            }
        } catch (err: any) {
            setError(err?.response?.data?.detail || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function onVerify(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        if (!otp) { setError("Please enter the verification code."); return; }
        setLoading(true);
        try {
            const { data } = await api.post("/auth/verify-email", { email, code: otp });
            login(data);
            navigate("/app", { replace: true });
        } catch (err: any) {
            setError(err?.response?.data?.detail || "Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-shell">
            {/* Left decorative panel */}
            <div className="auth-left">
                <div className="auth-left-logo">
                    <img src={myLogo} alt="Logo" className="auth-left-logo-mark" style={{ objectFit: "contain" }} />
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
                    {!isVerifying ? (
                        <>
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

                                <div className="form-group">
                                    <label className="label">Confirm Password</label>
                                    <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat your password" autoComplete="new-password" />
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
                        </>
                    ) : (
                        <>
                            <h1 className="auth-form-title">Verify your email</h1>
                            <p className="auth-form-sub">We sent a 6-digit code to <strong>{email}</strong></p>

                            <form onSubmit={onVerify}>
                                <div className="form-group">
                                    <label className="label">Verification Code</label>
                                    <input 
                                        className="input" 
                                        value={otp} 
                                        onChange={(e) => setOtp(e.target.value)} 
                                        placeholder="123456" 
                                        maxLength={6}
                                        style={{ fontSize: "1.5rem", letterSpacing: "4px", textAlign: "center", padding: "12px" }}
                                    />
                                </div>

                                {error && <div className="alert alert-error">{error}</div>}

                                <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", padding: "11px", fontSize: "0.9375rem", marginTop: 4 }}>
                                    {loading ? (
                                        <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Verifying...</>
                                    ) : "Verify & Complete Signup"}
                                </button>
                            </form>
                            
                            <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                                Didn't receive the code?{" "}
                                <button type="button" onClick={onSubmit} className="auth-link" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "inherit" }}>
                                    Resend code
                                </button>
                            </p>
                        </>
                    )}
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

### File: Frontend\gyaanchat-frontend\src\styles\docs.css
```css
/* =============================================================
   GyaanChat — docs.css
   Only doc-content specific styles.
   Layout (shell, sidebar, topbar) reuses globals.css classes.
   ============================================================= */

/* ── Content wrapper ── */
.docs-content-container {
  width: 100%;
  max-width: 100%;
  padding: 32px 28px 80px;
  animation: fadeIn 0.15s ease;
}

/* ── Page layout: article + right TOC ── */
.docs-page-layout {
  display: flex;
  gap: 48px;
  align-items: flex-start;
  max-width: 1100px;
}

.docs-page-content {
  flex: 1;
  min-width: 0;
  max-width: 740px;
}

/* ── Breadcrumb ── */
.docs-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  margin-bottom: 24px;
  color: var(--color-text-muted);
}

.docs-breadcrumb-link {
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color var(--transition);
}

.docs-breadcrumb-link:hover {
  color: var(--color-text-primary);
}

.docs-breadcrumb-sep {
  color: var(--color-border-strong);
}

.docs-breadcrumb-current {
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* ── Article hero ── */
.docs-article-hero {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--color-border);
}

.docs-article-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  background: var(--color-bg-input);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.docs-article-meta {
  flex: 1;
}

.docs-article-readtime {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 500;
  margin-bottom: 5px;
}

.docs-article-desc {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* ── Markdown Content ── */
.docs-markdown {
  font-size: 1rem;
  line-height: 1.75;
  color: var(--color-text-primary);
}

.docs-markdown h1 {
  font-size: 1.875rem;
  font-weight: 800;
  margin-bottom: 20px;
  line-height: 1.2;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.docs-markdown h2 {
  font-size: 1.3125rem;
  font-weight: 700;
  margin-top: 48px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.docs-markdown h3 {
  font-size: 1.0625rem;
  font-weight: 650;
  margin-top: 28px;
  margin-bottom: 10px;
  color: var(--color-text-primary);
}

.docs-markdown h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  margin-top: 20px;
  margin-bottom: 8px;
  color: var(--color-text-secondary);
}

.docs-markdown p {
  margin-bottom: 18px;
  color: var(--color-text-secondary);
}

.docs-markdown strong {
  color: var(--color-text-primary);
  font-weight: 600;
}

.docs-markdown a {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: var(--color-border-strong);
  transition: text-decoration-color var(--transition);
}

.docs-markdown a:hover {
  text-decoration-color: var(--color-accent);
}

.docs-markdown ul,
.docs-markdown ol {
  margin-bottom: 18px;
  padding-left: 24px;
  color: var(--color-text-secondary);
}

.docs-markdown li {
  margin-bottom: 8px;
  line-height: 1.7;
}

/* Inline code */
.docs-markdown code:not(pre code) {
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  padding: 2px 6px;
  border-radius: 5px;
  font-size: 0.8125em;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  color: var(--color-text-primary);
  font-weight: 500;
}

/* Code blocks */
.docs-markdown pre {
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  padding: 18px 22px;
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: 20px 0 28px;
}

.docs-markdown pre code {
  color: #e5e7eb;
  font-size: 0.8375rem;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  line-height: 1.7;
  background: transparent;
  border: none;
  padding: 0;
}

/* Tables */
.docs-table-wrap {
  width: 100%;
  overflow-x: auto;
  margin: 20px 0 28px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.docs-markdown table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.docs-markdown th {
  text-align: left;
  padding: 11px 16px;
  background: var(--color-bg-input);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.docs-markdown td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  vertical-align: top;
  line-height: 1.6;
}

.docs-markdown tr:last-child td {
  border-bottom: none;
}

.docs-markdown tr:hover td {
  background: var(--color-bg-input);
}

/* Standard blockquote */
.docs-blockquote {
  border-left: 3px solid var(--color-border-strong);
  padding: 12px 18px;
  margin: 20px 0;
  color: var(--color-text-secondary);
  background: var(--color-bg-input);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  font-style: italic;
}

.docs-blockquote p:last-child {
  margin-bottom: 0;
}

/* ── Callout Boxes ── */
.docs-callout {
  padding: 14px 18px;
  border-radius: var(--radius-md);
  border: 1px solid;
  margin: 20px 0 24px;
}

.docs-callout-header {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.docs-callout-body p {
  margin: 0;
  font-size: 0.9125rem;
  line-height: 1.65;
}

.docs-callout-body p:not(:last-child) {
  margin-bottom: 8px;
}

/* Tip — green */
.docs-callout-tip {
  background: #f0fdf4;
  border-color: #22c55e;
}
.docs-callout-tip .docs-callout-header { color: #16a34a; }
.docs-callout-tip .docs-callout-body,
.docs-callout-tip .docs-callout-body p { color: #166534; }

/* Note — blue */
.docs-callout-note {
  background: #eff6ff;
  border-color: #3b82f6;
}
.docs-callout-note .docs-callout-header { color: #2563eb; }
.docs-callout-note .docs-callout-body,
.docs-callout-note .docs-callout-body p { color: #1e40af; }

/* Warning — amber */
.docs-callout-warning {
  background: #fffbeb;
  border-color: #f59e0b;
}
.docs-callout-warning .docs-callout-header { color: #d97706; }
.docs-callout-warning .docs-callout-body,
.docs-callout-warning .docs-callout-body p { color: #92400e; }

/* Caution — red */
.docs-callout-caution {
  background: #fef2f2;
  border-color: #ef4444;
}
.docs-callout-caution .docs-callout-header { color: #dc2626; }
.docs-callout-caution .docs-callout-body,
.docs-callout-caution .docs-callout-body p { color: #991b1b; }

/* ── Images ── */
.docs-img {
  margin: 24px 0;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  max-width: 100%;
  display: block;
}

.docs-image-placeholder {
  width: 100%;
  min-height: 200px;
  background: var(--color-bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  border: 2px dashed var(--color-border-strong);
  color: var(--color-text-muted);
  font-size: 0.875rem;
  margin: 24px 0;
  font-weight: 500;
  font-style: italic;
}

/* ── Pagination (Prev / Next) ── */
.docs-pagination {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 56px;
  padding-top: 28px;
  border-top: 1px solid var(--color-border);
}

.docs-pagination-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  cursor: pointer;
  transition: all var(--transition);
  text-align: left;
  box-shadow: var(--shadow-sm);
}

.docs-pagination-card:hover {
  background: var(--color-bg-input);
  border-color: var(--color-border-strong);
}

.docs-pagination-next {
  text-align: right;
}

.docs-pagination-dir {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 5px;
}

.docs-pagination-next .docs-pagination-dir {
  justify-content: flex-end;
}

.docs-pagination-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* ── Right TOC ── */
.docs-toc {
  width: 220px;
  flex-shrink: 0;
  position: sticky;
  top: calc(var(--topbar-height) + 32px);
  max-height: calc(100vh - var(--topbar-height) - 64px);
  overflow-y: auto;
}

.docs-toc-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 12px;
}

.docs-toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  border-left: 2px solid var(--color-border);
}

.docs-toc-item {
  position: relative;
}

.docs-toc-item.active::before {
  content: '';
  position: absolute;
  left: -2px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-accent);
  border-radius: 1px;
}

.docs-toc-link {
  display: block;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  transition: color var(--transition);
  padding: 5px 0 5px 14px;
  line-height: 1.45;
  text-decoration: none;
}

.docs-toc-link:hover {
  color: var(--color-text-primary);
}

.docs-toc-link.active {
  color: var(--color-text-primary);
  font-weight: 600;
}

/* ── Not found ── */
.docs-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  gap: 12px;
}

.docs-not-found-icon {
  font-size: 3rem;
  font-weight: 800;
  color: var(--color-border-strong);
  line-height: 1;
  margin-bottom: 8px;
}

.docs-not-found-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.docs-not-found-sub {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  max-width: 360px;
}

.docs-not-found-btn {
  margin-top: 8px;
  padding: 10px 20px;
  background: var(--color-accent);
  color: var(--color-accent-fg);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition);
}

.docs-not-found-btn:hover {
  opacity: 0.85;
}

/* ── Responsive ── */
@media (max-width: 1100px) {
  .docs-toc {
    display: none;
  }
  .docs-page-layout {
    display: block;
  }
}

@media (max-width: 768px) {
  .docs-content-container {
    padding: 20px 16px 64px;
  }

  .docs-pagination {
    grid-template-columns: 1fr;
  }

  .docs-pagination-next {
    text-align: left;
  }

  .docs-pagination-next .docs-pagination-dir {
    justify-content: flex-start;
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

    --sidebar-width: 240px;
    --topbar-height: 68px;

    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 16px;
    --radius-full: 9999px;

    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
    --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.10);
    --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.14);

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
    font-size: 16px;
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
    padding: 11px 16px;
    border-radius: var(--radius-md);
    font-size: 0.9375rem;
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
    padding: 11px 16px;
    border-radius: var(--radius-md);
    font-size: 0.9375rem;
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
    padding: 11px 16px;
    border-radius: var(--radius-md);
    font-size: 0.9375rem;
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
    padding: 11px 14px;
    font-size: 0.9375rem;
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
    padding: 32px 28px;
    width: 100%;
    max-width: 100%;
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
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-text-primary);
    line-height: 1.2;
}

.page-subtitle {
    color: var(--color-text-muted);
    font-size: 0.875rem;
    margin-top: 5px;
}

/* ── Stat Cards Grid ── */
.stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 24px;
}

.stat-card {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 22px 24px;
    box-shadow: var(--shadow-sm);
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.stat-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 10px;
}

.stat-value {
    font-size: 1.875rem;
    font-weight: 700;
    color: var(--color-text-primary);
    line-height: 1;
}

.stat-sub {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    margin-top: 8px;
}

/* ── Tables ── */
.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table th {
    text-align: left;
    padding: 13px 20px;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg-input);
}

.data-table td {
    padding: 16px 20px;
    border-bottom: 1px solid var(--color-border);
    font-size: 0.9375rem;
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
    padding: 26px 20px;
    border-bottom: 1px solid var(--color-border);
}

.sidebar-logo {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-sm);
    object-fit: contain;
    flex-shrink: 0;
}

.sidebar-brand-text {
    display: flex;
    flex-direction: column;
}

.sidebar-brand-name {
    font-size: 1.0625rem;
    font-weight: 700;
    color: var(--color-text-primary);
    line-height: 1.2;
}

.sidebar-brand-sub {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-weight: 500;
}

.sidebar-nav {
    flex: 1;
    padding: 18px 14px;
    overflow-y: auto;
}

.nav-section-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 12px 10px 4px;
    margin-top: 8px;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 12px 14px;
    border-radius: var(--radius-md);
    font-size: 0.9375rem;
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
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    opacity: 0.7;
}

.nav-item.active svg,
.nav-item:hover svg {
    opacity: 1;
}

.sidebar-footer {
    padding: 16px 14px;
    border-top: 1px solid var(--color-border);
    position: relative;
}

.sidebar-user {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background var(--transition);
}

.sidebar-user:hover {
    background: var(--color-bg-input);
}

.user-avatar {
    width: 40px;
    height: 40px;
    background: var(--color-accent);
    color: var(--color-accent-fg);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 700;
    flex-shrink: 0;
}

.user-info {
    flex: 1;
    min-width: 0;
}

.user-name {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-email {
    font-size: 0.75rem;
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
    padding: 12px 16px;
    font-size: 0.9375rem;
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
    gap: 14px;
}

.topbar-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary);
}

.topbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
}

.icon-btn {
    width: 40px;
    height: 40px;
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
    width: 18px;
    height: 18px;
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
    width: 56px;
    height: 56px;
    border-radius: var(--radius-sm);
    object-fit: contain;
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
    max-width: 500px;
    box-shadow: var(--shadow-lg);
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 24px;
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
    grid-template-columns: 220px 1fr;
    gap: 28px;
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
    gap: 24px;
    margin-bottom: 32px;
}

.profile-avatar {
    width: 72px;
    height: 72px;
    background: var(--color-accent);
    color: var(--color-accent-fg);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
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
    padding: 24px;
}

.chart-title {
    font-size: 1rem;
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

