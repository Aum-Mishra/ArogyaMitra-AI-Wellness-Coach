from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.schemas.meal_schema import (
    MealPlanRequest, MealPlanResponse, MealCompletionRequest
)
from app.models.user import User
from app.models.meal_plan import MealPlan
from app.models.progress import MealProgress
from app.services.meal_generator import MealGeneratorService
from app.routes.user_routes import get_current_user

router = APIRouter(prefix="/meals", tags=["meals"])

@router.post("/generate-plan")
def generate_meal_plan(
    plan_request: MealPlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a 7-day personalized meal plan"""
    # Get health profile for allergies
    from app.models.health_profile import HealthProfile
    health_profile = db.query(HealthProfile).filter(
        HealthProfile.user_id == current_user.id
    ).first()
    
    allergies = health_profile.allergies if health_profile else None
    
    try:
        result = MealGeneratorService.generate_meal_plan(
            user_id=current_user.id,
            diet_type=plan_request.diet_type,
            calories=plan_request.calories,
            allergies=allergies,
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating plan: {str(e)}")

@router.get("/my-plan")
def get_my_meal_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's meal plan"""
    plan = MealGeneratorService.get_user_meal_plan(current_user.id, db)
    if not plan:
        raise HTTPException(status_code=404, detail="No meal plan found")
    
    return plan

@router.post("/complete-meal")
def mark_meal_complete(
    completion_data: MealCompletionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a meal as completed"""
    # Check if progress record exists
    progress = db.query(MealProgress).filter(
        MealProgress.user_id == current_user.id,
        MealProgress.meal_name == completion_data.meal_name
    ).first()
    
    if not progress:
        # Create new progress record
        progress = MealProgress(
            user_id=current_user.id,
            meal_name=completion_data.meal_name,
            completed=completion_data.completed,
            completed_at=datetime.utcnow() if completion_data.completed else None
        )
        db.add(progress)
    else:
        # Update existing record
        progress.completed = completion_data.completed
        progress.completed_at = datetime.utcnow() if completion_data.completed else None
    
    db.commit()
    db.refresh(progress)
    
    # Get completion percentage
    total_meals = db.query(MealProgress).filter(
        MealProgress.user_id == current_user.id
    ).count()
    completed = db.query(MealProgress).filter(
        MealProgress.user_id == current_user.id,
        MealProgress.completed == True
    ).count()
    
    percentage = (completed / total_meals * 100) if total_meals > 0 else 0
    
    return {
        "id": progress.id,
        "meal_name": progress.meal_name,
        "completed": progress.completed,
        "completion_percentage": percentage
    }

@router.get("/progress")
def get_meal_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's meal progress"""
    progress_records = db.query(MealProgress).filter(
        MealProgress.user_id == current_user.id
    ).all()
    
    total = len(progress_records)
    completed = sum(1 for p in progress_records if p.completed)
    
    return {
        "total_meals": total,
        "completed_meals": completed,
        "completion_percentage": (completed / total * 100) if total > 0 else 0,
        "records": [
            {
                "id": p.id,
                "meal_name": p.meal_name,
                "completed": p.completed,
                "completed_at": p.completed_at
            }
            for p in progress_records
        ]
    }
