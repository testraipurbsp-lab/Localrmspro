import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const stages = ['Sourced', 'Contacted', 'Submitted', 'Interview', 'Selected', 'Offered', 'Joined'];
const emptyForm = { name: '', location: '', email: '', phone: '', position: '', experience: '', currentCTC: '', expectedCTC: '', source: 'Resume Upload', skills: [] };

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [parsing, setParsing] = useState(false);

  const load = () => api.get('/candidates').then(setCandidates);
  useEffect(() => { load(); }, []);

  const onFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setParsing(true);
    const fd = new FormData();
    fd.append('resume', file);
    try {
      const parsed = await api.post('/candidates/parse-resume', fd);
      setForm(f => ({
        ...f,
        name: parsed.name || f.name,
        email: parsed.email || f.email,
        phone: parsed.phone || f.phone,
        experience: parsed.experience || f.experience,
        skills: parsed.skills || [],
      }));
    } catch (err) {
      alert('Could not parse resume. You can still fill details manually.');
    }
    setParsing(false);
  };

  const save = async () => {
    await api.post('/candidates', { ...form, stage: 'Sourced' });
    setForm(emptyForm);
    setShowModal(false);
    load();
  };

  const updateStage = async (id, stage) => {
    await api.put(`/candidates/${id}`, { stage });
    load();
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Candidates</h1>
          <div className="subtitle">{candidates.length} candidates in the database</div>
        </div>
        <button className="btn" onClick={() => setShowModal(true)}>+ Add candidate</button>
      </div>

      <div className="panel">
        <table>
          <thead><tr><th>CANDIDATE</th><th>SKILLS</th><th>EXPERIENCE</th><th>EXPECTED CTC</th><th>SOURCE</th><th>STAGE</th></tr></thead>
          <tbody>
            {candidates.map(c => (
              <tr key={c.id}>
                <td>
                  <Link to={`/candidates/${c.id}`} style={{ color: '#5b4bde', fontWeight: 600, textDecoration: 'none' }}>{c.name}</Link>
                  <br /><span style={{ color: '#999' }}>{c.location}</span>
                </td>
                <td>{(c.skills || []).map(s => <span className="skill-tag" key={s}>{s}</span>)}</td>
                <td>{c.experience}</td>
                <td>{c.expectedCTC ? '₹' + c.expectedCTC + '.0L' : '-'}</td>
                <td><span className="badge gray">{c.source}</span></td>
                <td>
                  <select value={c.stage} onChange={e => updateStage(c.id, e.target.value)}>
                    {stages.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add candidate</h3>

            <div className="field">
              <label>Upload resume (PDF / DOCX / TXT) — auto-fills details</label>
              <input type="file" accept=".pdf,.docx,.txt" onChange={onFile} />
              {parsing && <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>Parsing resume...</div>}
            </div>

            {['name', 'location', 'email', 'phone', 'position', 'experience', 'currentCTC', 'expectedCTC'].map(f => (
              <div className="field" key={f}>
                <label>{f}</label>
                <input value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} />
              </div>
            ))}

            {form.skills.length > 0 && (
              <div className="field">
                <label>Skills detected</label>
                <div>{form.skills.map(s => <span className="skill-tag" key={s}>{s}</span>)}</div>
              </div>
            )}

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
