from typing import Optional
from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password

class UserRepository:
    _initialized = False

    @classmethod
    def ensure_tables_created(cls, db: Session):
        if not cls._initialized:
            try:
                Base.metadata.create_all(bind=engine)
                cls._initialized = True
                cls.seed_demo_users(db)
            except Exception as e:
                print(f"[UserRepository] Error creating tables: {e}")

    @classmethod
    def get_by_email(cls, db: Session, email: str) -> Optional[User]:
        cls.ensure_tables_created(db)
        return db.query(User).filter(User.email.ilike(email.strip())).first()

    @classmethod
    def get_by_id(cls, db: Session, user_id: int) -> Optional[User]:
        cls.ensure_tables_created(db)
        return db.query(User).filter(User.id == user_id).first()

    @classmethod
    def create_user(cls, db: Session, user_in: UserCreate) -> User:
        cls.ensure_tables_created(db)
        hashed_pw = get_password_hash(user_in.password)
        db_user = User(
            full_name=user_in.full_name,
            email=user_in.email.strip().lower(),
            hashed_password=hashed_pw,
            role=user_in.role,
            hospital_name=user_in.hospital_name or "Lagos State University Teaching Hospital (LUTH)",
            is_active=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @classmethod
    def authenticate(cls, db: Session, email: str, password: str) -> Optional[User]:
        user = cls.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    @classmethod
    def seed_demo_users(cls, db: Session):
        """Pre-seeds clinical demo accounts if not present."""
        demo_accounts = [
            {
                "full_name": "Dr. Babatunde Ogunlesi",
                "email": "dr.babatunde@hospital.ng",
                "password": "password123",
                "role": "Physician",
                "hospital_name": "Lagos State University Teaching Hospital (LUTH)"
            },
            {
                "full_name": "Nurse Chioma Adebayo",
                "email": "nurse.chioma@phc.ng",
                "password": "password123",
                "role": "Nurse",
                "hospital_name": "Abuja Central Primary Health Center (PHC)"
            },
            {
                "full_name": "Admin Emeka Kalu",
                "email": "admin@diapredict.ai",
                "password": "password123",
                "role": "Administrator",
                "hospital_name": "DiaPredict Health Systems HQ"
            }
        ]

        for acc in demo_accounts:
            existing = db.query(User).filter(User.email == acc["email"]).first()
            if not existing:
                try:
                    hashed_pw = get_password_hash(acc["password"])
                    user = User(
                        full_name=acc["full_name"],
                        email=acc["email"],
                        hashed_password=hashed_pw,
                        role=acc["role"],
                        hospital_name=acc["hospital_name"],
                        is_active=True
                    )
                    db.add(user)
                    db.commit()
                    print(f"[UserRepository] Pre-seeded clinical demo account: {acc['email']}")
                except Exception as e:
                    db.rollback()
                    print(f"[UserRepository] Could not seed account {acc['email']}: {e}")
