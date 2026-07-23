import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Reports() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/reports').then(setData); }, []);
  if (!data) return <div>Loading...</div>;

  const L = (n) => '₹' + (n / 100000).toFixed(1) + 'L';
  const renderBars = (obj) => {
    const max = Math.max(1, ...Object.values(obj));
    return Object.entries(obj).map(([k, v]) => (
      <div className="bar-row" key={k}>
        <div className="top"><span>{k}</span><span>{v}</span></div>
        <div className="bar-bg"><div className="bar-fill" style={{ width: (v / max * 100) + '%' }} /></div>
      </div>
    ));
  };

  return (
    <div>
      <h1>Reports</h1>
      <div className="subtitle">Insights across candidates, leads, and revenue</div>
      <div className="cards">
        <div className="card"><div className="label">Total candidates</div><div className="value">{data.totalCandidates}</div></div>
        <div className="card"><div className="label">Total clients</div><div className="value">{data.totalClients}</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="panel">
          <h3>Candidates by source</h3>
          {renderBars(data.bySource)}
        </div>
        <div className="panel">
          <h3>Leads by recruiter</h3>
          {renderBars(data.byRecruiter)}
        </div>
      </div>
      <div className="panel">
        <h3>Revenue by client (paid invoices)</h3>
        <table>
          <thead><tr><th>CLIENT</th><th>REVENUE</th></tr></thead>
          <tbody>
            {Object.entries(data.revenueByClient).map(([client, amt]) => (
              <tr key={client}><td>{client}</td><td>{L(amt)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
