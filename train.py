import pandas as pd
import numpy as np
import mlflow
import mlflow.sklearn
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    roc_auc_score, recall_score,
    precision_score, f1_score,
    classification_report
)
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
import pickle
import os

# ── Load data ─────────────────────────────────────────────────
# Download creditcard.csv from Kaggle and put in credit-card/ folder
CSV_PATH = 'creditcard.csv'

if not os.path.exists(CSV_PATH):
    print("ERROR: creditcard.csv not found in credit-card/ folder")
    print("Download from: kaggle.com/datasets/mlg-ulb/creditcardfraud")
    exit()

print("Loading data...")
df = pd.read_csv(CSV_PATH)
print(f"Loaded: {df.shape}")

# ── Split ─────────────────────────────────────────────────────
X = df.drop('Class', axis=1)
y = df['Class']

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# ── SMOTE ─────────────────────────────────────────────────────
print("Applying SMOTE...")
sm = SMOTE(random_state=42)
X_train_res, y_train_res = sm.fit_resample(X_train, y_train)
print(f"After SMOTE: {pd.Series(y_train_res).value_counts().to_dict()}")

# ── MLflow experiment ─────────────────────────────────────────
mlflow.set_experiment("fraud-detection")

# ── Change these params to try new versions ───────────────────
params = {
    'n_estimators': 100,
    'max_depth': 6,
    'learning_rate': 0.1,
    'eval_metric': 'logloss',
    'random_state': 42
}

print("\nTraining XGBoost...")

with mlflow.start_run(run_name="XGBoost-local"):

    # Log all params
    mlflow.log_param("model_type", "XGBoost")
    mlflow.log_param("n_estimators", params['n_estimators'])
    mlflow.log_param("max_depth", params['max_depth'])
    mlflow.log_param("learning_rate", params['learning_rate'])
    mlflow.log_param("smote", True)
    mlflow.log_param("test_size", 0.2)

    # Train
    model = XGBClassifier(**params)
    model.fit(X_train_res, y_train_res)

    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    auc       = round(roc_auc_score(y_test, y_prob), 4)
    recall    = round(recall_score(y_test, y_pred), 4)
    precision = round(precision_score(y_test, y_pred), 4)
    f1        = round(f1_score(y_test, y_pred), 4)

    # Log metrics
    mlflow.log_metric("auc", auc)
    mlflow.log_metric("recall", recall)
    mlflow.log_metric("precision", precision)
    mlflow.log_metric("f1_score", f1)

    # Save model
    pickle.dump(model, open('model.pkl', 'wb'))
    mlflow.sklearn.log_model(model, "model")
    mlflow.log_artifact('model.pkl')

    print(f"\n=== Results ===")
    print(f"AUC:       {auc}")
    print(f"Recall:    {recall}")
    print(f"Precision: {precision}")
    print(f"F1 Score:  {f1}")
    print(f"\n{classification_report(y_test, y_pred)}")
    print(f"\nmodel.pkl saved!")
    print(f"Run ID: {mlflow.last_active_run().info.run_id}")
