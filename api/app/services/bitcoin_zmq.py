"""Assinante ZMQ (rawtx / rawblock) para mempool e confirmações on-chain."""
from __future__ import annotations

import datetime as dt
import logging
import threading
from typing import TYPE_CHECKING

if TYPE_CHECKING:
  from ..config import Settings

log = logging.getLogger(__name__)

_thread: threading.Thread | None = None
_stop = threading.Event()


def start_bitcoin_zmq_listener() -> None:
  global _thread
  from ..config import get_settings

  s = get_settings()
  if s.bitcoin_skip_integration:
    return
  if _thread is not None and _thread.is_alive():
    return
  _stop.clear()
  _thread = threading.Thread(target=_run, args=(s,), name="bitcoin-zmq", daemon=True)
  _thread.start()
  log.info("Bitcoin ZMQ: escutando rawtx=%s rawblock=%s", s.bitcoin_zmq_rawtx, s.bitcoin_zmq_rawblock)


def stop_bitcoin_zmq_listener() -> None:
  _stop.set()
  t = _thread
  if t is not None and t.is_alive():
    t.join(timeout=3.0)


def _run(settings: Settings) -> None:
  import zmq
  from sqlalchemy import select

  from ..db import get_sessionmaker
  from ..models import Transaction
  from ..services.bitcoin_core import block_hash_from_header, get_bitcoin_rpc, txid_from_raw_tx

  sub_tx = None
  sub_blk = None
  try:
    ctx = zmq.Context.instance()
    sub_tx = ctx.socket(zmq.SUB)
    sub_tx.connect(settings.bitcoin_zmq_rawtx)
    sub_tx.setsockopt(zmq.SUBSCRIBE, b"rawtx")

    sub_blk = ctx.socket(zmq.SUB)
    sub_blk.connect(settings.bitcoin_zmq_rawblock)
    sub_blk.setsockopt(zmq.SUBSCRIBE, b"rawblock")

    poller = zmq.Poller()
    poller.register(sub_tx, zmq.POLLIN)
    poller.register(sub_blk, zmq.POLLIN)

    while not _stop.is_set():
      try:
        socks = dict(poller.poll(500))
      except zmq.ZMQError:
        break
      if sub_tx in socks:
        _drain_rawtx(sub_tx, txid_from_raw_tx, get_sessionmaker, select, Transaction)
      if sub_blk in socks:
        _drain_rawblock(sub_blk, block_hash_from_header, get_bitcoin_rpc, get_sessionmaker, select, Transaction)
  except Exception:
    log.exception("Bitcoin ZMQ: listener encerrado com erro")
  finally:
    for sock in (sub_tx, sub_blk):
      if sock is not None:
        try:
          sock.close(0)
        except Exception:
          pass


def _drain_rawtx(sock, txid_from_raw, get_sm, select, TxModel) -> None:
  import zmq

  while True:
    try:
      parts = sock.recv_multipart(flags=zmq.NOBLOCK)
    except zmq.Again:
      break
    if len(parts) < 2:
      continue
    raw = parts[1]
    try:
      txid = txid_from_raw(raw)
    except Exception:
      continue
    SessionLocal = get_sm()
    db = SessionLocal()
    try:
      row = db.scalars(select(TxModel).where(TxModel.txid == txid, TxModel.status == "BROADCAST")).first()
      if row:
        log.debug("Bitcoin ZMQ rawtx: tx %s no mempool", txid)
    finally:
      db.close()


def _drain_rawblock(sock, block_hash_fn, get_rpc, get_sm, select, TxModel) -> None:
  import zmq

  while True:
    try:
      parts = sock.recv_multipart(flags=zmq.NOBLOCK)
    except zmq.Again:
      break
    if len(parts) < 2:
      continue
    raw = parts[1]
    if len(raw) < 80:
      continue
    block_hash = block_hash_fn(raw)
    if not block_hash:
      continue
    rpc = get_rpc()
    try:
      blk = rpc.call("getblock", [block_hash, 1])
    except Exception as e:
      log.warning("Bitcoin ZMQ: getblock %s falhou: %s", block_hash, e)
      continue
    txids = blk.get("tx") or []
    if not txids:
      continue
    confirmed = set(txids)
    SessionLocal = get_sm()
    db = SessionLocal()
    try:
      rows = db.scalars(select(TxModel).where(TxModel.status == "BROADCAST", TxModel.txid.isnot(None))).all()
      now = dt.datetime.utcnow()
      changed = False
      for t in rows:
        if t.txid and t.txid in confirmed:
          t.status = "CONFIRMED"
          t.confirmed_at = now
          db.add(t)
          changed = True
      if changed:
        db.commit()
        log.info("Bitcoin ZMQ rawblock: bloco %s… — confirmações atualizadas", block_hash[:16])
    finally:
      db.close()
