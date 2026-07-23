# RecruitAI Pro (simple version)

A simple recruitment CRM: React frontend + Node/Express backend, with resume parsing.

## Run backend
cd backend
npm install
npm start
(runs on http://localhost:5000)

## Run frontend (new terminal)
cd frontend
npm install
npm run dev
(open http://localhost:5173)

## Features
- Dashboard with live stats and pipeline chart
- Clients, Candidates, Calls, Finance, CRM pages (add/edit data)
- Resume upload (PDF/DOCX/TXT) on Candidates page auto-extracts name, email,
  phone, experience, and skills, and fills the add-candidate form
- Data stored in backend/data/db.json (simple file DB, no setup needed)

## Notes
- Keep both backend and frontend running at the same time.
- To reset sample data, replace backend/data/db.json with your own values.
