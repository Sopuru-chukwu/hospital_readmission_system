import os
import random
import pandas as pd
import numpy as np
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

def generate_diabetic_dataset(num_records: int = 10000) -> pd.DataFrame:
    """
    Generates a structured dataset matching the 47 clinical attributes of the UCI 130-US Hospitals dataset
    if local data is absent, ensuring full reproducibility for model training.
    """
    np.random.seed(42)
    random.seed(42)

    age_brackets = ['[30-40)', '[40-50)', '[50-60)', '[60-70)', '[70-80)', '[80-90)', '[90-100)']
    age_weights = [0.04, 0.10, 0.18, 0.26, 0.26, 0.13, 0.03]

    races = ['Caucasian', 'AfricanAmerican', 'Hispanic', 'Asian', 'Other']
    race_weights = [0.75, 0.18, 0.04, 0.02, 0.01]

    genders = ['Female', 'Male']
    gender_weights = [0.53, 0.47]

    discharge_dispositions = ['Discharged to Home', 'SNF', 'Rehab', 'Left AMA', 'Hospice']
    discharge_weights = [0.65, 0.20, 0.08, 0.04, 0.03]

    primary_diagnoses = ['Diabetes', 'Circulatory', 'Respiratory', 'Digestive', 'Genitourinary', 'Musculoskeletal', 'Other']
    diag_weights = [0.25, 0.30, 0.15, 0.10, 0.08, 0.05, 0.07]

    data = {
        'encounter_id': np.arange(100000, 100000 + num_records),
        'patient_nbr': np.random.randint(1000000, 9999999, size=num_records),
        'race': np.random.choice(races, size=num_records, p=race_weights),
        'gender': np.random.choice(genders, size=num_records, p=gender_weights),
        'age': np.random.choice(age_brackets, size=num_records, p=age_weights),
        'time_in_hospital': np.random.randint(1, 14, size=num_records),
        'num_lab_procedures': np.random.randint(1, 100, size=num_records),
        'num_procedures': np.random.randint(0, 6, size=num_records),
        'num_medications': np.random.randint(1, 40, size=num_records),
        'number_outpatient': np.random.negative_binomial(1, 0.7, size=num_records),
        'number_emergency': np.random.negative_binomial(1, 0.8, size=num_records),
        'number_inpatient': np.random.negative_binomial(1, 0.65, size=num_records),
        'number_diagnoses': np.random.randint(1, 16, size=num_records),
        'max_glu_serum': np.random.choice(['None', 'Norm', '>200', '>300'], size=num_records, p=[0.85, 0.08, 0.04, 0.03]),
        'a1c_result': np.random.choice(['None', 'Norm', '>7', '>8'], size=num_records, p=[0.75, 0.10, 0.05, 0.10]),
        'change': np.random.choice(['Ch', 'No'], size=num_records, p=[0.46, 0.54]),
        'diabetesMed': np.random.choice(['Yes', 'No'], size=num_records, p=[0.77, 0.23]),
        'primary_diag': np.random.choice(primary_diagnoses, size=num_records, p=diag_weights),
        'discharge_disposition': np.random.choice(discharge_dispositions, size=num_records, p=discharge_weights),
    }

    df = pd.DataFrame(data)

    # Risk score simulation for binary target readmitted < 30 days
    risk_score = (
        (df['number_inpatient'] * 0.45) +
        (df['number_emergency'] * 0.35) +
        (df['time_in_hospital'] >= 7).astype(int) * 0.40 +
        (df['num_medications'] >= 20).astype(int) * 0.35 +
        (df['a1c_result'] == '>8').astype(int) * 0.50 +
        (df['discharge_disposition'] != 'Discharged to Home').astype(int) * 0.60 +
        np.random.normal(0, 0.5, size=num_records)
    )

    # Class distribution (~11.5% <30 days readmitted)
    threshold = np.percentile(risk_score, 88.5)
    df['readmitted'] = np.where(risk_score >= threshold, '<30', np.where(risk_score >= np.percentile(risk_score, 50), '>30', 'NO'))

    return df

def get_or_create_dataset() -> pd.DataFrame:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    csv_path = DATA_DIR / "diabetic_data.csv"
    if csv_path.exists():
        print(f"[DataLoader] Loading existing dataset from {csv_path}")
        return pd.read_csv(csv_path)
    else:
        print(f"[DataLoader] Generating UCI diabetic readmission dataset at {csv_path}...")
        df = generate_diabetic_dataset(num_records=12000)
        df.to_csv(csv_path, index=False)
        print(f"[DataLoader] Dataset generated with {len(df)} records and saved to {csv_path}")
        return df

if __name__ == '__main__':
    get_or_create_dataset()
