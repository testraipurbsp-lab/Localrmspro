import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const stages = ['Sourced', 'Contacted', 'Submitted', 'Interview', 'Selected', 'Offered', 'Joined'];

export default function Pipeline() {
  const [candidates, setCandidates] = useState([]);
  useEffect(() => { api.get('/candidates').then(setCandidates); }, []);

  return (
    <div>
      <h1>Pipeline</h1>
      <div className="subtitle">Candidates grouped by stage</div>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto' }}>
        {stages.map(stage => {
          const items = candidates.filter(c => c.stage === stage);
          return (
            <div key={stage} className="panel" style={{ minWidth: 220, flex: '0 0 220px' }}>
              <h3>{stage} ({items.length})</h3>
              {items.map(c => (
                <Link to={`/candidates/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#f7f7fb', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, color: '#1f2233', fontSize: 13 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: '#8a8a9a' }}>{c.position}</div>
                  </div>
                </Link>
              ))}
              {items.length === 0 && <div style={{ fontSize: 12, color: '#bbb' }}>No candidates</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
