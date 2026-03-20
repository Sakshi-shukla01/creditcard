import { useState, useRef } from 'react';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://creditcard-abit.onrender.com'
  : 'http://localhost:5000';

export default function CSVUpload({ onBatchResult }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const processCSV = async (file) => {
    setLoading(true);
    setResults([]);
    setSummary(null);
    setProgress(0);

    const text = await file.text();
    const lines = text.trim().split('\n');

    // Remove header row
    const header = lines[0].toLowerCase();
    const dataLines = header.includes('time') || header.includes('amount')
      ? lines.slice(1)
      : lines;

    // Only process first 100 rows for speed
    const rowsToProcess = dataLines.slice(0, 100);
    setTotal(rowsToProcess.length);

    const batchResults = [];
    let fraudCount = 0;
    let legitCount = 0;

    for (let i = 0; i < rowsToProcess.length; i++) {
      const row = rowsToProcess[i].trim();
      if (!row) continue;

      // Parse CSV row — handle quoted values
      const values = row.split(',').map(v => parseFloat(v.trim()));

      // Skip if row doesn't have enough features
      if (values.length < 30) continue;

      // Use first 30 values as features (Time + V1-V28 + Amount)
  // Remove last column (Class) if present, use only 30 features
const features = values.length === 31 
  ? values.slice(0, 30)   // drop Class column
  : values.slice(0, 30);  // already 30 features

      try {
        const res = await fetch(`${API_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ features })
        });
        const data = await res.json();

        const resultRow = {
          id: i + 1,
          amount: `₹${values[29]?.toFixed(2) || 'N/A'}`,
          merchant: 'CSV Import',
          location: '-',
          time: new Date().toLocaleTimeString(),
          result: data.result,
          confidence: data.confidence
        };

        batchResults.push(resultRow);

        if (data.result === 'FRAUD') fraudCount++;
        else legitCount++;

        setResults([...batchResults]);
        setProgress(i + 1);

      } catch {
        console.error('Error on row', i + 1);
      }
    }

    setSummary({ total: batchResults.length, fraudCount, legitCount });
    onBatchResult(batchResults);
    setLoading(false);
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }
    processCSV(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const fraudResults = results.filter(r => r.result === 'FRAUD');
  const legitResults = results.filter(r => r.result === 'LEGITIMATE');

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current.click()}
        style={{
          border: `2px dashed ${dragging ? '#1F4E99' : '#ccc'}`,
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? '#EEF4FF' : '#fafafa',
          transition: 'all 0.2s',
          marginBottom: '20px'
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📂</div>
        <p style={{ fontSize: '15px', fontWeight: '500', color: '#333', margin: '0 0 6px' }}>
          Drop your CSV file here or click to browse
        </p>
        <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
          Upload creditcard.csv — first 100 rows will be analysed
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {/* Progress bar */}
      {loading && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            fontSize: '13px', color: '#555', marginBottom: '6px' }}>
            <span>Analysing transactions...</span>
            <span>{progress} / {total}</span>
          </div>
          <div style={{ background: '#e0e0e0', borderRadius: '6px', height: '10px' }}>
            <div style={{
              width: `${total > 0 ? (progress / total) * 100 : 0}%`,
              height: '10px', borderRadius: '6px',
              background: '#1F4E99', transition: 'width 0.2s'
            }} />
          </div>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
            Please wait — sending each row to fraud detection model...
          </p>
        </div>
      )}

      {/* Summary cards */}
      {summary && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: '#f5f5f5', borderRadius: '10px',
            padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F4E99' }}>
              {summary.total}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Total Analysed
            </div>
          </div>
          <div style={{ background: '#FDEDED', borderRadius: '10px',
            padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#B71C1C' }}>
              {summary.fraudCount}
            </div>
            <div style={{ fontSize: '12px', color: '#C62828', marginTop: '4px' }}>
              Fraud Detected
            </div>
          </div>
          <div style={{ background: '#E8F5E9', borderRadius: '10px',
            padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1B5E20' }}>
              {summary.legitCount}
            </div>
            <div style={{ fontSize: '12px', color: '#2E7D32', marginTop: '4px' }}>
              Legitimate
            </div>
          </div>
        </div>
      )}

      {/* Fraud results first */}
      {fraudResults.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: '#B71C1C', margin: '0 0 8px', fontSize: '14px' }}>
            Flagged Transactions ({fraudResults.length})
          </h4>
          <div style={{ background: '#fff', border: '1px solid #ffcdd2',
            borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#FDEDED' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#B71C1C', fontWeight: '500' }}>#</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#B71C1C', fontWeight: '500' }}>Amount</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#B71C1C', fontWeight: '500' }}>Confidence</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#B71C1C', fontWeight: '500' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {fraudResults.map((row) => (
                  <tr key={row.id} style={{ borderTop: '1px solid #ffebee' }}>
                    <td style={{ padding: '10px 14px', color: '#999' }}>{row.id}</td>
                    <td style={{ padding: '10px 14px', color: '#333' }}>{row.amount}</td>
                    <td style={{ padding: '10px 14px', color: '#B71C1C', fontWeight: '500' }}>{row.confidence}%</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: '#FDEDED', color: '#B71C1C',
                        padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                        fontWeight: '500' }}>FRAUD</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legit results */}
      {legitResults.length > 0 && (
        <div>
          <h4 style={{ color: '#1B5E20', margin: '0 0 8px', fontSize: '14px' }}>
            Legitimate Transactions ({legitResults.length})
          </h4>
          <div style={{ background: '#fff', border: '1px solid #c8e6c9',
            borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#E8F5E9' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#1B5E20', fontWeight: '500' }}>#</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#1B5E20', fontWeight: '500' }}>Amount</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#1B5E20', fontWeight: '500' }}>Confidence</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#1B5E20', fontWeight: '500' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {legitResults.map((row) => (
                  <tr key={row.id} style={{ borderTop: '1px solid #f1f8e9' }}>
                    <td style={{ padding: '10px 14px', color: '#999' }}>{row.id}</td>
                    <td style={{ padding: '10px 14px', color: '#333' }}>{row.amount}</td>
                    <td style={{ padding: '10px 14px', color: '#1B5E20', fontWeight: '500' }}>{row.confidence}%</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: '#E8F5E9', color: '#1B5E20',
                        padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
                        fontWeight: '500' }}>LEGIT</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}