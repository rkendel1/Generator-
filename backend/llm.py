import os
import httpx

GROQ_TOKEN = os.getenv("GROQ_TOKEN")

async def call_groq(prompt: str):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.groq.com/v1/infer",
            json={"prompt": prompt},
            headers={"Authorization": f"Bearer {GROQ_TOKEN}"}
        )
        resp.raise_for_status()
        return resp.json()
