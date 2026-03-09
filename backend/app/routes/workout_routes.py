from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.schemas.workout_schema import (
    WorkoutPlanRequest, WorkoutPlanResponse, WorkoutCompletionRequest
)
from app.models.user import User
from app.models.workout_plan import WorkoutPlan
from app.models.progress import WorkoutProgress
from app.services.workout_generator import WorkoutGeneratorService
from app.services.plan_adjuster import PlanAdjusterService
from app.routes.user_routes import get_current_user

router = APIRouter(prefix="/workouts", tags=["workouts"])

@router.post("/generate-plan")
def generate_workout_plan(
    plan_request: WorkoutPlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a 7-day personalized workout plan"""
    try:
        result = WorkoutGeneratorService.generate_workout_plan(
            user_id=current_user.id,
            goal=plan_request.goal,
            fitness_level=plan_request.fitness_level,
            workout_type=plan_request.workout_type,
            time_available=plan_request.time_available,
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating plan: {str(e)}")

@router.get("/my-plan")
def get_my_workout_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's workout plan"""
    plan = WorkoutGeneratorService.get_user_workout_plan(current_user.id, db)
    if not plan:
        raise HTTPException(status_code=404, detail="No workout plan found")
    
    return plan

@router.post("/complete-exercise")
def mark_exercise_complete(
    completion_data: WorkoutCompletionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark an exercise as completed"""
    # Check if progress record exists
    progress = db.query(WorkoutProgress).filter(
        WorkoutProgress.user_id == current_user.id,
        WorkoutProgress.exercise == completion_data.exercise,
        WorkoutProgress.day == completion_data.day
    ).first()
    
    if not progress:
        # Create new progress record
        progress = WorkoutProgress(
            user_id=current_user.id,
            day=completion_data.day,
            exercise=completion_data.exercise,
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
    total_exercises = db.query(WorkoutProgress).filter(
        WorkoutProgress.user_id == current_user.id
    ).count()
    completed = db.query(WorkoutProgress).filter(
        WorkoutProgress.user_id == current_user.id,
        WorkoutProgress.completed == True
    ).count()
    
    percentage = (completed / total_exercises * 100) if total_exercises > 0 else 0
    
    return {
        "id": progress.id,
        "exercise": progress.exercise,
        "completed": progress.completed,
        "completion_percentage": percentage
    }

@router.get("/progress")
def get_workout_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's workout progress"""
    progress_records = db.query(WorkoutProgress).filter(
        WorkoutProgress.user_id == current_user.id
    ).all()
    
    total = len(progress_records)
    completed = sum(1 for p in progress_records if p.completed)
    
    return {
        "total_exercises": total,
        "completed_exercises": completed,
        "completion_percentage": (completed / total * 100) if total > 0 else 0,
        "records": [
            {
                "id": p.id,
                "day": p.day,
                "exercise": p.exercise,
                "completed": p.completed,
                "completed_at": p.completed_at
            }
            for p in progress_records
        ]
    }

@router.post("/adjust-plan")
def adjust_workout_plan(
    adjustment_request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Adjust workout plan based on constraints"""
    constraint = adjustment_request.get("constraint")
    reason = adjustment_request.get("reason", "")
    
    try:
        result = PlanAdjusterService.adjust_workout_plan(
            user_id=current_user.id,
            constraint=constraint,
            reason=reason,
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adjusting plan: {str(e)}")

@router.get("/adjustment-suggestions/{constraint_type}")
def get_adjustment_suggestions(constraint_type: str):
    """Get quick adjustment suggestions"""
    suggestions = PlanAdjusterService.get_adjustment_suggestions(constraint_type)
    return suggestions
