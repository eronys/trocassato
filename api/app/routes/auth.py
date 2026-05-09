from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import User
from ..schemas import AuthLoginIn, PublicUser
from ..security import create_token, verify_password
from ..deps import require_user


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(payload: AuthLoginIn, response: Response, db: Session = Depends(get_db)):
  user = db.execute(select(User).where(User.email == str(payload.email))).scalar_one_or_none()
  if not user:
    raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")
  if not verify_password(payload.password, user.password_hash):
    raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")
  token = create_token(user.id, scope="user")
  response.set_cookie("trocasato_session", token, httponly=True, samesite="lax")
  return {"ok": True}


@router.post("/logout")
def logout(response: Response):
  response.delete_cookie("trocasato_session")
  return {"ok": True}


@router.get("/me", response_model=PublicUser)
def me(user: User = Depends(require_user)):
  return PublicUser.model_validate(user.__dict__)
