import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';

export default function CandidateDetail() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [summary, setSummary] = useState('');
  const [messageType, setMessageType] = useState('email');
  const [message, setMessage] = useState('');

  useEffect(() => { api.get(`/candidates/${id}`).then(setC); }, [id]);

  if (!c) return <div>Loading...</div>;

  const salaryLow = c.expectedCTC ? (c.expectedCTC * 0.9).toFixed(1) : '-';
  const salaryHigh = c.expectedCTC ? (c.expectedCTC * 1.25).toFixed(1) : '-';

  const generateSummary = () => {
    setSummary(
      `${c.name} is a ${c.experience} professional skilled in ${(c.skills || []).join(', ')}, ` +
      `currently based in ${c.location}. Sourced via ${c.source}, they are open to roles around ` +
      `${c.position} and are expecting a CTC of ₹${c.expectedCTC}L per annum.`
    );
  };

  const draftMessage = (type) => {
    setMessageType(type);
    if (type === 'email') {
      setMessage(
        `Subject: Opportunity for ${c.position}\n\nHi ${c.name},\n\nWe have an open role for ${c.position} that matches your background in ${(c.skills || [])[0] || 'your field'}. Would you be open to a quick call this week to discuss further?\n\nBest regards,\nMilestone Recruitment Consultants`
      );
    } else {
      setMessage(
        `Hi ${c.name}, this is from Milestone Recruitment Consultants. We have an opening for ${c.position} that looks like a great fit for you. Let us know if you'd like to hear more!`
      );
    }
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>{c.name}</h1>
          <div className="subtitle">{c.location} · {c.experience} experience</div>
        </div>
        <Link to="/candidates"><button className="btn secondary">Back to candidates</button></Link>
      </div>

      <div className="panel">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <div className="label" style={{ color: '#8a8a9a', fontSize: 12 }}>Phone</div>
            <div>{c.phone}</div>
          </div>
          <div>
            <div className="label" style={{ color: '#8a8a9a', fontSize: 12 }}>Email</div>
            <div>{c.email}</div>
          </div>
          <div>
            <div className="label" style={{ color: '#8a8a9a', fontSize: 12 }}>Current CTC</div>
            <div>₹{c.currentCTC || '-'}.0L</div>
          </div>
          <div>
            <div className="label" style={{ color: '#8a8a9a', fontSize: 12 }}>Expected CTC</div>
            <div>₹{c.expectedCTC || '-'}.0L</div>
          </div>
          <div>
            <div className="label" style={{ color: '#8a8a9a', fontSize: 12 }}>Source</div>
            <div><span className="badge gray">{c.source}</span></div>
          </div>
          <div>
            <div className="label" style={{ color: '#8a8a9a', fontSize: 12 }}>Salary band</div>
            <div>₹{salaryLow}L – ₹{salaryHigh}L per annum</div>
          </div>
          <div>
            <div className="label" style={{ color: '#8a8a9a', fontSize: 12 }}>Industry</div>
            <div>{c.industry || '-'}</div>
          </div>
          <div>
            <div className="label" style={{ color: '#8a8a9a', fontSize: 12 }}>Education</div>
            <div>{c.education || '-'}</div>
          </div>
          <div>
            <div className="label" style={{ color: '#8a8a9a', fontSize: 12 }}>Notice period</div>
            <div>{c.noticePeriod || '-'}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="label" style={{ color: '#8a8a9a', fontSize: 12 }}>Skills</div>
            <div>{(c.skills || []).map(s => <span className="skill-tag" key={s}>{s}</span>)}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="panel">
          <h3>Candidate summary</h3>
          <button className="btn secondary" onClick={generateSummary}>Generate summary</button>
          {summary && <p style={{ marginTop: 12, fontSize: 14, color: '#444' }}>{summary}</p>}
        </div>
        <div className="panel">
          <h3>Outreach message</h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <button className="btn secondary" onClick={() => draftMessage('email')}>Draft email</button>
            <button className="btn secondary" onClick={() => draftMessage('whatsapp')}>Draft WhatsApp</button>
          </div>
          {message && <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: '#444', fontFamily: 'inherit' }}>{message}</pre>}
        </div>
      </div>

      <div className="panel">
        <h3>Pipeline history</h3>
        <table>
          <thead><tr><th>JOB</th><th>STAGE</th><th>DATE</th><th>INTERVIEWER</th></tr></thead>
          <tbody>
            {(c.interviews || []).length === 0 && (
              <tr><td colSpan="4">Current stage: {c.stage}</td></tr>
            )}
            {(c.interviews || []).map(iv => (
              <tr key={iv.id}>
                <td>{iv.job}</td>
                <td><span className="badge orange">{iv.status}</span></td>
                <td>{iv.date} {iv.time}</td>
                <td>{iv.interviewer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
