from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.models.progress import ProgressLog, WorkoutProgress, MealProgress
from app.routes.user_routes import get_current_user
import json

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard summary for today"""
    # Get today's progress
    today = datetime.utcnow().date()
    today_log = db.query(ProgressLog).filter(
        ProgressLog.user_id == current_user.id,
        ProgressLog.date >= datetime.combine(today, datetime.min.time()),
        ProgressLog.date < datetime.combine(today + timedelta(days=1), datetime.min.time())
    ).first()
    
    # Get today's workout progress
    workout_progress = db.query(WorkoutProgress).filter(
        WorkoutProgress.user_id == current_user.id
    ).all()
    
    # Get today's meal progress
    meal_progress = db.query(MealProgress).filter(
        MealProgress.user_id == current_user.id
    ).all()
    
    workout_completed = sum(1 for w in workout_progress if w.completed)
    workout_total = len(workout_progress)
    
    meal_completed = sum(1 for m in meal_progress if m.completed)
    meal_total = len(meal_progress)
    
    return {
        "user": {
            "name": current_user.name,
            "weight": current_user.weight,
            "goal": current_user.goal.value
        },
        "today": {
            "calories_consumed": today_log.calories_consumed if today_log else 0,
            "calories_goal": 2000,
            "water_intake": today_log.water_intake if today_log else 0,
            "steps": today_log.steps if today_log else 0,
            "workout_completed": today_log.workout_completed if today_log else False
        },
        "progress": {
            "workouts_completed": workout_completed,
            "workouts_total": workout_total,
            "workouts_percentage": (workout_completed / workout_total * 100) if workout_total > 0 else 0,
            "meals_completed": meal_completed,
            "meals_total": meal_total,
            "meals_percentage": (meal_completed / meal_total * 100) if meal_total > 0 else 0
        },
        "stats": {
            "weekly_workouts": workout_completed,
            "weekly_meals": meal_completed,
            "streak_days": 7,
            "total_progress": (workout_completed + meal_completed) / (workout_total + meal_total) * 100 if (workout_total + meal_total) > 0 else 0
        }
    }

@router.get("/weekly-stats")
def get_weekly_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get weekly statistics"""
    # Get past 7 days
    today = datetime.utcnow().date()
    week_data = []
    
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        logs = db.query(ProgressLog).filter(
            ProgressLog.user_id == current_user.id,
            ProgressLog.date >= datetime.combine(date, datetime.min.time()),
            ProgressLog.date < datetime.combine(date + timedelta(days=1), datetime.min.time())
        ).first()
        
        week_data.append({
            "day": date.strftime("%a"),
            "calories_consumed": logs.calories_consumed if logs else 0,
            "calories_burned": 420 + (i * 10),  # Mock data
            "weight": current_user.weight - (i * 0.1)  # Mock trending
        })
    
    return {"weekly_stats": week_data}

@router.post("/log-progress")
def log_progress(
    progress_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log daily progress"""
    today = datetime.utcnow().date()
    today_log = db.query(ProgressLog).filter(
        ProgressLog.user_id == current_user.id,
        ProgressLog.date >= datetime.combine(today, datetime.min.time()),
        ProgressLog.date < datetime.combine(today + timedelta(days=1), datetime.min.time())
    ).first()
    
    if not today_log:
        today_log = ProgressLog(user_id=current_user.id)
        db.add(today_log)
    
    if "weight" in progress_data:
        today_log.weight = progress_data["weight"]
    if "steps" in progress_data:
        today_log.steps = progress_data["steps"]
    if "calories_consumed" in progress_data:
        today_log.calories_consumed = progress_data["calories_consumed"]
    if "water_intake" in progress_data:
        today_log.water_intake = progress_data["water_intake"]
    if "workout_completed" in progress_data:
        today_log.workout_completed = progress_data["workout_completed"]
    
    db.commit()
    db.refresh(today_log)
    
    return {
        "status": "logged",
        "date": str(today),
        "data": {
            "weight": today_log.weight,
            "steps": today_log.steps,
            "calories_consumed": today_log.calories_consumed,
            "water_intake": today_log.water_intake
        }
    }
