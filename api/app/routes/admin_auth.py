from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import AdminUser
from ..schemas import AdminLoginIn
from ..security import create_token, verify_password
from ..deps import require_admin


router = APIRouter(prefix="/admin/auth", tags=["admin-auth"])


@router.post("/login")
def login(payload: AdminLoginIn, response: Response, db: Session = Depends(get_db)):
  admin = db.get(AdminUser, payload.username)
  if not admin:
    raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")
  if not verify_password(payload.password, admin.password_hash):
    raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")
  token = create_token(admin.username, scope="admin")
  response.set_cookie("trocasato_admin_session", token, httponly=True, samesite="lax")
  return {"ok": True}


@router.post("/logout")
def logout(response: Response):
  response.delete_cookie("trocasato_admin_session")
  return {"ok": True}


@router.get("/me")
def me(_admin: AdminUser = Depends(require_admin)):
  return {"ok": True}
