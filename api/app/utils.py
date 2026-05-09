import re


def level_to_star_count(level: str) -> int:
  return {"STAR_1": 1, "STAR_2": 2, "STAR_3": 3, "STAR_4": 4}.get(level, 1)


def wallet_name_from_identity(cpf: str, full_name: str) -> str:
  parts = [p for p in re.split(r"\s+", full_name.strip()) if p]
  first = parts[0] if parts else "user"
  last = parts[-1] if parts else "user"
  raw = f"{cpf}{first}{last}".lower()
  return re.sub(r"[^a-z0-9_]", "", raw)
