from app.ai.groq_client import groq_client
from app.utils.prompt_templates import WORKOUT_GENERATION_PROMPT
from sqlalchemy.orm import Session
from app.models.workout_plan import WorkoutPlan
from app.models.health_profile import HealthProfile
import json

class WorkoutGeneratorService:
    
    @staticmethod
    def generate_workout_plan(
        user_id: int,
        goal: str,
        fitness_level: str,
        workout_type: str,
        time_available: int,
        db: Session
    ) -> dict:
        """Generate a 7-day workout plan using Groq LLM"""
        
        # Get user's health profile for workout preference
        health_profile = db.query(HealthProfile).filter(
            HealthProfile.user_id == user_id
        ).first()
        workout_preference = health_profile.workout_preference if health_profile else "home"
        
        # Create prompt
        prompt = WORKOUT_GENERATION_PROMPT.format(
            goal=goal,
            fitness_level=fitness_level,
            workout_type=workout_type,
            time_available=time_available,
            workout_preference=workout_preference
        )
        
        # Generate plan from LLM
        plan_data = groq_client.generate_json_response(prompt)
        plan_json = json.dumps(plan_data)
        
        # Save to database
        workout_plan = WorkoutPlan(
            user_id=user_id,
            plan_json=plan_json
        )
        db.add(workout_plan)
        db.commit()
        db.refresh(workout_plan)
        
        return {
            "id": workout_plan.id,
            "user_id": workout_plan.user_id,
            "plan": plan_data,
            "created_at": str(workout_plan.created_at)
        }
    
    @staticmethod
    def get_user_workout_plan(user_id: int, db: Session) -> dict:
        """Get the most recent workout plan for a user"""
        plan = db.query(WorkoutPlan).filter(
            WorkoutPlan.user_id == user_id
        ).order_by(WorkoutPlan.created_at.desc()).first()
        
        if not plan:
            return None
        
        return {
            "id": plan.id,
            "user_id": plan.user_id,
            "plan": json.loads(plan.plan_json),
            "created_at": str(plan.created_at),
            "updated_at": str(plan.updated_at)
        }
    
    @staticmethod
    def format_plan_for_display(plan_data: dict) -> list:
        """Format plan data for frontend display"""
        if not plan_data:
            return []
        
        plan = plan_data.get("plan", [])
        formatted = []
        
        for day_data in plan:
            day_item = {
                "day": day_data.get("day"),
                "date": day_data.get("date"),
                "warmup": day_data.get("warmup"),
                "exercises": day_data.get("exercises", []),
                "cooldown": day_data.get("cooldown"),
                "tip": day_data.get("tip"),
                "youtube_link": day_data.get("youtube_link")
            }
            formatted.append(day_item)
        
        return formatted
