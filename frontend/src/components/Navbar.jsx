import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ admin, onLogout }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <div className="navbar-logo">🏥 Hospital CRM</div>
        <button
          className="menu-btn"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      <div
        className={'navbar-menu' + (open ? ' open' : '')}
        onClick={() => setOpen(false)}
      >
        <div className="navbar-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/patients">Patients</Link>
          <Link to="/patient-registration">Register Patient</Link>
          <Link to="/emergency">🚨 Emergency</Link>
        </div>
        <div className="navbar-right">
          <span>{admin?.name}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;