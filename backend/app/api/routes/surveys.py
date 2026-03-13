from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.db.database import get_db
from app.db import models
from app.schemas.schemas import SurveyCreate, SurveyOut
from app.core.security import get_current_user, require_admin

router = APIRouter()


def _get_current_week_start() -> datetime:
    today = datetime.utcnow().date()
    monday = today - timedelta(days=today.weekday())
    return datetime(monday.year, monday.month, monday.day)


@router.post("/", response_model=SurveyOut, status_code=201)
def submit_survey(
    payload: SurveyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # One survey per user per week
    existing = (
        db.query(models.Survey)
        .filter(
            models.Survey.user_id == current_user.id,
            models.Survey.week_start == payload.week_start,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Survey already submitted for this week")

    slots_str = ",".join(payload.available_slots) if payload.available_slots else None
    survey = models.Survey(
        user_id=current_user.id,
        week_start=payload.week_start,
        available_slots=slots_str,
        preferred_location=payload.preferred_location,
        additional_volunteers=payload.additional_volunteers,
        notes=payload.notes,
    )
    db.add(survey)
    db.commit()
    db.refresh(survey)
    return survey


@router.get("/my", response_model=List[SurveyOut])
def my_surveys(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Survey)
        .filter(models.Survey.user_id == current_user.id)
        .order_by(models.Survey.week_start.desc())
        .all()
    )


@router.get("/current-week", response_model=Optional[SurveyOut])
def current_week_survey(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return current user's survey for the ongoing week, or null."""
    week_start = _get_current_week_start()
    return (
        db.query(models.Survey)
        .filter(
            models.Survey.user_id == current_user.id,
            models.Survey.week_start == week_start,
        )
        .first()
    )


# ── Admin endpoints ───────────────────────────────────────────────────────────

@router.get("/admin/all", response_model=List[SurveyOut])
def admin_all_surveys(
    week_start: Optional[datetime] = None,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """Admin: list all surveys, optionally filtered by week."""
    q = db.query(models.Survey)
    if week_start:
        q = q.filter(models.Survey.week_start == week_start)
    return q.order_by(models.Survey.week_start.desc()).all()


@router.get("/admin/with-notes", response_model=List[SurveyOut])
def surveys_with_notes(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    """Admin: return only surveys that have notes filled in."""
    return (
        db.query(models.Survey)
        .filter(models.Survey.notes.isnot(None), models.Survey.notes != "")
        .order_by(models.Survey.week_start.desc())
        .all()
    )