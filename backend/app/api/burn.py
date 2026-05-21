import asyncio
import json

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..db import get_db, SessionLocal
from ..models import BurnJob, Disc
from ..schemas.burn import BurnJobOut

router = APIRouter()


@router.post("/{disc_id}", response_model=BurnJobOut, status_code=201)
def queue_burn(disc_id: str, request: Request, db: Session = Depends(get_db)):
    disc = db.get(Disc, disc_id)
    if not disc:
        raise HTTPException(404, "Disc not found")
    if not disc.tracks:
        raise HTTPException(400, "Disc has no tracks")

    not_ready = [dt.track for dt in disc.tracks if dt.track.status != "ready"]
    if not_ready:
        raise HTTPException(400, f"{len(not_ready)} track(s) are not ready yet")

    job = BurnJob(disc_id=disc_id)
    db.add(job)
    db.commit()
    db.refresh(job)

    request.app.state.job_queue.put_nowait(job.id)
    return BurnJobOut.model_validate(job)


@router.get("", response_model=list[BurnJobOut])
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(BurnJob).order_by(BurnJob.created_at.desc()).all()
    return [BurnJobOut.model_validate(j) for j in jobs]


@router.get("/{job_id}", response_model=BurnJobOut)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.get(BurnJob, job_id)
    if not job:
        raise HTTPException(404, "Burn job not found")
    return BurnJobOut.model_validate(job)


@router.get("/{job_id}/status")
async def job_status_stream(job_id: str):
    async def generator():
        while True:
            db = SessionLocal()
            try:
                job = db.get(BurnJob, job_id)
                if not job:
                    yield f"data: {json.dumps({'error': 'not found'})}\n\n"
                    break
                data = {
                    "status": job.status,
                    "progress": job.progress_percent,
                    "log": job.log_output,
                    "error": job.error_message,
                }
                yield f"data: {json.dumps(data)}\n\n"
                if job.status in ("done", "error"):
                    break
            finally:
                db.close()
            await asyncio.sleep(1)

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.patch("/{job_id}/confirm", response_model=BurnJobOut)
def confirm_disc_inserted(job_id: str, db: Session = Depends(get_db)):
    job = db.get(BurnJob, job_id)
    if not job:
        raise HTTPException(404, "Burn job not found")
    if job.status != "awaiting_disc":
        raise HTTPException(400, "Job is not waiting for a disc")
    job.status = "burning"
    db.commit()
    db.refresh(job)
    return BurnJobOut.model_validate(job)


@router.delete("/{job_id}", status_code=204)
def cancel_job(job_id: str, db: Session = Depends(get_db)):
    job = db.get(BurnJob, job_id)
    if not job:
        raise HTTPException(404, "Burn job not found")
    if job.status != "queued":
        raise HTTPException(400, "Only queued jobs can be cancelled")
    db.delete(job)
    db.commit()
