from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.db.base_class import Base

class PatientPredictionRecord(Base):
    __tablename__ = "patient_prediction_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_name = Column(String, index=True, default="Anonymous Patient")
    age_bracket = Column(String, default="[60-70)")
    gender = Column(String, default="Female")
    race = Column(String, default="Caucasian")
    time_in_hospital = Column(Integer, default=4)
    num_lab_procedures = Column(Integer, default=45)
    num_medications = Column(Integer, default=15)
    number_inpatient = Column(Integer, default=1)
    number_emergency = Column(Integer, default=0)
    number_outpatient = Column(Integer, default=0)
    number_diagnoses = Column(Integer, default=7)
    a1c_result = Column(String, default=">8")
    primary_diagnosis = Column(String, default="Diabetes")
    discharge_disposition = Column(String, default="Discharged to Home")
    
    # Prediction Results
    risk_score = Column(Float, nullable=False)
    risk_category = Column(String, nullable=False)
    risk_level = Column(String, nullable=False)
    top_feature_impact = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
