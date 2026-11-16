# DiaPredict.AI – Hospital Readmission Risk Prediction System

**DiaPredict.AI** is an end-to-end Clinical Decision Support System (CDSS) designed to predict 30-day hospital readmission risk for diabetic patients. It combines a supervised Machine Learning soft-voting ensemble with clinical feature engineering, SHAP-style feature impact attribution, and tailored post-discharge care recommendations for Nigerian (PHC / NHIA / HMO) and international healthcare settings.

---

## ✨ Key Features

- **3-Step Clinical Risk Evaluator**: Interactive multi-step form (*1. Demographics & History*, *2. Admission & Utilization*, *3. Clinical Labs & Diagnosis*) with hospital record auto-completion, preset clinical profiles, and step-by-step validation.
- **Explainable AI (XAI) & Risk Dashboard**: Displays 30-day readmission probability, 95% confidence intervals, cohort percentile benchmarks, directional feature impact scores, What-If intervention simulation, and printable clinical discharge reports.
- **Role-Based Access Control (RBAC)**:
  - **Attending Physician**: Patient Predictor, Audit & History, and Cohort Analytics.
  - **Nurse Navigator**: Patient Predictor and Audit & History for post-discharge follow-up.
  - **Hospital Administrator**: Full access including Bulk CSV Batch Ingestion, Cohort Analytics, and Developer API Diagnostics.
- **Automatic Database Fallback**: Connects to PostgreSQL in production and automatically falls back to a local SQLite database (`backend/hospital_readmission.db`) during local development.

---

## 🧠 AI & Machine Learning Approach

1. **Soft-Voting Ensemble Classifier** (`ml_pipeline/src/train.py`):
   - **Histogram-Based Gradient Boosting (`HistGradientBoostingClassifier`)**: `max_iter=300`, `learning_rate=0.03`, `max_depth=8`, `class_weight='balanced'`.
   - **Random Forest (`RandomForestClassifier`)**: `n_estimators=250`, `max_depth=10`, `min_samples_split=8`, `class_weight='balanced'`.
   - **Classification Threshold**: Tuned to `0.35` to maximize clinical sensitivity (recall) on imbalanced readmission outcomes.
   - **Holdout Test Performance**: **ROC-AUC**: `0.9110` | **Recall**: `0.8659` | **F1-Score**: `0.5259`.
2. **Clinical Feature Engineering** (`ml_pipeline/src/preprocessing.py`):
   - Combines 17 core clinical encounter attributes with 5 engineered interaction features (`total_prior_visits`, `inpatient_visit_ratio`, `meds_per_hospital_day`, `uncontrolled_diabetes_risk`, and `is_high_risk_discharge`).
3. **Clinical Decision Support Layer** (`backend/app/services/prediction_service.py`):
   - Computes patient-specific directional feature impacts and generates prioritized post-discharge care pathways.

---

## 📁 Project Structure

```text
hospital_readmission_system/
├── backend/                  # FastAPI REST API, SQLAlchemy ORM, JWT Auth & ML Inference
│   ├── app/
│   │   ├── api/v1/           # Auth & Prediction endpoints (/api/v1/auth, /api/v1/predict)
│   │   ├── core/             # Settings, JWT security, and HTTP security headers middleware
│   │   ├── db/               # PostgreSQL / SQLite database session management
│   │   ├── models/           # SQLAlchemy models & exported .joblib ML model artifacts
│   │   ├── repositories/     # Database CRUD operations
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   └── services/         # ML inference & clinical recommendation engine
│   ├── tests/                # Pytest API test suite
│   ├── main.py               # FastAPI application entrypoint
│   └── requirements.txt      # Backend Python dependencies
├── frontend/                 # React 19 + TypeScript + Vite + Tailwind CSS UI
│   ├── src/
│   │   ├── components/       # PredictorForm, RiskResultDashboard, CohortAnalytics, etc.
│   │   ├── services/         # Axios API client
│   │   └── types/            # TypeScript interfaces
│   └── package.json          # Frontend dependencies and scripts
├── ml_pipeline/              # Offline ML training, preprocessing & model export pipeline
│   ├── src/                  # data_loader.py, preprocessing.py, train.py, explainability.py
│   └── requirements.txt      # ML training dependencies
├── docker-compose.yml        # Full-stack Docker orchestration (PostgreSQL + Backend + Frontend)
└── README_PRODUCTION.md      # Production deployment, security, and backup manual
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Python** 3.9+
- **Node.js** 18+ and **npm**

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/hospital_readmission_system.git
cd hospital_readmission_system
```

### 2. Set Up & Run the Backend (FastAPI)
Open a terminal in the project root:
```bash
# Create and activate a virtual environment
python3 -m venv backend/.venv
source backend/.venv/bin/activate

# Upgrade pip and install backend dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt

# Copy the example environment file (optional — defaults to local SQLite if PostgreSQL is offline)
cp backend/.env.example backend/.env

# Start the FastAPI server on http://127.0.0.1:8000
uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```
- **API Root**: http://127.0.0.1:8000
- **Interactive Swagger UI**: http://127.0.0.1:8000/docs
- **Health Check**: http://127.0.0.1:8000/api/v1/health

### 3. Set Up & Run the Frontend (React + Vite)
Open a second terminal in the project root:
```bash
cd frontend
npm install
npm run dev
```
- **Frontend Web App**: http://127.0.0.1:5173 (or http://localhost:5173)

### 4. (Optional) Re-Train the ML Model Pipeline
Pre-trained model artifacts (`readmission_model.joblib`, `scaler.joblib`, and `model_meta.json`) are already included in `backend/app/models/saved_models/`. To re-run the training pipeline from scratch:
```bash
source backend/.venv/bin/activate
python ml_pipeline/src/train.py
```

---

## 🐳 Running with Docker Compose (Full Stack)

To run the complete production stack (PostgreSQL 16 + Gunicorn/FastAPI Backend + Nginx Frontend) in Docker:

```bash
# 1. Create the root .env file from the production template
cp .env.production.example .env

# 2. Build and start all containers in detached mode
docker compose up -d --build
```

- **Web App (Nginx)**: http://localhost (Port `80`)
- **Backend API**: http://localhost:8000
- **Swagger UI Docs**: http://localhost:8000/docs
- **Stop Containers**: `docker compose down`

For production hardening, SSL/TLS, and database backup procedures, see [README_PRODUCTION.md](./README_PRODUCTION.md).

---

## 🔐 Demo Clinical Role Credentials

You can sign in immediately using the **Quick Demo Login** buttons in the Sign-In modal or with the following credentials:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Physician** | `dr.babatunde@hospital.ng` | `password123` | Patient Predictor, Audit & History, Cohort Analytics |
| **Nurse** | `nurse.chioma@phc.ng` | `password123` | Patient Predictor, Audit & History |
| **Administrator** | `admin@diapredict.ai` | `password123` | All Clinical Views + Batch CSV Ingestion + Dev Tools / API Diagnostics |

---

## 🧪 Running Tests

To run the backend API test suite with `pytest`:
```bash
source backend/.venv/bin/activate
pytest backend/tests
```
