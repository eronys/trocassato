from pathlib import Path
from functools import lru_cache
import os

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  app_env: str = Field(default="dev", validation_alias="APP_ENV")

  @staticmethod
  def _default_database_path() -> str:
    if os.getenv("VERCEL") and not os.getenv("DATABASE_PATH"):
      return "/tmp/trocasato.db"
    return "./data/trocasato.db"

  database_path: str = Field(default_factory=_default_database_path, validation_alias="DATABASE_PATH")

  auth_jwt_secret: str = Field(validation_alias="AUTH_JWT_SECRET")
  auth_token_ttl_seconds: int = Field(default=86400, validation_alias="AUTH_TOKEN_TTL_SECONDS")

  admin_username: str = Field(default="admin", validation_alias="ADMIN_USERNAME")
  admin_password: str | None = Field(default=None, validation_alias="ADMIN_PASSWORD")
  admin_password_hash: str | None = Field(default=None, validation_alias="ADMIN_PASSWORD_HASH")

  coingecko_base_url: str = Field(default="https://api.coingecko.com/api/v3", validation_alias="COINGECKO_BASE_URL")

  model_config = SettingsConfigDict(
    env_file=str(Path(__file__).resolve().parents[1] / ".env"),
    env_file_encoding="utf-8",
    extra="ignore",
  )


@lru_cache
def get_settings() -> Settings:
  return Settings()
