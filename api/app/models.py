import datetime as dt

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
  pass


class User(Base):
  __tablename__ = "users"

  id: Mapped[str] = mapped_column(String, primary_key=True)
  full_name: Mapped[str] = mapped_column(String, nullable=False)
  email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
  cpf: Mapped[str] = mapped_column(String, unique=True, nullable=False)
  photo_url: Mapped[str] = mapped_column(String, nullable=False)
  status: Mapped[str] = mapped_column(String, nullable=False)
  level: Mapped[str] = mapped_column(String, nullable=False)
  invited_by_user_id: Mapped[str | None] = mapped_column(String, nullable=True)
  wallet_name: Mapped[str] = mapped_column(String, nullable=False)
  password_hash: Mapped[str] = mapped_column(String, nullable=False)
  is_host: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
  created_at: Mapped[dt.datetime] = mapped_column(DateTime, nullable=False, default=dt.datetime.utcnow)


class AdminUser(Base):
  __tablename__ = "admin_users"

  username: Mapped[str] = mapped_column(String, primary_key=True)
  password_hash: Mapped[str] = mapped_column(String, nullable=False)
  created_at: Mapped[dt.datetime] = mapped_column(DateTime, nullable=False, default=dt.datetime.utcnow)


class Invitation(Base):
  __tablename__ = "invitations"

  id: Mapped[str] = mapped_column(String, primary_key=True)
  token: Mapped[str] = mapped_column(String, unique=True, nullable=False)
  invited_by_user_id: Mapped[str | None] = mapped_column(String, nullable=True)
  person_name: Mapped[str] = mapped_column(String, nullable=False)
  person_email: Mapped[str] = mapped_column(String, nullable=False)
  person_cpf: Mapped[str | None] = mapped_column(String, nullable=True)
  status: Mapped[str] = mapped_column(String, nullable=False)
  used_by_user_id: Mapped[str | None] = mapped_column(String, nullable=True)
  created_at: Mapped[dt.datetime] = mapped_column(DateTime, nullable=False, default=dt.datetime.utcnow)
  used_at: Mapped[dt.datetime | None] = mapped_column(DateTime, nullable=True)


class BusinessItem(Base):
  __tablename__ = "business_items"

  id: Mapped[str] = mapped_column(String, primary_key=True)
  seller_user_id: Mapped[str] = mapped_column(String, nullable=False)
  title: Mapped[str] = mapped_column(String, nullable=False)
  description: Mapped[str] = mapped_column(String, nullable=False)
  price_brl_cents: Mapped[int] = mapped_column(Integer, nullable=False)
  price_sats: Mapped[int] = mapped_column(Integer, nullable=False)
  image_url: Mapped[str | None] = mapped_column(String, nullable=True)
  created_at: Mapped[dt.datetime] = mapped_column(DateTime, nullable=False, default=dt.datetime.utcnow)


class Transaction(Base):
  __tablename__ = "transactions"

  id: Mapped[str] = mapped_column(String, primary_key=True)
  buyer_user_id: Mapped[str] = mapped_column(String, nullable=False)
  seller_user_id: Mapped[str] = mapped_column(String, nullable=False)
  business_item_id: Mapped[str] = mapped_column(String, nullable=False)
  amount_sats: Mapped[int] = mapped_column(Integer, nullable=False)
  status: Mapped[str] = mapped_column(String, nullable=False)
  txid: Mapped[str | None] = mapped_column(String, nullable=True)
  created_at: Mapped[dt.datetime] = mapped_column(DateTime, nullable=False, default=dt.datetime.utcnow)
  confirmed_at: Mapped[dt.datetime | None] = mapped_column(DateTime, nullable=True)
