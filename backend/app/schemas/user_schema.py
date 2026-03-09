from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    age: int
    gender: str
    height: float
    weight: float
    fitness_level: str = "beginner"
    goal: str = "general_fitness"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: int
    gender: str
    height: float
    weight: float
    fitness_level: str
    goal: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    fitness_level: Optional[str] = None
    goal: Optional[str] = None

class HealthProfileCreate(BaseModel):
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None
    diet_type: str = "vegetarian"
    daily_time_available: int = 60
    workout_preference: str = "home"

class HealthProfileResponse(BaseModel):
    id: int
    user_id: int
    allergies: Optional[str]
    medical_conditions: Optional[str]
    diet_type: str
    daily_time_available: int
    workout_preference: str
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
