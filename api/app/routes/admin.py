import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import require_admin
from ..models import Invitation, User
from ..schemas import (
  AdminSetHostIn,
  AdminSetUserLevelIn,
  AdminSetUserStatusIn,
  AdminSuspendIn,
  InvitationCreateIn,
  InvitationOut,
  InviteGraphOut,
  PublicUser,
)


router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/invitations", response_model=InvitationOut)
def create_invite(payload: InvitationCreateIn, _admin=Depends(require_admin), db: Session = Depends(get_db)):
  inv = Invitation(
    id=str(uuid.uuid4()),
    token=str(uuid.uuid4()).replace("-", ""),
    invited_by_user_id=payload.invited_by_user_id,
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


@router.get("/invitations", response_model=list[InvitationOut])
def list_invites(_admin=Depends(require_admin), db: Session = Depends(get_db)):
  invs = db.execute(select(Invitation).order_by(Invitation.created_at.desc())).scalars().all()
  return [InvitationOut.model_validate(i.__dict__) for i in invs]


@router.get("/users", response_model=list[PublicUser])
def list_users(_admin=Depends(require_admin), db: Session = Depends(get_db)):
  users = db.execute(select(User).order_by(User.created_at.desc())).scalars().all()
  return [PublicUser.model_validate(u.__dict__) for u in users]


@router.post("/users/{user_id}/status")
def set_user_status(user_id: str, payload: AdminSetUserStatusIn, _admin=Depends(require_admin), db: Session = Depends(get_db)):
  user = db.get(User, user_id)
  if not user:
    raise HTTPException(status_code=404, detail="Usuário não encontrado")
  user.status = payload.status
  if payload.status == "APPROVED" and user.level == "STAR_1":
    user.level = "STAR_2"
  db.add(user)
  db.commit()
  return {"ok": True}


@router.post("/users/{user_id}/level")
def set_user_level(user_id: str, payload: AdminSetUserLevelIn, _admin=Depends(require_admin), db: Session = Depends(get_db)):
  user = db.get(User, user_id)
  if not user:
    raise HTTPException(status_code=404, detail="Usuário não encontrado")
  user.level = payload.level
  db.add(user)
  db.commit()
  return {"ok": True}


@router.post("/users/{user_id}/host")
def set_user_host(user_id: str, payload: AdminSetHostIn, _admin=Depends(require_admin), db: Session = Depends(get_db)):
  user = db.get(User, user_id)
  if not user:
    raise HTTPException(status_code=404, detail="Usuário não encontrado")
  user.is_host = payload.is_host
  db.add(user)
  db.commit()
  return {"ok": True}


@router.post("/suspend")
def suspend(payload: AdminSuspendIn, _admin=Depends(require_admin), db: Session = Depends(get_db)):
  user = db.get(User, payload.user_id)
  if not user:
    raise HTTPException(status_code=404, detail="Usuário não encontrado")
  user.status = "SUSPENDED"
  db.add(user)
  db.commit()
  return {"ok": True}


@router.get("/invite-graph", response_model=InviteGraphOut)
def invite_graph(_admin=Depends(require_admin), db: Session = Depends(get_db)):
  users = db.execute(select(User)).scalars().all()
  nodes = [PublicUser.model_validate(u.__dict__) for u in users]
  edges: list[tuple[str, str]] = []
  for u in users:
    if u.invited_by_user_id:
      edges.append((u.invited_by_user_id, u.id))
  return InviteGraphOut(nodes=nodes, edges=edges)
