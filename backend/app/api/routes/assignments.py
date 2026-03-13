from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.db import models
from app.schemas.schemas import AssignmentCreate, AssignmentOut, AssignmentUpdate
from app.core.security import get_current_user, require_admin

router = APIRouter()


@router.get("/", response_model=List[AssignmentOut])
def list_assignments(
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    return db.query(models.Assignment).all()


@router.get("/my", response_model=List[AssignmentOut])
def my_assignments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return assignments for the logged-in volunteer."""
    return current_user.assignments


@router.get("/{assignment_id}", response_model=AssignmentOut)
def get_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    a = db.query(models.Assignment).filter(models.Assignment.id == assignment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return a


@router.post("/", response_model=AssignmentOut, status_code=201)
def create_assignment(
    payload: AssignmentCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    assignment = models.Assignment(**payload.dict())
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.patch("/{assignment_id}", response_model=AssignmentOut)
def update_assignment(
    assignment_id: int,
    payload: AssignmentUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    a = db.query(models.Assignment).filter(models.Assignment.id == assignment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assignment not found")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(a, k, v)
    db.commit()
    db.refresh(a)
    return a


@router.delete("/{assignment_id}", status_code=204)
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    a = db.query(models.Assignment).filter(models.Assignment.id == assignment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(a)
    db.commit()


# ── Volunteer assignment management ──────────────────────────────────────────

@router.post("/{assignment_id}/volunteers/{user_id}", response_model=AssignmentOut)
def assign_volunteer(
    assignment_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    a = db.query(models.Assignment).filter(models.Assignment.id == assignment_id).first()
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not a or not user:
        raise HTTPException(status_code=404, detail="Assignment or User not found")
    if user not in a.volunteers:
        a.volunteers.append(user)
        db.commit()
        db.refresh(a)
    return a


@router.delete("/{assignment_id}/volunteers/{user_id}", response_model=AssignmentOut)
def unassign_volunteer(
    assignment_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    a = db.query(models.Assignment).filter(models.Assignment.id == assignment_id).first()
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not a or not user:
        raise HTTPException(status_code=404, detail="Assignment or User not found")
    if user in a.volunteers:
        a.volunteers.remove(user)
        db.commit()
        db.refresh(a)
    return a