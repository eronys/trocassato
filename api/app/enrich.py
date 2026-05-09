"""Monta DTOs de negócios e transações com dados relacionados (SQLAlchemy)."""
from __future__ import annotations

from sqlalchemy.orm import Session

from .models import BusinessItem, Transaction, User
from .schemas import BusinessItemListOut, TransactionOut
from .utils import level_to_star_count


def transaction_out(db: Session, t: Transaction) -> TransactionOut:
  buyer = db.get(User, t.buyer_user_id)
  seller = db.get(User, t.seller_user_id)
  item = db.get(BusinessItem, t.business_item_id)
  return TransactionOut(
    id=t.id,
    buyer_user_id=t.buyer_user_id,
    seller_user_id=t.seller_user_id,
    business_item_id=t.business_item_id,
    amount_sats=t.amount_sats,
    status=t.status,
    txid=t.txid,
    created_at=t.created_at,
    confirmed_at=t.confirmed_at,
    buyer_full_name=buyer.full_name if buyer else None,
    seller_full_name=seller.full_name if seller else None,
    business_item_title=item.title if item else None,
    price_brl_cents=item.price_brl_cents if item else None,
  )


def business_item_list_out(db: Session, item: BusinessItem) -> BusinessItemListOut:
  seller = db.get(User, item.seller_user_id)
  stars = level_to_star_count(seller.level) if seller else 1
  return BusinessItemListOut(
    id=item.id,
    seller_user_id=item.seller_user_id,
    title=item.title,
    description=item.description,
    price_brl_cents=item.price_brl_cents,
    price_sats=item.price_sats,
    image_url=item.image_url,
    created_at=item.created_at,
    seller_full_name=seller.full_name if seller else "—",
    seller_level=seller.level if seller else "STAR_1",
    seller_stars=stars,
  )
