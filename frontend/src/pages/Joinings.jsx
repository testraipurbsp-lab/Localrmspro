import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const emptyForm = { candidate: '', job: '', joiningDate: '' };

export default function Joinings() {
  const [joinings, setJoinings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => api.get('/joinings').then(setJoinings);
  useEffect(() => { load(); }, []);

  const save = async () => {
    await api.post('/joinings', form);
    setForm(emptyForm);
    setShowModal(false);
    load();
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Joinings</h1>
          <div className="subtitle">{joinings.length} candidates joined / confirmed</div>
        </div>
        <button className="btn" onClick={() => setShowModal(true)}>+ Add joining</button>
      </div>
      <div className="panel">
        <table>
          <thead><tr><th>CANDIDATE</th><th>JOB</th><th>JOINING DATE</th><th>STATUS</th></tr></thead>
          <tbody>
            {joinings.map(j => (
              <tr key={j.id}>
                <td><b>{j.candidate}</b></td>
                <td>{j.job}</td>
                <td>{j.joiningDate}</td>
                <td><span className="badge green">{j.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add joining</h3>
            {['candidate', 'job', 'joiningDate'].map(f => (
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
