from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)

jwt = JWTManager(app)

# Database Configuration
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'hospital_crm')
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
        return None

# ==================== ADMIN AUTHENTICATION ====================

@app.route('/api/auth/register', methods=['POST'])
def register_admin():
    """Register a new admin user"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')

        if not email or not password or not name:
            return jsonify({'message': 'Missing required fields'}), 400

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Check if admin exists
        cursor.execute("SELECT * FROM admins WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({'message': 'Admin already exists'}), 400

        # Create admin
        hashed_password = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO admins (name, email, password) VALUES (%s, %s, %s)",
            (name, email, hashed_password)
        )
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({'message': 'Admin registered successfully'}), 201

    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login_admin():
    """Login admin and return JWT token"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'message': 'Missing email or password'}), 400

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT * FROM admins WHERE email = %s", (email,))
        admin = cursor.fetchone()
        cursor.close()
        connection.close()

        if not admin or not check_password_hash(admin['password'], password):
            return jsonify({'message': 'Invalid credentials'}), 401

        access_token = create_access_token(identity=str(admin['admin_id']))
        return jsonify({
            'access_token': access_token,
            'admin': {
                'admin_id': admin['admin_id'],
                'name': admin['name'],
                'email': admin['email']
            }
        }), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ==================== PATIENT MANAGEMENT ====================

@app.route('/api/patients', methods=['POST'])
@jwt_required()
def register_patient():
    """Register a new patient"""
    try:
        data = request.get_json()
        
        required_fields = ['first_name', 'last_name', 'date_of_birth', 'gender', 'phone', 'email', 'address']
        if not all(field in data for field in required_fields):
            return jsonify({'message': 'Missing required fields'}), 400

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Generate unique patient ID
        cursor.execute("SELECT COUNT(*) as count FROM patients")
        count = cursor.fetchone()['count']
        patient_id = f"PAT{str(count + 1).zfill(6)}"

        cursor.execute("""
            INSERT INTO patients
            (patient_id, first_name, last_name, date_of_birth, gender, phone, email, address,
             blood_group, allergies, reason_for_visit,
             emergency_contact_name, emergency_contact_phone,
             emergency_status, created_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            patient_id,
            data['first_name'],
            data['last_name'],
            data['date_of_birth'],
            data['gender'],
            data['phone'],
            data['email'],
            data['address'],
            data.get('blood_group') or None,
            data.get('allergies') or None,
            data.get('reason_for_visit') or None,
            data.get('emergency_contact_name') or None,
            data.get('emergency_contact_phone') or None,
            'normal',
            datetime.now()
        ))
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({
            'message': 'Patient registered successfully',
            'patient_id': patient_id
        }), 201

    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/patients', methods=['GET'])
@jwt_required()
def get_all_patients():
    """Get all patients"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT * FROM patients ORDER BY created_at DESC")
        patients = cursor.fetchall()
        cursor.close()
        connection.close()

        return jsonify(patients), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/patients/<patient_id>', methods=['GET'])
@jwt_required()
def get_patient(patient_id):
    """Get patient by ID"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT * FROM patients WHERE patient_id = %s", (patient_id,))
        patient = cursor.fetchone()
        cursor.close()
        connection.close()

        if not patient:
            return jsonify({'message': 'Patient not found'}), 404

        return jsonify(patient), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/patients/<patient_id>', methods=['PUT'])
@jwt_required()
def update_patient(patient_id):
    """Update patient information"""
    try:
        data = request.get_json()
        
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Build dynamic update query
        fields = []
        values = []
        allowed = ['first_name', 'last_name', 'phone', 'email', 'address',
                   'blood_group', 'allergies', 'reason_for_visit',
                   'medical_history', 'emergency_contact_name',
                   'emergency_contact_phone']
        for key, value in data.items():
            if key in allowed:
                fields.append(f"{key} = %s")
                values.append(value)

        if not fields:
            return jsonify({'message': 'No fields to update'}), 400

        values.append(patient_id)
        query = f"UPDATE patients SET {', '.join(fields)} WHERE patient_id = %s"
        
        cursor.execute(query, values)
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({'message': 'Patient updated successfully'}), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/patients/<patient_id>/emergency', methods=['POST'])
@jwt_required()
def set_emergency_status(patient_id):
    """Set emergency status for a patient"""
    try:
        data = request.get_json()
        status = data.get('status', 'normal')  # 'normal' or 'emergency'

        if status not in ['normal', 'emergency']:
            return jsonify({'message': 'Invalid status'}), 400

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            "UPDATE patients SET emergency_status = %s WHERE patient_id = %s",
            (status, patient_id)
        )
        connection.commit()
        cursor.close()
        connection.close()

        return jsonify({
            'message': f'Patient emergency status set to {status}',
            'patient_id': patient_id,
            'status': status
        }), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/patients/emergency/list', methods=['GET'])
@jwt_required()
def get_emergency_patients():
    """Get all patients with emergency status"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT * FROM patients WHERE emergency_status = 'emergency' ORDER BY created_at DESC")
        patients = cursor.fetchall()
        cursor.close()
        connection.close()

        return jsonify(patients), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Total patients
        cursor.execute("SELECT COUNT(*) as count FROM patients")
        total_patients = cursor.fetchone()['count']

        # Emergency patients
        cursor.execute("SELECT COUNT(*) as count FROM patients WHERE emergency_status = 'emergency'")
        emergency_patients = cursor.fetchone()['count']

        # Patients by gender
        cursor.execute("SELECT gender, COUNT(*) as count FROM patients GROUP BY gender")
        gender_distribution = cursor.fetchall()

        # Recent patients
        cursor.execute("SELECT * FROM patients ORDER BY created_at DESC LIMIT 5")
        recent_patients = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify({
            'total_patients': total_patients,
            'emergency_patients': emergency_patients,
            'gender_distribution': gender_distribution,
            'recent_patients': recent_patients
        }), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
