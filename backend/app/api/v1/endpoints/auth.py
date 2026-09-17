from fastapi import APIRouter, HTTPException, Depends, status, Header
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.db.session import get_db
from app.core.config import settings
from app.core.security import create_access_token, ALGORITHM
from app.schemas.user import LoginRequest, UserCreate, UserResponse, TokenResponse
from app.repositories.user_repository import UserRepository

router = APIRouter()

def get_current_user_from_token(authorization: str = Header(None), db: Session = Depends(get_db)) -> UserResponse:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization token"
        )
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token verification failed or expired")

    user = UserRepository.get_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.from_orm(user)

@router.post("/login", response_model=TokenResponse, summary="Clinical Staff Login")
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates clinical staff (Physicians, Nurses, Admins) and issues JWT access token.
    """
    user = UserRepository.authenticate(db, email=login_in.email, password=login_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is currently inactive")

    access_token = create_access_token(subject=user.email)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )

@router.post("/register", response_model=TokenResponse, summary="Register Clinical Staff")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new clinical staff user account.
    """
    existing = UserRepository.get_by_email(db, email=user_in.email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="An account with this email address already exists"
        )
    user = UserRepository.create_user(db, user_in=user_in)
    access_token = create_access_token(subject=user.email)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )

@router.get("/me", response_model=UserResponse, summary="Get Current Logged-in User Profile")
def get_me(current_user: UserResponse = Depends(get_current_user_from_token)):
    """
    Returns the authenticated user's profile details.
    """
    return current_user
