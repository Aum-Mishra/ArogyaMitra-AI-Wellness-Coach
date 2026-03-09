from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.workout_plan import WorkoutPlan
from app.models.meal_plan import MealPlan
from app.models.progress import WorkoutProgress, MealProgress
from app.services.aromi_chat import AromichatService
from app.services.plan_adjuster import PlanAdjusterService
from app.routes.user_routes import get_current_user
import json

router = APIRouter(prefix="/aromi", tags=["aromi"])

@router.post("/chat")
def aromi_chat(
    message_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message to AROMI and get a response"""
    user_message = message_data.get("message")
    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    try:
        # Check if user is asking for plan adjustment
        adjustment = AromichatService.detect_adjustment_request(user_message)
        
        # Get current plan progress
        current_workout_plan = db.query(WorkoutPlan).filter(
            WorkoutPlan.user_id == current_user.id
        ).order_by(WorkoutPlan.created_at.desc()).first()
        
        current_meal_plan = db.query(MealPlan).filter(
            MealPlan.user_id == current_user.id
        ).order_by(MealPlan.created_at.desc()).first()
        
        completed_workouts = db.query(WorkoutProgress).filter(
            WorkoutProgress.user_id == current_user.id,
            WorkoutProgress.completed == True
        ).count()
        
        completed_meals = db.query(MealProgress).filter(
            MealProgress.user_id == current_user.id,
            MealProgress.completed == True
        ).count()
        
        plan_context = f"\nCurrent Progress:\n- Completed Workouts: {completed_workouts}\n- Completed Meals: {completed_meals}"
        
        if adjustment:
            # Get quick suggestions for adjustment
            suggestions = PlanAdjusterService.get_adjustment_suggestions(adjustment["type"])
            
            response = f"""I've detected that you need {adjustment['constraint']} adjustments to your plan.

Here are immediate recommendations:
• Focus: {suggestions['focus']}
• Examples: {', '.join(suggestions['examples'])}
• Recommended Duration: {suggestions['duration']}
• Tip: {suggestions['tip']}

{plan_context}

Would you like me to generate an adjusted workout plan? Just say "Yes" or "Adjust my plan" and I'll create a new customized plan for you.

In the meantime, here are some tips:
- Stay hydrated and get adequate rest
- Listen to your body and don't push too hard
- Track your progress to see improvements over time
- Remember that consistency matters more than intensity"""
        else:
            # Get regular AI response with context
            response = AromichatService.chat(current_user.id, user_message, db, plan_context)
        
        return {
            "response": response,
            "user_id": current_user.id,
            "timestamp": "2024-03-08T12:00:00",
            "has_adjustment": bool(adjustment)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/apply-adjustment")
def apply_plan_adjustment(
    adjustment_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Apply a plan adjustment based on user's constraint"""
    constraint = adjustment_data.get("constraint")
    if not constraint:
        raise HTTPException(status_code=400, detail="Constraint is required")
    
    try:
        result = PlanAdjusterService.adjust_workout_plan(
            user_id=current_user.id,
            constraint=constraint,
            reason=adjustment_data.get("reason", "User requested adjustment via chat"),
            db=db
        )
        
        return {
            "success": True,
            "message": f"Your workout plan has been adjusted for {constraint}",
            "plan": result.get("plan"),
            "created_at": result.get("created_at")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error applying adjustment: {str(e)}")

@router.get("/suggestions")
def get_aromi_suggestions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get quick action suggestions for AROMI"""
    suggestions = [
        {"icon": "Dumbbell", "label": "Adjust workout plan", "color": "primary"},
        {"icon": "UtensilsCrossed", "label": "Suggest healthy meal", "color": "accent"},
        {"icon": "Heart", "label": "Recovery exercises", "color": "destructive"},
        {"icon": "TrendingUp", "label": "Track my progress", "color": "secondary"},
    ]
    
    return {"suggestions": suggestions}
