# DiaPredict.AI – Hospital Readmission Risk Prediction System

**DiaPredict.AI** is an end-to-end Clinical Decision Support System (CDSS) designed to predict 30-day hospital readmission risk for diabetic patients. It combines a supervised Machine Learning soft-voting ensemble with clinical feature engineering, SHAP-style feature impact attribution, and tailored post-discharge care recommendations for Nigerian (PHC / NHIA / HMO) and international healthcare settings.

---

## ✨ Key Features

- **3-Step Validated Clinical Risk Evaluator**: Interactive multi-step form (*1. Demographics & History*, *2. Admission & Utilization*, *3. Clinical Labs & Diagnosis*) with hospital record (MRN) auto-completion, preset clinical profiles, mandatory patient name validation, and step-by-step completion tracking before submission.
- **Explainable AI (XAI) & Risk Dashboard**: Displays 30-day readmission probability, 95% confidence intervals, cohort percentile benchmarks, directional SHAP-style feature impact scores, What-If intervention simulation, and printable clinical discharge reports.
- **Comprehensive Cohort Analytics Dashboard**: Interactive visual analytics including:
  - Readmission Class Distribution & Global Predictor Feature Importance
  - Training Set Class Distribution Before and After SMOTE (with Data Partition Summary)
  - Holdout Test-Set ROC Curves & Multi-Model Benchmark Comparison
  - 30-Day Readmission Rates by Age Bracket & Prior Inpatient Visits
  - Pearson Correlation Heatmap ($10 \times 10$) of Principal Numeric Features
  - Holdout Test-Set Confusion Matrix for the Best-Performing Model
- **Role-Based Access Control (RBAC)**:
  - **Attending Physician**: Patient Predictor, Audit & History, and Cohort Analytics.
  - **Nurse Navigator**: Patient Predictor and Audit & History for post-discharge follow-up.
  - **Hospital Administrator**: Full clinical access plus Bulk CSV Batch Ingestion and header **Dev Tools / Developer API Diagnostics** (hidden from non-administrators).
- **Automatic Database Fallback**: Connects to PostgreSQL in production and automatically falls back to a local SQLite database (`backend/hospital_readmission.db`) during local development.

---

## 🧠 AI & Machine Learning Approach

### 1. Model Architecture & Training (`ml_pipeline/src/train.py`)
The production inference engine is a `scikit-learn` **Soft-Voting Ensemble (`VotingClassifier`)** combining:
- **Histogram-Based Gradient Boosting (`HistGradientBoostingClassifier`)**: `max_iter=300`, `learning_rate=0.03`, `max_depth=8`, `min_samples_leaf=20`, `class_weight='balanced'`.
- **Random Forest (`RandomForestClassifier`)**: `n_estimators=250`, `max_depth=10`, `min_samples_split=8`, `class_weight='balanced'`.
- **Clinical Decision Threshold**: Tuned to $p \ge 0.35$ to prioritize clinical sensitivity (recall) and minimize missed acute 30-day readmissions.

### 2. Dataset Partitions & Class Imbalance Handling
Using an 80% / 20% stratified train-test split on $12{,}000$ cleaned clinical encounters (modeled after the UCI 130-US Hospitals Diabetes dataset), class rebalancing is applied strictly to the training split to prevent data leakage:

| Partition | Total Records | Readmitted <30 Days (`1`) | Not Readmitted <30 Days (`0`) | Readmission Rate |
| :--- | :---: | :---: | :---: | :---: |
| **Full dataset after cleaning** | 12,000 | 1,380 | 10,620 | 11.50% |
| **Training set (before SMOTE)** | 9,600 | 1,104 | 8,496 | 11.50% |
| **Training set (after SMOTE)** | 16,992 | 8,496 | 8,496 | 50.00% |
| **Test set (Unseen hold-out)** | 2,400 | 276 | 2,124 | 11.50% |

### 3. Holdout Test-Set Model Performance ($n = 2{,}400$, threshold $p \ge 0.35$)

| Model | ROC-AUC | 5-Fold CV AUC | Recall (Sensitivity) | Specificity | Precision | F1-Score | Accuracy | Confusion Matrix (`TN / FP / FN / TP`) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Soft-Voting Ensemble (HGB + RF)** | **0.9117** | `0.9112 ± 0.0028` | 84.06% | 83.47% | 39.79% | 0.5402 | 83.54% | `1773 / 351 / 44 / 232` |
| **Random Forest (RF)** | 0.9104 | `0.9096 ± 0.0026` | **84.78%** | **83.80%** | **40.48%** | **0.5480** | **83.92%** | `1780 / 344 / 42 / 234` |
| **HistGradientBoosting (HGB)** | 0.9071 | `0.9064 ± 0.0034` | 82.61% | 82.82% | 38.45% | 0.5247 | 82.79% | `1759 / 365 / 48 / 228` |
| **Logistic Regression (Baseline)** | 0.9130 | `0.9182 ± 0.0048` | 88.41% | 75.56% | 31.98% | 0.4697 | 77.04% | `1605 / 519 / 32 / 244` |
| **Decision Tree (Baseline)** | 0.8305 | `0.8442 ± 0.0053` | 78.26% | 78.44% | 32.05% | 0.4547 | 78.42% | `1666 / 458 / 60 / 216` |

### 4. Clinical Feature Engineering (`ml_pipeline/src/preprocessing.py`)
Combines **17 raw clinical encounter attributes** with **5 engineered interaction features** (**22 total features**):
- `total_prior_visits`: Sum of prior inpatient, emergency, and outpatient visits in the past year.
- `inpatient_visit_ratio`: $\frac{\text{number\_inpatient}}{\text{total\_prior\_visits} + 1}$, capturing acute hospitalization reliance.
- `meds_per_hospital_day`: $\frac{\text{num\_medications}}{\text{time\_in\_hospital} + 1}$, capturing daily medication intensity.
- `uncontrolled_diabetes_risk`: Interaction indicator when HbA1c is `>8%` alongside a diabetes medication adjustment (`Ch`).
- `is_high_risk_discharge`: Indicator for non-home discharge dispositions (`SNF`, `Rehab`, `Left AMA`, `Hospice`).

---

## 📁 Project Structure & Exported Figures

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
├── ml_pipeline/              # Offline ML training, preprocessing & model evaluation pipeline
│   ├── data/                 # Cleaned diabetic_data.csv dataset (12,000 encounters)
│   ├── models/               # Exported models, metrics JSON, and standalone SVG figures:
│   │   ├── readmission_model.joblib
│   │   ├── scaler.joblib
│   │   ├── model_meta.json
│   │   ├── roc_curves.json
│   │   ├── roc_curves_test_set.svg
│   │   ├── correlation_heatmap.svg
│   │   ├── readmission_by_age_and_admissions.svg
│   │   ├── figure_4_5_smote_class_distribution.svg
│   │   └── confusion_matrix_best_model.svg
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

### 4. (Optional) Re-Train the ML Model & Regenerate Figures
Pre-trained model artifacts (`.joblib`, `.json`, and `.svg` plots) are already included in `ml_pipeline/models/` and `backend/app/models/saved_models/`. To re-run the training and evaluation pipeline from scratch:
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
