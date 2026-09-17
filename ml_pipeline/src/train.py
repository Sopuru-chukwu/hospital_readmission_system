import os
import json
import joblib
import numpy as np
from pathlib import Path

from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier, VotingClassifier
from sklearn.metrics import roc_auc_score, recall_score, precision_score, f1_score, accuracy_score

from data_loader import get_or_create_dataset
from preprocessing import prepare_train_test_split, CATEGORICAL_MAPS, NUMERICAL_COLS

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
BACKEND_MODELS_DIR = Path(__file__).resolve().parent.parent.parent / "backend" / "app" / "models" / "saved_models"

def train_and_evaluate_models():
    print("=" * 60)
    print("  Diabetic Hospital Readmission ML Training Pipeline")
    print("=" * 60)

    # 1. Load Data
    df = get_or_create_dataset()
    print(f"\n[1/4] Loaded dataset: {len(df)} records.")

    # 2. Preprocess & Train/Test Split
    X_train, X_test, y_train, y_test, scaler, feature_names = prepare_train_test_split(df)
    print(f"[2/4] Preprocessed features. Train shape: {X_train.shape}, Test shape: {X_test.shape}")
    print(f"      30-Day Readmission Positives in Train: {y_train.sum()} ({y_train.mean()*100:.1f}%)")

    # 3. Model Training (Soft Voting Ensemble of HistGradientBoosting & RandomForest)
    print("\n[3/4] Training Gradient Boosted + Random Forest Voting Ensemble Classifier...")
    hgb_clf = HistGradientBoostingClassifier(
        max_iter=300,
        learning_rate=0.03,
        max_depth=8,
        min_samples_leaf=20,
        class_weight='balanced',
        random_state=42
    )

    rf_clf = RandomForestClassifier(
        n_estimators=250,
        max_depth=10,
        min_samples_split=8,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )

    clf = VotingClassifier(
        estimators=[
            ('hgb', hgb_clf),
            ('rf', rf_clf)
        ],
        voting='soft'
    )
    clf.fit(X_train, y_train)

    # 4. Evaluation
    y_pred_proba = clf.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba >= 0.35).astype(int)


    roc_auc = float(roc_auc_score(y_test, y_pred_proba))
    recall = float(recall_score(y_test, y_pred))
    precision = float(precision_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    accuracy = float(accuracy_score(y_test, y_pred))

    print("\n[4/4] Model Performance Metrics on Holdout Test Set:")
    print(f"      ROC-AUC Score : {roc_auc:.4f}")
    print(f"      Recall / Sens : {recall:.4f}")
    print(f"      Precision     : {precision:.4f}")
    print(f"      F1-Score      : {f1:.4f}")
    print(f"      Accuracy      : {accuracy:.4f}")

    # 5. Export Model Artifacts
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    BACKEND_MODELS_DIR.mkdir(parents=True, exist_ok=True)

    model_path = MODELS_DIR / "readmission_model.joblib"
    scaler_path = MODELS_DIR / "scaler.joblib"
    meta_path = MODELS_DIR / "model_meta.json"

    backend_model_path = BACKEND_MODELS_DIR / "readmission_model.joblib"
    backend_scaler_path = BACKEND_MODELS_DIR / "scaler.joblib"
    backend_meta_path = BACKEND_MODELS_DIR / "model_meta.json"

    metadata = {
        "model_type": "RandomForestClassifier",
        "roc_auc": round(roc_auc, 4),
        "recall": round(recall, 4),
        "precision": round(precision, 4),
        "f1": round(f1, 4),
        "feature_names": feature_names,
        "categorical_maps": CATEGORICAL_MAPS,
        "numerical_cols": NUMERICAL_COLS
    }

    # Save to ml_pipeline/models
    joblib.dump(clf, model_path)
    joblib.dump(scaler, scaler_path)
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    # Save copy to backend/app/models/saved_models
    joblib.dump(clf, backend_model_path)
    joblib.dump(scaler, backend_scaler_path)
    with open(backend_meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)

    print(f"\nSuccessfully exported model artifacts to:")
    print(f" - {model_path}")
    print(f" - {backend_model_path}")
    print("=" * 60)

if __name__ == '__main__':
    train_and_evaluate_models()
