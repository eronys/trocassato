from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import get_settings
from .models import AdminUser
from .security import hash_password


def bootstrap_admin(db: Session) -> None:
  settings = get_settings()
  existing = db.execute(select(AdminUser).limit(1)).scalar_one_or_none()
  if existing:
    return

  password_hash = None
  if settings.admin_password_hash:
    password_hash = settings.admin_password_hash
  elif settings.admin_password:
    password_hash = hash_password(settings.admin_password)

  if not password_hash:
    raise RuntimeError("Admin password is not configured. Set ADMIN_PASSWORD or ADMIN_PASSWORD_HASH.")

  db.add(AdminUser(username=settings.admin_username, password_hash=password_hash))
  db.commit()
