from typing import List
from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine
from app.models.patient_record import PatientPredictionRecord
from app.schemas.prediction import ReadmissionPredictionRequest, ReadmissionPredictionResponse

class PredictionRepository:
    _initialized = False

    @classmethod
    def ensure_tables_created(cls):
        if not cls._initialized:
            try:
                Base.metadata.create_all(bind=engine)
                cls._initialized = True
            except Exception as e:
                print(f"[PredictionRepository] Error creating tables: {e}")

    @classmethod
    def save_prediction(
        cls, 
        db: Session, 
        request: ReadmissionPredictionRequest, 
        response: ReadmissionPredictionResponse
    ) -> PatientPredictionRecord:
        cls.ensure_tables_created()
        top_impact = response.feature_impacts[0].description if response.feature_impacts else None

        record = PatientPredictionRecord(
            patient_name=request.patient_name or "Anonymous Patient",
            age_bracket=request.age_bracket,
            gender=request.gender,
            race=request.race,
            time_in_hospital=request.time_in_hospital,
            num_lab_procedures=request.num_lab_procedures,
            num_medications=request.num_medications,
            number_inpatient=request.number_inpatient,
            number_emergency=request.number_emergency,
            number_outpatient=request.number_outpatient,
            number_diagnoses=request.number_diagnoses,
            a1c_result=request.a1c_result,
            primary_diagnosis=request.primary_diagnosis,
            discharge_disposition=request.discharge_disposition,
            risk_score=response.readmission_risk_score,
            risk_category=response.risk_category,
            risk_level=response.risk_level,
            top_feature_impact=top_impact
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @classmethod
    def get_history(cls, db: Session, limit: int = 50) -> List[PatientPredictionRecord]:
        cls.ensure_tables_created()
        return (
            db.query(PatientPredictionRecord)
            .order_by(PatientPredictionRecord.created_at.desc())
            .limit(limit)
            .all()
        )
