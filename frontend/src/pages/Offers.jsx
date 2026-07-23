import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const emptyForm = { candidate: '', job: '', ctc: '', date: '' };
const badgeClass = { Pending: 'orange', Accepted: 'green', Declined: 'red' };

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => api.get('/offers').then(setOffers);
  useEffect(() => { load(); }, []);

  const save = async () => {
    await api.post('/offers', { ...form, ctc: Number(form.ctc) });
    setForm(emptyForm);
    setShowModal(false);
    load();
  };

  const updateStatus = async (id, status) => { await api.put(`/offers/${id}`, { status }); load(); };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Offers</h1>
          <div className="subtitle">{offers.length} offers extended</div>
        </div>
        <button className="btn" onClick={() => setShowModal(true)}>+ Make offer</button>
      </div>
      <div className="panel">
        <table>
          <thead><tr><th>CANDIDATE</th><th>JOB</th><th>CTC</th><th>DATE</th><th>STATUS</th></tr></thead>
          <tbody>
            {offers.map(o => (
              <tr key={o.id}>
                <td><b>{o.candidate}</b></td>
                <td>{o.job}</td>
                <td>₹{o.ctc}.0L</td>
                <td>{o.date}</td>
                <td>
                  <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
                    {['Pending', 'Accepted', 'Declined'].map(s => <option key={s}>{s}</option>)}
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
            <h3>Make offer</h3>
            {['candidate', 'job', 'ctc', 'date'].map(f => (
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
