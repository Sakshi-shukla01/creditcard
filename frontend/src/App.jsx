import { useState, useEffect } from 'react';
import TransactionForm from './components/TransactionForm';
import ResultCard from './components/ResultCard';
import HistoryTable from './components/HistoryTable';
import Stats from './components/Stats';
import CSVUpload from './components/CSVUpload';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-app.onrender.com'
  : 'http://localhost:5000';

function App() {
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ total: 0, fraud: 0, legit: 0 });
  const [activeTab, setActiveTab] = useState('single');

  // Load history from MongoDB on page load
  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/history`);
      const data = await res.json();
      setHistory(data.map((row, i) => ({
        id: i + 1,
        amount: row.amount,
        merchant: row.merchant,
        location: row.location,
        time: row.timestamp,
        result: row.result,
        confidence: row.confidence
      })));
    } catch (err) {
      console.log('Could not load history');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.log('Could not load stats');
    }
  };

  const handleResult = (newResult, formData) => {
    setResult(newResult);
    const newEntry = {
      id: history.length + 1,
      amount: formData.amount,
      merchant: formData.merchant,
      location: formData.location,
      time: new Date().toLocaleTimeString(),
      result: newResult.result,
      confidence: newResult.confidence
    };
    setHistory(prev => [newEntry, ...prev]);
    setStats(prev => ({
      total: prev.total + 1,
      fraud: prev.fraud + (newResult.result === 'FRAUD' ? 1 : 0),
      legit: prev.legit + (newResult.result === 'LEGITIMATE' ? 1 : 0)
    }));
  };

  const tabStyle = (tab) => ({
    padding: '10px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    background: activeTab === tab ? '#1F4E99' : '#f0f0f0',
    color: activeTab === tab ? '#fff' : '#555',
    transition: 'all 0.2s'
  });

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto',
      padding: '30px 20px', fontFamily: 'Arial, sans-serif' }}>

      <h1 style={{ textAlign: 'center', color: '#1F4E99', marginBottom: '4px' }}>
        UPI Fraud Detection System
      </h1>
      <p style={{ textAlign: 'center', color: '#888', marginBottom: '28px', fontSize: '14px' }}>
        Real-time transaction fraud analysis — powered by XGBoost
      </p>

      {/* Stats from MongoDB */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div style={{ background: '#fff', border: '1px solid #e0e0e0',
          borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1F4E99' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
            Total Checked
          </div>
        </div>
        <div style={{ background: '#FDEDED', border: '1px solid #ffcdd2',
          borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#B71C1C' }}>
            {stats.fraud}
          </div>
          <div style={{ fontSize: '13px', color: '#C62828', marginTop: '4px' }}>
            Fraud Detected
          </div>
        </div>
        <div style={{ background: '#E8F5E9', border: '1px solid #c8e6c9',
          borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1B5E20' }}>
            {stats.legit}
          </div>
          <div style={{ fontSize: '13px', color: '#2E7D32', marginTop: '4px' }}>
            Legitimate
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', margin: '24px 0 20px' }}>
        <button style={tabStyle('single')} onClick={() => setActiveTab('single')}>
          Single Transaction
        </button>
        <button style={tabStyle('csv')} onClick={() => setActiveTab('csv')}>
          Batch CSV Upload
        </button>
      </div>

      {activeTab === 'single' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <TransactionForm onResult={handleResult} />
          <ResultCard result={result} />
        </div>
      )}

      {activeTab === 'csv' && (
        <CSVUpload onBatchResult={(results) => {
          setHistory(prev => [...results, ...prev]);
          fetchStats();
        }} />
      )}

      <HistoryTable history={history} />
    </div>
  );
}

export default App;