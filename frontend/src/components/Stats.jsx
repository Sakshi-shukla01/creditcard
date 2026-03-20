export default function Stats({ history }) {
  const total = history.length;
  const fraudCount = history.filter(h => h.result === 'FRAUD').length;
  const legitCount = total - fraudCount;

  const cardStyle = {
    background: '#fff', border: '1px solid #e0e0e0',
    borderRadius: '12px', padding: '16px', textAlign: 'center'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
      <div style={cardStyle}>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1F4E99' }}>{total}</div>
        <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>Total Checked</div>
      </div>
      <div style={cardStyle}>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#E53935' }}>{fraudCount}</div>
        <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>Fraud Detected</div>
      </div>
      <div style={cardStyle}>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#43A047' }}>{legitCount}</div>
        <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>Legitimate</div>
      </div>
    </div>
  );
}