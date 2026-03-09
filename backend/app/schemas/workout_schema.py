from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ExerciseDetail(BaseModel):
    day: int
    warmup: str
    exercises: List[dict]
    rest: str
    youtube_link: Optional[str] = None
    tip: str

class WorkoutPlanRequest(BaseModel):
    goal: str
    fitness_level: str
    workout_type: str
    time_available: int

class WorkoutPlanResponse(BaseModel):
    id: int
    user_id: int
    plan_json: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class WorkoutProgressRequest(BaseModel):
    exercise: str
    day: int

class WorkoutProgressResponse(BaseModel):
    id: int
    user_id: int
    day: int
    exercise: str
    completed: bool
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class WorkoutCompletionRequest(BaseModel):
    exercise: str
    day: int
    completed: bool
