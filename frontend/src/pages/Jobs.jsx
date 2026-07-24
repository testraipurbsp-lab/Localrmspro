import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import DocumentManager from '../components/DocumentManager.jsx';

const emptyForm = {
  title: '', client: '', location: '', openings: 1,
  industryType: '', minExperience: '', maxExperience: '',
  minSalary: '', maxSalary: '', requiredSkills: '',
};

const shareLinks = (job) => {
  const text = encodeURIComponent(`We're hiring: ${job.title} at ${job.client} (${job.location}). Apply now!`);
  const url = encodeURIComponent(window.location.href);
  return {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
    whatsapp: `https://wa.me/?text=${text}%20${url}`,
    twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
  };
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [docsJob, setDocsJob] = useState(null);
  const [shareJob, setShareJob] = useState(null);

  const load = () => api.get('/jobs').then(setJobs);
  useEffect(() => { load(); }, []);

  const save = async () => {
    const skills = form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
    await api.post('/jobs', { ...form, requiredSkills: skills });
    setForm(emptyForm);
    setShowModal(false);
    load();
  };

  const toggleStatus = async (job) => {
    await api.put(`/jobs/${job.id}`, { status: job.status === 'open' ? 'closed' : 'open' });
    load();
  };

  const updateJobDocs = (jobId, newDocs) => {
    setJobs(js => js.map(j => j.id === jobId ? { ...j, documents: newDocs } : j));
  };

  const fieldLabels = {
    title: 'title', client: 'client', location: 'location', openings: 'openings',
    industryType: 'industry type', minExperience: 'min experience (yrs)', maxExperience: 'max experience (yrs)',
    minSalary: 'min salary (LPA)', maxSalary: 'max salary (LPA)', requiredSkills: 'required skills (comma separated)',
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Jobs</h1>
          <div className="subtitle">{jobs.length} job openings</div>
        </div>
        <button className="btn" onClick={() => setShowModal(true)}>+ Add job</button>
      </div>
      <div className="panel">
        <table>
          <thead><tr><th>TITLE</th><th>CLIENT</th><th>INDUSTRY</th><th>EXPERIENCE</th><th>SALARY</th><th>SKILLS</th><th>STATUS</th><th>FILES</th><th>SHARE</th></tr></thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j.id}>
                <td><b>{j.title}</b><br /><span style={{ color: '#999' }}>{j.location}</span></td>
                <td>{j.client}</td>
                <td>{j.industryType || '-'}</td>
                <td>{j.minExperience || j.maxExperience ? `${j.minExperience || 0}-${j.maxExperience || '?'} yrs` : '-'}</td>
                <td>{j.minSalary || j.maxSalary ? `₹${j.minSalary || 0}-${j.maxSalary || '?'}L` : '-'}</td>
                <td>{(j.requiredSkills || []).map(s => <span className="skill-tag" key={s}>{s}</span>)}</td>
                <td>
                  <span className={'badge ' + (j.status === 'open' ? 'green' : 'gray')} style={{ cursor: 'pointer' }} onClick={() => toggleStatus(j)}>{j.status}</span>
                </td>
                <td>
                  <button className="btn secondary" style={{ padding: '5px 12px', fontSize: 12.5 }} onClick={() => setDocsJob(j)}>
                    {(j.documents || []).length} file{(j.documents || []).length === 1 ? '' : 's'}
                  </button>
                </td>
                <td>
                  <button className="btn secondary" style={{ padding: '5px 12px', fontSize: 12.5 }} onClick={() => setShareJob(j)}>Share</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Add job</h3>
            {Object.keys(emptyForm).map(f => (
              <div className="field" key={f}>
                <label>{fieldLabels[f]}</label>
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

      {docsJob && (
        <DocumentManager
          entityType="jobs"
          entityId={docsJob.id}
          documents={docsJob.documents || []}
          title={`JD & files — ${docsJob.title}`}
          onChange={(newDocs) => updateJobDocs(docsJob.id, newDocs)}
          onClose={() => setDocsJob(null)}
        />
      )}

      {shareJob && (
        <div className="modal-overlay" onClick={() => setShareJob(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Share — {shareJob.title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(shareLinks(shareJob)).map(([platform, link]) => (
                <a key={platform} href={link} target="_blank" rel="noreferrer" className="btn secondary" style={{ textDecoration: 'none', textAlign: 'center', textTransform: 'capitalize' }}>
                  Share on {platform}
                </a>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShareJob(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}