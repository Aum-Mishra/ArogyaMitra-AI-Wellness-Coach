import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Database
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost:5432/arogyamitra"
    )
    
    # JWT
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    # CORS
    ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:3000"]
    
    # Groq AI
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    
    # API
    API_HOST = "0.0.0.0"
    API_PORT = 8000
    DEBUG = os.getenv("DEBUG", "True") == "True"

settings = Settings()
