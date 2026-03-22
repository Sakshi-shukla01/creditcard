# UPI Fraud Detection System

A full-stack, production-ready fraud detection system built with XGBoost, Flask, React, and MongoDB. Achieves **0.98 AUC** and **88.78% recall** on 284,807 real transactions.

---

## Live Demo

| Service | URL |
|---|---|
| Frontend (React) | https://creditcard-liart.vercel.app |
| Backend API (Flask) | https://creditcard-abit.onrender.com |
| API Health Check | https://creditcard-abit.onrender.com/health |

---

## Project Overview

This system detects fraudulent UPI/credit card transactions in real time using machine learning. It supports both single transaction analysis and batch CSV upload — mirroring how fraud teams at PhonePe, Razorpay, and Paytm operate internally.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Machine Learning | XGBoost, Scikit-learn, SMOTE |
| Backend API | Flask, Flask-CORS, Gunicorn |
| Database | MongoDB Atlas |
| Frontend | React.js |
| Experiment Tracking | MLflow |
| Containerisation | Docker |
| CI/CD | GitHub Actions |
| Deployment | Render (Flask), Vercel (React) |

---

## ML Model Performance

| Metric | Value |
|---|---|
| AUC Score | 0.9775 |
| Recall (fraud) | 88.78% |
| Precision (fraud) | 52.73% |
| F1 Score | 0.6616 |
| Dataset Size | 284,807 transactions |
| Fraud Rate | 0.17% (492 frauds) |

---

## Features

- **Single Transaction Analysis** — Load a real fraud or legit sample, edit amount, and get instant prediction
- **Batch CSV Upload** — Upload hundreds of transactions at once, get fraud/legit classification for each row
- **Persistent History** — Every prediction saved to MongoDB, history survives page refresh
- **Live Stats Dashboard** — Total checked, fraud detected, legitimate transactions
- **MLflow Experiment Tracking** — Compared XGBoost v1 vs v2, logged all metrics and parameters
- **CI/CD Pipeline** — GitHub Actions auto-tests and deploys on every push

---

## Project Structure

```
credit-card/
├── model.pkl               ← trained XGBoost model
├── app.py                  ← Flask REST API
├── train.py                ← local training with MLflow
├── log_results.py          ← log Kaggle results to MLflow
├── requirements.txt        ← Python dependencies
├── Dockerfile              ← Docker containerisation
├── runtime.txt             ← Python version for Render
├── .env                    ← environment variables (not committed)
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy.yml      ← GitHub Actions CI/CD
└── frontend/
    └── src/
        ├── App.js
        └── components/
            ├── TransactionForm.jsx
            ├── ResultCard.jsx
            ├── Stats.jsx
            ├── HistoryTable.jsx
            └── CSVUpload.jsx
```

---

## ML Concepts Used

### SMOTE (Synthetic Minority Oversampling)
Only 0.17% of transactions are fraud — a model trained on raw data would always predict "legit" and get 99.83% accuracy while catching zero fraud. SMOTE creates synthetic fraud samples by interpolating between real fraud data points, balancing the dataset to 50/50 before training.

### XGBoost
Builds decision trees sequentially — each tree learns from the previous tree's mistakes. Consistently outperforms neural networks on tabular data. Used at Flipkart, Swiggy, and most fintech companies for fraud detection.

### ROC-AUC
Standard metric for imbalanced classification. AUC of 0.9775 means the model correctly distinguishes fraud from legit 97.75% of the time across all decision thresholds. Much more meaningful than accuracy for fraud detection.

### Why Recall Over Precision?
Missing a fraud (False Negative) costs real money. Flagging a legit transaction as fraud (False Positive) is just annoying. So we optimise for recall — catching as many frauds as possible — even at the cost of some false alarms.

---

## MLflow Experiment Results

| Run | AUC | Recall | Precision | F1 | Chosen? |
|---|---|---|---|---|---|
| XGBoost-v1 | 0.9775 | 88.78% | 52.73% | 0.6616 | ✅ Production |
| XGBoost-v2 | 0.9746 | 83.67% | 63.57% | 0.7225 | ❌ |

V1 chosen because recall is higher — catching more fraud is the priority.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /health | Check API status |
| GET | / | API info and endpoints |
| POST | /predict | Predict fraud for a transaction |
| GET | /history | Last 50 transactions from MongoDB |
| GET | /stats | Total, fraud, legit counts |

### Sample /predict request
```json
POST /predict
{
  "features": [406.0, -2.31, 1.95, -1.60, 3.99, ...],
  "amount": 406.0,
  "merchant": "Amazon Pay",
  "location": "Mumbai"
}
```

### Sample /predict response
```json
{
  "result": "FRAUD",
  "confidence": 99.84
}
```

---

## Local Setup

### Prerequisites
- Python 3.11
- Node.js 18+
- MongoDB Atlas account (free)

### Backend Setup
```bash
# Clone repo
git clone https://github.com/Sakshi-shukla01/upi-fraud-detection.git
cd upi-fraud-detection

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "MONGO_URI=your_mongodb_connection_string" > .env

# Run Flask
python app.py
# API running at http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
# React running at http://localhost:3000
```

### Docker (optional)
```bash
# Build image
docker build -t fraud-api .

# Run container
docker run -p 5000:5000 --env-file .env fraud-api
```

---

## CI/CD Pipeline

Every push to `main` branch triggers:

```
Push to GitHub
      ↓
GitHub Actions
      ↓
Test Job — loads model.pkl, runs prediction test
      ↓ (only if test passes)
Deploy Job — triggers Render webhook
      ↓
Render pulls new code and redeploys automatically
```

---

## Environment Variables

| Variable | Where | Value |
|---|---|---|
| `MONGO_URI` | Render + local `.env` | MongoDB Atlas connection string |
| `REACT_APP_API_URL` | Vercel | https://creditcard-abit.onrender.com |
| `MONGO_URI` | GitHub Secrets | MongoDB Atlas connection string |
| `RENDER_DEPLOY_HOOK` | GitHub Secrets | Render deploy hook URL |

---

## Dataset

- **Source:** [Kaggle — Credit Card Fraud Detection](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud)
- **Size:** 284,807 transactions
- **Fraud cases:** 492 (0.17%)
- **Features:** V1-V28 (PCA-anonymised), Amount, Time
- **Origin:** Real European cardholder transactions (anonymised)

---

## Author

**Sakshi Shukla**
- GitHub: [@Sakshi-shukla01](https://github.com/Sakshi-shukla01)

---

## License

MIT License