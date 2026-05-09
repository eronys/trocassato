from contextlib import asynccontextmanager

from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from .bootstrap import bootstrap_admin
from .db import ensure_sqlite_schema, get_db, get_engine
from .models import Base
from .routes import admin, admin_auth, auth, catalog, host, invites, onboarding
from .services import bitcoin_zmq


@asynccontextmanager
async def lifespan(app: FastAPI):
  Base.metadata.create_all(bind=get_engine())
  ensure_sqlite_schema()
  db = next(get_db())
  try:
    bootstrap_admin(db)
  finally:
    db.close()
  bitcoin_zmq.start_bitcoin_zmq_listener()
  yield
  bitcoin_zmq.stop_bitcoin_zmq_listener()


def create_app() -> FastAPI:
    app = FastAPI(title="TROCASSATO API", version="0.1.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"^http://(localhost|127\.0\.0\.1|\d+\.\d+\.\d+\.\d+):5173$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Agregador com prefixo global
    api = APIRouter(prefix="/api")

    # Inclua TODOS os routers aqui (sem repetir "/api" neles)
    api.include_router(auth.router)
    api.include_router(admin_auth.router)
    api.include_router(onboarding.router)
    api.include_router(catalog.router)
    api.include_router(host.router)
    api.include_router(invites.router)
    api.include_router(admin.router)
    app.include_router(api)

    # Se quiser health também em /api/health, mova para o 'api'
    @app.get("/health")
    def health():
        return {"ok": True}

    return app

app = create_app()
