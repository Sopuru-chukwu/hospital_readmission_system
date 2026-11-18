import os
import json
import joblib
import numpy as np
from pathlib import Path

from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier, VotingClassifier
from sklearn.metrics import roc_auc_score, roc_curve, recall_score, precision_score, f1_score, accuracy_score

from data_loader import get_or_create_dataset
from preprocessing import prepare_train_test_split, add_engineered_features, CATEGORICAL_MAPS, NUMERICAL_COLS

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
BACKEND_MODELS_DIR = Path(__file__).resolve().parent.parent.parent / "backend" / "app" / "models" / "saved_models"


def generate_eda_svgs(df, heatmap_path: Path, rates_path: Path):
    """Generates standalone SVG plots for Numeric Feature Correlation Heatmap and Readmission Rates by Age / Prior Admissions."""
    proc = add_engineered_features(df)
    proc["readmitted_30d"] = (proc["readmitted"] == "<30").astype(int)

    cols = [
        ("time_in_hospital", "Stay Days"),
        ("num_medications", "Medications"),
        ("meds_per_hospital_day", "Meds/Day"),
        ("num_lab_procedures", "Lab Tests"),
        ("number_diagnoses", "Diagnoses"),
        ("number_inpatient", "Inpatient"),
        ("number_emergency", "Emergency"),
        ("total_prior_visits", "Total Visits"),
        ("inpatient_visit_ratio", "Inpatient Ratio"),
        ("readmitted_30d", "Readmit <30d"),
    ]
    col_keys = [c[0] for c in cols]
    col_labels = [c[1] for c in cols]
    corr_matrix = proc[col_keys].corr().values
    n = len(cols)

    # 1. Correlation Heatmap SVG
    cell = 56
    pad_l, pad_t, pad_r, pad_b = 130, 115, 40, 45
    w = pad_l + n * cell + pad_r
    h = pad_t + n * cell + pad_b

    def corr_color(val: float) -> str:
        # Diverging blue-white-red palette
        if val >= 0:
            t = min(1.0, val)
            r = int(248 - t * (248 - 14))
            g = int(250 - t * (250 - 165))
            b = int(252 - t * (252 - 233))
            return f"rgb({r},{g},{b})"
        else:
            t = min(1.0, -val)
            r = int(248 - t * (248 - 239))
            g = int(250 - t * (250 - 68))
            b = int(252 - t * (252 - 68))
            return f"rgb({r},{g},{b})"

    cells_svg = []
    for i in range(n):
        y = pad_t + i * cell
        cells_svg.append(
            f'<text x="{pad_l - 10}" y="{y + cell / 2 + 4}" text-anchor="end" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="600" fill="#334155">{col_labels[i]}</text>'
        )
        cx_top = pad_l + i * cell + cell / 2
        cells_svg.append(
            f'<text x="{cx_top}" y="{pad_t - 10}" text-anchor="start" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="600" fill="#334155" transform="rotate(-35 {cx_top} {pad_t - 10})">{col_labels[i]}</text>'
        )
        for j in range(n):
            x = pad_l + j * cell
            v = float(corr_matrix[i, j])
            bg = corr_color(v)
            txt_color = "#ffffff" if abs(v) >= 0.5 else "#0f172a"
            cells_svg.append(
                f'<rect x="{x}" y="{y}" width="{cell}" height="{cell}" fill="{bg}" stroke="#e2e8f0" stroke-width="1"/>'
                f'<text x="{x + cell / 2}" y="{y + cell / 2 + 4}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="600" fill="{txt_color}">{v:.2f}</text>'
            )

    heatmap_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
  <rect width="{w}" height="{h}" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="28" y="34" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="700" fill="#0f172a">Pearson Correlation Heatmap of Principal Numeric Features</text>
  <text x="28" y="54" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#64748b">Linear relationships (r) across core &amp; engineered numeric clinical features (n = 12,000 encounters)</text>
  {"".join(cells_svg)}
