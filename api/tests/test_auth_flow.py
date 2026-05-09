import os
import tempfile
import unittest


class AuthFlowTests(unittest.IsolatedAsyncioTestCase):
  async def test_admin_invite_onboarding_login(self):
    with tempfile.TemporaryDirectory() as td:
      db_path = os.path.join(td, "test.db")
      os.environ["APP_ENV"] = "dev"
      os.environ["DATABASE_PATH"] = db_path
      os.environ["AUTH_JWT_SECRET"] = "test-secret"
      os.environ["BITCOIN_SKIP_INTEGRATION"] = "1"

      from passlib.context import CryptContext

      ctx = CryptContext(schemes=["argon2"], deprecated="auto")
      os.environ["ADMIN_USERNAME"] = "admin"
      os.environ["ADMIN_PASSWORD"] = ""
      os.environ["ADMIN_PASSWORD_HASH"] = ctx.hash("admin1234")

      import httpx

      from api.app.bootstrap import bootstrap_admin
      from api.app.config import get_settings
      from api.app.db import get_engine, get_sessionmaker, reset_db
      from api.app.models import Base
      from api.app.main import create_app

      get_settings.cache_clear()
      reset_db()
      Base.metadata.create_all(bind=get_engine())
      SessionLocal = get_sessionmaker()
      db = SessionLocal()
      try:
        bootstrap_admin(db)
      finally:
        db.close()

      app = create_app()
      transport = httpx.ASGITransport(app=app)
      try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
          r = await c.post("/api/admin/auth/login", json={"username": "admin", "password": "admin1234"})
          self.assertEqual(r.status_code, 200)

          inv = await c.post(
            "/api/admin/invitations",
            json={
              "person_name": "Alice",
              "person_email": "alice@example.com",
              "person_cpf": "12345678901",
              "invited_by_user_id": None,
            },
          )
          self.assertEqual(inv.status_code, 200)
          token = inv.json()["token"]

          ob = await c.post(
            "/api/onboarding/finish",
            json={
              "invite_token": token,
              "full_name": "Alice",
              "email": "alice@example.com",
              "cpf": "12345678901",
              "password": "user12345",
            },
          )
          self.assertEqual(ob.status_code, 200)

          lu = await c.post("/api/auth/login", json={"email": "alice@example.com", "password": "user12345"})
          self.assertEqual(lu.status_code, 200)

          me = await c.get("/api/auth/me")
          self.assertEqual(me.status_code, 200)
          self.assertEqual(me.json()["status"], "PENDING_APPROVAL")
      finally:
        get_engine().dispose()


if __name__ == "__main__":
  unittest.main()
