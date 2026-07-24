import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { api } from '../api.js';

// columns: [{ key: 'name', label: 'Name' }, ...] — used for the template download + preview headers
export default function BulkImportModal({ entityType, columns, onClose, onImported }) {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const downloadTemplate = () => {
    const header = columns.map(c => c.key).join(',');
    const example = columns.map(c => c.example || '').join(',');
    const csv = header + '\n' + example;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entityType}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => setRows(result.data),
        error: () => setError('Could not read this CSV file.'),
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const wb = XLSX.read(evt.target.result, { type: 'binary' });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          setRows(XLSX.utils.sheet_to_json(sheet));
        } catch (err) {
          setError('Could not read this Excel file.');
        }
      };
      reader.readAsBinaryString(file);
    } else {
      setError('Please upload a .csv or .xlsx file.');
    }
  };

  const doImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    try {
      const res = await api.post(`/${entityType}/bulk`, { rows });
      onImported && onImported(res.count);
      onClose();
    } catch (err) {
      setError('Import failed. Please check the file and try again.');
    }
    setImporting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Bulk import</h3>

        <div className="field">
          <label>Expected columns</label>
          <div>{columns.map(c => <span className="skill-tag" key={c.key}>{c.key}</span>)}</div>
        </div>

        <button className="btn secondary" style={{ marginBottom: 14 }} onClick={downloadTemplate}>Download CSV template</button>

        <div className="field">
          <label>Upload CSV or Excel file</label>
          <input type="file" accept=".csv,.xlsx,.xls" onChange={onFile} />
        </div>

        {error && <div style={{ color: '#d13a3a', fontSize: 13, marginBottom: 10 }}>{error}</div>}

        {rows.length > 0 && (
          <div style={{ fontSize: 13, color: '#444', marginBottom: 10 }}>
            <b>{rows.length}</b> row{rows.length === 1 ? '' : 's'} found in <b>{fileName}</b>. Preview of first 3:
            <div style={{ overflowX: 'auto', marginTop: 8 }}>
              <table>
                <thead>
                  <tr>{columns.map(c => <th key={c.key}>{c.key}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.slice(0, 3).map((r, i) => (
                    <tr key={i}>{columns.map(c => <td key={c.key}>{String(r[c.key] ?? '')}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn secondary" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={doImport} disabled={rows.length === 0 || importing}>
            {importing ? 'Importing...' : `Import ${rows.length || ''} row${rows.length === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </div>
  );
}