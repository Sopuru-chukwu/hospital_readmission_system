import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.append(str(backend_dir))

from main import app

client = TestClient(app)

def test_health_check():
    """Test health check endpoint GET /api/v1/health."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "environment" in data
    assert data["api_version"] == "1.0.0"

def test_get_sample_cases():
    """Test sample clinical profiles endpoint GET /api/v1/predict/sample-cases."""
    response = client.get("/api/v1/predict/sample-cases")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    assert data[0]["id"] in ["high_risk_lagos", "high_risk_elderly", "moderate_risk_cardiac", "low_risk_managed"]


def test_predict_readmission_risk():
    """Test single patient readmission risk prediction POST /api/v1/predict."""
    payload = {
        "patient_name": "Test Patient",
        "age_bracket": "[70-80)",
        "gender": "Female",
        "race": "Caucasian",
        "time_in_hospital": 6,
        "num_lab_procedures": 55,
        "num_procedures": 2,
        "num_medications": 20,
        "number_outpatient": 1,
        "number_emergency": 1,
        "number_inpatient": 2,
        "number_diagnoses": 9,
        "max_glu_serum": "None",
        "a1c_result": ">8",
        "change_med": "Ch",
        "diabetes_med": "Yes",
        "primary_diagnosis": "Diabetes",
        "discharge_disposition": "Discharged to Home"
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "readmission_risk_score" in data
    assert 0 <= data["readmission_risk_score"] <= 100
    assert "risk_category" in data
    assert data["risk_level"] in ["High", "Moderate", "Low"]
    assert isinstance(data["confidence_interval"], list)
    assert len(data["confidence_interval"]) == 2
    assert isinstance(data["feature_impacts"], list)
    assert len(data["feature_impacts"]) > 0
    assert isinstance(data["recommendations"], list)

def test_predict_batch_readmission():
    """Test batch patient readmission risk evaluation POST /api/v1/predict/batch."""
    batch_payload = [
        {
            "patient_name": "Batch Patient 1",
            "age_bracket": "[60-70)",
            "gender": "Male",
            "race": "Caucasian",
            "time_in_hospital": 4,
            "num_lab_procedures": 40,
            "num_procedures": 1,
            "num_medications": 15,
            "number_outpatient": 0,
            "number_emergency": 0,
            "number_inpatient": 1,
            "number_diagnoses": 7,
            "max_glu_serum": "None",
            "a1c_result": ">7",
            "change_med": "No",
            "diabetes_med": "Yes",
            "primary_diagnosis": "Circulatory",
            "discharge_disposition": "Discharged to Home"
        },
        {
            "patient_name": "Batch Patient 2",
            "age_bracket": "[50-60)",
            "gender": "Female",
            "race": "Asian",
            "time_in_hospital": 2,
            "num_lab_procedures": 30,
            "num_procedures": 0,
            "num_medications": 8,
            "number_outpatient": 0,
            "number_emergency": 0,
            "number_inpatient": 0,
            "number_diagnoses": 4,
            "max_glu_serum": "None",
            "a1c_result": "Norm",
            "change_med": "No",
            "diabetes_med": "No",
            "primary_diagnosis": "Diabetes",
            "discharge_disposition": "Discharged to Home"
        }
    ]
    response = client.post("/api/v1/predict/batch", json=batch_payload)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert "readmission_risk_score" in data[0]

def test_get_prediction_history():
    """Test fetching prediction audit logs GET /api/v1/predict/history."""
    response = client.get("/api/v1/predict/history?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        record = data[0]
        assert "patient_name" in record
        assert "risk_score" in record
        assert "risk_level" in record
        assert "created_at" in record
