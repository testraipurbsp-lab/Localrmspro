import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => { api.get('/dashboard').then(setData); }, []);

  if (!data) return <div>Loading...</div>;
  const { stats, pipeline } = data;
 const cards = [
  ['Open positions', stats.openPositions, 'violet'],
  ['Calls today', stats.callsToday, 'blue'],
  ['Interviews scheduled', stats.interviewsScheduled, 'amber'],
  ['Offers accepted', stats.offersAccepted, 'green'],
  ['Joined this month', stats.joinedThisMonth, 'teal'],
  ['Invoices pending', stats.invoicesPending, 'rose'],
  ['Revenue (MTD)', '₹' + (stats.revenueMTD / 100000).toFixed(1) + 'L', 'violet'],
];
  const maxVal = Math.max(1, ...Object.values(pipeline));

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="subtitle">Overview across all clients</div>
      <div className="cards">
     {cards.map(([label, value, accent]) => (
  <div className={'card accent-' + accent} key={label}>
            <div className="label">{label}</div>
            <div className="value">{value}</div>
          </div>
        ))}
      </div>
      <div className="panel">
        <h3>Pipeline by stage</h3>
        {Object.entries(pipeline).map(([stage, count]) => (
          <div className="bar-row" key={stage}>
            <div className="top"><span>{stage}</span><span>{count}</span></div>
            <div className="bar-bg"><div className="bar-fill" style={{ width: (count / maxVal * 100) + '%' }} /></div>
          </div>
        ))}
        {Object.keys(pipeline).length === 0 && <div>No candidates yet.</div>}
      </div>
    </div>
  );
}
