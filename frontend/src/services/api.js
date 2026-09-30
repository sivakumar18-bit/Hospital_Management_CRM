const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://hospital-management-crm.onrender.com/api';

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Authentication APIs
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (name, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },
};

// Patient APIs
export const patientAPI = {
  registerPatient: async (patientData) => {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(patientData),
    });
    return response.json();
  },

  getAllPatients: async () => {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  getPatientById: async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  updatePatient: async (patientId, patientData) => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(patientData),
    });
    return response.json();
  },

  setEmergencyStatus: async (patientId, status) => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/emergency`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return response.json();
  },

  getEmergencyPatients: async () => {
    const response = await fetch(`${API_BASE_URL}/patients/emergency/list`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },
};
