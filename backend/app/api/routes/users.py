from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os, io
from PIL import Image

from app.db.database import get_db
from app.db import models
from app.schemas.schemas import UserOut, UserUpdate
from app.core.security import get_current_user, require_admin
from app.core.config import settings

router = APIRouter()


@router.get("/me", response_model=UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.get("/", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    return db.query(models.User).all()


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Only admins can update other users; users can update themselves (name only)
    if current_user.id != user_id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Forbidden")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = payload.dict(exclude_unset=True)

    # Non-admins cannot change role or active status
    if current_user.role != models.UserRole.ADMIN:
        update_data.pop("role", None)
        update_data.pop("is_active", None)

    for k, v in update_data.items():
        setattr(user, k, v)

    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/photo", response_model=UserOut)
def upload_photo(
    user_id: int,
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.id != user_id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Forbidden")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    contents = photo.file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img = img.resize((settings.PHOTO_RESIZE_WIDTH, settings.PHOTO_RESIZE_HEIGHT), Image.LANCZOS)

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filename = f"user_{user_id}.jpg"
    save_path = os.path.join(settings.UPLOAD_DIR, filename)
    img.save(save_path, "JPEG", quality=85)

    user.photo_path = f"/uploads/{filename}"
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(require_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()