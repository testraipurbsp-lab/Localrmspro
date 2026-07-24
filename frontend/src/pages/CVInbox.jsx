import React, { useEffect, useState } from 'react';
import { api, fileUrl } from '../api.js';

const statuses = ['New', 'Reviewed', 'Shortlisted', 'Rejected'];
const statusBadge = { New: 'purple', Reviewed: 'orange', Shortlisted: 'green', Rejected: 'red', Converted: 'gray' };

export default function CVInbox() {
  const [entries, setEntries] = useState([]);
  const [team, setTeam] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [convertEntry, setConvertEntry] = useState(null);
  const [convertForm, setConvertForm] = useState({ location: '', position: '' });

  const load = () => api.get('/cv-inbox').then(setEntries);
  useEffect(() => {
    load();
    api.get('/team').then(setTeam);
  }, []);

  const onFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('resume', file);
    try {
      await api.post('/cv-inbox/upload', fd);
      load();
    } catch (err) {
      alert('Could not process this resume.');
    }
    setUploading(false);
    e.target.value = '';
  };

  const updateEntry = async (id, patch) => {
    await api.put(`/cv-inbox/${id}`, patch);
    load();
  };

  const removeEntry = async (id) => {
    await api.del(`/cv-inbox/${id}`);
    load();
  };

  const openConvert = (entry) => {
    setConvertEntry(entry);
    setConvertForm({ location: '', position: '' });
  };

  const doConvert = async () => {
    await api.post(`/cv-inbox/${convertEntry.id}/convert`, convertForm);
    setConvertEntry(null);
    load();
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>CV Inbox</h1>
          <div className="subtitle">{entries.length} resumes received</div>
        </div>
        <div>
          <input type="file" id="cv-upload" style={{ display: 'none' }} accept=".pdf,.docx,.txt" onChange={onFile} />
          <label htmlFor="cv-upload" className="btn" style={{ cursor: 'pointer' }}>
            {uploading ? 'Uploading...' : '+ Upload resume'}
          </label>
        </div>
      </div>

      <div className="panel">
        <table>
          <thead><tr><th>NAME</th><th>CONTACT</th><th>EXPERIENCE</th><th>SKILLS</th><th>RESUME</th><th>STATUS</th><th>RECRUITER</th><th>DATE</th><th></th></tr></thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id}>
                <td><b>{e.name || 'Unnamed'}</b></td>
                <td>{e.email}<br /><span style={{ color: '#999' }}>{e.phone}</span></td>
                <td>{e.experience || '-'}</td>
                <td>{(e.skills || []).map(s => <span className="skill-tag" key={s}>{s}</span>)}</td>
                <td><a href={fileUrl(e.resumeUrl)} target="_blank" rel="noreferrer" style={{ color: '#5b4bde', fontSize: 13 }}>{e.resumeName}</a></td>
                <td>
                  <select value={e.status} onChange={ev => updateEntry(e.id, { status: ev.target.value })}>
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    {e.status === 'Converted' && <option value="Converted">Converted</option>}
                  </select>
                </td>
                <td>
                  <select value={e.recruiter || ''} onChange={ev => updateEntry(e.id, { recruiter: ev.target.value })}>
                    <option value="">Unassigned</option>
                    {team.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                </td>
                <td>{e.uploadedAt}</td>
                <td style={{ display: 'flex', gap: 6 }}>
                  {e.status !== 'Converted' && (
                    <button className="btn secondary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => openConvert(e)}>Convert</button>
                  )}
                  <button className="btn secondary" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => removeEntry(e.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan="9" style={{ textAlign: 'center', color: '#999' }}>No resumes yet — upload one to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {convertEntry && (
        <div className="modal-overlay" onClick={() => setConvertEntry(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Convert {convertEntry.name || 'candidate'} to Candidate</h3>
            <div className="field">
              <label>location</label>
              <input value={convertForm.location} onChange={e => setConvertForm({ ...convertForm, location: e.target.value })} />
            </div>
            <div className="field">
              <label>position</label>
              <input value={convertForm.position} onChange={e => setConvertForm({ ...convertForm, position: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setConvertEntry(null)}>Cancel</button>
              <button className="btn" onClick={doConvert}>Convert</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}