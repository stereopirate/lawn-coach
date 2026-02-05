import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="logo-section">
            {/* Reference your existing logo path */}
            <img src="/logo.png" alt="Lawn Coach Logo" className="logo-img" />
            <h1 style={{fontSize: '1.2rem'}}>LAWN COACH</h1>
          </div>
          
          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
          </div>

          <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
            <li><Link to="/activities" onClick={() => setMenuOpen(false)}>Activities</Link></li>
            <li><Link to="/garage" onClick={() => setMenuOpen(false)}>Garage</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* Keep your existing component paths here */}
          <Route path="/activities" element={<Activities />} />
          <Route path="/garage" element={<Garage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

/* Activities Form */
.activity-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 150px;
}

.form-group label { font-size: 0.8rem; margin-bottom: 5px; font-weight: bold; }

.btn-save {
  background: var(--accent);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  align-self: flex-end;
}

/* History List */
.history-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.log-icon { font-size: 1.5rem; margin-right: 15px; }
.log-details { flex-grow: 1; }
.log-details strong { display: block; }

/* Progress Bars */
.maintenance-item { margin-top: 15px; }
.label-row { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 5px; }
.progress-bar-bg { background: #eee; height: 8px; border-radius: 4px; overflow: hidden; }
.progress-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }

.btn-outline {
  width: 100%;
  background: transparent;
  border: 1px solid #bdc3c7;
  padding: 8px;
  border-radius: 5px;
  margin-top: 15px;
  cursor: pointer;
}

