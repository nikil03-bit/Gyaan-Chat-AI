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
