import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Invitation, User
from ..schemas import OnboardingFinishIn, PublicUser
from ..security import hash_password
from ..utils import wallet_name_from_identity


router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])


@router.post("/finish", response_model=PublicUser)
def finish(payload: OnboardingFinishIn, db: Session = Depends(get_db)):
  inv = db.execute(select(Invitation).where(Invitation.token == payload.invite_token)).scalar_one_or_none()
  if not inv or inv.status in ("REVOKED", "USED"):
    raise HTTPException(status_code=400, detail="Convite inválido")

  email_exists = db.execute(select(User).where(User.email == str(payload.email))).scalar_one_or_none()
  if email_exists:
    raise HTTPException(status_code=400, detail="E-mail já cadastrado")

  cpf_exists = db.execute(select(User).where(User.cpf == payload.cpf)).scalar_one_or_none()
  if cpf_exists:
    raise HTTPException(status_code=400, detail="CPF já cadastrado")

  user_id = str(uuid.uuid4())
  user = User(
    id=user_id,
    full_name=payload.full_name,
    email=str(payload.email),
    cpf=payload.cpf,
    photo_url=payload.photo_url,
    status="PENDING_APPROVAL",
    level="STAR_1",
    invited_by_user_id=inv.invited_by_user_id,
    wallet_name=wallet_name_from_identity(payload.cpf, payload.full_name),
    password_hash=hash_password(payload.password),
    is_host=False,
  )
  db.add(user)
  inv.status = "USED"
  inv.used_by_user_id = user_id
  db.add(inv)
  db.commit()
  db.refresh(user)
  return PublicUser.model_validate(user.__dict__)
