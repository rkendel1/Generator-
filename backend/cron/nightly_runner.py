import asyncio
import os
from app.services.pitch_generation import run_nightly_pipeline

if __name__ == "__main__":
    asyncio.run(run_nightly_pipeline())