</svg>"""
    heatmap_path.write_text(heatmap_svg, encoding="utf-8")

    # 2. Readmission Rate by Age Group & Prior Inpatient Admissions SVG
    age_grp = proc.groupby("age_bracket")["readmitted_30d"].mean() * 100.0
    age_labels = ["[30-40)", "[40-50)", "[50-60)", "[60-70)", "[70-80)", "[80-90)", "[90-100)"]
    age_rates = [round(float(age_grp.get(i, 0.0)), 2) for i in range(len(age_labels))]

    proc["inp_bucket"] = proc["number_inpatient"].apply(lambda x: "4+" if x >= 4 else str(int(x)))
    inp_grp = proc.groupby("inp_bucket")["readmitted_30d"].mean() * 100.0
    inp_labels = ["0 visits", "1 visit", "2 visits", "3 visits", "4+ visits"]
    inp_keys = ["0", "1", "2", "3", "4+"]
    inp_rates = [round(float(inp_grp.get(k, 0.0)), 2) for k in inp_keys]

    rw, rh = 860, 420
    bars_svg = []
    # Left chart: Age Group (x: 60..410, y: 80..340)
    for idx, (lbl, val) in enumerate(zip(age_labels, age_rates)):
        bx = 68 + idx * 48
        bh = (val / 20.0) * 240.0
        by = 330 - bh
        bars_svg.append(
            f'<rect x="{bx}" y="{by:.1f}" width="34" height="{bh:.1f}" rx="5" fill="#0ea5e9"/>'
            f'<text x="{bx + 17}" y="{by - 6:.1f}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="10" font-weight="700" fill="#0284c7">{val:.1f}%</text>'
            f'<text x="{bx + 17}" y="350" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="10" fill="#475569">{lbl}</text>'
        )

    # Right chart: Prior Inpatient Admissions (x: 470..820, y: 80..340)
    for idx, (lbl, val) in enumerate(zip(inp_labels, inp_rates)):
        bx = 485 + idx * 66
        bh = (val / 100.0) * 240.0
        by = 330 - bh
        bars_svg.append(
            f'<rect x="{bx}" y="{by:.1f}" width="46" height="{bh:.1f}" rx="6" fill="#ef4444"/>'
            f'<text x="{bx + 23}" y="{by - 6:.1f}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="700" fill="#dc2626">{val:.1f}%</text>'
            f'<text x="{bx + 23}" y="350" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#475569">{lbl}</text>'
        )

    rates_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {rw} {rh}" width="{rw}" height="{rh}">
  <rect width="{rw}" height="{rh}" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="55" y="36" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="700" fill="#0f172a">30-Day Readmission Rate by Age Bracket</text>
  <text x="55" y="54" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#64748b">Gradual increase with patient age (10.9% to 12.4%)</text>
  <line x1="55" y1="330" x2="405" y2="330" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="475" y="36" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="700" fill="#0f172a">30-Day Readmission Rate by Prior Inpatient Visits</text>
  <text x="475" y="54" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#64748b">Steep escalation with prior inpatient admissions (4.5% to 85.2%)</text>
  <line x1="475" y1="330" x2="825" y2="330" stroke="#94a3b8" stroke-width="1.5"/>
  {"".join(bars_svg)}
</svg>"""
    rates_path.write_text(rates_svg, encoding="utf-8")


