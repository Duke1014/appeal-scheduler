# Appeal Scheduler

Volunteer scheduling and event management platform.

**Stack:** React + Vite + TypeScript (frontend) · FastAPI + PostgreSQL (backend)

---

## Quick Start

### 1. Database

```bash
createdb appeal_scheduler
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env           # Fill in your values

uvicorn main:app --reload
# API running at http://localhost:8000
# Docs at       http://localhost:8000/docs
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Running at http://localhost:5173
```

---

## Project Structure

```
appeal-scheduler/
├── backend/
│   ├── main.py                   # FastAPI entry point
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── api/routes/
│       │   ├── auth.py           # Register / Login
│       │   ├── users.py          # CRUD users + photo upload
│       │   ├── events.py         # CRUD events + assignment linking
│       │   ├── assignments.py    # CRUD assignments + volunteer linking
│       │   └── surveys.py        # Weekly survey submit + admin views
│       ├── core/
│       │   ├── config.py         # Settings / env vars
│       │   └── security.py       # JWT, password hashing, auth deps
│       ├── db/
│       │   ├── database.py       # SQLAlchemy engine + session
│       │   └── models.py         # All ORM models
│       └── schemas/
│           └── schemas.py        # All Pydantic schemas
└── frontend/
    └── src/
        ├── api/client.ts         # Axios API client
        ├── store/authContext.tsx  # JWT auth context
        ├── types/index.ts        # TypeScript types
        ├── components/
        │   ├── ui/index.tsx      # Button, Input, Card, Modal, Avatar...
        │   └── layout/AppLayout  # Sidebar navigation
        └── pages/
            ├── LoginPage.tsx
            ├── RegisterPage.tsx
            ├── DashboardPage.tsx
            ├── volunteer/
            │   ├── MyAssignmentsPage.tsx
            │   └── SurveyPage.tsx
            └── admin/
                ├── AdminDashboardPage.tsx
                ├── AdminUsersPage.tsx
                ├── AdminEventsPage.tsx
                ├── AdminAssignmentsPage.tsx
                └── AdminSurveysPage.tsx
```

---

## Registration Codes

Set in `backend/.env` — give the appropriate code to each new user:

| Role      | Default Code |
|-----------|-------------|
| Volunteer | `VOL-2024`  |
| Employee  | `EMP-2024`  |
| Admin     | `ADM-2024`  |

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register with code + optional photo |
| POST | `/api/auth/login` | Login → JWT |
| GET  | `/api/users/` | Admin: list all users |
| GET  | `/api/users/me` | Current user |
| PATCH | `/api/users/{id}` | Update user (admin or self) |
| POST | `/api/users/{id}/photo` | Upload/replace photo |
| GET  | `/api/events/` | List all events |
| POST | `/api/events/` | Admin: create event |
| POST | `/api/events/{id}/assignments/{aid}` | Link assignment to event |
| GET  | `/api/assignments/my` | Volunteer: my assignments |
| POST | `/api/assignments/{id}/volunteers/{uid}` | Admin: assign volunteer |
| POST | `/api/surveys/` | Submit weekly survey |
| GET  | `/api/surveys/current-week` | My survey this week |
| GET  | `/api/surveys/admin/all` | Admin: all surveys |
| GET  | `/api/surveys/admin/with-notes` | Admin: surveys with notes |

Full interactive docs: `http://localhost:8000/docs`

---

## Next Steps

- [ ] Run `alembic init alembic` and set up migrations for schema evolution
- [ ] Add event–assignment grid view on admin dashboard  
- [ ] Auto-deploy weekly surveys (APScheduler or Celery beat)
- [ ] Suggestion engine using survey data
- [ ] Show status push notifications (WebSocket or polling)
- [ ] Internal stage/position maps per event
