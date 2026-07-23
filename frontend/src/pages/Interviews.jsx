import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const emptyForm = { candidate: '', job: '', date: '', time: '', interviewer: '' };
const badgeClass = { Scheduled: 'purple', Completed: 'green', Cancelled: 'red' };

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => api.get('/interviews').then(setInterviews);
  useEffect(() => { load(); }, []);

  const save = async () => {
    await api.post('/interviews', form);
    setForm(emptyForm);
    setShowModal(false);
    load();
  };

  const updateStatus = async (id, status) => { await api.put(`/interviews/${id}`, { status }); load(); };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Interviews</h1>
          <div className="subtitle">{interviews.length} interviews scheduled</div>
        </div>
        <button className="btn" onClick={() => setShowModal(true)}>+ Schedule interview</button>
      </div>
      <div className="panel">
        <table>
          <thead><tr><th>CANDIDATE</th><th>JOB</th><th>DATE</th><th>TIME</th><th>INTERVIEWER</th><th>STATUS</th></tr></thead>
          <tbody>
            {interviews.map(iv => (
              <tr key={iv.id}>
                <td><b>{iv.candidate}</b></td>
                <td>{iv.job}</td>
                <td>{iv.date}</td>
                <td>{iv.time}</td>
                <td>{iv.interviewer}</td>
                <td>
                  <select value={iv.status} onChange={e => updateStatus(iv.id, e.target.value)}>
                    {['Scheduled', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
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
            <h3>Schedule interview</h3>
            {['candidate', 'job', 'date', 'time', 'interviewer'].map(f => (
              <div className="field" key={f}>
                <label>{f}</label>
                <input value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} placeholder={f === 'date' ? 'YYYY-MM-DD' : ''} />
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
