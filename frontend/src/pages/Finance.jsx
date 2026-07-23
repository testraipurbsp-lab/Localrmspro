import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const emptyForm = { invoice: '', client: '', amount: '', invoiced: '', due: '' };
const badgeClass = { paid: 'green', pending: 'orange', overdue: 'red' };

export default function Finance() {
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => api.get('/invoices').then(setInvoices);
  useEffect(() => { load(); }, []);

  const collected = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);
  const pending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + Number(i.amount), 0);
  const overdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + Number(i.amount), 0);
  const L = (n) => '₹' + (n / 100000).toFixed(1) + 'L';

  const save = async () => {
    await api.post('/invoices', { ...form, amount: Number(form.amount) });
    setForm(emptyForm);
    setShowModal(false);
    load();
  };

  const markPaid = async (id) => { await api.put(`/invoices/${id}/pay`, {}); load(); };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Finance</h1>
          <div className="subtitle">Invoices, payments, and revenue</div>
        </div>
        <button className="btn" onClick={() => setShowModal(true)}>+ Generate invoice</button>
      </div>
      <div className="cards">
        <div className="card"><div className="label">Revenue collected</div><div className="value">{L(collected)}</div></div>
        <div className="card"><div className="label">Pending</div><div className="value">{L(pending)}</div></div>
        <div className="card"><div className="label">Overdue</div><div className="value">{L(overdue)}</div></div>
      </div>
      <div className="panel">
        <table>
          <thead><tr><th>INVOICE</th><th>CLIENT</th><th>AMOUNT</th><th>INVOICED</th><th>DUE</th><th>STATUS</th><th></th></tr></thead>
          <tbody>
            {invoices.map(i => (
              <tr key={i.id}>
                <td>{i.invoice}</td>
                <td>{i.client}</td>
                <td>{L(Number(i.amount))}</td>
                <td>{i.invoiced}</td>
                <td>{i.due}</td>
                <td><span className={'badge ' + (badgeClass[i.status] || 'gray')}>{i.status}</span></td>
                <td>{i.status !== 'paid' && <button className="btn secondary" onClick={() => markPaid(i.id)}>Mark paid</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Generate invoice</h3>
            {['invoice', 'client', 'amount', 'invoiced', 'due'].map(f => (
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
