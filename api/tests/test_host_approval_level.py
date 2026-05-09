import os
import tempfile
import unittest


class HostApprovalLevelTests(unittest.IsolatedAsyncioTestCase):
  async def test_host_approval_promotes_to_star_2(self):
    with tempfile.TemporaryDirectory() as td:
      db_path = os.path.join(td, "test.db")
      os.environ["APP_ENV"] = "dev"
      os.environ["DATABASE_PATH"] = db_path
      os.environ["AUTH_JWT_SECRET"] = "test-secret"
      os.environ["BITCOIN_SKIP_INTEGRATION"] = "1"
      os.environ["ADMIN_USERNAME"] = "admin"
      os.environ["ADMIN_PASSWORD"] = "123"
      os.environ["ADMIN_PASSWORD_HASH"] = ""

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

      async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        r = await c.post("/api/admin/auth/login", json={"username": "admin", "password": "123"})
        self.assertEqual(r.status_code, 200)

        inv_host = await c.post(
          "/api/admin/invitations",
          json={
            "person_name": "Host",
            "person_email": "host@example.com",
            "person_cpf": "11111111111",
            "invited_by_user_id": None,
          },
        )
        self.assertEqual(inv_host.status_code, 200)
        host_token = inv_host.json()["token"]

        ob_host = await c.post(
          "/api/onboarding/finish",
          json={
            "invite_token": host_token,
            "full_name": "Host",
            "email": "host@example.com",
            "cpf": "11111111111",
            "password": "hostpass1",
          },
        )
        self.assertEqual(ob_host.status_code, 200)
        host_id = ob_host.json()["id"]

        mk_host = await c.post(f"/api/admin/users/{host_id}/host", json={"is_host": True})
        self.assertEqual(mk_host.status_code, 200)

        login_host = await c.post("/api/auth/login", json={"email": "host@example.com", "password": "hostpass1"})
        self.assertEqual(login_host.status_code, 200)

        inv_user = await c.post(
          "/api/host/invitations",
          json={"person_name": "User", "person_email": "user@example.com", "person_cpf": "22222222222"},
        )
        self.assertEqual(inv_user.status_code, 200)
        user_token = inv_user.json()["token"]

        ob_user = await c.post(
          "/api/onboarding/finish",
          json={
            "invite_token": user_token,
            "full_name": "User",
            "email": "user@example.com",
            "cpf": "22222222222",
            "password": "userpass1",
          },
        )
        self.assertEqual(ob_user.status_code, 200)
        user_id = ob_user.json()["id"]
        self.assertEqual(ob_user.json()["level"], "STAR_1")

        approve = await c.post("/api/host/approve", json={"user_id": user_id, "approve": True})
        self.assertEqual(approve.status_code, 200)

        users = await c.get("/api/admin/users")
        self.assertEqual(users.status_code, 200)
        u = next(x for x in users.json() if x["id"] == user_id)
        self.assertEqual(u["status"], "APPROVED")
        self.assertEqual(u["level"], "STAR_2")

      get_engine().dispose()


if __name__ == "__main__":
  unittest.main()
