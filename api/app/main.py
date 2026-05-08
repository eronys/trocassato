from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .bootstrap import bootstrap_admin
from .db import get_db, get_engine
from .models import Base
from .routes import admin, admin_auth, auth, catalog, host, onboarding, simulate


def create_app() -> FastAPI:
  app = FastAPI(title="TROCASSATO API", version="0.1.0")

  app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^http://(localhost|127\\.0\\.0\\.1|\\d+\\.\\d+\\.\\d+\\.\\d+):5173$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
  )

  app.include_router(auth.router)
  app.include_router(admin_auth.router)
  app.include_router(onboarding.router)
  app.include_router(catalog.router)
  app.include_router(host.router)
  app.include_router(admin.router)
  app.include_router(simulate.router)

  @app.on_event("startup")
  def _on_startup() -> None:
    Base.metadata.create_all(bind=get_engine())
    db = next(get_db())
    try:
      bootstrap_admin(db)
    finally:
      db.close()

  @app.get("/health")
  def health():
    return {"ok": True}

  return app


app = create_app()
