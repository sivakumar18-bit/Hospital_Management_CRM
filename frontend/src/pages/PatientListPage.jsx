import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { patientAPI } from '../services/api';

function PatientListPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientAPI.getAllPatients();
      setPatients(data);
    } catch (err) {
      setError('Failed to load patients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || patient.emergency_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

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
          <h2 className="card-title">👥 Patient List</h2>
          <button className="btn btn-primary" onClick={fetchPatients}>
            Refresh
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Search and Filter */}
        <div className="form-row" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label htmlFor="search">Search Patient</label>
            <input
              type="text"
              id="search"
              placeholder="Search by ID, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="filter">Filter by Status</label>
            <select
              id="filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Patients</option>
              <option value="normal">Normal</option>
              <option value="emergency">Emergency Only</option>
            </select>
          </div>
        </div>

        {/* Patients Table */}
        {filteredPatients.length === 0 ? (
          <div className="alert alert-info">No patients found.</div>
        ) : (
          <>
            <p style={{ marginBottom: '1rem', color: '#7f8c8d' }}>
              Showing {filteredPatients.length} of {patients.length} patients
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Gender</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.patient_id}>
                      <td>
                        <strong>{patient.patient_id}</strong>
                      </td>
                      <td>
                        {patient.first_name} {patient.last_name}
                      </td>
                      <td>{patient.email || 'N/A'}</td>
                      <td>{patient.phone}</td>
                      <td>{patient.gender}</td>
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
                      <td>
                        {new Date(patient.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <Link to={`/patients/${patient.patient_id}`}>
                          <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                            View
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PatientListPage;
