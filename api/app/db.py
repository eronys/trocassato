from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Iterator

from sqlalchemy import create_engine
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

