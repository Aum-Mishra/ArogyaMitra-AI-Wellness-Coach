from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MealDetail(BaseModel):
    day: int
    breakfast: dict
    lunch: dict
    dinner: dict
    snacks: dict

class MealPlanRequest(BaseModel):
    diet_type: str
    calories: float
    allergies: Optional[str] = None
    number_of_days: int = 7

class MealPlanResponse(BaseModel):
    id: int
    user_id: int
    plan_json: str
    calories: float
    diet_type: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class MealProgressRequest(BaseModel):
    meal_name: str

class MealProgressResponse(BaseModel):
    id: int
    user_id: int
    meal_name: str
    completed: bool
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class MealCompletionRequest(BaseModel):
    meal_name: str
    completed: bool
