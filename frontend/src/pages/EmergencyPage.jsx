import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { patientAPI } from '../services/api';
import './EmergencyPage.css';

function EmergencyPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmergencyPatients();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchEmergencyPatients, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmergencyPatients = async () => {
    try {
      setLoading(true);
      const data = await patientAPI.getEmergencyPatients();
      setPatients(data);
    } catch (err) {
      setError('Failed to load emergency patients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearEmergency = async (patientId) => {
    try {
      await patientAPI.setEmergencyStatus(patientId, 'normal');
      setPatients(patients.filter((p) => p.patient_id !== patientId));
    } catch (err) {
      setError('Failed to clear emergency status');
      console.error(err);
    }
  };

  if (loading && patients.length === 0) {
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
      <div className="card emergency-card">
        <div className="card-header">
          <h2 className="card-title emergency-title">🚨 EMERGENCY ALERTS</h2>
          <button className="btn btn-primary" onClick={fetchEmergencyPatients}>
            🔄 Refresh
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {patients.length === 0 ? (
          <div className="alert alert-success" style={{ fontSize: '1.1rem' }}>
            ✓ No emergency patients at the moment
          </div>
        ) : (
          <>
            <p style={{ marginBottom: '1.5rem', color: '#e74c3c', fontWeight: 'bold', fontSize: '1.1rem' }}>
              ⚠️ {patients.length} patient{patients.length !== 1 ? 's' : ''} in emergency status
            </p>

            <div className="emergency-grid">
              {patients.map((patient) => (
                <div key={patient.patient_id} className="emergency-card-item emergency-alert">
                  <div className="emergency-card-header">
                    <h3>{patient.first_name} {patient.last_name}</h3>
                    <span className="badge badge-emergency">🚨 EMERGENCY</span>
                  </div>

                  <div className="emergency-card-body">
                    <div className="info-row">
                      <span className="label">Patient ID:</span>
                      <span className="value">{patient.patient_id}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Phone:</span>
                      <span className="value">{patient.phone}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Age:</span>
                      <span className="value">
                        {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} years
                      </span>
                    </div>
                    <div className="info-row">
                      <span className="label">Gender:</span>
                      <span className="value">{patient.gender}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Blood Group:</span>
                      <span className="value">{patient.blood_group || 'Unknown'}</span>
                    </div>

                    {patient.allergies && (
                      <div className="info-row alert-row">
                        <span className="label">⚠️ Allergies:</span>
                        <span className="value">{patient.allergies}</span>
                      </div>
                    )}

                    {patient.emergency_contact_name && (
                      <>
                        <div className="info-row">
                          <span className="label">Emergency Contact:</span>
                          <span className="value">{patient.emergency_contact_name}</span>
                        </div>
                        <div className="info-row">
                          <span className="label">Contact Phone:</span>
                          <span className="value">{patient.emergency_contact_phone}</span>
                        </div>
                      </>
                    )}

                    <div className="info-row">
                      <span className="label">Registered:</span>
                      <span className="value">
                        {new Date(patient.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="emergency-card-footer">
                    <Link to={`/patients/${patient.patient_id}`}>
                      <button className="btn btn-primary">View Full Details</button>
                    </Link>
                    <button
                      className="btn btn-success"
                      onClick={() => handleClearEmergency(patient.patient_id)}
                    >
                      ✓ Clear Emergency
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EmergencyPage;
