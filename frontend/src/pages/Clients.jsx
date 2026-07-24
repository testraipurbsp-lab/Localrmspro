import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import DocumentManager from '../components/DocumentManager.jsx';
import BulkImportModal from '../components/BulkImportModal.jsx';

const empty = { name: '', industry: '', contact: '', email: '', openJobs: 0 };
const bulkColumns = [
  { key: 'name', example: 'Acme Corp' },
  { key: 'industry', example: 'IT / Software' },
  { key: 'contact', example: 'Jane Doe' },
  { key: 'email', example: 'jane@acme.com' },
  { key: 'openJobs', example: '2' },
  { key: 'status', example: 'active' },
];

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [form, setForm] = useState(empty);
  const [docsClient, setDocsClient] = useState(null);

  const load = () => api.get('/clients').then(setClients);
  useEffect(() => { load(); }, []);

  const save = async () => {
    await api.post('/clients', form);
    setForm(empty);
    setShowModal(false);
    load();
  };

  const updateClientDocs = (clientId, newDocs) => {
    setClients(cs => cs.map(c => c.id === clientId ? { ...c, documents: newDocs } : c));
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Clients</h1>
          <div className="subtitle">{clients.length} client companies</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn secondary" onClick={() => setShowBulk(true)}>Bulk import</button>
          <button className="btn" onClick={() => setShowModal(true)}>+ Add client</button>
        </div>
      </div>
      <div className="panel">
        <table>
          <thead><tr><th>CLIENT</th><th>CONTACT</th><th>OPEN JOBS</th><th>STATUS</th><th>DOCUMENTS</th></tr></thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id}>
                <td><b>{c.name}</b><br /><span style={{ color: '#999' }}>{c.industry}</span></td>
                <td>{c.contact}<br /><span style={{ color: '#999' }}>{c.email}</span></td>
                <td>{c.openJobs}</td>
                <td><span className={'badge ' + (c.status === 'active' ? 'green' : 'gray')}>{c.status}</span></td>
                <td>
                  <button className="btn secondary" style={{ padding: '5px 12px', fontSize: 12.5 }} onClick={() => setDocsClient(c)}>
                    {(c.documents || []).length} file{(c.documents || []).length === 1 ? '' : 's'}
                  </button>
                </td>
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

      {docsClient && (
        <DocumentManager
          entityType="clients"
          entityId={docsClient.id}
          documents={docsClient.documents || []}
          title={`Documents — ${docsClient.name}`}
          onChange={(newDocs) => updateClientDocs(docsClient.id, newDocs)}
          onClose={() => setDocsClient(null)}
        />
      )}

      {showBulk && (
        <BulkImportModal
          entityType="clients"
          columns={bulkColumns}
          onClose={() => setShowBulk(false)}
          onImported={() => load()}
        />
      )}
    </div>
  );
}