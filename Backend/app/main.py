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
