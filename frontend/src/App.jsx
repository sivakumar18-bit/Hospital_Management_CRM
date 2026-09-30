import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientRegistrationPage from './pages/PatientRegistrationPage';
import PatientListPage from './pages/PatientListPage';
import PatientDetailPage from './pages/PatientDetailPage';
import EmergencyPage from './pages/EmergencyPage';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    const adminData = localStorage.getItem('admin');
    
    if (token && adminData) {
      setIsAuthenticated(true);
      setAdmin(JSON.parse(adminData));
    }
  }, []);

  const handleLogin = (token, adminData) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('admin', JSON.stringify(adminData));
    setIsAuthenticated(true);
    setAdmin(adminData);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('admin');
    setIsAuthenticated(false);
    setAdmin(null);
  };

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navbar admin={admin} onLogout={handleLogout} />}
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient-registration"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <PatientRegistrationPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <PatientListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/patients/:patientId"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <PatientDetailPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/emergency"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <EmergencyPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
