import asyncio
import os
import sys
sys.path.append('/app')
from app.services.pitch_generation import run_nightly_pipeline

if __name__ == "__main__":
    asyncio.run(run_nightly_pipeline())
