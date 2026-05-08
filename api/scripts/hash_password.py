import sys

from passlib.context import CryptContext


def main() -> int:
  pwd = sys.argv[1] if len(sys.argv) > 1 else ""
  if not pwd:
    print("usage: python api/scripts/hash_password.py <senha>")
    return 2
  ctx = CryptContext(schemes=["argon2"], deprecated="auto")
  print(ctx.hash(pwd))
  return 0


if __name__ == "__main__":
  raise SystemExit(main())
