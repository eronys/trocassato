from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Iterator

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from .config import get_settings


def _ensure_parent_dir(db_path: str) -> None:
  p = Path(db_path)
  if p.parent and not p.parent.exists():
    p.parent.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_engine() -> Engine:
  settings = get_settings()
  _ensure_parent_dir(settings.database_path)
  return create_engine(f"sqlite:///{settings.database_path}", connect_args={"check_same_thread": False})


def ensure_sqlite_schema() -> None:
  """Migração mínima (sem Alembic) para DEV/SQLite."""
  eng = get_engine()
  with eng.begin() as conn:
    cols = conn.execute(text("PRAGMA table_info(business_items)")).fetchall()
    names = {r[1] for r in cols}  # (cid, name, type, notnull, dflt_value, pk)
    if "is_deleted" not in names:
      conn.execute(text("ALTER TABLE business_items ADD COLUMN is_deleted INTEGER NOT NULL DEFAULT 0"))


@lru_cache
def get_sessionmaker() -> sessionmaker:
  return sessionmaker(autocommit=False, autoflush=False, bind=get_engine())


def reset_db() -> None:
  get_sessionmaker.cache_clear()
  get_engine.cache_clear()


def get_db() -> Iterator[Session]:
  SessionLocal = get_sessionmaker()
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()

