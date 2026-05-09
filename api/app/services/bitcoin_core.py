"""Cliente JSON-RPC para Bitcoin Core (regtest / mainnet)."""
from __future__ import annotations

import hashlib
import re
from decimal import Decimal
from typing import Any
from urllib.parse import quote

import httpx

from ..config import Settings, get_settings


class BitcoinRPCError(RuntimeError):
  """Erro retornado pelo nó via JSON-RPC."""

  def __init__(self, code: int | None, message: str):
    self.code = code
    self.message = message
    super().__init__(message)


def txid_from_raw_tx(raw: bytes) -> str:
  return hashlib.sha256(hashlib.sha256(raw).digest()).digest()[::-1].hex()


def block_hash_from_header(header: bytes) -> str:
  if len(header) < 80:
    return ""
  return hashlib.sha256(hashlib.sha256(header[:80]).digest()).digest()[::-1].hex()


def normalize_wallet_name(wallet_name: str, user_id: str) -> str:
  """Nome aceito pelo Bitcoin Core (máx. 64 caracteres)."""
  base = re.sub(r"[^a-zA-Z0-9_-]", "_", (wallet_name or "").strip())
  if len(base) < 1:
    base = "u" + user_id.replace("-", "")
  return base[:64]


class BitcoinRPC:
  def __init__(self, settings: Settings):
    self._settings = settings
    self._base = f"http://{settings.bitcoin_rpc_host}:{settings.bitcoin_rpc_port}"
    self._auth = (settings.bitcoin_rpc_user, settings.bitcoin_rpc_password)
    self._client = httpx.Client(timeout=120.0)

  def close(self) -> None:
    self._client.close()

  def call(self, method: str, params: list[Any] | dict[str, Any] | None = None, *, wallet: str | None = None) -> Any:
    if params is None:
      params = []
    url = self._base
    if wallet is not None:
      url = f"{self._base}/wallet/{quote(wallet, safe='')}"
    r = self._client.post(
      url,
      auth=self._auth,
      json={"jsonrpc": "1.0", "id": "trocassato", "method": method, "params": params},
      headers={"Content-Type": "application/json"},
    )
    try:
      data = r.json()
    except Exception:
      r.raise_for_status()
      raise

    err = data.get("error")
    if err:
      code = err.get("code") if isinstance(err, dict) else None
      msg = err.get("message") if isinstance(err, dict) else str(err)
      raise BitcoinRPCError(code, str(msg))
    return data.get("result")


_rpc_singleton: BitcoinRPC | None = None


def get_bitcoin_rpc() -> BitcoinRPC:
  global _rpc_singleton
  s = get_settings()
  if _rpc_singleton is None:
    _rpc_singleton = BitcoinRPC(s)
  return _rpc_singleton


def reset_bitcoin_rpc() -> None:
  global _rpc_singleton
  if _rpc_singleton is not None:
    _rpc_singleton.close()
    _rpc_singleton = None


def ensure_user_wallet(rpc: BitcoinRPC, wallet_name: str) -> None:
  try:
    rpc.call("createwallet", [wallet_name, False, False, "", False, True])
  except BitcoinRPCError as e:
    msg = str(e).lower()
    if "already exists" in msg:
      _load_wallet_ignore_loaded(rpc, wallet_name)
    else:
      raise


def _load_wallet_ignore_loaded(rpc: BitcoinRPC, wallet_name: str) -> None:
  try:
    rpc.call("loadwallet", [wallet_name])
  except BitcoinRPCError as e2:
    if "already loaded" in str(e2).lower():
      return
    raise


def fund_regtest_address(rpc: BitcoinRPC, address: str, blocks: int) -> None:
  rpc.call("generatetoaddress", [max(1, blocks), address])


def send_payment_to_address(rpc: BitcoinRPC, buyer_wallet: str, seller_address: str, amount_sats: int) -> str:
  amount_btc = (Decimal(amount_sats) / Decimal(10**8)).quantize(Decimal("0.00000001"))
  if amount_btc <= 0:
    raise BitcoinRPCError(None, "Valor em sats inválido")
  # Passamos os argumentos nomeados (como dict) para definir o fee_rate explicitamente
  return str(rpc.call("sendtoaddress", {"address": seller_address, "amount": format(amount_btc, "f"), "fee_rate": 2.0}, wallet=buyer_wallet))
