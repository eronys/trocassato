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

  # Bitcoin Core (regtest em DEV). `datadir` é só documentação; o RPC usa host/porta.
  bitcoin_skip_integration: bool = Field(default=False, validation_alias="BITCOIN_SKIP_INTEGRATION")
  bitcoin_rpc_host: str = Field(default="127.0.0.1", validation_alias="BITCOIN_RPC_HOST")
  bitcoin_rpc_port: int = Field(default=18443, validation_alias="BITCOIN_RPC_PORT")
  bitcoin_rpc_user: str = Field(default="dev", validation_alias="BITCOIN_RPC_USER")
  bitcoin_rpc_password: str = Field(default="devmode", validation_alias="BITCOIN_RPC_PASSWORD")
  bitcoin_datadir: str | None = Field(
    default="/home/dev/bitcoin-regtest-node1",
    validation_alias="BITCOIN_RPC_DATADIR",
  )
  bitcoin_zmq_rawtx: str = Field(default="tcp://127.0.0.1:28332", validation_alias="BITCOIN_ZMQ_RAWTX")
  bitcoin_zmq_rawblock: str = Field(default="tcp://127.0.0.1:28333", validation_alias="BITCOIN_ZMQ_RAWBLOCK")
  bitcoin_regtest_fund_blocks: int = Field(default=101, validation_alias="BITCOIN_REGTEST_FUND_BLOCKS")

  model_config = SettingsConfigDict(
    env_file=str(Path(__file__).resolve().parents[1] / ".env"),
    env_file_encoding="utf-8",
    extra="ignore",
  )


@lru_cache
def get_settings() -> Settings:
  return Settings()