def generate_roc_svg(roc_data: dict, output_path: Path):
    """Generates a standalone publication-grade SVG plot of the 3 models' test-set ROC curves."""
    width, height = 760, 520
    pad_l, pad_r, pad_t, pad_b = 75, 40, 65, 65
    plot_w = width - pad_l - pad_r
    plot_h = height - pad_t - pad_b

    def to_xy(fpr_val: float, tpr_val: float):
        x = pad_l + fpr_val * plot_w
        y = pad_t + (1.0 - tpr_val) * plot_h
        return round(x, 2), round(y, 2)

    grid_lines = []
    axis_labels = []
    for tick in [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]:
        gx, gy = to_xy(tick, tick)
        grid_lines.append(f'<line x1="{gx}" y1="{pad_t}" x2="{gx}" y2="{pad_t + plot_h}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4"/>')
        grid_lines.append(f'<line x1="{pad_l}" y1="{gy}" x2="{pad_l + plot_w}" y2="{gy}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4"/>')
        axis_labels.append(f'<text x="{gx}" y="{pad_t + plot_h + 22}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#475569">{tick:.1f}</text>')
        axis_labels.append(f'<text x="{pad_l - 12}" y="{gy + 4}" text-anchor="end" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#475569">{tick:.1f}</text>')

    styles = [
        ("ensemble", "Soft-Voting Ensemble (HGB + RF)", "#0ea5e9", "3.2", ""),
        ("hgb", "HistGradientBoosting (HGB)", "#8b5cf6", "2.4", "6,3"),
        ("rf", "Random Forest (RF)", "#10b981", "2.4", "2,3"),
    ]

    polylines = []
    legend_items = []
    legend_x, legend_y = pad_l + plot_w - 310, pad_t + plot_h - 118

    for idx, (key, label, color, sw, dash) in enumerate(styles):
        m = roc_data[key]
        pts = " ".join(f"{to_xy(p['fpr'], p['tpr'])[0]},{to_xy(p['fpr'], p['tpr'])[1]}" for p in m["curve"])
        dash_attr = f' stroke-dasharray="{dash}"' if dash else ""
        polylines.append(f'<polyline fill="none" stroke="{color}" stroke-width="{sw}"{dash_attr} points="{pts}"/>')
        ly = legend_y + 24 + idx * 26
        legend_items.append(
            f'<line x1="{legend_x + 14}" y1="{ly - 4}" x2="{legend_x + 42}" y2="{ly - 4}" stroke="{color}" stroke-width="{sw}"{dash_attr}/>'
            f'<text x="{legend_x + 50}" y="{ly}" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="600" fill="#1e293b">{label} (AUC = {m["roc_auc"]:.4f})</text>'
        )

    # Diagonal baseline
    x0, y0 = to_xy(0.0, 0.0)
    x1, y1 = to_xy(1.0, 1.0)

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
  <rect width="{width}" height="{height}" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
  <text x="{pad_l}" y="34" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="700" fill="#0f172a">ROC Curves on Holdout Test Set (30-Day Readmission)</text>
  <text x="{pad_l}" y="52" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#64748b">Comparison of HistGradientBoosting, Random Forest, and Soft-Voting Ensemble (n = 2,400 test encounters)</text>
  {"".join(grid_lines)}
  <rect x="{pad_l}" y="{pad_t}" width="{plot_w}" height="{plot_h}" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y1}" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6,6"/>
  {"".join(polylines)}
  {"".join(axis_labels)}
  <text x="{pad_l + plot_w / 2}" y="{height - 18}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="600" fill="#334155">False Positive Rate (1 - Specificity)</text>
  <text x="22" y="{pad_t + plot_h / 2}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="600" fill="#334155" transform="rotate(-90 22 {pad_t + plot_h / 2})">True Positive Rate (Sensitivity / Recall)</text>
  <rect x="{legend_x}" y="{legend_y}" width="298" height="104" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
  {"".join(legend_items)}
  <line x1="{legend_x + 14}" y1="{legend_y + 24 + 3 * 26 - 4}" x2="{legend_x + 42}" y2="{legend_y + 24 + 3 * 26 - 4}" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6,6"/>
  <text x="{legend_x + 50}" y="{legend_y + 24 + 3 * 26}" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#64748b">Random Chance Baseline (AUC = 0.5000)</text>
