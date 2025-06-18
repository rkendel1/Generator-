# backend/app/services/github.py

import httpx

async def fetch_trending(language: str, period: str = "daily"):
    url = f"https://ghapi.huchen.dev/repositories?language={language}&since={period}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()
