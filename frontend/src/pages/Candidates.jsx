import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import BulkImportModal from '../components/BulkImportModal.jsx';

const stages = ['Sourced', 'Contacted', 'Submitted', 'Interview', 'Selected', 'Offered', 'Joined'];
const emptyForm = {
  name: '', location: '', email: '', phone: '', position: '', experience: '',
  currentCTC: '', expectedCTC: '', source: 'Resume Upload', skills: [],
  industry: '', education: '', noticePeriod: '',
};
const emptyFilters = { skill: '', location: '', industry: '', education: '', noticePeriod: '', minExp: '', maxExp: '', minCTC: '', maxCTC: '' };
const bulkColumns = [
  { key: 'name', example: 'Priya Sharma' },
  { key: 'location', example: 'Bengaluru' },
  { key: 'email', example: 'priya.sharma@mail.com' },
  { key: 'phone', example: '9876543210' },
  { key: 'position', example: 'Backend Developer' },
  { key: 'experience', example: '4 yrs' },
  { key: 'currentCTC', example: '12' },
  { key: 'expectedCTC', example: '16' },
  { key: 'source', example: 'Naukri' },
  { key: 'skills', example: 'Python;Django' },
  { key: 'industry', example: 'IT / Software' },
  { key: 'education', example: 'B.Tech' },
  { key: 'noticePeriod', example: '30 days' },
];

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState(emptyFilters);
  const [parsing, setParsing] = useState(false);

  const load = () => api.get('/candidates').then(setCandidates);
  useEffect(() => { load(); }, []);

  const onFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setParsing(true);
    const fd = new FormData();
    fd.append('resume', file);
    try {
      const parsed = await api.post('/candidates/parse-resume', fd);
      setForm(f => ({
        ...f,
        name: parsed.name || f.name,
        email: parsed.email || f.email,
        phone: parsed.phone || f.phone,
        experience: parsed.experience || f.experience,
        skills: parsed.skills || [],
      }));
    } catch (err) {
      alert('Could not parse resume. You can still fill details manually.');
    }
    setParsing(false);
  };

  const save = async () => {
    await api.post('/candidates', { ...form, stage: 'Sourced' });
    setForm(emptyForm);
    setShowModal(false);
    load();
  };

  const updateStage = async (id, stage) => {
    await api.put(`/candidates/${id}`, { stage });
    load();
  };

  const expYears = (c) => parseInt(c.experience) || 0;

  const filtered = candidates.filter(c => {
    if (filters.skill && !(c.skills || []).some(s => s.toLowerCase().includes(filters.skill.toLowerCase()))) return false;
    if (filters.location && !(c.location || '').toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.industry && !(c.industry || '').toLowerCase().includes(filters.industry.toLowerCase())) return false;
    if (filters.education && !(c.education || '').toLowerCase().includes(filters.education.toLowerCase())) return false;
    if (filters.noticePeriod && c.noticePeriod !== filters.noticePeriod) return false;
    if (filters.minExp && expYears(c) < Number(filters.minExp)) return false;
    if (filters.maxExp && expYears(c) > Number(filters.maxExp)) return false;
    if (filters.minCTC && Number(c.expectedCTC || 0) < Number(filters.minCTC)) return false;
    if (filters.maxCTC && Number(c.expectedCTC || 0) > Number(filters.maxCTC)) return false;
    return true;
  });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Candidates</h1>
          <div className="subtitle">{filtered.length} of {candidates.length} candidates{activeFilterCount ? ' (filtered)' : ''}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn secondary" onClick={() => setShowFilters(s => !s)}>
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
          </button>
          <button className="btn secondary" onClick={() => setShowBulk(true)}>Bulk import</button>
          <button className="btn" onClick={() => setShowModal(true)}>+ Add candidate</button>
        </div>
      </div>

      {showFilters && (
        <div className="panel">
          <h3>Advanced search</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div className="field"><label>Skill</label><input value={filters.skill} onChange={e => setFilters({ ...filters, skill: e.target.value })} placeholder="e.g. React" /></div>
            <div className="field"><label>Location</label><input value={filters.location} onChange={e => setFilters({ ...filters, location: e.target.value })} placeholder="e.g. Bengaluru" /></div>
            <div className="field"><label>Industry</label><input value={filters.industry} onChange={e => setFilters({ ...filters, industry: e.target.value })} placeholder="e.g. IT" /></div>
            <div className="field"><label>Education</label><input value={filters.education} onChange={e => setFilters({ ...filters, education: e.target.value })} placeholder="e.g. B.Tech" /></div>
            <div className="field"><label>Min experience (yrs)</label><input value={filters.minExp} onChange={e => setFilters({ ...filters, minExp: e.target.value })} /></div>
            <div className="field"><label>Max experience (yrs)</label><input value={filters.maxExp} onChange={e => setFilters({ ...filters, maxExp: e.target.value })} /></div>
            <div className="field"><label>Min expected CTC (L)</label><input value={filters.minCTC} onChange={e => setFilters({ ...filters, minCTC: e.target.value })} /></div>
            <div className="field"><label>Max expected CTC (L)</label><input value={filters.maxCTC} onChange={e => setFilters({ ...filters, maxCTC: e.target.value })} /></div>
            <div className="field">
              <label>Notice period</label>
              <select value={filters.noticePeriod} onChange={e => setFilters({ ...filters, noticePeriod: e.target.value })}>
                <option value="">Any</option>
                {['Immediate', '15 days', '30 days', '60 days', '90 days'].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button className="btn secondary" style={{ marginTop: 4 }} onClick={() => setFilters(emptyFilters)}>Clear filters</button>
          )}
        </div>
      )}

      <div className="panel">
        <table>
          <thead><tr><th>CANDIDATE</th><th>SKILLS</th><th>EXPERIENCE</th><th>EXPECTED CTC</th><th>SOURCE</th><th>STAGE</th></tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <Link to={`/candidates/${c.id}`} style={{ color: '#5b4bde', fontWeight: 600, textDecoration: 'none' }}>{c.name}</Link>
                  <br /><span style={{ color: '#999' }}>{c.location}</span>
                </td>
                <td>{(c.skills || []).map(s => <span className="skill-tag" key={s}>{s}</span>)}</td>
                <td>{c.experience}</td>
                <td>{c.expectedCTC ? '₹' + c.expectedCTC + '.0L' : '-'}</td>
                <td><span className="badge gray">{c.source}</span></td>
                <td>
                  <select value={c.stage} onChange={e => updateStage(c.id, e.target.value)}>
                    {stages.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', color: '#999' }}>No candidates match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add candidate</h3>

            <div className="field">
              <label>Upload resume (PDF / DOCX / TXT) — auto-fills details</label>
              <input type="file" accept=".pdf,.docx,.txt" onChange={onFile} />
              {parsing && <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>Parsing resume...</div>}
            </div>

            {['name', 'location', 'email', 'phone', 'position', 'experience', 'currentCTC', 'expectedCTC', 'industry', 'education'].map(f => (
              <div className="field" key={f}>
                <label>{f}</label>
                <input value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} />
              </div>
            ))}

            <div className="field">
              <label>notice period</label>
              <select value={form.noticePeriod} onChange={e => setForm({ ...form, noticePeriod: e.target.value })}>
                <option value="">Select</option>
                {['Immediate', '15 days', '30 days', '60 days', '90 days'].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>

            {form.skills.length > 0 && (
              <div className="field">
                <label>Skills detected</label>
                <div>{form.skills.map(s => <span className="skill-tag" key={s}>{s}</span>)}</div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showBulk && (
        <BulkImportModal
          entityType="candidates"
          columns={bulkColumns}
          onClose={() => setShowBulk(false)}
          onImported={() => load()}
        />
      )}
    </div>
  );
}