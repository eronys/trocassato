from fastapi import Cookie, Depends, HTTPException
from sqlalchemy.orm import Session

from .db import get_db
from .models import AdminUser, User
from .security import decode_token


def require_user(
  trocasato_session: str | None = Cookie(default=None),
  db: Session = Depends(get_db),
) -> User:
  if not trocasato_session:
    raise HTTPException(status_code=401, detail="Não autenticado")
  try:
    payload = decode_token(trocasato_session)
  except Exception:
    raise HTTPException(status_code=401, detail="Sessão inválida")
  if payload.get("scope") != "user":
    raise HTTPException(status_code=401, detail="Sessão inválida")
  user_id = payload.get("sub")
  user = db.get(User, user_id)
  if not user:
    raise HTTPException(status_code=401, detail="Usuário não encontrado")
  if user.status == "SUSPENDED":
    raise HTTPException(status_code=403, detail="Usuário suspenso")
  if user.status == "APPROVED" and user.level == "STAR_1":
    user.level = "STAR_2"
    db.add(user)
    db.commit()
  return user


def require_admin(
  trocasato_admin_session: str | None = Cookie(default=None),
  db: Session = Depends(get_db),
) -> AdminUser:
  if not trocasato_admin_session:
    raise HTTPException(status_code=401, detail="Não autenticado")
  try:
    payload = decode_token(trocasato_admin_session)
  except Exception:
    raise HTTPException(status_code=401, detail="Sessão inválida")
  if payload.get("scope") != "admin":
    raise HTTPException(status_code=401, detail="Sessão inválida")
  username = payload.get("sub")
  admin = db.get(AdminUser, username)
  if not admin:
    raise HTTPException(status_code=401, detail="Admin não encontrado")
  return admin
