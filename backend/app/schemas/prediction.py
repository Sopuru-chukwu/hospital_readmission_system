from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class ReadmissionPredictionRequest(BaseModel):
    patient_name: Optional[str] = Field(default="Anonymous Patient", description="Patient name or ID")
    age_bracket: str = Field(default="[60-70)", description="Age group bracket")
    gender: str = Field(default="Female", description="Gender")
    race: str = Field(default="Caucasian", description="Race / Ethnicity")
    time_in_hospital: int = Field(default=4, ge=1, le=14, description="Days spent in hospital")
    num_lab_procedures: int = Field(default=45, ge=1, le=132, description="Number of lab tests performed")
    num_procedures: int = Field(default=1, ge=0, le=6, description="Number of non-lab procedures")
    num_medications: int = Field(default=15, ge=1, le=81, description="Number of distinct medications administered")
    number_outpatient: int = Field(default=0, ge=0, le=40, description="Outpatient visits in past year")
    number_emergency: int = Field(default=0, ge=0, le=76, description="Emergency room visits in past year")
    number_inpatient: int = Field(default=1, ge=0, le=21, description="Inpatient admissions in past year")
    number_diagnoses: int = Field(default=7, ge=1, le=16, description="Number of diagnoses entered to system")
    max_glu_serum: str = Field(default="None", description="Glucose serum test result: None, Norm, >200, >300")
    a1c_result: str = Field(default=">8", description="A1C result: None, Norm, >7, >8")
    change_med: str = Field(default="Ch", description="Change in diabetic medication: Ch (Changed), No")
    diabetes_med: str = Field(default="Yes", description="Diabetic medication prescribed: Yes, No")
    primary_diagnosis: str = Field(default="Diabetes", description="Primary ICD-9 diagnosis category")
    discharge_disposition: str = Field(default="Discharged to Home", description="Discharge location/status")

class FeatureImpact(BaseModel):
    feature_name: str
    feature_value: str
    impact_score: float  # SHAP value
    direction: str  # 'increase' or 'decrease'
    description: str

class ClinicalRecommendation(BaseModel):
    category: str
    title: str
    description: str
    priority: str  # 'High', 'Medium', 'Low'

class ReadmissionPredictionResponse(BaseModel):
    readmission_risk_score: float
    risk_category: str
    risk_level: str
    confidence_interval: List[float]
    feature_impacts: List[FeatureImpact]
    recommendations: List[ClinicalRecommendation]
    dataset_benchmark_percentile: float

class PatientHistoryRecordResponse(BaseModel):
    id: int
    patient_name: str
    age_bracket: str
    gender: str
    time_in_hospital: int
    num_medications: int
    number_inpatient: int
    number_emergency: int
    a1c_result: str
    primary_diagnosis: str
    discharge_disposition: str
    risk_score: float
    risk_category: str
    risk_level: str
    top_feature_impact: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class SamplePatientCase(BaseModel):
    id: str
    name: str
    badge: str
    description: str
    patient_data: ReadmissionPredictionRequest
