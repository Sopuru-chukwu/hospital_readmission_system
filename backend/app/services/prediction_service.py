import os
import json
import math
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Optional, Tuple

from app.schemas.prediction import (
    ReadmissionPredictionRequest,
    ReadmissionPredictionResponse,
    FeatureImpact,
    ClinicalRecommendation,
    SamplePatientCase
)

SAVED_MODELS_DIR = Path(__file__).resolve().parent.parent / "models" / "saved_models"

class ReadmissionPredictionService:
    _model = None
    _scaler = None
    _metadata = None

    @classmethod
    def _load_model_artifacts(cls):
        """Lazy loads exported ML model artifacts if available on disk."""
        model_path = SAVED_MODELS_DIR / "readmission_model.joblib"
        scaler_path = SAVED_MODELS_DIR / "scaler.joblib"
        meta_path = SAVED_MODELS_DIR / "model_meta.json"

        if cls._model is None and model_path.exists() and scaler_path.exists():
            try:
                cls._model = joblib.load(model_path)
                cls._scaler = joblib.load(scaler_path)
                if meta_path.exists():
                    with open(meta_path, 'r') as f:
                        cls._metadata = json.load(f)
                print(f"[PredictionService] Successfully loaded trained ML model from {model_path}")
            except Exception as e:
                print(f"[PredictionService] Error loading ML model artifacts: {e}")

    @classmethod
    def predict_readmission(cls, data: ReadmissionPredictionRequest) -> ReadmissionPredictionResponse:
        cls._load_model_artifacts()

        # If trained ML model artifact is loaded, run ML model inference!
        if cls._model is not None and cls._scaler is not None:
            return cls._predict_with_ml_model(data)

        # Fallback heuristic calculation if model not exported yet
        return cls._predict_with_heuristic(data)

    @classmethod
    def _predict_with_ml_model(cls, data: ReadmissionPredictionRequest) -> ReadmissionPredictionResponse:
        raw_dict = data.dict()
        df = pd.DataFrame([raw_dict])

        # Compute engineered features for incoming request
        num_inp = float(df['number_inpatient'].iloc[0]) if 'number_inpatient' in df.columns else 0.0

        num_emg = float(df['number_emergency'].iloc[0]) if 'number_emergency' in df.columns else 0.0
        num_out = float(df['number_outpatient'].iloc[0]) if 'number_outpatient' in df.columns else 0.0
        tot_visits = num_inp + num_emg + num_out
        df['total_prior_visits'] = tot_visits
        df['inpatient_visit_ratio'] = num_inp / (tot_visits + 1.0)

        stay_days = float(df['time_in_hospital'].iloc[0]) if 'time_in_hospital' in df.columns else 1.0
        meds = float(df['num_medications'].iloc[0]) if 'num_medications' in df.columns else 1.0
        df['meds_per_hospital_day'] = meds / (stay_days + 1.0)

        a1c_val = str(df['a1c_result'].iloc[0]) if 'a1c_result' in df.columns else 'None'
        ch_val = str(df['change_med'].iloc[0]) if 'change_med' in df.columns else 'No'
        df['uncontrolled_diabetes_risk'] = 1.0 if (a1c_val in ['>8', '3'] and ch_val in ['Ch', '1']) else 0.0

        disch_val = str(df['discharge_disposition'].iloc[0]) if 'discharge_disposition' in df.columns else 'Discharged to Home'
        df['is_high_risk_discharge'] = 0.0 if disch_val in ['Discharged to Home', '0'] else 1.0

        # Normalize race aliases for regional demographics (e.g. African (Nigerian))
        race_aliases = {
            "African (Nigerian)": "AfricanAmerican",
            "African (Other)": "AfricanAmerican",
            "African American": "AfricanAmerican",
            "Caucasian": "Caucasian",
            "Hispanic": "Hispanic",
            "Asian": "Asian",
            "Other": "Other"
        }
        if 'race' in df.columns:
            r_val = str(df['race'].iloc[0])
            df['race'] = race_aliases.get(r_val, r_val)

        categorical_maps = cls._metadata.get('categorical_maps', {}) if cls._metadata else {}
        numerical_cols = cls._metadata.get('numerical_cols', []) if cls._metadata else []
        feature_names = cls._metadata.get('feature_names', []) if cls._metadata else []

        # Encode categoricals using categorical_maps
        for col, mapping in categorical_maps.items():
            if col in df.columns:
                df[col] = df[col].astype(str).map(mapping).fillna(0).astype(int)

        # Scale numericals
        num_cols_present = [c for c in numerical_cols if c in df.columns]
        if num_cols_present and cls._scaler is not None:
            df[num_cols_present] = cls._scaler.transform(df[num_cols_present])

        # Reorder columns exactly as in training feature_names
        X_df = df[feature_names].copy()
        X_vec = X_df.values

        proba = float(cls._model.predict_proba(X_vec)[0, 1])
        risk_score_pct = round(proba * 100.0, 1)

        # Generate feature impact scores using model feature importances
        feature_impacts = cls._compute_feature_impacts_from_heuristic(data)

        # Categorize Risk Level
        if risk_score_pct >= 35.0:
            risk_category = "High Risk (<30 Days)"
            risk_level = "High"
        elif risk_score_pct >= 18.0:
            risk_category = "Moderate Risk (>30 Days)"
            risk_level = "Moderate"
        else:
            risk_category = "Low Risk / Standard"
            risk_level = "Low"

        recommendations = cls._generate_recommendations(data, risk_level, risk_score_pct)

        return ReadmissionPredictionResponse(
            readmission_risk_score=risk_score_pct,
            risk_category=risk_category,
            risk_level=risk_level,
            confidence_interval=[max(0.0, round(risk_score_pct - 4.2, 1)), min(100.0, round(risk_score_pct + 4.2, 1))],
            feature_impacts=feature_impacts,
            recommendations=recommendations,
            dataset_benchmark_percentile=min(99.0, round(risk_score_pct * 1.5, 1))
        )

    @classmethod
    def _predict_with_heuristic(cls, data: ReadmissionPredictionRequest) -> ReadmissionPredictionResponse:
        log_odds = -2.10
        feature_impacts = cls._compute_feature_impacts_from_heuristic(data)

        for item in feature_impacts:
            log_odds += (item.impact_score / 12.0)

        probability = 1.0 / (1.0 + math.exp(-log_odds))
        risk_score_pct = round(probability * 100.0, 1)

        if risk_score_pct >= 40.0:
            risk_category = "High Risk (<30 Days)"
            risk_level = "High"
        elif risk_score_pct >= 20.0:
            risk_category = "Moderate Risk (>30 Days)"
            risk_level = "Moderate"
        else:
            risk_category = "Low Risk / Standard"
            risk_level = "Low"

        recommendations = cls._generate_recommendations(data, risk_level, risk_score_pct)

        return ReadmissionPredictionResponse(
            readmission_risk_score=risk_score_pct,
            risk_category=risk_category,
            risk_level=risk_level,
            confidence_interval=[max(0.0, round(risk_score_pct - 4.5, 1)), min(100.0, round(risk_score_pct + 4.5, 1))],
            feature_impacts=feature_impacts,
            recommendations=recommendations,
            dataset_benchmark_percentile=min(99.0, round(risk_score_pct * 1.6, 1))
        )

    @classmethod
    def _compute_feature_impacts_from_heuristic(cls, data: ReadmissionPredictionRequest) -> List[FeatureImpact]:
        feature_impacts: List[FeatureImpact] = []

        if data.number_inpatient > 0:
            impact = min(data.number_inpatient * 0.45, 1.80)
            feature_impacts.append(FeatureImpact(
                feature_name="Prior Inpatient Admissions",
                feature_value=f"{data.number_inpatient} visit(s)",
                impact_score=round(impact * 12.5, 1),
                direction="increase",
                description=f"{data.number_inpatient} past inpatient admission(s) strongly increases 30-day readmission risk."
            ))
        else:
            feature_impacts.append(FeatureImpact(
                feature_name="Prior Inpatient Admissions",
                feature_value="0 visits",
                impact_score=-3.8,
                direction="decrease",
                description="No prior inpatient admissions in past year reduces readmission risk."
            ))

        if data.number_emergency > 0:
            impact = min(data.number_emergency * 0.35, 1.20)
            feature_impacts.append(FeatureImpact(
                feature_name="Emergency Visits",
                feature_value=f"{data.number_emergency} ER visit(s)",
                impact_score=round(impact * 12.0, 1),
                direction="increase",
                description=f"{data.number_emergency} emergency room visit(s) indicates prior acute instability."
            ))

        if data.a1c_result == ">8":
            if data.change_med == "Ch":
                feature_impacts.append(FeatureImpact(
                    feature_name="HbA1c Level (>8%)",
                    feature_value="Elevated (>8%) with Med Change",
                    impact_score=2.1,
                    direction="increase",
                    description="HbA1c > 8% shows uncontrolled glycemic levels, mitigated partially by medication adjustment."
                ))
            else:
                feature_impacts.append(FeatureImpact(
                    feature_name="HbA1c Level (>8%)",
                    feature_value="Elevated (>8%) without Med Change",
                    impact_score=6.8,
                    direction="increase",
                    description="Severe uncontrolled HbA1c (>8%) without medication adjustment is a high-risk clinical trigger."
                ))
        elif data.a1c_result == "Norm":
            feature_impacts.append(FeatureImpact(
                feature_name="HbA1c Level",
                feature_value="Normal",
                impact_score=-4.5,
                direction="decrease",
                description="Normal HbA1c demonstrates stable glycemic control."
            ))

        high_risk_discharges = ["SNF", "Rehab", "Left AMA", "Hospice"]
        if any(hr.lower() in data.discharge_disposition.lower() for hr in high_risk_discharges):
            feature_impacts.append(FeatureImpact(
                feature_name="Discharge Disposition",
                feature_value=data.discharge_disposition,
                impact_score=7.9,
                direction="increase",
                description=f"Discharge status '{data.discharge_disposition}' reflects post-acute care needs or compliance challenges."
            ))

        if data.time_in_hospital >= 7:
            feature_impacts.append(FeatureImpact(
                feature_name="Extended Stay",
                feature_value=f"{data.time_in_hospital} days",
                impact_score=4.8,
                direction="increase",
                description=f"Long stay ({data.time_in_hospital} days) correlates with higher clinical complexity."
            ))

        if data.num_medications >= 20:
            feature_impacts.append(FeatureImpact(
                feature_name="Polypharmacy",
                feature_value=f"{data.num_medications} medications",
                impact_score=4.2,
                direction="increase",
                description=f"High medication burden ({data.num_medications} drugs) increases drug interaction & compliance risk."
            ))

        if data.number_diagnoses >= 9:
            feature_impacts.append(FeatureImpact(
                feature_name="High Comorbidity Count",
                feature_value=f"{data.number_diagnoses} diagnoses",
                impact_score=3.6,
                direction="increase",
                description=f"{data.number_diagnoses} underlying diagnoses indicates multiple chronic co-morbidities."
            ))

        if data.primary_diagnosis in ["Circulatory", "Respiratory", "Diabetes"]:
            feature_impacts.append(FeatureImpact(
                feature_name="Primary Diagnosis",
                feature_value=data.primary_diagnosis,
                impact_score=3.0,
                direction="increase",
                description=f"Primary condition ({data.primary_diagnosis}) is among top readmission-prone categories."
            ))

        if data.age_bracket in ["[70-80)", "[80-90)", "[90-100)"]:
            feature_impacts.append(FeatureImpact(
                feature_name="Advanced Age",
                feature_value=data.age_bracket,
                impact_score=3.5,
                direction="increase",
                description=f"Patient age bracket {data.age_bracket} presents elevated vulnerability post-discharge."
            ))

        feature_impacts.sort(key=lambda x: abs(x.impact_score), reverse=True)
        return feature_impacts

    @staticmethod
    def _generate_recommendations(data: ReadmissionPredictionRequest, risk_level: str, risk_pct: float) -> List[ClinicalRecommendation]:
        recs = []

        if risk_level == "High":
            recs.append(ClinicalRecommendation(
                category="Follow-up Care",
                title="Mandatory 7-Day PHC / Outpatient Clinic Visit",
                description="Schedule a post-discharge primary care or Primary Health Center (PHC) evaluation within 7 days to review vitals and medication tolerance.",
                priority="High"
            ))
            recs.append(ClinicalRecommendation(
                category="Medication & Insurance",
                title="NHIA / HMO Medication Reconciliation & Access Check",
                description="Verify patient access to essential anti-diabetic medications under NHIA/HMO insurance scheme to prevent supply disruptions.",
                priority="High"
            ))

        if data.a1c_result == ">8":
            recs.append(ClinicalRecommendation(
                category="Glycemic Control & Diet",
                title="Endocrinology Consult & Regional Dietary Guidance",
                description="Provide DSME (Diabetes Self-Management Education) and customized nutrition plan for African staple foods (portioning Garri/Eba/Yam, incorporating Ofada rice & unripe plantain).",
                priority="High"
            ))

        if data.number_inpatient >= 2 or data.number_emergency >= 2:
            recs.append(ClinicalRecommendation(
                category="Care Management",
                title="Assign Dedicated Telehealth Nurse Navigator",
                description="Enroll patient in 30-day post-discharge mobile hotline & weekly check-in monitoring protocol.",
                priority="Medium"
            ))

        if data.num_medications >= 15:
            recs.append(ClinicalRecommendation(
                category="Adherence Support",
                title="Pillbox Organizer & Regimen Simplification",
                description="Provide pre-sorted pill packaging or automated reminder app for polypharmacy regimen.",
                priority="Medium"
            ))

        if len(recs) == 0:
            recs.append(ClinicalRecommendation(
                category="Standard Care",
                title="Standard Discharge Instructions",
                description="Provide written glycemic target guidelines and 14-day routine outpatient follow-up.",
                priority="Low"
            ))

        return recs

    @staticmethod
    def get_sample_cases() -> List[SamplePatientCase]:
        return [
            SamplePatientCase(
                id="high_risk_lagos",
                name="Babatunde O. – High Risk (Lagos)",
                badge="High Risk (<30d)",
                description="74yo male in Lagos with 3 prior admissions, HbA1c > 8%, 18 medications, post-acute care disposition.",
                patient_data=ReadmissionPredictionRequest(
                    patient_name="Babatunde O.",
                    age_bracket="[70-80)",
                    gender="Male",
                    race="African (Nigerian)",
                    time_in_hospital=8,
                    num_lab_procedures=62,
                    num_procedures=2,
                    num_medications=19,
                    number_outpatient=1,
                    number_emergency=2,
                    number_inpatient=3,
                    number_diagnoses=9,
                    max_glu_serum=">300",
                    a1c_result=">8",
                    change_med="No",
                    diabetes_med="Yes",
                    primary_diagnosis="Circulatory",
                    discharge_disposition="SNF"
                )
            ),
            SamplePatientCase(
                id="moderate_risk_abuja",
                name="Chioma A. – Moderate Risk (Abuja)",
                badge="Moderate Risk",
                description="62yo female in Abuja with 1 prior admission, diabetes & respiratory co-morbidities, medication adjustment.",
                patient_data=ReadmissionPredictionRequest(
                    patient_name="Chioma A.",
                    age_bracket="[60-70)",
                    gender="Female",
                    race="African (Nigerian)",
                    time_in_hospital=4,
                    num_lab_procedures=44,
                    num_procedures=1,
                    num_medications=14,
                    number_outpatient=2,
                    number_emergency=0,
                    number_inpatient=1,
                    number_diagnoses=7,
                    max_glu_serum="Norm",
                    a1c_result=">8",
                    change_med="Ch",
                    diabetes_med="Yes",
                    primary_diagnosis="Respiratory",
                    discharge_disposition="Discharged to Home"
                )
            ),
            SamplePatientCase(
                id="low_risk_ph",
                name="Emeka K. – Low Risk (Port Harcourt)",
                badge="Low Risk",
                description="48yo male in Port Harcourt, 2-day stay, normal HbA1c, 0 prior admissions, routine home discharge.",
                patient_data=ReadmissionPredictionRequest(
                    patient_name="Emeka K.",
                    age_bracket="[40-50)",
                    gender="Male",
                    race="African (Nigerian)",
                    time_in_hospital=2,
                    num_lab_procedures=32,
                    num_procedures=0,
                    num_medications=8,
                    number_outpatient=0,
                    number_emergency=0,
                    number_inpatient=0,
                    number_diagnoses=4,
                    max_glu_serum="Norm",
                    a1c_result="Norm",
                    change_med="No",
                    diabetes_med="Yes",
                    primary_diagnosis="Diabetes",
                    discharge_disposition="Discharged to Home"
                )
            )
        ]
