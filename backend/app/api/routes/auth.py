import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from PIL import Image
import io

from app.db.database import get_db
from app.db import models
from app.schemas.schemas import RegisterRequest, TokenResponse, UserOut
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings

router = APIRouter()

# Map registration codes to roles
CODE_ROLE_MAP = {
    settings.VOLUNTEER_CODE: models.UserRole.VOLUNTEER,
    settings.EMPLOYEE_CODE:  models.UserRole.EMPLOYEE,
    settings.ADMIN_CODE:     models.UserRole.ADMIN,
}


@router.post("/register", response_model=UserOut, status_code=201)
def register(
    email: str = Form(...),
    password: str = Form(...),
    full_name: str = Form(...),
    registration_code: str = Form(...),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    # Validate registration code
    role = CODE_ROLE_MAP.get(registration_code)
    if not role:
        raise HTTPException(status_code=400, detail="Invalid registration code")

    # Check duplicate email
    if db.query(models.User).filter(models.User.email == email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    photo_path = None
    if photo:
        # Resize and save photo
        contents = photo.file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img = img.resize((settings.PHOTO_RESIZE_WIDTH, settings.PHOTO_RESIZE_HEIGHT), Image.LANCZOS)

        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        filename = f"{email.replace('@', '_').replace('.', '_')}.jpg"
        save_path = os.path.join(settings.UPLOAD_DIR, filename)
        img.save(save_path, "JPEG", quality=85)
        photo_path = f"/uploads/{filename}"

    user = models.User(
        email=email,
        hashed_password=get_password_hash(password),
        full_name=full_name,
        role=role,
        photo_path=photo_path,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token({"sub": user.id})
    return TokenResponse(access_token=token, user=UserOut.from_orm(user))