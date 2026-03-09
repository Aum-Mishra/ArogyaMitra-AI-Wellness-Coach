from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class WorkoutProgress(Base):
    __tablename__ = "workout_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    day = Column(Integer)  # 1-7
    exercise = Column(String)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="workout_progress")

class MealProgress(Base):
    __tablename__ = "meal_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    meal_name = Column(String)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="meal_progress")

class ProgressLog(Base):
    __tablename__ = "progress_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    date = Column(DateTime, default=datetime.utcnow)
    weight = Column(Float, nullable=True)
    steps = Column(Integer, default=0)
    workout_completed = Column(Boolean, default=False)
    calories_consumed = Column(Float, nullable=True)
    water_intake = Column(Integer, default=0)  # in ml
    
    # Relationship
    user = relationship("User", back_populates="progress_logs")
