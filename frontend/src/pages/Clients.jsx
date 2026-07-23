import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const empty = { name: '', industry: '', contact: '', email: '', openJobs: 0 };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);

  const load = () => api.get('/clients').then(setClients);
  useEffect(() => { load(); }, []);

  const save = async () => {
    await api.post('/clients', form);
    setForm(empty);
    setShowModal(false);
    load();
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Clients</h1>
          <div className="subtitle">{clients.length} client companies</div>
        </div>
        <button className="btn" onClick={() => setShowModal(true)}>+ Add client</button>
      </div>
      <div className="panel">
        <table>
          <thead><tr><th>CLIENT</th><th>CONTACT</th><th>OPEN JOBS</th><th>STATUS</th></tr></thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id}>
                <td><b>{c.name}</b><br /><span style={{ color: '#999' }}>{c.industry}</span></td>
                <td>{c.contact}<br /><span style={{ color: '#999' }}>{c.email}</span></td>
                <td>{c.openJobs}</td>
                <td><span className={'badge ' + (c.status === 'active' ? 'green' : 'gray')}>{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add client</h3>
            {['name', 'industry', 'contact', 'email'].map(f => (
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
