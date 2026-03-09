from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user_schema import (
    UserResponse, UserUpdate, HealthProfileCreate, HealthProfileResponse
)
from app.models.user import User
from app.models.health_profile import HealthProfile
from app.utils.jwt_handler import decode_token

router = APIRouter(prefix="/users", tags=["users"])

def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated - missing Authorization header"
        )
    
    # Remove "Bearer " prefix if present
    token = authorization
    if token.startswith("Bearer "):
        token = token[7:]
    
    # Decode token
    decoded = decode_token(token)
    if not decoded:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Get user from database
    user_id = decoded.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token - missing user ID"
        )
    
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token - invalid user ID format"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user info"""
    return UserResponse.from_orm(current_user)

@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user info"""
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return UserResponse.from_orm(current_user)

@router.post("/health-profile", response_model=HealthProfileResponse)
def create_health_profile(
    profile_data: HealthProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update user's health profile"""
    # Check if profile exists
    existing_profile = db.query(HealthProfile).filter(
        HealthProfile.user_id == current_user.id
    ).first()
    
    if existing_profile:
        for field, value in profile_data.dict().items():
            setattr(existing_profile, field, value)
        db.commit()
        db.refresh(existing_profile)
        return HealthProfileResponse.from_orm(existing_profile)
    
    # Create new profile
    new_profile = HealthProfile(
        user_id=current_user.id,
        **profile_data.dict()
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    
    return HealthProfileResponse.from_orm(new_profile)

@router.get("/health-profile", response_model=HealthProfileResponse)
def get_health_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's health profile"""
    
    profile = db.query(HealthProfile).filter(
        HealthProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Health profile not found")
    
    return HealthProfileResponse.from_orm(profile)

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID (public endpoint)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse.from_orm(user)
