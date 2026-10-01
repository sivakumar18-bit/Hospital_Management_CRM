from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

import mysql.connector
from mysql.connector import Error, pooling

import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

CORS(
    app,
    origins=os.getenv('FRONTEND_URL', '*')
)

# ==================== JWT CONFIGURATION ====================

app.config['JWT_SECRET_KEY'] = os.getenv(
    'JWT_SECRET_KEY',
    'your-secret-key-change-in-production'
)

app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)

jwt = JWTManager(app)


# ==================== DATABASE CONFIGURATION ====================

CA_CERT_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    'aiven-ca.pem'
)

db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
    'port': int(os.getenv('DB_PORT', 18174)),

    # Aiven MySQL SSL
    'ssl_ca': CA_CERT_PATH,
    'ssl_verify_cert': True,
    'ssl_verify_identity': True,
}

# Connection pool
db_pool = None


def get_db_connection():
    """
    Get a connection from the MySQL connection pool.

    Instead of creating a new Aiven connection for every request,
    existing connections are reused.
    """
    global db_pool

    try:
        if db_pool is None:
            db_pool = pooling.MySQLConnectionPool(
                pool_name="hospital_crm_pool",
                pool_size=5,
                pool_reset_session=True,
                **db_config
            )

            print("✅ MySQL connection pool created")

        connection = db_pool.get_connection()

        if connection.is_connected():
            return connection

        return None

    except Error as e:
        print(f"❌ Database connection error: {e}")
        return None


# ==================== ADMIN AUTHENTICATION ====================

