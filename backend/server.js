const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'data', 'db.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const DOCS_DIR = path.join(__dirname, 'uploads', 'documents');
if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });
app.use('/files', express.static(DOCS_DIR));

function readDB() { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); }
function writeDB(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

function bulkCreate(collectionName, rows, defaults, res) {
  const db = readDB();
  const created = rows.map(row => ({ id: uuidv4(), ...defaults, ...row }));
  db[collectionName].push(...created);
  writeDB(db);
  res.json({ count: created.length });
}

const upload = multer({ dest: UPLOAD_DIR });

const docStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, DOCS_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, Date.now() + '-' + safe);
  },
});
const uploadDoc = multer({ storage: docStorage });

function addDocument(collectionName, id, file, res) {
  const db = readDB();
  const item = db[collectionName].find(x => x.id === id);
  if (!item) return res.status(404).end();
  if (!item.documents) item.documents = [];
  const doc = {
    id: uuidv4(),
    name: file.originalname,
    url: '/files/' + file.filename,
    uploadedAt: new Date().toISOString().slice(0, 10),
  };
  item.documents.push(doc);
  writeDB(db);
  res.json(doc);
}

function deleteDocument(collectionName, id, docId, res) {
  const db = readDB();
  const item = db[collectionName].find(x => x.id === id);
  if (!item) return res.status(404).end();
  const doc = (item.documents || []).find(d => d.id === docId);
  if (doc) {
    const filePath = path.join(DOCS_DIR, path.basename(doc.url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  item.documents = (item.documents || []).filter(d => d.id !== docId);
  writeDB(db);
  res.json({ ok: true });
}

// ---------- Dashboard ----------
app.get('/api/dashboard', (req, res) => {
  const db = readDB();
  const stats = {
    openPositions: db.jobs.filter(j => j.status === 'open').length,
    callsToday: db.calls.length,
    interviewsScheduled: db.candidates.filter(c => c.stage === 'Interview').length,
    offersAccepted: db.candidates.filter(c => c.stage === 'Offered').length,
    joinedThisMonth: db.candidates.filter(c => c.stage === 'Joined').length,
    invoicesPending: db.invoices.filter(i => i.status === 'pending').length,
    revenueMTD: db.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0),
  };
  const pipeline = {};
  db.candidates.forEach(c => { pipeline[c.stage] = (pipeline[c.stage] || 0) + 1; });
  res.json({ stats, pipeline, clients: db.clients.length });
});

// ---------- Clients ----------
app.get('/api/clients', (req, res) => res.json(readDB().clients));
app.post('/api/clients', (req, res) => {
  const db = readDB();
  const client = { id: uuidv4(), status: 'active', openJobs: 0, ...req.body };
  db.clients.push(client);
  writeDB(db);
  res.json(client);
});
app.post('/api/clients/bulk', (req, res) => {
  bulkCreate('clients', req.body.rows || [], { status: 'active', openJobs: 0, documents: [] }, res);
});
app.put('/api/clients/:id', (req, res) => {
  const db = readDB();
  const idx = db.clients.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).end();
  db.clients[idx] = { ...db.clients[idx], ...req.body };
  writeDB(db);
  res.json(db.clients[idx]);
});
app.delete('/api/clients/:id', (req, res) => {
  const db = readDB();
  db.clients = db.clients.filter(c => c.id !== req.params.id);
  writeDB(db);
  res.json({ ok: true });
});


app.post('/api/clients/:id/documents', uploadDoc.single('file'), (req, res) => {
  addDocument('clients', req.params.id, req.file, res);
});
app.delete('/api/clients/:id/documents/:docId', (req, res) => {
  deleteDocument('clients', req.params.id, req.params.docId, res);
});
// ---------- Candidates ----------
app.get('/api/candidates', (req, res) => res.json(readDB().candidates));
app.post('/api/candidates', (req, res) => {
  const db = readDB();
  const candidate = { id: uuidv4(), stage: 'Sourced', ...req.body };
  db.candidates.push(candidate);
  writeDB(db);
  res.json(candidate);
});
app.post('/api/candidates/bulk', (req, res) => {
  const rows = (req.body.rows || []).map(row => ({
    ...row,
    skills: typeof row.skills === 'string' ? row.skills.split(';').map(s => s.trim()).filter(Boolean) : (row.skills || []),
  }));
  bulkCreate('candidates', rows, { stage: 'Sourced' }, res);
});
app.put('/api/candidates/:id', (req, res) => {
  const db = readDB();
  const idx = db.candidates.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).end();
  db.candidates[idx] = { ...db.candidates[idx], ...req.body };
  writeDB(db);
  res.json(db.candidates[idx]);
});
app.delete('/api/candidates/:id', (req, res) => {
  const db = readDB();
  db.candidates = db.candidates.filter(c => c.id !== req.params.id);
  writeDB(db);
  res.json({ ok: true });
});

