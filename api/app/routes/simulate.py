import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import require_admin
from ..models import BusinessItem, Transaction, User
from ..schemas import AdminMineIn, AdminSimulateIn


router = APIRouter(prefix="/api/admin/simulate", tags=["admin-simulate"])


@router.post("/transactions")
def simulate_transactions(payload: AdminSimulateIn, _admin=Depends(require_admin), db: Session = Depends(get_db)):
  users = db.execute(select(User).where(User.status == "APPROVED")).scalars().all()
  items_q = select(BusinessItem)
  if payload.product_ids:
    items_q = items_q.where(BusinessItem.id.in_(payload.product_ids))
  items = db.execute(items_q).scalars().all()
  if not users or not items:
    raise HTTPException(status_code=400, detail="Sem usuários aprovados ou itens cadastrados")

  import random

  created = 0
  for _ in range(payload.tx_count):
    item = random.choice(items)
    buyer = random.choice(users)
    amount = random.randint(payload.min_sats, payload.max_sats)
    tx = Transaction(
      id=str(uuid.uuid4()),
      buyer_user_id=buyer.id,
      seller_user_id=item.seller_user_id,
      business_item_id=item.id,
      amount_sats=amount,
      status="BROADCAST",
      txid=str(uuid.uuid4()).replace("-", "")[:32],
    )
    db.add(tx)
    created += 1
  db.commit()
  return {"ok": True, "created": created}


@router.post("/mine")
def mine(payload: AdminMineIn, _admin=Depends(require_admin), db: Session = Depends(get_db)):
  txs = db.execute(select(Transaction).where(Transaction.status == "BROADCAST").order_by(Transaction.created_at.asc())).scalars().all()
  import datetime as dt

  now = dt.datetime.utcnow()
  confirmed = 0
  for t in txs:
    t.status = "CONFIRMED"
    t.confirmed_at = now
    db.add(t)
    confirmed += 1
  db.commit()
  return {"ok": True, "blocks": payload.blocks, "confirmed": confirmed}
