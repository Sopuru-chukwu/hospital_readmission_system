import pandas as pd
import numpy as np
from typing import Tuple, List, Dict
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

FEATURE_COLUMNS = [
    'age_bracket', 'gender', 'race', 'time_in_hospital',
    'num_lab_procedures', 'num_procedures', 'num_medications',
    'number_outpatient', 'number_emergency', 'number_inpatient',
    'number_diagnoses', 'max_glu_serum', 'a1c_result',
    'change_med', 'diabetes_med', 'primary_diagnosis', 'discharge_disposition',
    'total_prior_visits', 'inpatient_visit_ratio', 'meds_per_hospital_day',
    'uncontrolled_diabetes_risk', 'is_high_risk_discharge'
]

CATEGORICAL_MAPS = {
    'age_bracket': {'[30-40)': 0, '[40-50)': 1, '[50-60)': 2, '[60-70)': 3, '[70-80)': 4, '[80-90)': 5, '[90-100)': 6},
    'gender': {'Female': 0, 'Male': 1},
    'race': {'Caucasian': 0, 'AfricanAmerican': 1, 'Hispanic': 2, 'Asian': 3, 'Other': 4},
    'max_glu_serum': {'None': 0, 'Norm': 1, '>200': 2, '>300': 3},
    'a1c_result': {'None': 0, 'Norm': 1, '>7': 2, '>8': 3},
    'change_med': {'No': 0, 'Ch': 1},
    'diabetes_med': {'No': 0, 'Yes': 1},
    'primary_diagnosis': {'Diabetes': 0, 'Circulatory': 1, 'Respiratory': 2, 'Digestive': 3, 'Genitourinary': 4, 'Musculoskeletal': 5, 'Other': 6},
    'discharge_disposition': {'Discharged to Home': 0, 'SNF': 1, 'Rehab': 2, 'Left AMA': 3, 'Hospice': 4}
}

NUMERICAL_COLS = [
    'time_in_hospital', 'num_lab_procedures', 'num_procedures',
    'num_medications', 'number_outpatient', 'number_emergency',
    'number_inpatient', 'number_diagnoses', 'total_prior_visits',
    'inpatient_visit_ratio', 'meds_per_hospital_day',
    'uncontrolled_diabetes_risk', 'is_high_risk_discharge'
]

def add_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    """Calculates high-leverage clinical interaction and utilization features."""
    processed = df.copy()

    # Column renames FIRST so categorical mapping keys match
    column_renames = {
        'age': 'age_bracket',
        'change': 'change_med',
        'diabetesMed': 'diabetes_med',
        'primary_diag': 'primary_diagnosis'
    }
    processed = processed.rename(columns=column_renames)

    # Convert categoricals safely
    for col, mapping in CATEGORICAL_MAPS.items():
        if col in processed.columns:
            processed[col] = processed[col].astype(str).map(mapping).fillna(0).astype(int)



    # 1. Total Prior Healthcare Utilization
    num_inp = processed['number_inpatient'] if 'number_inpatient' in processed.columns else 0
    num_emg = processed['number_emergency'] if 'number_emergency' in processed.columns else 0
    num_out = processed['number_outpatient'] if 'number_outpatient' in processed.columns else 0
    processed['total_prior_visits'] = num_inp + num_emg + num_out

    # 2. Inpatient Utilization Ratio
    processed['inpatient_visit_ratio'] = num_inp / (processed['total_prior_visits'] + 1.0)

    # 3. Hospitalization Intensity (meds per hospital stay day)
    stay_days = processed['time_in_hospital'] if 'time_in_hospital' in processed.columns else 1
    meds = processed['num_medications'] if 'num_medications' in processed.columns else 1
    processed['meds_per_hospital_day'] = meds / (stay_days + 1.0)

    # 4. Uncontrolled Glycemic Risk Interaction (a1c_result > 8 AND change_med == Ch/1)
    a1c_val = processed['a1c_result'] if 'a1c_result' in processed.columns else 0
    change_val = processed['change_med'] if 'change_med' in processed.columns else 0
    is_a1c_high = (a1c_val == 3) | (a1c_val == '>8')
    is_med_changed = (change_val == 1) | (change_val == 'Ch')
    processed['uncontrolled_diabetes_risk'] = (is_a1c_high & is_med_changed).astype(float)

    # 5. Non-Home Discharge Risk
    discharge_val = processed['discharge_disposition'] if 'discharge_disposition' in processed.columns else 0
    is_home = (discharge_val == 0) | (discharge_val == 'Discharged to Home')
    processed['is_high_risk_discharge'] = (~is_home).astype(float)

    return processed

def preprocess_dataframe(df: pd.DataFrame, scaler: StandardScaler = None, is_training: bool = True) -> Tuple[np.ndarray, np.ndarray, StandardScaler, List[str]]:
    """
    Preprocesses raw DataFrame into model-ready numerical feature matrix X and target y.
    """
    processed_df = add_engineered_features(df)

    # Prepare feature matrix X
    feature_names = [c for c in FEATURE_COLUMNS if c in processed_df.columns]
    X_df = processed_df[feature_names].copy()

    # Scale numerical columns
    num_cols_present = [c for c in NUMERICAL_COLS if c in X_df.columns]
    if is_training:
        scaler = StandardScaler()
        X_df[num_cols_present] = scaler.fit_transform(X_df[num_cols_present])
    elif scaler is not None:
        X_df[num_cols_present] = scaler.transform(X_df[num_cols_present])

    # Target variable y (1 for <30 days readmission, 0 otherwise)
    y = None
    if 'readmitted' in processed_df.columns:
        y = (processed_df['readmitted'] == '<30').astype(int).values

    return X_df.values, y, scaler, feature_names

def prepare_train_test_split(df: pd.DataFrame, test_size: float = 0.2, random_state: int = 42):
    """
    Splits DataFrame into train and test sets, then fits preprocessor.
    """
    train_df, test_df = train_test_split(df, test_size=test_size, random_state=random_state, stratify=df['readmitted'])
    X_train, y_train, scaler, feature_names = preprocess_dataframe(train_df, is_training=True)
    X_test, y_test, _, _ = preprocess_dataframe(test_df, scaler=scaler, is_training=False)
    return X_train, X_test, y_train, y_test, scaler, feature_names

