from sqlalchemy import Column, Integer, String, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class DietType(str, enum.Enum):
    VEGETARIAN = "vegetarian"
    NON_VEGETARIAN = "non_vegetarian"
    VEGAN = "vegan"
    KETO = "keto"

class WorkoutPreference(str, enum.Enum):
    GYM = "gym"
    HOME = "home"
    OUTDOOR = "outdoor"
    MIXED = "mixed"

class HealthProfile(Base):
    __tablename__ = "health_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    allergies = Column(Text)  # JSON string
    medical_conditions = Column(Text)  # JSON string
    diet_type = Column(Enum(DietType), default=DietType.VEGETARIAN)
    daily_time_available = Column(Integer)  # in minutes
    workout_preference = Column(Enum(WorkoutPreference), default=WorkoutPreference.HOME)
    
    # Relationship
    user = relationship("User", back_populates="health_profile")
