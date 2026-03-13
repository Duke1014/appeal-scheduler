from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/appeal_scheduler"

    # JWT
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_use_openssl_rand_hex_32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Registration codes (map code -> role)
    # In production, store these in the DB or env
    VOLUNTEER_CODE: str = "VOL-2024"
    EMPLOYEE_CODE: str = "EMP-2024"
    ADMIN_CODE: str = "ADM-2024"

    # Photo uploads
    UPLOAD_DIR: str = "uploads"
    MAX_PHOTO_SIZE_MB: int = 5
    PHOTO_RESIZE_WIDTH: int = 300
    PHOTO_RESIZE_HEIGHT: int = 300

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()