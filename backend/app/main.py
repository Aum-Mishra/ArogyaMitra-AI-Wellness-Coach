from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routes import auth_routes, user_routes, workout_routes, meal_routes, aromi_routes, progress_routes
from app.models import User, HealthProfile, WorkoutPlan, MealPlan, WorkoutProgress, MealProgress, ProgressLog

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="ArogyaMitra API",
    description="AI-powered fitness and wellness platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(workout_routes.router)
app.include_router(meal_routes.router)
app.include_router(aromi_routes.router)
app.include_router(progress_routes.router)

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Welcome to ArogyaMitra API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "ok"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    )
