from app.ai.groq_client import groq_client
from app.utils.prompt_templates import PLAN_ADJUSTMENT_PROMPT
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.workout_plan import WorkoutPlan
import json

class PlanAdjusterService:
    
    @staticmethod
    def adjust_workout_plan(
        user_id: int,
        constraint: str,
        reason: str = "",
        db: Session = None
    ) -> dict:
        """Adjust user's workout plan based on constraints"""
        
        user = db.query(User).filter(User.id == user_id).first()
        current_plan_obj = db.query(WorkoutPlan).filter(
            WorkoutPlan.user_id == user_id
        ).order_by(WorkoutPlan.created_at.desc()).first()
        
        if not current_plan_obj:
            return {"error": "No current workout plan found"}
        
        current_plan = json.loads(current_plan_obj.plan_json)
        
        # Create adjustment prompt
        prompt = PLAN_ADJUSTMENT_PROMPT.format(
            constraint=f"{constraint} - {reason}",
            fitness_level=user.fitness_level.value,
            time_available=60,
            current_plan=json.dumps(current_plan, indent=2)[:500]  # Limit context
        )
        
        # Generate adjusted plan
        adjusted_plan = groq_client.generate_json_response(prompt)
        adjusted_json = json.dumps(adjusted_plan)
        
        # Save adjusted plan
        new_plan = WorkoutPlan(
            user_id=user_id,
            plan_json=adjusted_json
        )
        db.add(new_plan)
        db.commit()
        db.refresh(new_plan)
        
        return {
            "id": new_plan.id,
            "adjustment_reason": f"{constraint}: {reason}",
            "plan": adjusted_plan,
            "created_at": str(new_plan.created_at)
        }
    
    @staticmethod
    def get_adjustment_suggestions(constraint_type: str) -> dict:
        """Get quick adjustment suggestions without LLM call"""
        suggestions = {
            "travelling": {
                "focus": "Bodyweight exercises",
                "examples": ["Push-ups", "Bodyweight squats", "Plank", "Burpees"],
                "duration": "20-30 minutes",
                "tip": "Hotel rooms are perfect for these workouts!"
            },
            "injury": {
                "focus": "Low-impact exercises",
                "examples": ["Walking", "Swimming", "Yoga", "Stretching"],
                "duration": "20-40 minutes",
                "tip": "Consult a physician before starting exercise after injury"
            },
            "tired": {
                "focus": "Active recovery",
                "examples": ["Light stretching", "Yoga", "Walking", "Foam rolling"],
                "duration": "15-25 minutes",
                "tip": "Get adequate rest and hydration"
            },
            "time": {
                "focus": "Quick HIIT workouts",
                "examples": ["Jump rope", "Burpees", "Mountain climbers", "High knees"],
                "duration": "15-20 minutes",
                "tip": "Intense short sessions can be very effective"
            },
            "equipment": {
                "focus": "Bodyweight training",
                "examples": ["Push-ups", "Pull-ups", "Squats", "Lunges"],
                "duration": "30-45 minutes",
                "tip": "Minimal equipment needed for effective workouts"
            }
        }
        
        return suggestions.get(constraint_type, suggestions["time"])
