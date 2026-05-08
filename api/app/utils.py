import re


def wallet_name_from_identity(cpf: str, full_name: str) -> str:
  parts = [p for p in re.split(r"\s+", full_name.strip()) if p]
  first = parts[0] if parts else "user"
  last = parts[-1] if parts else "user"
  raw = f"{cpf}{first}{last}".lower()
  return re.sub(r"[^a-z0-9_]", "", raw)
