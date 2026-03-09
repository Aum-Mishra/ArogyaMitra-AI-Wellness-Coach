from app.ai.groq_client import groq_client
from app.utils.prompt_templates import AROMI_SYSTEM_PROMPT
from sqlalchemy.orm import Session
from app.models.user import User
from app.services.workout_generator import WorkoutGeneratorService
from app.services.meal_generator import MealGeneratorService
from typing import Optional

class AromichatService:
    
    @staticmethod
    def get_user_context(user_id: int, db: Session) -> str:
        """Get user's current context for AROMI"""
        user = db.query(User).filter(User.id == user_id).first()
        
        workout_plan = WorkoutGeneratorService.get_user_workout_plan(user_id, db)
        meal_plan = MealGeneratorService.get_user_meal_plan(user_id, db)
        
        context = f"""
User Profile:
- Name: {user.name}
- Age: {user.age}
- Gender: {user.gender}
- Height: {user.height} cm
- Weight: {user.weight} kg
- Fitness Level: {user.fitness_level.value}
- Goal: {user.goal.value}

Current Workout Plan: {workout_plan.get('plan') if workout_plan else 'Not generated yet'}

Current Meal Plan: {meal_plan.get('plan') if meal_plan else 'Not generated yet'}
"""
        return context
    
    @staticmethod
    def chat(
        user_id: int,
        message: str,
        db: Session,
        plan_context: str = ""
    ) -> str:
        """Send a message to AROMI and get a response"""
        
        # Get user context
        user_context = AromichatService.get_user_context(user_id, db)
        
        # Add plan context if provided
        full_context = user_context + plan_context
        
        # Prepare the full system prompt with user context
        system_prompt = AROMI_SYSTEM_PROMPT + "\n" + full_context
        
        # Get response from LLM
        response = groq_client.generate_response(
            prompt=message,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=1024
        )
        
        return response
    
    @staticmethod
    def detect_adjustment_request(message: str) -> Optional[dict]:
        """Detect if user is asking for plan adjustment"""
        message_lower = message.lower()
        
        # Check for common adjustment requests
        if "traveling" in message_lower or "travel" in message_lower:
            return {"type": "travelling", "constraint": "traveling"}
        elif "injury" in message_lower or "hurt" in message_lower:
            return {"type": "injury", "constraint": "injury"}
        elif "tired" in message_lower or "fatigue" in message_lower:
            return {"type": "tired", "constraint": "tired"}
        elif "short" in message_lower and "time" in message_lower:
            return {"type": "time", "constraint": "limited_time"}
        elif "home" in message_lower or "no equipment" in message_lower:
            return {"type": "equipment", "constraint": "no_equipment"}
        
        return None
