import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const emptyForm = { contact: '', phone: '', email: '', location: '', position: '', salary: '', status: 'Interested', remarks: '', source: 'Referral', recruiter: '' };
const badgeClass = { Interested: 'green', 'Not pick': 'gray', 'Notice Issue': 'orange', 'Location Issue': 'orange' };

export default function Calls() {
  const [calls, setCalls] = useState([]);
  const [team, setTeam] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterRecruiter, setFilterRecruiter] = useState('All');

  const load = () => api.get('/calls').then(setCalls);
  useEffect(() => {
    load();
    api.get('/team').then(setTeam);
  }, []);

  const save = async () => {
    await api.post('/calls', form);
    setForm(emptyForm);
    setShowModal(false);
    load();
  };

  const visibleCalls = filterRecruiter === 'All' ? calls : calls.filter(c => c.recruiter === filterRecruiter);

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Call logs</h1>
          <div className="subtitle">Daily calling sheet</div>
        </div>
        <button className="btn" onClick={() => setShowModal(true)}>+ Log call</button>
      </div>

      <div className="field" style={{ maxWidth: 240, marginBottom: 14 }}>
        <label>Filter by recruiter</label>
        <select value={filterRecruiter} onChange={e => setFilterRecruiter(e.target.value)}>
          <option value="All">All recruiters</option>
          {team.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
      </div>

      <div className="panel">
        <table>
          <thead><tr><th>CONTACT</th><th>MAIL ID</th><th>LOCATION</th><th>POSITION</th><th>SALARY</th><th>STATUS</th><th>REMARKS</th><th>SOURCE</th><th>RECRUITER</th><th>DATE</th></tr></thead>
          <tbody>
            {visibleCalls.map(c => (
              <tr key={c.id}>
                <td><b>{c.contact}</b><br /><span style={{ color: '#999' }}>{c.phone}</span></td>
                <td>{c.email}</td>
                <td>{c.location}</td>
                <td>{c.position}</td>
                <td>{c.salary}</td>
                <td><span className={'badge ' + (badgeClass[c.status] || 'gray')}>{c.status}</span></td>
                <td>{c.remarks}</td>
                <td><span className="badge purple">{c.source}</span></td>
                <td><span className="badge gray">{c.recruiter || '-'}</span></td>
                <td>{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Log call</h3>
            {['contact', 'phone', 'email', 'location', 'position', 'salary', 'remarks'].map(f => (
              <div className="field" key={f}>
                <label>{f}</label>
                <input value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} />
              </div>
            ))}
            <div className="field">
              <label>status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {['Interested', 'Not pick', 'Notice Issue', 'Location Issue'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>source</label>
              <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                {['LinkedIn', 'Referral', 'Naukri'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>recruiter</label>
              <select value={form.recruiter} onChange={e => setForm({ ...form, recruiter: e.target.value })}>
                <option value="">Select recruiter</option>
                {team.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}