# 🏥 Hospital Management CRM System

A comprehensive hospital management system with patient registration, tracking, and emergency alert features.

## 🎯 Features

### Admin Management
- Secure admin authentication with JWT tokens
- Admin profile management
- Login/Register functionality

### Patient Management
- Patient registration with comprehensive information
- Unique patient ID generation (PAT000001, PAT000002, etc.)
- Patient profile view and edit
- Patient search and filtering
- Display of all registered patients

### Emergency Management
- 🚨 Emergency alert system for critical patients
- Quick status toggle (Normal ↔ Emergency)
- Emergency patient dashboard with pulsing alerts
- Emergency contact information tracking
- Auto-refresh emergency patient list

### Dashboard
- Real-time statistics
- Total patient count
- Emergency patient count
- Gender distribution charts
- Recent patient activity

## 🏗️ Project Structure

```
hospital-crm/
├── backend/
│   ├── app.py                 # Flask main application
│   ├── requirements.txt       # Python dependencies
│   └── .env.example          # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── PatientRegistrationPage.jsx
│   │   │   ├── PatientListPage.jsx
│   │   │   ├── PatientDetailPage.jsx
│   │   │   └── EmergencyPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── database/
│   └── schema.sql            # MySQL database schema
└── docs/
    └── setup-guide.md        # Detailed setup instructions
```

## 🚀 Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 14+ and npm
- MySQL 8.0+
- Git

### Backend Setup

1. **Create MySQL Database**
   ```bash
   mysql -u root -p < database/schema.sql
   ```

2. **Install Python Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run Flask Server**
   ```bash
   python app.py
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```
   Application will run on `http://localhost:3000`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register admin
- `POST /api/auth/login` - Login admin

### Patients
- `POST /api/patients` - Register new patient
- `GET /api/patients` - Get all patients
- `GET /api/patients/<patient_id>` - Get patient details
- `PUT /api/patients/<patient_id>` - Update patient
- `POST /api/patients/<patient_id>/emergency` - Set emergency status
- `GET /api/patients/emergency/list` - Get emergency patients

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## 💾 Database Schema

### Admins Table
- admin_id (PK)
- name
- email (unique)
- password (hashed)
- created_at
- updated_at

### Patients Table
- id (PK)
- patient_id (unique)
- first_name
- last_name
- date_of_birth
- gender
- phone
- email
- address
- emergency_status
- blood_group
- allergies
- medical_history
- emergency_contact_name
- emergency_contact_phone
- created_at
- updated_at

### Medical Records Table
- id (PK)
- patient_id (FK)
- visit_date
- chief_complaint
- diagnosis
- prescription
- notes
- doctor_name
- created_at

### Emergency Alerts Table
- id (PK)
- patient_id (FK)
- alert_type
- severity
- description
- status
- created_at
- resolved_at

## 🎨 UI Features

### Responsive Design
- Mobile-friendly interface
- Works on all device sizes
- Adaptive grid layouts

### Color Scheme
- Primary: #3498db (Blue)
- Success: #27ae60 (Green)
- Danger: #e74c3c (Red)
- Dark: #2c3e50

### Animations
- Emergency pulsing alerts
- Smooth transitions
- Loading spinners

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with werkzeug
- CORS enabled for safe cross-origin requests
- Input validation on backend
- Secure database queries with parameterized statements

## 📱 User Roles

### Admin User
- Can register new patients
- View all patients
- Edit patient information
- Mark patients as emergency
- Access dashboard analytics
- View emergency patients list

## 🐛 Testing

### Test Admin Login
1. Register a new admin account
2. Use credentials to login
3. Access dashboard and patient management

### Test Patient Registration
1. Login as admin
2. Navigate to "Register Patient"
3. Fill in patient details
4. Submit form
5. Patient ID will be generated automatically

### Test Emergency Feature
1. Go to Patient List
2. Click on a patient
3. Click "Mark Emergency" button
4. Check Emergency page to see updated list

## 📊 Performance Considerations

- Database indexes on frequently queried fields
- Pagination ready (can be added)
- Optimized API responses
- Client-side filtering for better UX

## 🔄 Future Enhancements

- Medical records management
- Appointment scheduling
- Doctor assignment
- Billing system
- SMS notifications for emergencies
- File upload for documents
- Advanced reporting
- Multi-hospital support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under MIT License.

## 📞 Support

For issues and questions, please contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Production Ready
