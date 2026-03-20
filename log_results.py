import mlflow

mlflow.set_experiment("fraud-detection")

# Log V1 results from Kaggle
with mlflow.start_run(run_name="XGBoost-v1"):
    mlflow.log_param("model_type", "XGBoost")
    mlflow.log_param("n_estimators", 100)
    mlflow.log_param("max_depth", 6)
    mlflow.log_param("learning_rate", 0.1)
    mlflow.log_param("smote", True)
    mlflow.log_param("dataset_rows", 284807)

    mlflow.log_metric("auc", 0.9775)
    mlflow.log_metric("recall", 0.8878)
    mlflow.log_metric("precision", 0.5273)
    mlflow.log_metric("f1_score", 0.6616)
    print("V1 logged!")

# Log V2 results from Kaggle
with mlflow.start_run(run_name="XGBoost-v2"):
    mlflow.log_param("model_type", "XGBoost")
    mlflow.log_param("n_estimators", 200)
    mlflow.log_param("max_depth", 8)
    mlflow.log_param("learning_rate", 0.05)
    mlflow.log_param("smote", True)
    mlflow.log_param("dataset_rows", 284807)

    mlflow.log_metric("auc", 0.9746)
    mlflow.log_metric("recall", 0.8367)
    mlflow.log_metric("precision", 0.6357)
    mlflow.log_metric("f1_score", 0.7225)
    print("V2 logged!")

# Log production model
with mlflow.start_run(run_name="XGBoost-PRODUCTION"):
    mlflow.log_param("model_type", "XGBoost")
    mlflow.log_param("n_estimators", 100)
    mlflow.log_param("max_depth", 6)
    mlflow.log_param("learning_rate", 0.1)
    mlflow.log_param("reason_chosen", "highest_recall")
    mlflow.log_param("dataset_rows", 284807)

    mlflow.log_metric("auc", 0.9775)
    mlflow.log_metric("recall", 0.8878)
    mlflow.log_metric("precision", 0.5273)
    mlflow.log_metric("f1_score", 0.6616)
    print("Production model logged!")

print("\nAll runs logged! Refresh MLflow UI at http://localhost:5001")