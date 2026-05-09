import datetime as dt

from pydantic import BaseModel, EmailStr, Field


class PublicUser(BaseModel):
  id: str
  full_name: str
  email: EmailStr
  cpf: str
  photo_url: str
  status: str
  level: str
  invited_by_user_id: str | None
  wallet_name: str
  is_host: bool
  created_at: dt.datetime


class AuthLoginIn(BaseModel):
  email: EmailStr
  password: str


class AdminLoginIn(BaseModel):
  username: str
  password: str


class OnboardingFinishIn(BaseModel):
  invite_token: str
  full_name: str = Field(min_length=3, max_length=100)
  email: EmailStr
  cpf: str = Field(min_length=11, max_length=11)
  photo_url: str = Field(default="", max_length=500)
  password: str = Field(min_length=8, max_length=200)


class BusinessItemOut(BaseModel):
  id: str
  seller_user_id: str
  title: str
  description: str
  price_brl_cents: int
  price_sats: int
  image_url: str | None
  created_at: dt.datetime


class BusinessItemListOut(BusinessItemOut):
  seller_full_name: str
  seller_level: str
  seller_stars: int


class BusinessItemCreateIn(BaseModel):
  title: str = Field(min_length=1, max_length=50)
  description: str = Field(min_length=1, max_length=200)
  price_brl_cents: int = Field(ge=1)
  image_url: str | None = Field(default=None, max_length=500)


class BusinessItemUpdateIn(BaseModel):
  title: str | None = Field(default=None, min_length=1, max_length=50)
  description: str | None = Field(default=None, min_length=1, max_length=200)
  price_brl_cents: int | None = Field(default=None, ge=1)
  image_url: str | None = Field(default=None, max_length=500)


class InvitationOut(BaseModel):
  id: str
  token: str
  invited_by_user_id: str | None
  person_name: str
  person_email: EmailStr
  person_cpf: str | None
  status: str
  used_by_user_id: str | None
  created_at: dt.datetime
  used_at: dt.datetime | None


class InvitationCreateIn(BaseModel):
  person_name: str = Field(min_length=3, max_length=100)
  person_email: EmailStr
  person_cpf: str | None = Field(default=None, min_length=11, max_length=11)
  invited_by_user_id: str | None = None


class InvitationCreateByHostIn(BaseModel):
  person_name: str = Field(min_length=3, max_length=100)
  person_email: EmailStr
  person_cpf: str | None = Field(default=None, min_length=11, max_length=11)


class HostApprovalIn(BaseModel):
  user_id: str
  approve: bool


class TransactionOut(BaseModel):
  id: str
  buyer_user_id: str
  seller_user_id: str
  business_item_id: str
  amount_sats: int
  status: str
  txid: str | None
  created_at: dt.datetime
  confirmed_at: dt.datetime | None
  buyer_full_name: str | None = None
  seller_full_name: str | None = None
  business_item_title: str | None = None
  price_brl_cents: int | None = None


class CheckoutConfirmIn(BaseModel):
  business_item_id: str


class AdminSetUserStatusIn(BaseModel):
  status: str


class AdminSetUserLevelIn(BaseModel):
  level: str


class AdminSetHostIn(BaseModel):
  is_host: bool


class AdminSuspendIn(BaseModel):
  user_id: str


class InviteGraphOut(BaseModel):
  nodes: list[PublicUser]
  edges: list[tuple[str, str]]
