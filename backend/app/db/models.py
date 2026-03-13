import enum
from datetime import datetime
from sqlalchemy import (
    Boolean, Column, DateTime, Enum, ForeignKey,
    Integer, String, Text, Table
)
from sqlalchemy.orm import relationship
from app.db.database import Base


# ── Enums ────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    VOLUNTEER = "volunteer"
    EMPLOYEE  = "employee"
    ADMIN     = "admin"


class ShowType(str, enum.Enum):
    EVENING = "evening"
    MATINEE = "matinee"


class EventStatus(str, enum.Enum):
    SCHEDULED  = "scheduled"
    ACTIVE     = "active"
    CANCELLED  = "cancelled"
    COMPLETED  = "completed"
    POSTPONED  = "postponed"


class VolunteerLocation(str, enum.Enum):
    UPTOWN   = "uptown"
    DOWNTOWN = "downtown"


# ── Association table: Event <-> Assignment ───────────────────────────────────

event_assignments = Table(
    "event_assignments",
    Base.metadata,
    Column("event_id",      Integer, ForeignKey("events.id"),      primary_key=True),
    Column("assignment_id", Integer, ForeignKey("assignments.id"), primary_key=True),
)

# ── Association table: Assignment <-> Volunteer ───────────────────────────────

assignment_volunteers = Table(
    "assignment_volunteers",
    Base.metadata,
    Column("assignment_id", Integer, ForeignKey("assignments.id"), primary_key=True),
    Column("user_id",       Integer, ForeignKey("users.id"),       primary_key=True),
)


# ── Models ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name     = Column(String(255), nullable=False)
    role          = Column(Enum(UserRole), nullable=False, default=UserRole.VOLUNTEER)
    photo_path    = Column(String(512), nullable=True)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime, default=datetime.utcnow)

    # Relationships
    surveys       = relationship("Survey",     back_populates="user",     cascade="all, delete-orphan")
    assignments   = relationship("Assignment", secondary=assignment_volunteers, back_populates="volunteers")


class Event(Base):
    __tablename__ = "events"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(255), nullable=False)
    show_type   = Column(Enum(ShowType), nullable=False)
    location    = Column(String(255), nullable=False)
    status      = Column(Enum(EventStatus), nullable=False, default=EventStatus.SCHEDULED)
    event_date  = Column(DateTime, nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assignments = relationship("Assignment", secondary=event_assignments, back_populates="events")


class Assignment(Base):
    __tablename__ = "assignments"

    id                   = Column(Integer, primary_key=True, index=True)
    name                 = Column(String(255), nullable=False)
    uses_tech_devices    = Column(Boolean, default=False, nullable=False)
    notes                = Column(Text, nullable=True)
    created_at           = Column(DateTime, default=datetime.utcnow)

    events               = relationship("Event",  secondary=event_assignments,      back_populates="assignments")
    volunteers           = relationship("User",   secondary=assignment_volunteers,   back_populates="assignments")


class Survey(Base):
    __tablename__ = "surveys"

    id                    = Column(Integer, primary_key=True, index=True)
    user_id               = Column(Integer, ForeignKey("users.id"), nullable=False)
    week_start            = Column(DateTime, nullable=False)         # Monday of the relevant week

    # Availability — stored as comma-separated time slots, e.g. "monday_morning,tuesday_evening"
    available_slots       = Column(String(1024), nullable=True)

    # Location preference
    preferred_location    = Column(Enum(VolunteerLocation), nullable=True)

    # How many extra people they're bringing
    additional_volunteers = Column(Integer, default=0)

    # Free-form notes visible to admins
    notes                 = Column(Text, nullable=True)

    submitted_at          = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="surveys")