import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 Dashboard</h2>
          <button className="btn btn-primary" onClick={fetchStats}>
            Refresh
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {stats && (
          <>
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-label">Total Patients</div>
                <div className="stat-value">{stats.total_patients}</div>
              </div>

              <div className="stat-card danger">
                <div className="stat-label">🚨 Emergency Patients</div>
                <div className="stat-value emergency-alert">
                  {stats.emergency_patients}
                </div>
              </div>
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Gender Distribution</h3>
            <div className="stats-grid">
              {stats.gender_distribution &&
                stats.gender_distribution.map((item, index) => (
                  <div key={index} className="stat-card success">
                    <div className="stat-label">{item.gender}</div>
                    <div className="stat-value">{item.count}</div>
                  </div>
                ))}
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Recent Patients</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Registered Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_patients &&
                  stats.recent_patients.map((patient) => (
                    <tr key={patient.patient_id}>
                      <td>{patient.patient_id}</td>
                      <td>
                        {patient.first_name} {patient.last_name}
                      </td>
                      <td>{patient.email}</td>
                      <td>
                        <span
                          className={`badge badge-${
                            patient.emergency_status === 'emergency'
                              ? 'emergency'
                              : 'normal'
                          }`}
                        >
                          {patient.emergency_status === 'emergency'
                            ? '🚨 Emergency'
                            : 'Normal'}
                        </span>
                      </td>
                      <td>{new Date(patient.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
