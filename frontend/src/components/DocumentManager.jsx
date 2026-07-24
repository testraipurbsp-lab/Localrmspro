import React, { useState } from 'react';
import { api, fileUrl } from '../api.js';

// entityType: 'clients' or 'jobs'
export default function DocumentManager({ entityType, entityId, documents, onChange, onClose, title }) {
  const [docs, setDocs] = useState(documents || []);
  const [uploading, setUploading] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const doc = await api.post(`/${entityType}/${entityId}/documents`, fd);
      const updated = [...docs, doc];
      setDocs(updated);
      onChange && onChange(updated);
    } catch (err) {
      alert('Upload failed. Please try again.');
    }
    setUploading(false);
    e.target.value = '';
  };

  const removeDoc = async (docId) => {
    await api.del(`/${entityType}/${entityId}/documents/${docId}`);
    const updated = docs.filter(d => d.id !== docId);
    setDocs(updated);
    onChange && onChange(updated);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{title || 'Attachments'}</h3>

        <div className="field">
          <label>Upload a file (PDF, DOCX, image, etc.)</label>
          <input type="file" onChange={onFile} />
          {uploading && <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>Uploading...</div>}
        </div>

        {docs.length === 0 && <div style={{ fontSize: 13, color: '#999', marginTop: 10 }}>No files attached yet.</div>}

        {docs.map(d => (
          <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f2f2f5' }}>
            <a href={fileUrl(d.url)} target="_blank" rel="noreferrer" style={{ color: '#5b4bde', fontSize: 13.5, textDecoration: 'none', fontWeight: 500 }}>
              {d.name}
            </a>
            <button className="btn secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => removeDoc(d.id)}>Remove</button>
          </div>
        ))}

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}