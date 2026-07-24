import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import BulkImportModal from '../components/BulkImportModal.jsx';

const emptyForm = { name: '', role: 'Recruiter', email: '' };
const bulkColumns = [
  { key: 'name', example: 'Rohan Gupta' },
  { key: 'role', example: 'Recruiter' },
  { key: 'email', example: 'rohan.gupta@ananta.com' },
];

export default function Admin() {
  const [team, setTeam] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => api.get('/team').then(setTeam);
  useEffect(() => { load(); }, []);

  const save = async () => {
    await api.post('/team', form);
    setForm(emptyForm);
    setShowModal(false);
    load();
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Admin</h1>
          <div className="subtitle">Team members and workspace settings</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn secondary" onClick={() => setShowBulk(true)}>Bulk import</button>
          <button className="btn" onClick={() => setShowModal(true)}>+ Add team member</button>
        </div>
      </div>
      <div className="panel">
        <table>
          <thead><tr><th>NAME</th><th>ROLE</th><th>EMAIL</th></tr></thead>
          <tbody>
            {team.map(t => (
              <tr key={t.id}>
                <td><b>{t.name}</b></td>
                <td><span className="badge purple">{t.role}</span></td>
                <td>{t.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add team member</h3>
            {['name', 'role', 'email'].map(f => (
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

      {showBulk && (
        <BulkImportModal
          entityType="team"
          columns={bulkColumns}
          onClose={() => setShowBulk(false)}
          onImported={() => load()}
        />
      )}
    </div>
  );
}