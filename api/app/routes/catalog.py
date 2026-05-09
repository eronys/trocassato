import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import get_settings
from ..db import get_db
from ..deps import require_user
from ..enrich import business_item_list_out, transaction_out
from ..models import BusinessItem, Transaction, User
from ..schemas import (
  BusinessItemCreateIn,
  BusinessItemListOut,
  BusinessItemOut,
  BusinessItemUpdateIn,
  CheckoutConfirmIn,
  TransactionOut,
)
from ..services.bitcoin_core import BitcoinRPCError, ensure_user_wallet, get_bitcoin_rpc, normalize_wallet_name, send_payment_to_address
from ..services.price import brl_cents_to_sats


router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("/items", response_model=list[BusinessItemListOut])
def list_items(db: Session = Depends(get_db)):
  items = (
    db.execute(select(BusinessItem).where(BusinessItem.is_deleted == False).order_by(BusinessItem.created_at.desc()))  # noqa: E712
    .scalars()
    .all()
  )
  return [business_item_list_out(db, i) for i in items]


@router.get("/items/{item_id}", response_model=BusinessItemListOut)
def get_item(item_id: str, db: Session = Depends(get_db)):
  item = db.get(BusinessItem, item_id)
  if not item or item.is_deleted:
    raise HTTPException(status_code=404, detail="Item não encontrado")
  return business_item_list_out(db, item)


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
    is_deleted=False,
  )
  db.add(item)
  db.commit()
  db.refresh(item)
  return BusinessItemOut.model_validate(item.__dict__)


@router.get("/my/items", response_model=list[BusinessItemOut])
def my_items(user: User = Depends(require_user), db: Session = Depends(get_db)):
  items = (
    db.execute(
      select(BusinessItem)
      .where(BusinessItem.seller_user_id == user.id, BusinessItem.is_deleted == False)  # noqa: E712
      .order_by(BusinessItem.created_at.desc())
    )
    .scalars()
    .all()
  )
  return [BusinessItemOut.model_validate(i.__dict__) for i in items]


@router.put("/items/{item_id}", response_model=BusinessItemOut)
async def update_item(item_id: str, payload: BusinessItemUpdateIn, user: User = Depends(require_user), db: Session = Depends(get_db)):
  item = db.get(BusinessItem, item_id)
  if not item or item.is_deleted:
    raise HTTPException(status_code=404, detail="Item não encontrado")
  if item.seller_user_id != user.id:
    raise HTTPException(status_code=403, detail="Acesso restrito")
  if user.status != "APPROVED":
    raise HTTPException(status_code=403, detail="Acesso restrito")
  if user.level not in ("STAR_2", "STAR_3", "STAR_4"):
    raise HTTPException(status_code=403, detail="Nível insuficiente")

  if payload.title is not None:
    item.title = payload.title
  if payload.description is not None:
    item.description = payload.description
  if payload.image_url is not None:
    item.image_url = payload.image_url
  if payload.price_brl_cents is not None:
    item.price_brl_cents = payload.price_brl_cents
    item.price_sats = await brl_cents_to_sats(payload.price_brl_cents)

  db.add(item)
  db.commit()
  db.refresh(item)
  return BusinessItemOut.model_validate(item.__dict__)


@router.delete("/items/{item_id}")
def delete_item(item_id: str, user: User = Depends(require_user), db: Session = Depends(get_db)):
  item = db.get(BusinessItem, item_id)
  if not item or item.is_deleted:
    raise HTTPException(status_code=404, detail="Item não encontrado")
  if item.seller_user_id != user.id:
    raise HTTPException(status_code=403, detail="Acesso restrito")
  item.is_deleted = True
  db.add(item)
  db.commit()
  return {"ok": True}


@router.post("/checkout/confirm", response_model=TransactionOut)
def checkout_confirm(payload: CheckoutConfirmIn, buyer: User = Depends(require_user), db: Session = Depends(get_db)):
  if buyer.status != "APPROVED":
    raise HTTPException(status_code=403, detail="Aguarde aprovação do anfitrião")
  item = db.get(BusinessItem, payload.business_item_id)
  if not item:
    raise HTTPException(status_code=404, detail="Item não encontrado")
  if buyer.id == item.seller_user_id:
    raise HTTPException(status_code=400, detail="Não é possível comprar o próprio item")
  seller = db.get(User, item.seller_user_id)
  if not seller:
    raise HTTPException(status_code=404, detail="Vendedor não encontrado")

  settings = get_settings()
  if settings.bitcoin_skip_integration:
    raise HTTPException(
      status_code=503,
      detail="Checkout requer Bitcoin Core. Este ambiente está com BITCOIN_SKIP_INTEGRATION.",
    )
  try:
    rpc = get_bitcoin_rpc()
    buyer_w = normalize_wallet_name(buyer.wallet_name, buyer.id)
    seller_w = normalize_wallet_name(seller.wallet_name, seller.id)
    ensure_user_wallet(rpc, buyer_w)
    ensure_user_wallet(rpc, seller_w)
    seller_address = rpc.call("getnewaddress", [""], wallet=seller_w)
    txid = send_payment_to_address(rpc, buyer_w, seller_address, item.price_sats)
  except BitcoinRPCError as e:
    raise HTTPException(status_code=400, detail=str(e)) from e

  tx = Transaction(
    id=str(uuid.uuid4()),
    buyer_user_id=buyer.id,
    seller_user_id=item.seller_user_id,
    business_item_id=item.id,
    amount_sats=item.price_sats,
    status="BROADCAST",
    txid=txid,
  )
  db.add(tx)
  db.commit()
  db.refresh(tx)
  return transaction_out(db, tx)


@router.get("", response_model=list[TransactionOut])
def profile_transactions(user: User = Depends(require_user), db: Session = Depends(get_db)):
  txs = (
    db.execute(
      select(Transaction).where((Transaction.buyer_user_id == user.id) | (Transaction.seller_user_id == user.id)).order_by(Transaction.created_at.desc())
    )
    .scalars()
    .all()
  )
  return [transaction_out(db, t) for t in txs]
