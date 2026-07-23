import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Clients from './pages/Clients.jsx';
import Jobs from './pages/Jobs.jsx';
import Candidates from './pages/Candidates.jsx';
import CandidateDetail from './pages/CandidateDetail.jsx';
import Pipeline from './pages/Pipeline.jsx';
import Calls from './pages/Calls.jsx';
import Interviews from './pages/Interviews.jsx';
import Offers from './pages/Offers.jsx';
import Joinings from './pages/Joinings.jsx';
import Finance from './pages/Finance.jsx';
import CRM from './pages/CRM.jsx';
import Reports from './pages/Reports.jsx';
import Admin from './pages/Admin.jsx';

const links = [
  { section: 'OVERVIEW', items: [{ to: '/', label: 'Dashboard', icon: '\u25A6' }] },
  { section: 'RECRUITMENT', items: [
    { to: '/clients', label: 'Clients', icon: '\u2302' },
    { to: '/jobs', label: 'Jobs', icon: '\u2318' },
    { to: '/candidates', label: 'Candidates', icon: '\u25CF' },
    { to: '/pipeline', label: 'Pipeline', icon: '\u21C9' },
    { to: '/calls', label: 'Calls', icon: '\u260E' },
    { to: '/interviews', label: 'Interviews', icon: '\u25A4' },
    { to: '/offers', label: 'Offers', icon: '\u2713' },
    { to: '/joinings', label: 'Joinings', icon: '\u2605' },
  ]},
  { section: 'BUSINESS', items: [
    { to: '/finance', label: 'Finance', icon: '\u20B9' },
    { to: '/crm', label: 'CRM', icon: '\u25C8' },
    { to: '/reports', label: 'Reports', icon: '\u2261' },
  ]},
  { section: 'SYSTEM', items: [{ to: '/admin', label: 'Admin', icon: '\u2699' }] },
];

export default function App() {
  const location = useLocation();
  return (
    <div className="layout">
      <div className="sidebar">
        <div className="brand"><span className="brand-dot" />RecruitAI Pro</div>
        {links.map(group => (
          <div key={group.section}>
            <div className="section-label">{group.section}</div>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
              >
                <span className="nav-icon">{item.icon}</span>{item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
      <div className="main">
        <div className="topbar">
          <input className="search" placeholder="Search candidates, jobs, clients..." />
          <div className="org-chip">
            <span className="org-avatar">AU</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Milestone Recruitment Consultants</div>
              <div style={{ fontSize: 11.5, color: '#9698ab' }}>Admin workspace</div>
            </div>
          </div>
        </div>
    <ErrorBoundary key={location.pathname}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/candidates/:id" element={<CandidateDetail />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/calls" element={<Calls />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/joinings" element={<Joinings />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </div>
  );
}