import datetime as dt

from jose import jwt
from passlib.context import CryptContext

from .config import get_settings


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
  return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
  return pwd_context.verify(password, password_hash)


def create_token(subject: str, scope: str) -> str:
  settings = get_settings()
  now = dt.datetime.utcnow()
  exp = now + dt.timedelta(seconds=settings.auth_token_ttl_seconds)
  payload = {"sub": subject, "scope": scope, "iat": int(now.timestamp()), "exp": int(exp.timestamp())}
  return jwt.encode(payload, settings.auth_jwt_secret, algorithm="HS256")


def decode_token(token: str) -> dict:
  settings = get_settings()
  return jwt.decode(token, settings.auth_jwt_secret, algorithms=["HS256"])
