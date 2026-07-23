import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const emptyForm = { title: '', client: '', location: '', openings: 1 };

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => api.get('/jobs').then(setJobs);
  useEffect(() => { load(); }, []);

  const save = async () => {
    await api.post('/jobs', form);
    setForm(emptyForm);
    setShowModal(false);
    load();
  };

  const toggleStatus = async (job) => {
    await api.put(`/jobs/${job.id}`, { status: job.status === 'open' ? 'closed' : 'open' });
    load();
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Jobs</h1>
          <div className="subtitle">{jobs.length} job openings</div>
        </div>
        <button className="btn" onClick={() => setShowModal(true)}>+ Add job</button>
      </div>
      <div className="panel">
        <table>
          <thead><tr><th>TITLE</th><th>CLIENT</th><th>LOCATION</th><th>OPENINGS</th><th>STATUS</th></tr></thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j.id}>
                <td><b>{j.title}</b></td>
                <td>{j.client}</td>
                <td>{j.location}</td>
                <td>{j.openings}</td>
                <td>
                  <span className={'badge ' + (j.status === 'open' ? 'green' : 'gray')} style={{ cursor: 'pointer' }} onClick={() => toggleStatus(j)}>{j.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add job</h3>
            {['title', 'client', 'location', 'openings'].map(f => (
              <div className="field" key={f}>
                <label>{f}</label>
                <input value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} />
              </div>
            ))}
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
