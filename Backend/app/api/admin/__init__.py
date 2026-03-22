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
