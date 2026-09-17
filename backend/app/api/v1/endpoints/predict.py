from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.prediction import (
    ReadmissionPredictionRequest,
    ReadmissionPredictionResponse,
    PatientHistoryRecordResponse,
    SamplePatientCase
)
from app.services.prediction_service import ReadmissionPredictionService
from app.repositories.prediction_repository import PredictionRepository

router = APIRouter()

@router.post("", response_model=ReadmissionPredictionResponse, summary="Predict Diabetic Readmission Risk")
def predict_readmission_risk(request: ReadmissionPredictionRequest, db: Session = Depends(get_db)):
    """
    Evaluates 30-day diabetic patient readmission risk probability, SHAP feature contributions,
    and tailored clinical discharge recommendations. Automatically persists the assessment to the database log.
    """
    try:
        response = ReadmissionPredictionService.predict_readmission(request)
        # Auto-persist to database log
        try:
            PredictionRepository.save_prediction(db, request, response)
        except Exception as db_err:
            print(f"[PredictEndpoint] Warning: Failed to persist prediction log to DB: {db_err}")
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.post("/batch", response_model=List[ReadmissionPredictionResponse], summary="Batch Predict Readmission Risk")
def predict_batch_readmission_risk(requests: List[ReadmissionPredictionRequest], db: Session = Depends(get_db)):
    """
    Evaluates a batch of diabetic patient clinical encounter records.
    Returns readmission risk scores, confidence intervals, and SHAP features for each patient.
    """
    try:
        results = []
        for req in requests:
            res = ReadmissionPredictionService.predict_readmission(req)
            results.append(res)
            try:
                PredictionRepository.save_prediction(db, req, res)
            except Exception as db_err:
                pass
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")


@router.get("/history", response_model=List[PatientHistoryRecordResponse], summary="Get Patient Prediction History Log")
def get_prediction_history(limit: int = 50, db: Session = Depends(get_db)):
    """
    Returns recent patient readmission risk evaluation logs persisted in the database.
    """
    try:
        return PredictionRepository.get_history(db, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch prediction history: {str(e)}")

@router.get("/sample-cases", response_model=List[SamplePatientCase], summary="Get Sample Patient Clinical Profiles")
def get_sample_patient_cases():
    """
    Returns pre-configured clinical patient profiles (High Risk, Moderate Risk, Low Risk)
    for interactive UI testing.
    """
    return ReadmissionPredictionService.get_sample_cases()
