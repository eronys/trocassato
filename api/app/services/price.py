import httpx

from ..config import get_settings


async def brl_cents_to_sats(brl_cents: int) -> int:
  settings = get_settings()
  brl = brl_cents / 100
  try:
    async with httpx.AsyncClient(timeout=5) as client:
      res = await client.get(
        f"{settings.coingecko_base_url}/simple/price",
        params={"ids": "bitcoin", "vs_currencies": "brl"},
      )
      res.raise_for_status()
      data = res.json()
      btc_brl = float(data["bitcoin"]["brl"])
      sats_per_brl = int(100_000_000 / btc_brl)
      return max(1, int(brl * sats_per_brl))
  except Exception:
    return max(1, int(brl))
