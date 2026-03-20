export default function HistoryTable({ history }) {
  if (history.length === 0) return null;

  return (
    <div style={{ marginTop: '30px', background: '#fff',
      border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e0e0e0' }}>
        <h3 style={{ margin: 0, color: '#1F4E99' }}>Transaction History</h3>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#666', fontWeight: '500' }}>#</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#666', fontWeight: '500' }}>Time</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#666', fontWeight: '500' }}>Amount</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#666', fontWeight: '500' }}>Result</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', color: '#666', fontWeight: '500' }}>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {history.map((row) => (
            <tr key={row.id} style={{ borderTop: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px 16px', color: '#999' }}>{row.id}</td>
              <td style={{ padding: '12px 16px', color: '#333' }}>{row.time}</td>
              <td style={{ padding: '12px 16px', color: '#333' }}>€{row.amount}</td>
              <td style={{ padding: '12px 16px' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                  background: row.result === 'FRAUD' ? '#FDEDED' : '#E8F5E9',
                  color: row.result === 'FRAUD' ? '#B71C1C' : '#1B5E20'
                }}>
                  {row.result}
                </span>
              </td>
              <td style={{ padding: '12px 16px', color: '#333' }}>{row.confidence}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}