app.get('/api/candidates/:id', (req, res) => {
  const db = readDB();
  const candidate = db.candidates.find(c => c.id === req.params.id);
  if (!candidate) return res.status(404).end();
  const interviews = db.interviews.filter(i => i.candidate === candidate.name);
  res.json({ ...candidate, interviews });
});

// ---------- Jobs ----------
app.get('/api/jobs', (req, res) => res.json(readDB().jobs));
app.post('/api/jobs', (req, res) => {
  const db = readDB();
  const job = { id: uuidv4(), status: 'open', ...req.body };
  db.jobs.push(job);
  writeDB(db);
  res.json(job);
});
app.post('/api/jobs/bulk', (req, res) => {
  const rows = (req.body.rows || []).map(row => ({
    ...row,
    requiredSkills: typeof row.requiredSkills === 'string' ? row.requiredSkills.split(';').map(s => s.trim()).filter(Boolean) : (row.requiredSkills || []),
  }));
  bulkCreate('jobs', rows, { status: 'open', documents: [] }, res);
});
app.put('/api/jobs/:id', (req, res) => {
  const db = readDB();
  const idx = db.jobs.findIndex(j => j.id === req.params.id);
  if (idx === -1) return res.status(404).end();
  db.jobs[idx] = { ...db.jobs[idx], ...req.body };
  writeDB(db);
  res.json(db.jobs[idx]);
});

app.post('/api/jobs/:id/documents', uploadDoc.single('file'), (req, res) => {
  addDocument('jobs', req.params.id, req.file, res);
});
app.delete('/api/jobs/:id/documents/:docId', (req, res) => {
  deleteDocument('jobs', req.params.id, req.params.docId, res);
});
// ---------- Interviews ----------
app.get('/api/interviews', (req, res) => res.json(readDB().interviews));
app.post('/api/interviews', (req, res) => {
  const db = readDB();
  const iv = { id: uuidv4(), status: 'Scheduled', ...req.body };
  db.interviews.push(iv);
  writeDB(db);
  res.json(iv);
});
app.put('/api/interviews/:id', (req, res) => {
  const db = readDB();
  const idx = db.interviews.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).end();
  db.interviews[idx] = { ...db.interviews[idx], ...req.body };
  writeDB(db);
  res.json(db.interviews[idx]);
});

// ---------- Offers ----------
app.get('/api/offers', (req, res) => res.json(readDB().offers));
app.post('/api/offers', (req, res) => {
  const db = readDB();
  const of = { id: uuidv4(), status: 'Pending', ...req.body };
  db.offers.push(of);
  writeDB(db);
  res.json(of);
});
app.put('/api/offers/:id', (req, res) => {
  const db = readDB();
  const idx = db.offers.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).end();
  db.offers[idx] = { ...db.offers[idx], ...req.body };
  writeDB(db);
  res.json(db.offers[idx]);
});

// ---------- Joinings ----------
app.get('/api/joinings', (req, res) => res.json(readDB().joinings));
app.post('/api/joinings', (req, res) => {
  const db = readDB();
  const j = { id: uuidv4(), status: 'Confirmed', ...req.body };
  db.joinings.push(j);
  writeDB(db);
  res.json(j);
});

