from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from app.db.models import UserRole, ShowType, EventStatus, VolunteerLocation


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    registration_code: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── User ──────────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    photo_path: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None


# ── Assignment ────────────────────────────────────────────────────────────────

class AssignmentCreate(BaseModel):
    name: str
    uses_tech_devices: bool = False
    notes: Optional[str] = None


class AssignmentOut(BaseModel):
    id: int
    name: str
    uses_tech_devices: bool
    notes: Optional[str]
    volunteers: List[UserOut] = []

    class Config:
        from_attributes = True


class AssignmentUpdate(BaseModel):
    name: Optional[str] = None
    uses_tech_devices: Optional[bool] = None
    notes: Optional[str] = None


# ── Event ─────────────────────────────────────────────────────────────────────

class EventCreate(BaseModel):
    name: str
    show_type: ShowType
    location: str
    status: EventStatus = EventStatus.SCHEDULED
    event_date: Optional[datetime] = None


class EventOut(BaseModel):
    id: int
    name: str
    show_type: ShowType
    location: str
    status: EventStatus
    event_date: Optional[datetime]
    assignments: List[AssignmentOut] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EventUpdate(BaseModel):
    name: Optional[str] = None
    show_type: Optional[ShowType] = None
    location: Optional[str] = None
    status: Optional[EventStatus] = None
    event_date: Optional[datetime] = None


# ── Survey ────────────────────────────────────────────────────────────────────

class SurveyCreate(BaseModel):
    week_start: datetime
    available_slots: Optional[List[str]] = []   # list of slot keys
    preferred_location: Optional[VolunteerLocation] = None
    additional_volunteers: int = 0
    notes: Optional[str] = None


class SurveyOut(BaseModel):
    id: int
    user_id: int
    week_start: datetime
    available_slots: Optional[str]
    preferred_location: Optional[VolunteerLocation]
    additional_volunteers: int
    notes: Optional[str]
    submitted_at: datetime
    user: UserOut

    class Config:
        from_attributes = True