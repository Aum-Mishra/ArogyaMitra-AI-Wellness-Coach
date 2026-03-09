from app.ai.groq_client import groq_client
from app.utils.prompt_templates import MEAL_GENERATION_PROMPT
from sqlalchemy.orm import Session
from app.models.meal_plan import MealPlan
from app.models.health_profile import HealthProfile
import json

class MealGeneratorService:
    
    @staticmethod
    def generate_meal_plan(
        user_id: int,
        diet_type: str,
        calories: float,
        allergies: str = None,
        db: Session = None
    ) -> dict:
        """Generate a 7-day meal plan using Groq LLM"""
        
        allergies_str = allergies or "None"
        
        # Create prompt
        prompt = MEAL_GENERATION_PROMPT.format(
            diet_type=diet_type,
            calories=calories,
            allergies=allergies_str
        )
        
        # Generate plan from LLM
        plan_data = groq_client.generate_json_response(prompt)
        plan_json = json.dumps(plan_data)
        
        # Save to database
        meal_plan = MealPlan(
            user_id=user_id,
            plan_json=plan_json,
            calories=calories,
            diet_type=diet_type
        )
        db.add(meal_plan)
        db.commit()
        db.refresh(meal_plan)
        
        return {
            "id": meal_plan.id,
            "user_id": meal_plan.user_id,
            "plan": plan_data,
            "calories": meal_plan.calories,
            "diet_type": meal_plan.diet_type,
            "created_at": str(meal_plan.created_at)
        }
    
    @staticmethod
    def get_user_meal_plan(user_id: int, db: Session) -> dict:
        """Get the most recent meal plan for a user"""
        plan = db.query(MealPlan).filter(
            MealPlan.user_id == user_id
        ).order_by(MealPlan.created_at.desc()).first()
        
        if not plan:
            return None
        
        return {
            "id": plan.id,
            "user_id": plan.user_id,
            "plan": json.loads(plan.plan_json),
            "calories": plan.calories,
            "diet_type": plan.diet_type,
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
                "breakfast": day_data.get("breakfast"),
                "lunch": day_data.get("lunch"),
                "dinner": day_data.get("dinner"),
                "snacks": day_data.get("snacks")
            }
            formatted.append(day_item)
        
        return formatted
