import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import require_user
from ..models import BusinessItem, Transaction, User
from ..schemas import BusinessItemCreateIn, BusinessItemOut, CheckoutConfirmIn, TransactionOut
from ..services.price import brl_cents_to_sats


router = APIRouter(prefix="/api", tags=["catalog"])


@router.get("/catalog/items", response_model=list[BusinessItemOut])
def list_items(db: Session = Depends(get_db)):
  items = db.execute(select(BusinessItem).order_by(BusinessItem.created_at.desc())).scalars().all()
  return [BusinessItemOut.model_validate(i.__dict__) for i in items]


@router.get("/items/{item_id}", response_model=BusinessItemOut)
def get_item(item_id: str, db: Session = Depends(get_db)):
  item = db.get(BusinessItem, item_id)
  if not item:
    raise HTTPException(status_code=404, detail="Item não encontrado")
  return BusinessItemOut.model_validate(item.__dict__)


@router.post("/items", response_model=BusinessItemOut)
async def create_item(payload: BusinessItemCreateIn, user: User = Depends(require_user), db: Session = Depends(get_db)):
  if user.status != "APPROVED":
    raise HTTPException(status_code=403, detail="Acesso restrito")
  if user.level not in ("STAR_2", "STAR_3", "STAR_4"):
    raise HTTPException(status_code=403, detail="Nível insuficiente")
  sats = await brl_cents_to_sats(payload.price_brl_cents)
  item = BusinessItem(
    id=str(uuid.uuid4()),
    seller_user_id=user.id,
    title=payload.title,
    description=payload.description,
    price_brl_cents=payload.price_brl_cents,
    price_sats=sats,
    image_url=payload.image_url,
  )
  db.add(item)
  db.commit()
  db.refresh(item)
  return BusinessItemOut.model_validate(item.__dict__)


@router.post("/checkout/confirm", response_model=TransactionOut)
def checkout_confirm(payload: CheckoutConfirmIn, buyer: User = Depends(require_user), db: Session = Depends(get_db)):
  if buyer.status != "APPROVED":
    raise HTTPException(status_code=403, detail="Aguarde aprovação do anfitrião")
  item = db.get(BusinessItem, payload.business_item_id)
  if not item:
    raise HTTPException(status_code=404, detail="Item não encontrado")
  tx = Transaction(
    id=str(uuid.uuid4()),
    buyer_user_id=buyer.id,
    seller_user_id=item.seller_user_id,
    business_item_id=item.id,
    amount_sats=item.price_sats,
    status="BROADCAST",
    txid=str(uuid.uuid4()).replace("-", "")[:32],
  )
  db.add(tx)
  db.commit()
  db.refresh(tx)
  return TransactionOut.model_validate(tx.__dict__)


@router.get("/profile/transactions", response_model=list[TransactionOut])
def profile_transactions(user: User = Depends(require_user), db: Session = Depends(get_db)):
  txs = (
    db.execute(
      select(Transaction).where((Transaction.buyer_user_id == user.id) | (Transaction.seller_user_id == user.id)).order_by(Transaction.created_at.desc())
    )
    .scalars()
    .all()
  )
  return [TransactionOut.model_validate(t.__dict__) for t in txs]
