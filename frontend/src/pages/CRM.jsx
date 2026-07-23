import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const stageBadge = { new: 'purple', contacted: 'purple', proposal: 'orange', won: 'green', lost: 'red' };
const emptyForm = { company: '', contact: '', owner: '', stage: 'new' };

export default function CRM() {
  const [leads, setLeads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => api.get('/leads').then(setLeads);
  useEffect(() => { load(); }, []);

  const save = async () => {
    await api.post('/leads', form);
    setForm(emptyForm);
    setShowModal(false);
    load();
  };

  const updateStage = async (id, stage) => { await api.put(`/leads/${id}`, { stage }); load(); };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>CRM</h1>
          <div className="subtitle">Leads and internal tasks for client acquisition</div>
        </div>
        <button className="btn" onClick={() => setShowModal(true)}>+ Add lead</button>
      </div>
      <div className="panel">
        <table>
          <thead><tr><th>COMPANY</th><th>CONTACT</th><th>STAGE</th><th>OWNER</th></tr></thead>
          <tbody>
            {leads.map(l => (
              <tr key={l.id}>
                <td><b>{l.company}</b></td>
                <td>{l.contact}</td>
                <td>
                  <select value={l.stage} onChange={e => updateStage(l.id, e.target.value)}>
                    {['new', 'contacted', 'proposal', 'won', 'lost'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>{l.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add lead</h3>
            {['company', 'contact', 'owner'].map(f => (
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
