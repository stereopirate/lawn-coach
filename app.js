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
