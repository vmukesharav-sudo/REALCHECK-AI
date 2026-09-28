import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "REALCHECK AI"
    ENVIRONMENT: str = "development"
    
    # Security
    SECRET_KEY: str = "change-this-in-production"
    
    # Database
    DATABASE_URL: str = "sqlite:///./realcheck.db"
    
    # Storage
    STORAGE_PROVIDER: str = "local"
    
    # Celery & Redis
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    CELERY_TASK_ALWAYS_EAGER: bool = False
    
    # ML & Detectors
    ENABLE_DEMO_MODE: bool = True
    
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        extra="ignore"
    )

settings = Settings()
