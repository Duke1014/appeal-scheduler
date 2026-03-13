# RENAME THINGS FROM EVENTS TO SHOWS

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.db import models
from app.schemas.schemas import EventCreate, EventOut, EventUpdate
from app.core.security import get_current_user, require_admin

router = APIRouter()


@router.get("/", response_model=List[EventOut])
def list_events(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    return db.query(models.Event).order_by(models.Event.event_date).all()


@router.get("/{event_id}", response_model=EventOut)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("/", response_model=EventOut, status_code=201)
def create_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    event = models.Event(**payload.dict())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.patch("/{event_id}", response_model=EventOut)
def update_event(
    event_id: int,
    payload: EventUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(event, k, v)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=204)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()


# ── Assignment management within an event ────────────────────────────────────

@router.post("/{event_id}/assignments/{assignment_id}", response_model=EventOut)
def add_assignment_to_event(
    event_id: int,
    assignment_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    assignment = db.query(models.Assignment).filter(models.Assignment.id == assignment_id).first()
    if not event or not assignment:
        raise HTTPException(status_code=404, detail="Event or Assignment not found")
    if assignment not in event.assignments:
        event.assignments.append(assignment)
        db.commit()
        db.refresh(event)
    return event


@router.delete("/{event_id}/assignments/{assignment_id}", response_model=EventOut)
def remove_assignment_from_event(
    event_id: int,
    assignment_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    assignment = db.query(models.Assignment).filter(models.Assignment.id == assignment_id).first()
    if not event or not assignment:
        raise HTTPException(status_code=404, detail="Event or Assignment not found")
    if assignment in event.assignments:
        event.assignments.remove(assignment)
        db.commit()
        db.refresh(event)
    return event