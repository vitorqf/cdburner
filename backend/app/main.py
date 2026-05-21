import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .db import Base, engine
from .api import tracks, discs, burn
from .services.burner import run_burn_job


async def _burn_worker(queue: asyncio.Queue):
    while True:
        job_id: str = await queue.get()
        try:
            await run_burn_job(job_id)
        except Exception:
            pass
        finally:
            queue.task_done()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure storage dirs exist
    for path in (
        settings.uploads_path,
        settings.converted_path,
        settings.temp_path,
        settings.covers_path,
    ):
        path.mkdir(parents=True, exist_ok=True)

    Base.metadata.create_all(bind=engine)

    job_queue: asyncio.Queue = asyncio.Queue()
    app.state.job_queue = job_queue
    worker = asyncio.create_task(_burn_worker(job_queue))

    yield

    worker.cancel()
    try:
        await worker
    except asyncio.CancelledError:
        pass


app = FastAPI(title="CDburner API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tracks.router, prefix="/api/tracks", tags=["tracks"])
app.include_router(discs.router, prefix="/api/discs", tags=["discs"])
app.include_router(burn.router, prefix="/api/burn", tags=["burn"])

# Serve uploaded covers
app.mount("/storage", StaticFiles(directory=str(settings.storage_path)), name="storage")


@app.get("/health")
def health():
    return {"status": "ok"}