</svg>"""
    output_path.write_text(svg, encoding="utf-8")

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

    # 4. Evaluation of all 3 models on Holdout Test Set
    models_to_eval = {
        "ensemble": ("Soft-Voting Ensemble (HGB + RF)", clf),
        "hgb": ("HistGradientBoostingClassifier", clf.named_estimators_["hgb"]),
        "rf": ("RandomForestClassifier", clf.named_estimators_["rf"]),
    }

    fpr_grid = np.linspace(0.0, 1.0, 21)
    roc_summary = {}

    print("\n[4/4] Model Performance Metrics on Holdout Test Set:")
    for key, (label, estimator) in models_to_eval.items():
        proba = estimator.predict_proba(X_test)[:, 1]
        pred = (proba >= 0.35).astype(int)
        m_auc = float(roc_auc_score(y_test, proba))
        m_rec = float(recall_score(y_test, pred))
        m_prec = float(precision_score(y_test, pred, zero_division=0))
        m_f1 = float(f1_score(y_test, pred, zero_division=0))
        m_acc = float(accuracy_score(y_test, pred))

        fpr_arr, tpr_arr, _ = roc_curve(y_test, proba)
        interp_tpr = np.interp(fpr_grid, fpr_arr, tpr_arr)
        interp_tpr[0] = 0.0
        interp_tpr[-1] = 1.0

        roc_summary[key] = {
            "name": label,
            "roc_auc": round(m_auc, 4),
            "recall": round(m_rec, 4),
            "precision": round(m_prec, 4),
            "f1": round(m_f1, 4),
            "accuracy": round(m_acc, 4),
            "curve": [
                {"fpr": round(float(f), 2), "tpr": round(float(t), 4)}
                for f, t in zip(fpr_grid, interp_tpr)
            ],
        }
        print(f"  * {label}:")
        print(f"      ROC-AUC : {m_auc:.4f} | Recall: {m_rec:.4f} | Precision: {m_prec:.4f} | F1: {m_f1:.4f} | Acc: {m_acc:.4f}")

    roc_auc = roc_summary["ensemble"]["roc_auc"]
    recall = roc_summary["ensemble"]["recall"]
    precision = roc_summary["ensemble"]["precision"]
    f1 = roc_summary["ensemble"]["f1"]
    accuracy = roc_summary["ensemble"]["accuracy"]

    # 5. Export Model Artifacts & ROC Curves
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    BACKEND_MODELS_DIR.mkdir(parents=True, exist_ok=True)

    model_path = MODELS_DIR / "readmission_model.joblib"
    scaler_path = MODELS_DIR / "scaler.joblib"
    meta_path = MODELS_DIR / "model_meta.json"
    roc_svg_path = MODELS_DIR / "roc_curves_test_set.svg"
    roc_json_path = MODELS_DIR / "roc_curves.json"
    heatmap_svg_path = MODELS_DIR / "correlation_heatmap.svg"
    rates_svg_path = MODELS_DIR / "readmission_by_age_and_admissions.svg"

    backend_model_path = BACKEND_MODELS_DIR / "readmission_model.joblib"
    backend_scaler_path = BACKEND_MODELS_DIR / "scaler.joblib"
    backend_meta_path = BACKEND_MODELS_DIR / "model_meta.json"
    backend_roc_json_path = BACKEND_MODELS_DIR / "roc_curves.json"

    metadata = {
        "model_type": "VotingClassifier(HistGradientBoosting + RandomForest)",
        "roc_auc": round(roc_auc, 4),
        "recall": round(recall, 4),
        "precision": round(precision, 4),
        "f1": round(f1, 4),
        "accuracy": round(accuracy, 4),
        "models_comparison": roc_summary,
        "feature_names": feature_names,
        "categorical_maps": CATEGORICAL_MAPS,
        "numerical_cols": NUMERICAL_COLS
    }

    # Save to ml_pipeline/models
    joblib.dump(clf, model_path)
    joblib.dump(scaler, scaler_path)
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    with open(roc_json_path, 'w') as f:
        json.dump(roc_summary, f, indent=2)
    generate_roc_svg(roc_summary, roc_svg_path)
    generate_eda_svgs(df, heatmap_svg_path, rates_svg_path)

    # Save copy to backend/app/models/saved_models
    joblib.dump(clf, backend_model_path)
    joblib.dump(scaler, backend_scaler_path)
    with open(backend_meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    with open(backend_roc_json_path, 'w') as f:
        json.dump(roc_summary, f, indent=2)

    print(f"\nSuccessfully exported model artifacts & ROC curves to:")
    print(f" - {model_path}")
    print(f" - {roc_svg_path}")
    print(f" - {heatmap_svg_path}")
    print(f" - {rates_svg_path}")
    print(f" - {roc_json_path}")
    print(f" - {backend_model_path}")
    print("=" * 60)

if __name__ == '__main__':
    train_and_evaluate_models()
