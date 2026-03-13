from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.routes import auth, users, events, assignments, surveys
from app.core.config import settings
from app.db.database import engine
from app.db import models

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Appeal Scheduler API",
    description="Volunteer scheduling and event management platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded photos
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Routers
app.include_router(auth.router,        prefix="/api/auth",        tags=["Auth"])
app.include_router(users.router,       prefix="/api/users",       tags=["Users"])
app.include_router(events.router,      prefix="/api/events",      tags=["Events"])
app.include_router(assignments.router, prefix="/api/assignments", tags=["Assignments"])
app.include_router(surveys.router,     prefix="/api/surveys",     tags=["Surveys"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}