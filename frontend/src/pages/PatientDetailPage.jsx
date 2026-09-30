import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI } from '../services/api';

function PatientDetailPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const data = await patientAPI.getPatientById(patientId);
      if (data.patient_id) {
        setPatient(data);
        setEditData(data);
      } else {
        setError('Patient not found');
      }
    } catch (err) {
      setError('Failed to load patient');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyToggle = async () => {
    try {
      const newStatus = patient.emergency_status === 'emergency' ? 'normal' : 'emergency';
      await patientAPI.setEmergencyStatus(patientId, newStatus);
      setSuccess(`Emergency status updated to ${newStatus}`);
      setPatient({ ...patient, emergency_status: newStatus });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update emergency status');
      console.error(err);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      // Remove patient_id and other read-only fields from update
      const updateData = { ...editData };
      delete updateData.id;
      delete updateData.created_at;
      delete updateData.updated_at;

      const res = await patientAPI.updatePatient(patientId, updateData);
      if (res.message !== 'Patient updated successfully') {
        setError(res.message || 'Failed to update patient');
        return;
      }
      setSuccess('Patient information updated successfully');
      setPatient(editData);
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update patient');
      console.error(err);
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

  if (!patient) {
    return (
      <div className="container">
        <div className="card">
          <div className="alert alert-error">{error || 'Patient not found'}</div>
          <button className="btn btn-primary" onClick={() => navigate('/patients')}>
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">👤 {patient.first_name} {patient.last_name}</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => navigate('/patients')}>
              Back
            </button>
            <button
              className={`btn ${patient.emergency_status === 'emergency' ? 'btn-success' : 'btn-danger'}`}
              onClick={handleEmergencyToggle}
            >
              {patient.emergency_status === 'emergency' ? '✓ Clear Emergency' : '🚨 Mark Emergency'}
            </button>
          </div>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Patient Status */}
        <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <p style={{ margin: '0.5rem 0' }}>
            <strong>Patient ID:</strong> {patient.patient_id}
          </p>
          <p style={{ margin: '0.5rem 0' }}>
            <strong>Status:</strong>
            <span
              className={`badge badge-${patient.emergency_status === 'emergency' ? 'emergency' : 'normal'}`}
              style={{ marginLeft: '0.5rem' }}
            >
              {patient.emergency_status === 'emergency' ? '🚨 Emergency' : 'Normal'}
            </span>
          </p>
          <p style={{ margin: '0.5rem 0' }}>
            <strong>Registered:</strong> {new Date(patient.created_at).toLocaleString()}
          </p>
        </div>

        {/* Edit Toggle */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => {
              setIsEditing(!isEditing);
              setEditData(patient);
            }}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Information'}
          </button>
        </div>

        {/* Patient Information */}
        {!isEditing ? (
          <div>
            <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#2c3e50' }}>
              Basic Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <p style={{ padding: '0.75rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  {patient.first_name}
                </p>
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <p style={{ padding: '0.75rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  {patient.last_name}
                </p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth</label>
                <p style={{ padding: '0.75rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  {new Date(patient.date_of_birth).toLocaleDateString()}
                </p>
              </div>
              <div className="form-group">
                <label>Gender</label>
                <p style={{ padding: '0.75rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  {patient.gender}
                </p>
              </div>
            </div>

            <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#2c3e50' }}>
              Contact Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <p style={{ padding: '0.75rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  {patient.phone}
                </p>
              </div>
              <div className="form-group">
                <label>Email</label>
                <p style={{ padding: '0.75rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  {patient.email || 'N/A'}
                </p>
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <p style={{ padding: '0.75rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                {patient.address}
              </p>
            </div>

            {patient.blood_group && (
              <>
                <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#2c3e50' }}>
              Medical Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label>Blood Group</label>
                <p style={{ padding: '0.75rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  {patient.blood_group || 'Not provided'}
                </p>
              </div>
              <div className="form-group">
                <label>Allergies</label>
                <p style={{ padding: '0.75rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  {patient.allergies || 'None recorded'}
                </p>
              </div>
            </div>
            <div className="form-group">
              <label>Reason for Visit / Problem</label>
              <p style={{ padding: '0.75rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                {patient.reason_for_visit || 'Not provided'}
              </p>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Emergency Contact</label>
                <p style={{ padding: '0.75rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  {patient.emergency_contact_name || 'Not provided'}
                </p>
              </div>
              <div className="form-group">
                <label>Emergency Contact Phone</label>
                <p style={{ padding: '0.75rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  {patient.emergency_contact_phone || 'Not provided'}
                </p>
              </div>
            </div>
              </>
            )}
          </div>
        ) : (
          <div>
            <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#2c3e50' }}>
              Edit Basic Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={editData.first_name || ''}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={editData.last_name || ''}
                  onChange={handleEditChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={editData.phone || ''}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={editData.email || ''}
                  onChange={handleEditChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={editData.address || ''}
                onChange={handleEditChange}
                rows="3"
              ></textarea>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
              <button className="btn btn-success" onClick={handleSaveChanges}>
                Save Changes
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientDetailPage;
