export default function ResultCard({ result }) {
  if (!result) return (
    <div style={{ background: '#f9f9f9', border: '1px solid #e0e0e0',
      borderRadius: '12px', padding: '24px', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '200px' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
      <p style={{ color: '#999', fontSize: '14px', textAlign: 'center' }}>
        Load a sample and click Analyse Transaction
      </p>
    </div>
  );

  const isFraud = result.result === 'FRAUD';

  return (
    <div style={{ borderRadius: '12px', padding: '24px', textAlign: 'center',
      background: isFraud ? '#FDEDED' : '#E8F5E9',
      border: `2px solid ${isFraud ? '#E53935' : '#43A047'}`,
      minHeight: '200px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center' }}>

      <div style={{ fontSize: '52px', marginBottom: '10px' }}>
        {isFraud ? '🚨' : '✅'}
      </div>

      <h2 style={{ fontSize: '26px', margin: '0 0 6px',
        color: isFraud ? '#B71C1C' : '#1B5E20' }}>
        {isFraud ? 'FRAUD DETECTED' : 'LEGITIMATE'}
      </h2>

      <p style={{ fontSize: '16px', margin: '0 0 20px',
        color: isFraud ? '#C62828' : '#2E7D32' }}>
        {result.confidence}% confidence
      </p>

      <div style={{ width: '100%', background: 'rgba(0,0,0,0.08)',
        borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
        <div style={{
          width: `${result.confidence}%`, height: '10px',
          borderRadius: '6px', transition: 'width 0.8s ease',
          background: isFraud
            ? 'linear-gradient(90deg, #E53935, #B71C1C)'
            : 'linear-gradient(90deg, #43A047, #1B5E20)'
        }} />
      </div>

      <p style={{ fontSize: '12px', color: isFraud ? '#C62828' : '#2E7D32',
        marginTop: '8px' }}>
        Risk Score: {result.confidence}%
      </p>

      <div style={{ marginTop: '16px', padding: '10px 16px',
        background: 'rgba(0,0,0,0.05)', borderRadius: '8px',
        fontSize: '12px', color: isFraud ? '#B71C1C' : '#1B5E20' }}>
        {isFraud
          ? 'Transaction blocked. Bank notified.'
          : 'Transaction approved. No risk detected.'}
      </div>
    </div>
  );
}