@app.route('/api/auth/register', methods=['POST'])
def register_admin():
    """Register a new admin user"""

    connection = None
    cursor = None

    try:
        data = request.get_json() or {}

        email = data.get('email')
        password = data.get('password')
        name = data.get('name')

        if not email or not password or not name:
            return jsonify({
                'message': 'Missing required fields'
            }), 400

        connection = get_db_connection()

        if not connection:
            return jsonify({
                'message': 'Database connection failed'
            }), 500

        cursor = connection.cursor(dictionary=True)

        # Check whether an admin already exists
        cursor.execute(
            "SELECT COUNT(*) AS c FROM admins"
        )

        if cursor.fetchone()['c'] > 0:
            return jsonify({
                'message': 'Registration is closed'
            }), 403

        # Check if admin exists
        cursor.execute(
            "SELECT admin_id FROM admins WHERE email = %s",
            (email,)
        )

        if cursor.fetchone():
            return jsonify({
                'message': 'Admin already exists'
            }), 400

        # Create admin
        hashed_password = generate_password_hash(password)

        cursor.execute(
            """
            INSERT INTO admins
            (name, email, password)
            VALUES (%s, %s, %s)
            """,
            (name, email, hashed_password)
        )

        connection.commit()

        return jsonify({
            'message': 'Admin registered successfully'
        }), 201

    except Exception as e:
        if connection:
            connection.rollback()

        print(f"❌ Registration error: {e}")

        return jsonify({
            'message': 'Server error'
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


@app.route('/api/auth/login', methods=['POST'])
def login_admin():
    """Login admin and return JWT token"""

    connection = None
    cursor = None

    try:
        data = request.get_json() or {}

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({
                'message': 'Missing email or password'
            }), 400

        connection = get_db_connection()

        if not connection:
            return jsonify({
                'message': 'Database connection failed'
            }), 500

        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT admin_id, name, email, password
            FROM admins
            WHERE email = %s
            LIMIT 1
            """,
            (email,)
        )

        admin = cursor.fetchone()

        if not admin or not check_password_hash(
            admin['password'],
            password
        ):
            return jsonify({
                'message': 'Invalid credentials'
            }), 401

        access_token = create_access_token(
            identity=str(admin['admin_id'])
        )

        return jsonify({
            'access_token': access_token,
            'admin': {
                'admin_id': admin['admin_id'],
                'name': admin['name'],
                'email': admin['email']
            }
        }), 200

    except Exception as e:
        print(f"❌ Login error: {e}")

        return jsonify({
            'message': 'Server error'
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==================== PATIENT MANAGEMENT ====================

@app.route('/api/patients', methods=['POST'])
@jwt_required()
def register_patient():
    """Register a new patient"""

    connection = None
    cursor = None

    try:
        data = request.get_json() or {}

        required_fields = [
            'first_name',
            'last_name',
            'date_of_birth',
            'gender',
            'phone',
            'email',
            'address'
        ]

        if not all(field in data for field in required_fields):
            return jsonify({
                'message': 'Missing required fields'
            }), 400

        connection = get_db_connection()

        if not connection:
            return jsonify({
                'message': 'Database connection failed'
            }), 500

        cursor = connection.cursor(dictionary=True)

        # Generate patient ID
        cursor.execute(
            "SELECT COUNT(*) AS count FROM patients"
        )

        count = cursor.fetchone()['count']

        patient_id = f"PAT{str(count + 1).zfill(6)}"

        cursor.execute(
            """
            INSERT INTO patients
            (
                patient_id,
                first_name,
                last_name,
                date_of_birth,
                gender,
                phone,
                email,
                address,
                blood_group,
                allergies,
                reason_for_visit,
                emergency_contact_name,
                emergency_contact_phone,
                emergency_status,
                created_at
            )
            VALUES
            (
                %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s
            )
            """,
            (
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
            )
        )

        connection.commit()

        return jsonify({
            'message': 'Patient registered successfully',
            'patient_id': patient_id
        }), 201

    except Exception as e:
        if connection:
            connection.rollback()

        print(f"❌ Patient registration error: {e}")

        return jsonify({
            'message': 'Server error'
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==================== GET ALL PATIENTS ====================

@app.route('/api/patients', methods=['GET'])
@jwt_required()
def get_all_patients():
    """Get all patients"""

    connection = None
    cursor = None

    try:
        connection = get_db_connection()

        if not connection:
            return jsonify({
                'message': 'Database connection failed'
            }), 500

        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT *
            FROM patients
            ORDER BY created_at DESC
            """
        )

        patients = cursor.fetchall()

        return jsonify(patients), 200

    except Exception as e:
        print(f"❌ Get patients error: {e}")

        return jsonify({
            'message': 'Server error'
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==================== GET SINGLE PATIENT ====================

@app.route('/api/patients/<patient_id>', methods=['GET'])
@jwt_required()
def get_patient(patient_id):
    """Get patient by ID"""

    connection = None
    cursor = None

    try:
        connection = get_db_connection()

        if not connection:
            return jsonify({
                'message': 'Database connection failed'
            }), 500

        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT *
            FROM patients
            WHERE patient_id = %s
            LIMIT 1
            """,
            (patient_id,)
        )

        patient = cursor.fetchone()

        if not patient:
            return jsonify({
                'message': 'Patient not found'
            }), 404

        return jsonify(patient), 200

    except Exception as e:
        print(f"❌ Get patient error: {e}")

        return jsonify({
            'message': 'Server error'
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==================== UPDATE PATIENT ====================

@app.route('/api/patients/<patient_id>', methods=['PUT'])
@jwt_required()
def update_patient(patient_id):
    """Update patient information"""

    connection = None
    cursor = None

    try:
        data = request.get_json() or {}

        connection = get_db_connection()

        if not connection:
            return jsonify({
                'message': 'Database connection failed'
            }), 500

        cursor = connection.cursor(dictionary=True)

        allowed = [
            'first_name',
            'last_name',
            'phone',
            'email',
            'address',
            'blood_group',
            'allergies',
            'reason_for_visit',
            'medical_history',
            'emergency_contact_name',
            'emergency_contact_phone'
        ]

        fields = []
        values = []

        for key, value in data.items():

            if key in allowed:
                fields.append(f"{key} = %s")
                values.append(value)

        if not fields:
            return jsonify({
                'message': 'No fields to update'
            }), 400

        values.append(patient_id)

        query = f"""
            UPDATE patients
            SET {', '.join(fields)}
            WHERE patient_id = %s
        """

        cursor.execute(query, values)

        connection.commit()

        return jsonify({
            'message': 'Patient updated successfully'
        }), 200

    except Exception as e:
        if connection:
            connection.rollback()

        print(f"❌ Update patient error: {e}")

        return jsonify({
            'message': 'Server error'
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==================== EMERGENCY STATUS ====================

@app.route('/api/patients/<patient_id>/emergency', methods=['POST'])
@jwt_required()
def set_emergency_status(patient_id):
    """Set emergency status for a patient"""

    connection = None
    cursor = None

    try:
        data = request.get_json() or {}

        status = data.get('status', 'normal')

        if status not in ['normal', 'emergency']:
            return jsonify({
                'message': 'Invalid status'
            }), 400

        connection = get_db_connection()

        if not connection:
            return jsonify({
                'message': 'Database connection failed'
            }), 500

        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            UPDATE patients
            SET emergency_status = %s
            WHERE patient_id = %s
            """,
            (status, patient_id)
        )

        connection.commit()

        return jsonify({
            'message': f'Patient emergency status set to {status}',
            'patient_id': patient_id,
            'status': status
        }), 200

    except Exception as e:
        if connection:
            connection.rollback()

        print(f"❌ Emergency status error: {e}")

        return jsonify({
            'message': 'Server error'
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==================== EMERGENCY PATIENTS ====================

@app.route('/api/patients/emergency/list', methods=['GET'])
@jwt_required()
def get_emergency_patients():
    """Get all emergency patients"""

    connection = None
    cursor = None

    try:
        connection = get_db_connection()

        if not connection:
            return jsonify({
                'message': 'Database connection failed'
            }), 500

        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT *
            FROM patients
            WHERE emergency_status = 'emergency'
            ORDER BY created_at DESC
            """
        )

        patients = cursor.fetchall()

        return jsonify(patients), 200

    except Exception as e:
        print(f"❌ Emergency patients error: {e}")

        return jsonify({
            'message': 'Server error'
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==================== DASHBOARD ====================

@app.route('/api/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get dashboard statistics"""

    connection = None
    cursor = None

    try:
        connection = get_db_connection()

        if not connection:
            return jsonify({
                'message': 'Database connection failed'
            }), 500

        cursor = connection.cursor(dictionary=True)

        # Total patients
        cursor.execute(
            "SELECT COUNT(*) AS count FROM patients"
        )

        total_patients = cursor.fetchone()['count']

        # Emergency patients
        cursor.execute(
            """
            SELECT COUNT(*) AS count
            FROM patients
            WHERE emergency_status = 'emergency'
            """
        )

        emergency_patients = cursor.fetchone()['count']

        # Gender distribution
        cursor.execute(
            """
            SELECT gender, COUNT(*) AS count
            FROM patients
            GROUP BY gender
            """
        )

        gender_distribution = cursor.fetchall()

        # Recent patients
        cursor.execute(
            """
            SELECT *
            FROM patients
            ORDER BY created_at DESC
            LIMIT 5
            """
        )

        recent_patients = cursor.fetchall()

        return jsonify({
            'total_patients': total_patients,
            'emergency_patients': emergency_patients,
            'gender_distribution': gender_distribution,
            'recent_patients': recent_patients
        }), 200

    except Exception as e:
        print(f"❌ Dashboard error: {e}")

        return jsonify({
            'message': 'Server error'
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ==================== HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health_check():

    connection = get_db_connection()

    if connection:

        connection.close()

        return jsonify({
            'status': 'ok',
            'database': 'connected'
        }), 200

    return jsonify({
        'status': 'error',
        'database': 'not connected'
    }), 500

# ==================== PING CHECK ====================

@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({
        'status': 'ok',
        'message': 'Backend is running'
    })


# ==================== LOCAL DEVELOPMENT ====================

if __name__ == '__main__':
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )