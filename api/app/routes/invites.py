import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import require_user
from ..models import Invitation, User
from ..schemas import HostApprovalIn, InvitationCreateByHostIn, InvitationOut, PublicUser


router = APIRouter(prefix="/invites", tags=["invites"])


@router.get("/invitations", response_model=list[InvitationOut])
def my_invitations(me: User = Depends(require_user), db: Session = Depends(get_db)):
  invs = (
    db.execute(select(Invitation).where(Invitation.invited_by_user_id == me.id).order_by(Invitation.created_at.desc()))
    .scalars()
    .all()
  )
  return [InvitationOut.model_validate(i.__dict__) for i in invs]


@router.post("/invitations", response_model=InvitationOut)
def create_invitation(payload: InvitationCreateByHostIn, me: User = Depends(require_user), db: Session = Depends(get_db)):
  inv = Invitation(
    id=str(uuid.uuid4()),
    token=str(uuid.uuid4()).replace("-", ""),
    invited_by_user_id=me.id,
    person_name=payload.person_name,
    person_email=str(payload.person_email),
    person_cpf=payload.person_cpf,
    status="CREATED",
    used_by_user_id=None,
    used_at=None,
  )
  db.add(inv)
  db.commit()
  db.refresh(inv)
  return InvitationOut.model_validate(inv.__dict__)


@router.get("/pending", response_model=list[PublicUser])
def pending(me: User = Depends(require_user), db: Session = Depends(get_db)):
  users = (
    db.execute(select(User).where(User.invited_by_user_id == me.id, User.status == "PENDING_APPROVAL"))
    .scalars()
    .all()
  )
  return [PublicUser.model_validate(u.__dict__) for u in users]


@router.post("/approve")
def approve(payload: HostApprovalIn, me: User = Depends(require_user), db: Session = Depends(get_db)):
  user = db.get(User, payload.user_id)
  if not user or user.invited_by_user_id != me.id:
    raise HTTPException(status_code=404, detail="Usuário não encontrado")
  if payload.approve:
    user.status = "APPROVED"
    if user.level == "STAR_1":
      user.level = "STAR_2"
  else:
    user.status = "SUSPENDED"
  db.add(user)
  db.commit()
  return {"ok": True}

