import React, { useState } from 'react';
import { patientAPI } from '../services/api';

function PatientRegistrationPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    blood_group: '',
    allergies: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [newPatientId, setNewPatientId] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await patientAPI.registerPatient(formData);

      if (response.patient_id) {
        setSuccess(
          `Patient registered successfully! Patient ID: ${response.patient_id}`
        );
        setNewPatientId(response.patient_id);
        
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          date_of_birth: '',
          gender: 'Male',
          phone: '',
          email: '',
          address: '',
          blood_group: '',
          allergies: '',
          emergency_contact_name: '',
          emergency_contact_phone: '',
        });

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(response.message || response.msg || JSON.stringify(response));
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">👤 Register New Patient</h2>
        </div>

        {success && (
          <div className="alert alert-success">
            ✓ {success}
          </div>
        )}
        {error && <div className="alert alert-error">✗ {error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#2c3e50' }}>
            Basic Information
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="John"
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date_of_birth">Date of Birth *</label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#2c3e50' }}>
            Contact Information
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+1-555-0000"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Enter full address"
              rows="3"
            ></textarea>
          </div>

          {/* Medical Information */}
          <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#2c3e50' }}>
            Medical Information
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="blood_group">Blood Group</label>
              <select
                id="blood_group"
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
              >
                <option value="">Select Blood Group</option>
                <option>O+</option>
                <option>O-</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>
            </div>
           <div className="form-group">
             <label htmlFor="reason_for_visit">Reason for Visit / Problem</label>
             <textarea
               id="reason_for_visit"
               name="reason_for_visit"
               value={formData.reason_for_visit}
               onChange={handleChange}
               placeholder="e.g., chest pain, fever for 3 days"
               rows="3"
             ></textarea>
           </div>
          </div>

          {/* Emergency Contact */}
          <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#2c3e50' }}>
            Emergency Contact
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="emergency_contact_name">Emergency Contact Name</label>
              <input
                type="text"
                id="emergency_contact_name"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                placeholder="Contact person name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="emergency_contact_phone">Emergency Contact Phone</label>
              <input
                type="tel"
                id="emergency_contact_phone"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
                placeholder="+1-555-0000"
              />
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Patient'}
            </button>
            <button
              type="reset"
              className="btn btn-secondary"
              onClick={() => {
                setFormData({
                  first_name: '',
                  last_name: '',
                  date_of_birth: '',
                  gender: 'Male',
                  phone: '',
                  email: '',
                  address: '',
                  blood_group: '',
                  allergies: '',
                  emergency_contact_name: '',
                  emergency_contact_phone: '',
                });
              }}
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatientRegistrationPage;
