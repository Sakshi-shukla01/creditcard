from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import pickle
import numpy as np
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Load model
model = pickle.load(open('model.pkl', 'rb'))

# Connect to MongoDB
client = MongoClient(os.getenv('MONGO_URI'))
db = client['frauddb']
transactions = db['transactions']

print("MongoDB connected!")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    features = np.array(data['features']).reshape(1, -1)

    prediction = model.predict(features)
    probability = model.predict_proba(features)[0][1]

    result = 'FRAUD' if prediction[0] == 1 else 'LEGITIMATE'
    confidence = round(float(probability) * 100, 2)

    # Save to MongoDB
    transaction_doc = {
        'result': result,
        'confidence': confidence,
        'amount': data.get('amount', 'N/A'),
        'merchant': data.get('merchant', 'N/A'),
        'location': data.get('location', 'N/A'),
        'card': data.get('card', 'N/A'),
        'timestamp': datetime.utcnow(),
        'features': data['features']
    }
    transactions.insert_one(transaction_doc)

    return jsonify({
        'result': result,
        'confidence': confidence
    })

@app.route('/history', methods=['GET'])
def get_history():
    # Get last 50 transactions from MongoDB
    docs = list(transactions.find(
        {},
        {'_id': 0, 'features': 0}  # exclude features and _id
    ).sort('timestamp', -1).limit(50))

    # Convert datetime to string
    for doc in docs:
        doc['timestamp'] = doc['timestamp'].strftime('%Y-%m-%d %H:%M:%S')

    return jsonify(docs)

@app.route('/stats', methods=['GET'])
def get_stats():
    total = transactions.count_documents({})
    fraud = transactions.count_documents({'result': 'FRAUD'})
    legit = transactions.count_documents({'result': 'LEGITIMATE'})

    return jsonify({
        'total': total,
        'fraud': fraud,
        'legit': legit
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)