// ---------- Team (Admin) ----------
app.get('/api/team', (req, res) => res.json(readDB().team));
app.post('/api/team', (req, res) => {
  const db = readDB();
  const member = { id: uuidv4(), ...req.body };
  db.team.push(member);
  writeDB(db);
  res.json(member);
});

app.post('/api/team/bulk', (req, res) => {
  bulkCreate('team', req.body.rows || [], {}, res);
});
// ---------- Reports ----------
app.get('/api/reports', (req, res) => {
  const db = readDB();
  const bySource = {};
  db.candidates.forEach(c => { bySource[c.source] = (bySource[c.source] || 0) + 1; });
  const byRecruiter = {};
  db.leads.forEach(l => { byRecruiter[l.owner] = (byRecruiter[l.owner] || 0) + 1; });
  const revenueByClient = {};
  db.invoices.filter(i => i.status === 'paid').forEach(i => {
    revenueByClient[i.client] = (revenueByClient[i.client] || 0) + i.amount;
  });
  res.json({ bySource, byRecruiter, revenueByClient, totalCandidates: db.candidates.length, totalClients: db.clients.length });
});

// ---------- Resume upload & parse ----------
app.post('/api/candidates/parse-resume', upload.single('resume'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let text = '';
    if (ext === '.pdf') {
      const buf = fs.readFileSync(filePath);
      const data = await pdfParse(buf);
      text = data.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      text = fs.readFileSync(filePath, 'utf-8');
    }
    fs.unlinkSync(filePath);
    res.json(parseResumeText(text));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to parse resume' });
  }
});

function parseResumeText(text) {
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const phoneMatch = text.match(/(\+?\d[\d -]{8,14}\d)/);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const name = lines[0] ? lines[0].slice(0, 60) : '';
  const expMatch = text.match(/(\d+)\+?\s*(years|yrs)/i);
  const skillsList = ['javascript','react','node','python','java','sql','aws','docker','kubernetes','angular','vue','html','css','excel','sales','marketing','recruitment','communication','leadership','django','flask','c++','c#','php','android','ios','figma','photoshop'];
  const lowerText = text.toLowerCase();
  const skills = skillsList.filter(s => lowerText.includes(s));
  return {
    name,
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
    experience: expMatch ? `${expMatch[1]} years` : '',
    skills,
  };
}

// ---------- Calls ----------
app.get('/api/calls', (req, res) => res.json(readDB().calls));
app.post('/api/calls', (req, res) => {
  const db = readDB();
  const call = { id: uuidv4(), date: new Date().toISOString().slice(0, 10), ...req.body };
  db.calls.unshift(call);
  writeDB(db);
  res.json(call);
});
app.put('/api/calls/:id', (req, res) => {
  const db = readDB();
  const idx = db.calls.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).end();
  db.calls[idx] = { ...db.calls[idx], ...req.body };
  writeDB(db);
  res.json(db.calls[idx]);
});

// ---------- Finance ----------
app.get('/api/invoices', (req, res) => res.json(readDB().invoices));
app.post('/api/invoices', (req, res) => {
  const db = readDB();
  const inv = { id: uuidv4(), status: 'pending', ...req.body };
  db.invoices.push(inv);
  writeDB(db);
  res.json(inv);
});
app.put('/api/invoices/:id/pay', (req, res) => {
  const db = readDB();
  const idx = db.invoices.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).end();
  db.invoices[idx].status = 'paid';
  writeDB(db);
  res.json(db.invoices[idx]);
});

// ---------- CRM ----------
app.get('/api/leads', (req, res) => res.json(readDB().leads));
app.post('/api/leads', (req, res) => {
  const db = readDB();
  const lead = { id: uuidv4(), stage: 'new', ...req.body };
  db.leads.push(lead);
  writeDB(db);
  res.json(lead);
});
app.put('/api/leads/:id', (req, res) => {
  const db = readDB();
  const idx = db.leads.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).end();
  db.leads[idx] = { ...db.leads[idx], ...req.body };
  writeDB(db);
  res.json(db.leads[idx]);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
